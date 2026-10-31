import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NET_QUESTIONS as bank } from '../src/data/net-questions.js';

const normal = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const p1Units = ['teaching','research','comprehension','communication','mathematical-reasoning','logical-reasoning','data-interpretation','ict','environment','higher-education'];
const domains = ['ancient','ancient','ancient','medieval','medieval','medieval','modern','modern','modern','historiography'];
const syllabus = JSON.parse(fs.readFileSync(new URL('../src/data/syllabus.json', import.meta.url), 'utf8'));
const leaves = new Set(syllabus.units.flatMap(u => u.topics.flatMap(t => t.items.map(i => i.id))));

test('NET questions have distinct canonical identities, stems and four-option contracts', () => {
  assert.equal(bank.length, 220);
  assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
  assert.equal(new Set(bank.map(q => normal(q.question))).size, bank.length);
  for (const q of bank) {
    assert.ok(q.id && q.unit && q.domain && q.topic && q.kind, q.id);
    assert.ok(q.question.trim().length > 35, q.id);
    assert.ok(q.explanation.trim().length > 50, q.id);
    assert.equal(q.options.length, 4, q.id);
    assert.ok(q.options.every(o => typeof o === 'string' && o.trim()), q.id);
    assert.equal(new Set(q.options.map(normal)).size, 4, q.id);
    assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < 4, q.id);
    assert.ok(['Moderate','High'].includes(q.difficulty), q.id);
    assert.ok(q.source.name.includes('topic reference'), q.id);
    assert.equal(new URL(q.source.url).protocol, 'https:', q.id);
    assert.ok(q.syllabusIds?.length, q.id);
    assert.ok(q.syllabusIds.every(id => leaves.has(id)), q.id);
    assert.doesNotMatch(q.explanation, /official(?:ly)?[- ](?:verified|certified)|official answer key/i, q.id);
  }
});

test('all ten Paper I units have a useful independent pool', () => {
  const p1 = bank.filter(q => q.section === 'p1');
  assert.equal(p1.length, 80);
  assert.deepEqual(new Set(p1.map(q => q.unit)), new Set(p1Units));
  for (const unit of p1Units) {
    const pool = p1.filter(q => q.unit === unit);
    assert.equal(pool.length, 8, unit);
    assert.ok(pool.every(q => q.domain === unit), unit);
    assert.ok(pool.every(q => q.syllabusIds.every(id => id.startsWith('N'))), unit);
    assert.equal(new Set(pool.map(q => q.correctAnswer)).size, 4, unit);
  }
});

test('History uses actual ten-unit identifiers and a documented period mapping', () => {
  const history = bank.filter(q => q.section === 'p2');
  assert.equal(history.length, 140);
  for (let number = 1; number <= 10; number++) {
    const unit = `history-${number}`;
    const pool = history.filter(q => q.unit === unit);
    assert.equal(pool.length, 14, unit);
    assert.ok(pool.every(q => q.domain === domains[number - 1]), unit);
    assert.ok(pool.every(q => q.syllabusIds.every(id => id.startsWith('H'))), unit);
    assert.equal(new Set(pool.map(q => q.correctAnswer)).size, 4, unit);
  }
  const ancient = history.filter(q => q.domain === 'ancient');
  assert.equal(ancient.length, 42);
  assert.ok(ancient.every(q => ['history-1','history-2','history-3'].includes(q.unit)));
  // Only the stem is checked: distractors can legitimately name later periods.
  assert.ok(ancient.every(q => !/Mughal|Delhi Sultanate|British annexation|Indian National Congress/i.test(q.question)), 'Later-period questions leaked into the ancient/early medieval survey.');
});

test('reading items include consistent original passages and evidence-based prompts', () => {
  const reading = bank.filter(q => q.section === 'p1' && q.unit === 'comprehension');
  const groups = new Map();
  for (const q of reading) {
    assert.equal(q.kind, 'comprehension', q.id);
    assert.equal(q.passage?.type, 'prose', q.id);
    assert.ok(q.passage.text.split(/\s+/).length >= 100, q.id);
    const group = groups.get(q.passage.id) || [];
    group.push(q);
    groups.set(q.passage.id, group);
  }
  assert.equal(groups.size, 2);
  for (const [id, group] of groups) {
    assert.equal(group.length, 4, id);
    assert.equal(new Set(group.map(q => q.passage.text)).size, 1, id);
    assert.equal(new Set(group.map(q => normal(q.question))).size, 4, id);
  }
});

test('quantitative items are self-contained and keep independently calculated answers', () => {
  const answer = id => {
    const q = bank.find(q => q.id === id);
    assert.ok(q, id);
    return q.options[q.correctAnswer];
  };
  const expectedMath = ['₹1,920','₹64,000','66','48 km/h','48','EBUB','₹2,100','12.5%'];
  for (let i = 0; i < expectedMath.length; i++) {
    assert.equal(answer(`net-p1-mathematical-reasoning-${String(i + 1).padStart(2,'0')}`), expectedMath[i]);
  }
  const expectedData = ['33⅓%','Economics','37.5%','More distinct students borrowed books in 2025','South','78.3%','3:2','70'];
  for (let i = 0; i < expectedData.length; i++) {
    const id = `net-p1-data-interpretation-${String(i + 1).padStart(2,'0')}`;
    assert.equal(answer(id), expectedData[i]);
    assert.match(bank.find(q => q.id === id).question, /Original practice data:/);
    assert.match(bank.find(q => q.id === id).question, /\|/);
  }
  assert.equal(answer('net-p1-logical-reasoning-06'), '10');
  assert.equal(answer('net-p1-ict-07'), '4,096');
  assert.equal(answer('net-p1-environment-08'), '7,000 kg CO₂');
});

test('reviewed historical distinctions retain the intended answers', () => {
  const answer = id => { const q = bank.find(q => q.id === id); return q.options[q.correctAnswer]; };
  assert.equal(answer('net-p2-history-1-02'), 'Lothal');
  assert.equal(answer('net-p2-history-4-01'), 'Ziauddin Barani');
  assert.equal(answer('net-p2-history-7-05'), 'Alleged misgovernment');
  assert.equal(answer('net-p2-history-8-04'), 'The zamindars’ land-revenue demand payable to the Company');
  assert.equal(answer('net-p2-history-9-09'), '26 November 1949 and 26 January 1950');
  assert.equal(answer('net-p2-history-10-05'), 'External criticism followed by internal criticism');
});
