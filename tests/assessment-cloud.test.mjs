import test from 'node:test';
import assert from 'node:assert/strict';
import { getApps } from 'firebase/app';

let cloud;
try { cloud = await import('../src/assessment-cloud.js'); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
test('assessment cloud adapter is available', () => assert.ok(cloud?.createAssessmentCloud, 'Assessment cloud adapter has not been implemented.'));
const check = (name, fn) => test(name, { skip: !cloud }, fn);
const paper = id => ({ id, title: `Practice ${id}`, category: 'ncert', durationMinutes: 10, totalMarks: 1, markingScheme: { correct: 1, incorrect: 0 }, sections: [{ id: 'all', name: 'Practice' }], questions: [{ id: `${id}-q`, section: 'all', question: `Which answer is first for ${id}?`, options: ['First', 'Second', 'Third', 'Fourth'], correctAnswer: 0 }] });
const attempt = id => ({ testId: id, completed: true, submittedAt: '2026-10-30T12:00:00Z', testSnapshot: paper(id), userAnswers: { [`${id}-q`]: 0 }, statusMap: {}, score: 1, maxScore: 1, correctCount: 1, incorrectCount: 0, unattemptedCount: 0 });
const draft = id => ({ testId: id, testSnapshot: paper(id), startedAt: '2026-10-30T12:00:00Z', deadline: Date.parse('2026-10-30T12:10:00Z'), userAnswers: {}, statusMap: {}, activeSectionId: 'all', currentIndex: 0, visitedIds: [] });
const empty = () => ({ version: 1, customTests: [], attempts: {}, drafts: {}, archivedTests: [], migrationWarnings: [] });

check('an older device cannot overwrite a newer cloud draft at planning or commit time',()=>{
 const old=empty();old.drafts.shared={...draft('shared'),updatedAt:'2026-10-30T12:01:00Z'};
 const newer=structuredClone(old);newer.drafts.shared.updatedAt='2026-10-30T12:02:00Z';newer.drafts.shared.userAnswers={'shared-q':1};
 const rows=cloud.assessmentRecordsFromState(newer),item=cloud.assessmentRecordsFromState(old)[0];
 assert.deepEqual(cloud.planAssessmentSync(old,rows),[]);assert.deepEqual(cloud.resolveAssessmentWrite(item,rows).writes,[]);
});
check('two different sittings of one paper produce a conflict instead of a last-writer overwrite',()=>{
 const first=empty();first.drafts.shared=draft('shared');const second=structuredClone(first);second.drafts.shared.startedAt='2026-10-30T12:01:00Z';second.drafts.shared.deadline+=60000;
 assert.throws(()=>cloud.planAssessmentSync(first,cloud.assessmentRecordsFromState(second)),/conflict/i);
});

check('null configuration emits an honest state without creating a Firebase app', async () => {
  const before = getApps().length, states = [], remote = [];
  const adapter = cloud.createAssessmentCloud(null, { onState: state => states.push(state), onRemote: state => remote.push(state) });
  assert.equal(adapter.configured, false);
  assert.deepEqual(states[0], { phase: 'unconfigured', user: null, error: '', pending: 0 });
  await assert.rejects(adapter.signIn(), /Firebase|configuration/i);
  await assert.rejects(adapter.sync(empty()), /Firebase|configuration/i);
  adapter.retry(); adapter.destroy();
  assert.equal(getApps().length, before);
  assert.deepEqual(remote, []);
});

check('canonical comparison ignores object insertion order while retaining option order', () => {
  assert.equal(cloud.canonicalPayload({ b: 2, a: { y: 2, x: 1 } }), '{"a":{"x":1,"y":2},"b":2}');
  assert.notEqual(cloud.canonicalPayload(['First', 'Second']), cloud.canonicalPayload(['Second', 'First']));
  assert.throws(() => cloud.canonicalPayload({ score: NaN }), /finite|JSON/i);
});

check('payload size uses UTF-8 bytes and rejects records at the 600 KB boundary', () => {
  assert.doesNotThrow(() => cloud.canonicalPayload('अ'.repeat(199999)));
  assert.throws(() => cloud.canonicalPayload('अ'.repeat(200000)), /600|large|size/i);
});

check('paper, draft and immutable attempt records round-trip through a complete envelope', () => {
  const state = empty(); state.customTests = [paper('custom-one')]; state.attempts['done-one'] = attempt('done-one'); state.drafts['draft-one'] = draft('draft-one');
  const records = cloud.assessmentRecordsFromState(state);
  assert.deepEqual(records.map(row => row.id).sort(), ['attempt:done-one', 'draft:draft-one', 'paper:custom-one']);
  assert.deepEqual(cloud.stateFromAssessmentRecords(records), state);
});

check('malformed remote data is rejected as a whole instead of silently losing records', () => {
  const state = empty(); state.customTests = [paper('custom-one')];
  const records = cloud.assessmentRecordsFromState(state);
  assert.throws(() => cloud.stateFromAssessmentRecords([...records, { id: 'attempt:bad', kind: 'attempt', paperId: 'bad', payload: '{"testId":"different"}' }]), /match|invalid/i);
  assert.throws(() => cloud.stateFromAssessmentRecords([{ ...records[0], id: 'paper:other' }]), /match|invalid/i);
  assert.throws(() => cloud.stateFromAssessmentRecords([{ ...records[0], payload: '{broken' }]), /JSON|invalid/i);
});

check('oversized incoming JSON is rejected even when excess whitespace would canonicalize away', () => {
  const state = empty(); state.customTests = [paper('custom-one')];
  const record = cloud.assessmentRecordsFromState(state)[0];
  assert.throws(() => cloud.stateFromAssessmentRecords([{ ...record, payload: record.payload + ' '.repeat(600000) }]), /600|large|size/i);
});

check('unchanged canonical payloads produce no cloud writes', () => {
  const state = empty(); state.customTests = [paper('custom-one')];
  const remote = cloud.assessmentRecordsFromState(state).map(record => ({ ...record, payload: JSON.stringify(JSON.parse(record.payload), null, 2) }));
  assert.deepEqual(cloud.planAssessmentSync(state, remote), []);
});

check('a different completed attempt raises a conflict without mutating either record', () => {
  const local = empty(); local.attempts.done = attempt('done');
  const remoteState = structuredClone(local); remoteState.attempts.done.submittedAt = '2026-10-30T12:01:00Z';
  const remote = cloud.assessmentRecordsFromState(remoteState), before = structuredClone(remote);
  assert.throws(() => cloud.planAssessmentSync(local, remote), error => error.code === 'assessment/conflict' && error.paperId === 'done' && /both|backup|conflict/i.test(error.message));
  assert.deepEqual(remote, before);
  assert.equal(local.attempts.done.submittedAt, '2026-10-30T12:00:00Z');
});

check('completed attempt operations delete only their matching draft after the attempt commits', () => {
  const local = empty(); local.attempts.done = attempt('done');
  const remoteState = empty(); remoteState.drafts.done = draft('done'); remoteState.drafts.unrelated = draft('unrelated');
  const operations = cloud.planAssessmentSync(local, cloud.assessmentRecordsFromState(remoteState));
  assert.equal(operations.length, 1);
  assert.equal(operations[0].kind, 'attempt');
  assert.equal(operations[0].paperId, 'done');
  assert.equal(operations[0].deleteDraft, true);
});

check('absence from one device never erases unrelated remote drafts', () => {
  const remote = empty(); remote.drafts.unrelated = draft('unrelated');
  assert.deepEqual(cloud.planAssessmentSync(empty(), cloud.assessmentRecordsFromState(remote)), []);
});

check('a completed remote record prevents a local stale draft from being uploaded', () => {
  const local = empty(); local.drafts.done = draft('done');
  const remote = empty(); remote.attempts.done = attempt('done');
  assert.deepEqual(cloud.planAssessmentSync(local, cloud.assessmentRecordsFromState(remote)), []);
});

check('a completed attempt arriving after planning still blocks an overwrite at commit time', () => {
  assert.equal(typeof cloud.resolveAssessmentWrite, 'function', 'Commit-time reconciliation is required.');
  const local = empty(); local.attempts.done = attempt('done');
  const operation = cloud.planAssessmentSync(local, [])[0];
  const fresh = structuredClone(local); fresh.attempts.done.submittedAt = '2026-10-30T12:03:00Z';
  assert.throws(() => cloud.resolveAssessmentWrite(operation, cloud.assessmentRecordsFromState(fresh)), error => error.code === 'assessment/conflict');
});

check('a transaction that discovers completion removes its stale draft and writes no new draft', () => {
  assert.equal(typeof cloud.resolveAssessmentWrite, 'function', 'Commit-time reconciliation is required.');
  const local = empty(); local.drafts.done = draft('done');
  const operation = cloud.planAssessmentSync(local, [])[0];
  const fresh = empty(); fresh.drafts.done = draft('done');
  const rows = [...cloud.assessmentRecordsFromState(fresh), ...cloud.assessmentRecordsFromState({ ...empty(), attempts: { done: attempt('done') } })];
  const result = cloud.resolveAssessmentWrite(operation, rows);
  assert.deepEqual(result.writes, []);
  assert.deepEqual(result.remove, ['draft:done']);
});
