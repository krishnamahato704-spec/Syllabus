import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut,
  setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { previewAssessmentBackup } from './test-engine.js';
import { validId } from './assessment-validation.js';
import { SessionGate } from './session.js';

const MAX_PAYLOAD_BYTES = 600000;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const emptyState = () => ({ version: 1, customTests: [], attempts: {}, drafts: {}, archivedTests: [], migrationWarnings: [] });

// Stable JSON makes equality independent of object key insertion order. Array order is retained.
export function canonicalPayload(value) {
  const ancestors = new Set();
  function ordered(item) {
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return item;
    if (typeof item === 'number' && Number.isFinite(item)) return item;
    if (typeof item !== 'object' || (!Array.isArray(item) && !plain(item))) throw new Error('Cloud records must contain finite numbers and plain JSON values.');
    if (ancestors.has(item)) throw new Error('Cloud records cannot contain circular JSON values.');
    ancestors.add(item);
    const result = Array.isArray(item) ? item.map(ordered) : Object.fromEntries(Object.keys(item).sort().map(key => [key, ordered(item[key])]));
    ancestors.delete(item);
    return result;
  }
  const payload = JSON.stringify(ordered(value));
  if (new TextEncoder().encode(payload).length >= MAX_PAYLOAD_BYTES) throw new Error('This cloud record is too large. Each paper, draft or result must be smaller than 600 KB. Keep a local JSON backup.');
  return payload;
}

function validateState(state) {
  if (!plain(state) || state.version !== 1) throw new Error('Invalid assessment state version.');
  previewAssessmentBackup(JSON.stringify({ app: 'study-atlas-assessment', version: 1, state }));
}

function record(kind, paperId, value) {
  validId(paperId, 'Cloud paper ID');
  if (!plain(value) || (kind === 'paper' ? value.id : value.testId) !== paperId) throw new Error('The cloud record paper ID does not match its payload.');
  return { id: `${kind}:${paperId}`, kind, paperId, payload: canonicalPayload(value) };
}

function decodeRecord(raw) {
  if (!plain(raw) || !['paper', 'draft', 'attempt'].includes(raw.kind) || typeof raw.payload !== 'string') throw new Error('Invalid assessment cloud record.');
  if (new TextEncoder().encode(raw.payload).length >= MAX_PAYLOAD_BYTES) throw new Error('The incoming cloud record is too large. Each payload must be smaller than 600 KB.');
  let value;
  try { value = JSON.parse(raw.payload); } catch { throw new Error('Invalid JSON in an assessment cloud record.'); }
  const next = record(raw.kind, raw.paperId, value);
  if (raw.id !== next.id) throw new Error('The cloud document ID does not match its paper ID.');
  return { ...next, value };
}

export function assessmentRecordsFromState(state) {
  validateState(state);
  return [
    ...state.customTests.map(paper => record('paper', paper.id, paper)),
    ...Object.entries(state.attempts).map(([id, attempt]) => record('attempt', id, attempt)),
    ...Object.entries(state.drafts).filter(([id]) => !state.attempts[id]?.completed).map(([id, draft]) => record('draft', id, draft)),
  ];
}

export function stateFromAssessmentRecords(rows) {
  if (!Array.isArray(rows)) throw new Error('Invalid assessment cloud collection.');
  const next = emptyState(), seen = new Set();
  for (const raw of rows) {
    const item = decodeRecord(raw);
    if (seen.has(item.id)) throw new Error('Duplicate assessment cloud document.');
    seen.add(item.id);
    if (item.kind === 'paper') next.customTests.push(item.value);
    else if (item.kind === 'attempt') next.attempts[item.paperId] = item.value;
    else next.drafts[item.paperId] = item.value;
  }
  validateState(next);
  for (const id of Object.keys(next.drafts)) if (next.attempts[id]?.completed) delete next.drafts[id];
  return next;
}

function attemptConflict(paperId, localPayload, remotePayload) {
  const error = new Error(`Completed-result conflict for ${paperId}. This device and the cloud contain different completed sittings. Both records were kept. Export a local backup before choosing which record to retain.`);
  error.code = 'assessment/conflict'; error.paperId = paperId;
  error.localPayload = localPayload; error.remotePayload = remotePayload;
  return error;
}

// Planning is side-effect free: omitted records never mean deletion.
function writableVersion(next,existing){
 if(!existing||next.payload===existing.payload)return true;
 const a=JSON.parse(next.payload),b=JSON.parse(existing.payload);
 const conflict=()=>{const e=new Error('Cloud '+next.kind+' conflict for '+next.paperId+'. Keep a local backup; different paper versions or concurrent sittings cannot overwrite one another.');e.code='assessment/conflict';throw e;};
 if(next.kind==='paper')conflict();
 if(next.kind==='draft'){
  if(a.startedAt!==b.startedAt||a.deadline!==b.deadline||canonicalPayload(a.testSnapshot)!==canonicalPayload(b.testSnapshot))conflict();
  const local=Date.parse(a.updatedAt||a.startedAt),remote=Date.parse(b.updatedAt||b.startedAt);
  if(local===remote)conflict();
  return local>remote;
 }
 return true;
}
export function planAssessmentSync(state, remoteRows) {
  const local = assessmentRecordsFromState(state);
  stateFromAssessmentRecords(remoteRows);
  const remote = new Map(remoteRows.map(raw => { const item = decodeRecord(raw); return [item.id, item]; }));
  const operations = [], completed = new Set();
  for (const item of local.filter(row => row.kind === 'attempt')) {
    const existing = remote.get(item.id);
    if (existing && existing.payload !== item.payload) throw attemptConflict(item.paperId, item.payload, existing.payload);
    completed.add(item.paperId);
    if (!existing || remote.has(`draft:${item.paperId}`)) operations.push({ ...item, deleteDraft: true });
  }
  for (const existing of remote.values()) {
    if (existing.kind === 'attempt' && !completed.has(existing.paperId) && remote.has(`draft:${existing.paperId}`)) {
      const { value, ...item } = existing;
      operations.push({ ...item, deleteDraft: true });
    }
  }
  for (const item of local.filter(row => row.kind !== 'attempt')) {
    if (item.kind === 'draft' && remote.has(`attempt:${item.paperId}`)) continue;
    if (remote.get(item.id)?.payload !== item.payload&&writableVersion(item,remote.get(item.id))) operations.push(item);
  }
  return operations;
}

// Recheck against the documents read inside the transaction, not an earlier listener snapshot.
export function resolveAssessmentWrite(item, freshRows) {
  stateFromAssessmentRecords([item]);
  stateFromAssessmentRecords(freshRows);
  const next = decodeRecord(item), fresh = new Map(freshRows.map(raw => { const row = decodeRecord(raw); return [row.id, row]; }));
  const existing = fresh.get(next.id);
  if (next.kind === 'attempt' && existing && existing.payload !== next.payload) throw attemptConflict(next.paperId, next.payload, existing.payload);
  if (next.kind === 'draft' && fresh.has(`attempt:${next.paperId}`)) {
    const remove = existing ? [next.id] : [];
    return { writes: [], put: [], remove, saved: remove.length };
  }
  if(!writableVersion(next,existing))return {writes:[],put:existing?[existing]:[],remove:[],saved:0};
  const { value, ...row } = next;
  const writes = existing?.payload === next.payload ? [] : [row];
  const remove = next.kind === 'attempt' && fresh.has(`draft:${next.paperId}`) ? [`draft:${next.paperId}`] : [];
  return { writes, put: [row], remove, saved: writes.length + remove.length };
}

function cloudError(error) {
  if (error?.code === 'assessment/conflict') return error;
  const code = error?.code || '';
  let message = error?.message || 'Assessment cloud sync could not finish. Retry when connected.';
  if (/popup-closed|cancelled-popup/.test(code)) message = 'Sign-in was cancelled. You can try again.';
  else if (code.includes('popup-blocked')) message = 'Your browser blocked sign-in. Allow the sign-in window and try again.';
  else if (code.includes('unauthorized-domain')) message = 'This site must be added to the Firebase authorised domains before sign-in can work.';
  else if (code.includes('operation-not-allowed')) message = 'Google sign-in is not enabled in this Firebase project.';
  else if (code.includes('permission-denied')) message = 'Assessment cloud access was denied. Publish the owner-only assessment rules for this Firebase project and retry.';
  else if (/unavailable|network|offline/.test(code)) message = 'Cloud sync is unavailable. Your browser-local work is kept; reconnect and retry.';
  else if (/invalid-api-key|project-not-found/.test(code)) message = 'The Firebase web-app configuration needs to be checked.';
  const result = new Error(message, { cause: error }); result.code = code;
  return result;
}

export function createAssessmentCloud(config, { onState = () => {}, onRemote = () => {} } = {}) {
  const configured = !!(config?.apiKey && config?.authDomain && config?.projectId && config?.appId);
  let active = true, user = null, errorText = '', pending = 0, previousStatus = '';
  const gate = new SessionGate();
  const emit = () => {
    const state = { phase: gate.phase, user, error: errorText, pending }, fingerprint = JSON.stringify(state);
    if (active && fingerprint !== previousStatus) { previousStatus = fingerprint; onState(state); }
  };
  if (!configured) {
    gate.phase = 'unconfigured'; emit();
    const unavailable = async () => { throw new Error('Cloud sync needs the owner’s Firebase web-app configuration. This app is currently browser-local.'); };
    return { configured: false, signIn: unavailable, signOut: unavailable, sync: unavailable, retry: emit, destroy() { active = false; } };
  }

  let auth, db, persistenceReady;
  try {
    const name = `study-atlas-assessment-${config.projectId}`;
    const app = getApps().find(item => item.name === name) || initializeApp(config, name);
    auth = getAuth(app); db = getFirestore(app);
    persistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => setPersistence(auth, inMemoryPersistence));
    // Attach a rejection handler immediately; signIn still awaits the same promise and reports it.
    persistenceReady.catch(error => { if (active) { gate.phase = 'error'; errorText = cloudError(error).message; emit(); } });
  } catch (error) {
    gate.phase = 'error'; errorText = cloudError(error).message; emit();
    const unavailable = async () => { throw new Error(errorText); };
    return { configured: true, signIn: unavailable, signOut: unavailable, sync: unavailable, retry: emit, destroy() { active = false; } };
  }

  let remoteRows = [], queued = null, running = null, lastRequest = null, unsubscribeRecords = () => {};
  const online = () => globalThis.navigator?.onLine !== false;
  const current = token => active && gate.isCurrent(token) && auth.currentUser?.uid === token.uid;
  function assertSession(token) {
    if (!current(token)) throw new Error('The account session changed. Sync again from the current account.');
  }
  function assertCurrent(token) {
    assertSession(token);
    if (!online()) throw new Error('You are offline. Your browser-local work is kept; reconnect and retry cloud sync.');
  }
  const setPhase = (token, phase, error = '') => { if (current(token)) { gate.setPhase(token, phase); errorText = error; emit(); } };
  const ref = (token, id) => doc(db, 'users', token.uid, 'assessmentRecords', id);

  async function commitOperation(item, token) {
    return runTransaction(db, async transaction => {
      assertCurrent(token);
      const target = ref(token, item.id);
      const targetSnapshot = await transaction.get(target);
      // All transaction reads precede its writes, including the completion guard for drafts.
      let attemptSnapshot, draftSnapshot;
      if (item.kind === 'draft') attemptSnapshot = await transaction.get(ref(token, `attempt:${item.paperId}`));
      if (item.kind === 'attempt') draftSnapshot = await transaction.get(ref(token, `draft:${item.paperId}`));
      assertCurrent(token);
      const freshRows = [targetSnapshot, attemptSnapshot, draftSnapshot].filter(snapshot => snapshot?.exists()).map(snapshot => ({ ...snapshot.data(), id: snapshot.id }));
      const result = resolveAssessmentWrite(item, freshRows);
      for (const row of result.writes) transaction.set(ref(token, row.id), { kind: row.kind, paperId: row.paperId, payload: row.payload, updatedAt: serverTimestamp() });
      for (const id of result.remove) transaction.delete(ref(token, id));
      return result;
    });
  }

  async function drain(token) {
    let saved = 0, unchanged = 0;
    try {
      while (queued && current(token)) {
        const state = queued.state; queued = null;
        const operations = planAssessmentSync(state, remoteRows);
        pending = operations.length;
        if (pending) setPhase(token, 'saving');
        else unchanged++;
        for (const item of operations) {
          assertCurrent(token);
          const result = await commitOperation(item, token);
          assertCurrent(token);
          const byId = new Map(remoteRows.map(row => [row.id, row]));
          for (const id of result.remove) byId.delete(id);
          for (const row of result.put) byId.set(row.id, row);
          remoteRows = [...byId.values()];
          saved += result.saved; pending--;
          if (pending) setPhase(token, 'saving');
        }
      }
      assertCurrent(token); pending = 0;
      return { saved, unchanged };
    } catch (error) {
      if (current(token)) { pending = 0; setPhase(token, online() ? 'error' : 'offline', cloudError(error).message); }
      throw cloudError(error);
    }
  }

  function sync(state) {
    const token = gate.capture();
    try {
      assessmentRecordsFromState(state); // Validate everything before accepting a queued state.
      assertSession(token);
      lastRequest = { uid: token.uid, state: structuredClone(state) };
      assertCurrent(token);
      if (!['ready', 'saving'].includes(gate.phase)) throw new Error('Cloud sync is not ready. Wait for loading or retry after reconnecting.');
      const operations = planAssessmentSync(state, remoteRows);
      if (!running && !operations.length) return Promise.resolve({ saved: 0, unchanged: 1 });
      queued = { state: lastRequest.state };
      if (!running) {
        const job = Promise.resolve().then(() => drain(token));
        running = job;
        pending = operations.length;
        setPhase(token, 'saving');
        job.finally(() => {
          if (running === job) {
            running = null;
            if (current(token) && !['error', 'offline'].includes(gate.phase)) setPhase(token, 'ready');
          }
        }).catch(() => {});
      }
      return running;
    } catch (error) { return Promise.reject(cloudError(error)); }
  }

  function subscribe(nextUser, resume = false) {
    unsubscribeRecords();
    const previousUid = user?.uid;
    const token = gate.activate(nextUser?.uid || null);
    user = nextUser ? { uid: nextUser.uid, name: nextUser.displayName || '', email: nextUser.email || '' } : null;
    remoteRows = []; queued = null; running = null; pending = 0; errorText = '';
    if (!resume || previousUid !== user?.uid) lastRequest = null;
    emit(); // The account scope must change before any records for the new UID arrive.
    if (!nextUser) return;
    unsubscribeRecords = onSnapshot(collection(db, 'users', token.uid, 'assessmentRecords'), { includeMetadataChanges: true }, snapshot => {
      if (!current(token)) return;
      if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) {
        setPhase(token, !online() ? 'offline' : running ? 'saving' : 'loading');
        return;
      }
      try {
        const rows = snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
        const state = stateFromAssessmentRecords(rows);
        remoteRows = rows; onRemote(state);
        if (!current(token)) return;
        setPhase(token, !online() ? 'offline' : running ? 'saving' : 'ready');
        if (resume && lastRequest?.uid === token.uid && !running) {
          const stateToRetry = lastRequest.state; lastRequest = null;
          sync(stateToRetry).catch(() => {});
        }
      } catch (error) { setPhase(token, 'error', cloudError(error).message); }
    }, error => setPhase(token, online() ? 'error' : 'offline', cloudError(error).message));
  }

  gate.phase = 'loading'; emit();
  const unsubscribeAuth = onAuthStateChanged(auth, nextUser => subscribe(nextUser), error => {
    unsubscribeRecords(); gate.activate(null); user = null; queued = null; pending = 0;
    gate.phase = 'error'; errorText = cloudError(error).message; emit();
  });
  const handleOffline = () => { const token = gate.capture(); if (token.uid) setPhase(token, 'offline'); };
  const handleOnline = () => { if (active && auth.currentUser && !running) subscribe(auth.currentUser, true); };
  globalThis.window?.addEventListener('offline', handleOffline);
  globalThis.window?.addEventListener('online', handleOnline);

  return {
    configured: true,
    async signIn() {
      if (!active) throw new Error('This cloud session has closed. Reload before signing in.');
      if (pending || running) throw new Error('Wait for assessment cloud saves to finish before changing accounts.');
      try {
        await persistenceReady;
        if (!active) throw new Error('This cloud session has closed.');
        const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } catch (error) { errorText = cloudError(error).message; emit(); throw cloudError(error); }
    },
    async signOut() {
      if (pending || running) throw new Error('Wait for assessment cloud saves to finish before signing out.');
      unsubscribeRecords(); gate.activate(null); user = null; remoteRows = []; queued = null; lastRequest = null; pending = 0; errorText = ''; emit();
      try { await firebaseSignOut(auth); }
      catch (error) { subscribe(auth.currentUser); throw cloudError(error); }
    },
    sync,
    retry() { if (active) { if (auth.currentUser && !running) subscribe(auth.currentUser, true); else emit(); } },
    destroy() {
      active = false; gate.activate(null); queued = null; lastRequest = null; unsubscribeRecords(); unsubscribeAuth();
      globalThis.window?.removeEventListener('offline', handleOffline);
      globalThis.window?.removeEventListener('online', handleOnline);
    },
  };
}
