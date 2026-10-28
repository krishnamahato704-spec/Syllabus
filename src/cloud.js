import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
  setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { normalizeEntry, applyPatch } from './study.js';
import { SessionGate } from './session.js';

export function friendlyCloudError(error) {
  const code = error?.code || '';
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) return 'Sign-in was cancelled. You can try again.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.';
  if (code.includes('unauthorized-domain')) return `This site's domain (${location.hostname}) must be added in Firebase Authentication → Settings → Authorised domains.`;
  if (code.includes('operation-not-allowed')) return 'Google sign-in is not enabled in this Firebase project yet. See the setup guide.';
  if (code.includes('permission-denied')) return 'Your progress could not be accessed. Check that the supplied Firestore rules are published for this project, then retry sync.';
  if (code.includes('unavailable') || code.includes('network')) return 'The cloud connection is unavailable. Reconnect and retry; unconfirmed changes are not labelled saved.';
  if (code.includes('invalid-api-key') || code.includes('project-not-found')) return 'The Firebase web-app configuration needs to be checked.';
  return error?.message || 'Cloud sync could not finish. Please retry.';
}

export function createCloudStore(config, index, notify) {
  const gate = new SessionGate();
  let active = true, user = null, records = {}, optimistic = {}, pending = new Set(), unsubscribeRecords = () => {};
  const isConfigured = !!(config?.apiKey && config?.authDomain && config?.projectId && config?.appId);
  const emit = (error = '') => {
    if (active) notify({ configured: isConfigured, phase: gate.phase, user,
      entries: { ...records, ...optimistic }, pending: [...pending], error });
  };
  if (!isConfigured) {
    gate.phase = 'unconfigured'; emit();
    const unavailable = async () => { throw new Error('Cloud sync needs your Firebase web-app configuration. Open the setup guide.'); };
    return { configured: false, signIn: unavailable, signOut: unavailable, patch: unavailable,
      importRecords: unavailable, capture: () => gate.capture(), retry() {}, destroy() { active = false; } };
  }
  const name = `study-atlas-${config.projectId}`;
  const app = getApps().find(a => a.name === name) || initializeApp(config, name);
  const auth = getAuth(app), db = getFirestore(app);
  const persistenceReady = setPersistence(auth, browserLocalPersistence)
    .catch(() => setPersistence(auth, inMemoryPersistence));

  function subscribe(nextUser) {
    unsubscribeRecords();
    const token = gate.activate(nextUser?.uid || null);
    user = nextUser ? { uid: nextUser.uid, name: nextUser.displayName || '', email: nextUser.email || '' } : null;
    records = {}; optimistic = {}; pending = new Set(); emit();
    if (!nextUser) return;
    unsubscribeRecords = onSnapshot(collection(db, 'users', token.uid, 'items'), { includeMetadataChanges: true }, snapshot => {
      if (!gate.isCurrent(token)) return;
      const loaded = {};
      snapshot.forEach(d => {
        if (!index.itemMap[d.id]) return;
        const value = d.data();
        loaded[d.id] = normalizeEntry({ ...value, updatedAt: value.updatedAt?.toDate?.().toISOString() || null });
      });
      records = loaded;
      gate.setPhase(token, snapshot.metadata.fromCache ? (navigator.onLine ? 'loading' : 'offline') : 'ready');
      emit();
    }, error => {
      if (!gate.isCurrent(token)) return;
      gate.setPhase(token, 'error'); emit(friendlyCloudError(error));
    });
  }
  const unsubscribeAuth = onAuthStateChanged(auth, subscribe, error => {
    gate.activate(null); gate.phase = 'error'; user = null; records = {}; optimistic = {}; emit(friendlyCloudError(error));
  });
  const handleOffline = () => { if (user) { gate.setPhase(gate.capture(), 'offline'); emit(); } };
  const handleOnline = () => { if (auth.currentUser) subscribe(auth.currentUser); };
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  async function patch(id, changes, token = gate.capture()) {
    gate.assertWritable(token);
    if (!navigator.onLine) throw new Error('You are offline. Reconnect before saving cloud progress.');
    if (!index.itemMap[id]) throw new Error('This subtopic is not in the checklist.');
    if (pending.has(id)) throw new Error('This subtopic is still saving. Please wait.');
    const now = new Date().toISOString();
    optimistic[id] = applyPatch(records[id], changes, now); pending.add(id); emit();
    try {
      const result = await runTransaction(db, async transaction => {
        gate.assertWritable(token);
        const ref = doc(db, 'users', token.uid, 'items', id);
        const snapshot = await transaction.get(ref);
        gate.assertWritable(token);
        const current = snapshot.exists() ? snapshot.data() : {};
        const next = applyPatch(current, changes, now);
        transaction.set(ref, { status: next.status, needsRevision: next.needsRevision, notes: next.notes,
          completedAt: next.completedAt, updatedAt: serverTimestamp() });
        return next;
      });
      if (gate.isCurrent(token)) records[id] = result;
    } catch (error) {
      if (gate.isCurrent(token)) { delete optimistic[id]; pending.delete(id); emit(); }
      throw new Error(friendlyCloudError(error));
    } finally {
      if (gate.isCurrent(token)) { delete optimistic[id]; pending.delete(id); emit(); }
    }
  }

  return {
    configured: true,
    capture: () => gate.capture(),
    async signIn() {
      await persistenceReady;
      const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
      try { await signInWithPopup(auth, provider); } catch (error) { throw new Error(friendlyCloudError(error)); }
    },
    async signOut() {
      if (pending.size) throw new Error('Wait for the current save to finish before signing out.');
      unsubscribeRecords(); gate.activate(null); user = null; records = {}; optimistic = {}; emit();
      try { await signOut(auth); }
      catch (error) { subscribe(auth.currentUser); throw new Error(friendlyCloudError(error)); }
    },
    patch,
    async importRecords(entries, onProgress = () => {}) {
      const token = gate.capture(); gate.assertWritable(token);
      const rows = Object.entries(entries); let saved = 0;
      try {
        for (const [id, entry] of rows) {
          gate.assertWritable(token);
          await patch(id, { status: entry.status, needsRevision: entry.needsRevision, notes: entry.notes, completedAt: entry.completedAt }, token);
          saved++; onProgress(saved, rows.length);
        }
        return { saved, total: rows.length };
      } catch (error) {
        throw new Error(`Imported ${saved} of ${rows.length} records. ${error.message} You can retry the same backup to finish.`);
      }
    },
    retry() { if (auth.currentUser) subscribe(auth.currentUser); },
    destroy() {
      active = false; gate.activate(null); unsubscribeRecords(); unsubscribeAuth();
      window.removeEventListener('offline', handleOffline); window.removeEventListener('online', handleOnline);
    },
  };
}
