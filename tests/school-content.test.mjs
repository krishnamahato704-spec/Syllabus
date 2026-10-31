import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHOOL_QUESTIONS as bank } from '../src/data/school-questions.js';

const normal = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
test('school content has unique canonical items and complete answer contracts', () => {
  assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
  assert.equal(new Set(bank.map(q => normal(q.question))).size, bank.length);
  for (const q of bank) {
    assert.ok(q.id && q.domain && q.unit && q.topic && q.explanation, q.id);
    assert.equal(q.options.length, 4, q.id);
    assert.equal(new Set(q.options.map(normal)).size, 4, q.id);
    assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < 4, q.id);
    assert.ok(['Moderate', 'High'].includes(q.difficulty), q.id);
    assert.ok(['content','pedagogy','comprehension','calculation','data'].includes(q.kind), q.id);
    assert.ok(new URL(q.source.url).hostname.endsWith('ncert.nic.in'), q.id);
    assert.equal(q.review.status, 'reviewed', q.id);
  }
});
test('school pools can support the advertised CTET section quotas', () => {
  const count = predicate => bank.filter(predicate).length;
  assert.ok(count(q => q.section === 'cdp' && q.domain === 'development') >= 15);
  assert.ok(count(q => q.section === 'cdp' && q.domain === 'inclusion') >= 5);
  assert.ok(count(q => q.section === 'cdp' && q.domain === 'learning') >= 10);
  assert.ok(count(q => q.section === 'cdp') >= 60);
  for (const section of ['lang1','lang2']) {
    assert.ok(count(q => q.section === section && q.kind === 'pedagogy') >= 20);
    assert.ok(count(q => q.section === section && q.kind === 'comprehension') >= 30);
  }
  assert.ok(count(q => q.section === 'sst' && q.kind !== 'pedagogy') >= 60);
  assert.ok(count(q => q.section === 'sst' && q.kind === 'pedagogy') >= 25);
  assert.ok(count(q => q.section === 'all') >= 70);
});
test('original passage groups support the official two-passage language compositions', () => {
  const groups = new Map();
  for (const q of bank.filter(q => q.kind === 'comprehension')) {
    assert.ok(q.passage?.text.length >= 150, q.id);
    const group = groups.get(q.passage.id) || [];
    group.push(q);
    groups.set(q.passage.id, group);
  }
  for (const [id, group] of groups) {
    const expected = group[0].section === 'lang1' ? (group[0].passage.type === 'poem' ? 5 : 10)
      : ['school-passage-tank','school-passage-bus','school-passage-weaver'].includes(id) ? 8 : 7;
    assert.equal(group.length, expected, id);
    assert.equal(new Set(group.map(q => q.passage.text)).size, 1, id);
  }
  assert.ok([...groups.values()].some(g => g[0].section === 'lang1' && g[0].passage.type === 'poem'));
  const sizes = section => [...groups.values()].filter(g => g[0].section === section).map(g => g.length);
  assert.deepEqual(sizes('lang1').sort((a,b) => a-b), [5,5,5,10,10,10]);
  assert.deepEqual(sizes('lang2').sort((a,b) => a-b), [7,7,7,8,8,8]);
});
test('question mappings use real syllabus IDs and support broad school filters', () => {
  const syllabus = JSON.parse(readFileSync(new URL('../src/data/syllabus.json', import.meta.url), 'utf8'));
  const ids = new Set();
  function collect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.id) ids.add(value.id);
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) child.forEach(collect);
      else if (child && typeof child === 'object') collect(child);
    }
  }
  collect(syllabus);
  for (const q of bank) for (const id of q.syllabusIds) assert.ok(ids.has(id), `${q.id}: ${id}`);
  for (const domain of ['history','geography','civics','economics']) {
    assert.ok(bank.filter(q => q.section === 'all' && q.domain === domain).length >= 15, domain);
  }
  const reading = bank.filter(q => q.section === 'lang1' && q.passage);
  assert.equal(new Set(reading.filter(q => q.passage.type === 'poem').map(q => q.passage.id)).size, 3);
  assert.equal(new Set(reading.filter(q => q.passage.type === 'prose').map(q => q.passage.id)).size, 3);
});
test('independent factual and reading examples retain their intended answers', () => {
  const answer = id => { const q = bank.find(q => q.id === id); assert.ok(q, id); return q.options[q.correctAnswer]; };
  assert.equal(answer('school-sst-scale-distance'), '6 km');
  assert.equal(answer('school-ncert-opportunity-cost'), 'The value of the best alternative given up');
  assert.equal(answer('school-en-library-reason'), 'Borrowers returned before the room opened');
  assert.equal(answer('school-hi-tank-cause'), 'नाली पत्तों से बंद थी');
});
