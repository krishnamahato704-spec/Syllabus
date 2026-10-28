import test from 'node:test';
import assert from 'node:assert/strict';
import syllabus from '../src/data/syllabus.json' with { type: 'json' };

let api;
try { api = await import('../src/study.js'); } catch {}
test('study logic is available', () => assert.ok(api, 'The study behaviour module has not been implemented yet.'));
const check = (title, fn) => test(title, { skip: !api }, fn);
const NOW = '2026-10-28T10:00:00.000Z';

test('the full revised checklist contains 204 topics and 1602 unique subtopics', () => {
  const topics = syllabus.units.flatMap(u => u.topics);
  const items = topics.flatMap(t => t.items);
  assert.equal(topics.length, 204);
  assert.equal(items.length, 1602);
  assert.equal(new Set(items.map(i => i.id)).size, 1602);
  assert.equal(syllabus.units.filter(u => u.part === 2).length, 11);
});

check('exact-ID and concept searches keep their parent topic and matching rows', () => {
  const index = api.buildIndex(syllabus);
  const result = api.filterTopics(index, {}, { query: 'H004.04' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'H004');
  assert.deepEqual(result[0].visibleItems.map(x => x.id), ['H004.04']);
  assert.match(result[0].unitTitle, /Sources/);
  assert.ok(api.filterTopics(index, {}, { query: 'town planning' }).some(t => t.id === 'H004'));
  assert.ok(api.filterTopics(index, {}, { query: 'संज्ञा' }).some(t => t.id === 'HI002'));
});

check('completion and revision totals use only known syllabus records', () => {
  const index = api.buildIndex(syllabus);
  const entries = { 'H004.04': { status: 'complete', needsRevision: true }, 'G001.01': { status: 'studying' }, 'FAKE.01': { status: 'complete' } };
  assert.deepEqual(api.progressStats(index, entries), { total: 1602, complete: 1, studying: 1, revision: 1, notStarted: 1600, percent: 0 });
  assert.equal(api.filterTopics(index, entries, { status: 'revision' })[0].id, 'H004');
});

check('status changes timestamp completion but notes and revision do not reset it', () => {
  const complete = api.applyPatch({}, { status: 'complete' }, NOW);
  assert.equal(complete.completedAt, NOW);
  const noted = api.applyPatch(complete, { notes: 'Drainage evidence', needsRevision: true }, '2026-11-02T00:00:00.000Z');
  assert.equal(noted.completedAt, NOW);
  assert.equal(noted.status, 'complete');
  const reopened = api.applyPatch(noted, { status: 'studying' }, NOW);
  assert.equal(reopened.completedAt, null);
});

check('a notes dialog saves only fields the user changed', () => {
  const original = { status: 'studying', notes: 'Earlier notes', needsRevision: false };
  assert.deepEqual(api.changedStudyFields(original, { ...original, notes: 'New notes' }), { notes: 'New notes' });
  assert.deepEqual(api.changedStudyFields(original, { ...original, status: 'complete', needsRevision: true }), { status: 'complete', needsRevision: true });
  assert.deepEqual(api.changedStudyFields(original, original), {});
});

check('assessment scope uses India-time dates and excludes unchecked or later items', () => {
  const index = api.buildIndex(syllabus);
  const entries = {
    'G001.01': { status: 'complete', completedAt: '2026-10-27T18:29:59.999Z' },
    'H004.04': { status: 'complete', completedAt: '2026-10-27T18:30:00.000Z' },
    'H004.05': { status: 'studying', completedAt: NOW },
    'H004.06': { status: 'complete', completedAt: '2026-10-28T18:30:00.000Z' },
  };
  const result = api.assessmentScope(index, entries, { fromDay: '2026-10-28', toDay: '2026-10-28', includeOlder: true });
  assert.deepEqual(result.current.map(x => x.id), ['H004.04']);
  assert.deepEqual(result.older.map(x => x.id), ['G001.01']);
  assert.equal(api.indiaDay('2026-10-27T18:30:00Z'), '2026-10-28');
  assert.throws(() => api.assessmentScope(index, entries, { fromDay: '2026-02-30', toDay: '2026-03-01' }), /date/i);
  assert.throws(() => api.assessmentScope(index, entries, { fromDay: '2026-11-01', toDay: '2026-10-01' }), /before|range/i);
});

check('assessment and research prompts contain exact eligible IDs and source URLs', () => {
  const index = api.buildIndex(syllabus);
  const entries = { 'H004.04': api.applyPatch({}, { status: 'complete' }, NOW) };
  const scope = api.assessmentScope(index, entries, { fromDay: '2026-10-28', toDay: '2026-10-28' });
  const prompt = api.makeAssessmentPrompt(scope, { mode: 'NET', count: 30 });
  assert.match(prompt, /H004\.04/);
  assert.doesNotMatch(prompt, /H004\.05/);
  assert.match(prompt, /without.*answer|questions first/i);
  assert.match(api.makeTopicPrompt(index.topicMap.H004, entries, 'research', syllabus.sources), /https:\/\//);
  assert.match(api.makeTopicPrompt(index.topicMap.H004, entries, 'review', syllabus.sources), /do not.*complete|only.*understand/i);
});

check('backup round-trip preserves Unicode notes, completion date and revision state', () => {
  const index = api.buildIndex(syllabus);
  const entries = { 'HI002.01': api.applyPatch({}, { status: 'complete', notes: 'संज्ञा के उदाहरण', needsRevision: true }, NOW) };
  const backup = api.makeBackup(entries, index, NOW);
  assert.deepEqual(api.parseBackup(JSON.stringify(backup), index).entries, entries);
  assert.match(api.completedMarkdown(index, entries), /\[x\] HI002\.01/);
});

check('invalid backups are rejected before any records are returned', () => {
  const index = api.buildIndex(syllabus);
  const wrap = entries => JSON.stringify({ app: 'study-atlas', version: 1, syllabusVersion: syllabus.version, entries });
  assert.throws(() => api.parseBackup('{bad json', index), /JSON|file/i);
  assert.throws(() => api.parseBackup(wrap({ 'H999.99': { status: 'complete' } }), index), /unknown/i);
  assert.throws(() => api.parseBackup(wrap({ 'H004.04': { status: 'bogus' } }), index), /status/i);
  assert.throws(() => api.parseBackup(wrap({ 'H004.04': { status: 'complete', completedAt: 'yesterday' } }), index), /date|timestamp/i);
  assert.throws(() => api.parseBackup(wrap({ 'H004.04': { status: 'studying', notes: 'a'.repeat(4001) } }), index), /note/i);
  assert.throws(() => api.parseBackup(wrap({ 'H004.04': { status: 'studying', needsRevision: 'yes' } }), index), /revision/i);
  assert.throws(() => api.parseBackup(JSON.stringify({ app: 'other', version: 1, entries: {} }), index), /backup/i);
});
