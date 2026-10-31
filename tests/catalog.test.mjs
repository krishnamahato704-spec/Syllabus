import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_INITIAL_TESTS,QUESTION_BANK} from '../src/data/tests-data.js';
import {validateTestPaper,canonicalStem,prepareAttemptPaper} from '../src/assessment-validation.js';
const count=(qs,p)=>qs.filter(p).length;
test('every active paper is valid with distinct underlying stems and a stable version',()=>{
 assert.ok(ALL_INITIAL_TESTS.length>53); assert.ok(QUESTION_BANK.length>=540);
 for(const t of ALL_INITIAL_TESTS){validateTestPaper(t);assert.equal(new Set(t.questions.map(q=>canonicalStem(q.question))).size,t.questions.length);assert.match(t.version,/2026/);}
});
test('all authored questions are reachable through the paper catalog',()=>{
 const reachable=new Set(ALL_INITIAL_TESTS.flatMap(t=>t.questions.map(q=>q.id)));
 assert.deepEqual(QUESTION_BANK.filter(q=>!reachable.has(q.id)).map(q=>q.id),[]);
});
test('CTET full forms have the required content/pedagogy and two-passage language compositions',()=>{
 for(const t of ALL_INITIAL_TESTS.filter(t=>t.category==='ctet'&&t.syllabusSection==='full_mock')){
  assert.equal(t.questions.length,150);assert.equal(t.durationMinutes,150);
  assert.deepEqual(['cdp','lang1','lang2','sst'].map(s=>count(t.questions,q=>q.section===s)),[30,30,30,60]);
  for(const s of ['lang1','lang2']){const qs=t.questions.filter(q=>q.section===s);assert.equal(count(qs,q=>q.kind==='pedagogy'),15);assert.equal(count(qs,q=>q.kind==='comprehension'),15);assert.equal(new Set(qs.filter(q=>q.passage).map(q=>q.passage.id)).size,2);}
  const english=t.questions.filter(q=>q.section==='lang1'&&q.passage);assert.equal(count(english,q=>q.passage.type==='poem'),5);
  assert.equal(count(t.questions,q=>q.section==='sst'&&q.kind==='pedagogy'),20);
  assert.deepEqual(['development','inclusion','learning'].map(d=>count(t.questions,q=>q.section==='cdp'&&q.domain===d)),[15,5,10]);
 }
});
test('NET full forms cover all ten units of both papers without guessing History weighting is official',()=>{
 for(const t of ALL_INITIAL_TESTS.filter(t=>t.category==='ugc_net'&&t.syllabusSection==='full_mock')){
  assert.equal(t.durationMinutes,180);assert.equal(t.totalMarks,300);
  const p1=t.questions.filter(q=>q.section==='p1'),p2=t.questions.filter(q=>q.section==='p2');assert.equal(p1.length,50);assert.equal(p2.length,100);
  assert.equal(new Set(p1.map(q=>q.unit)).size,10);assert.equal(new Set(p2.map(q=>q.unit)).size,10);assert.match(t.coverage.note,/app.*balance/i);
 }
});
test('strictly ancient drills never include medieval/modern/historiography questions',()=>{
 const drills=ALL_INITIAL_TESTS.filter(t=>t.category==='ugc_net'&&t.syllabusSection==='ancient');assert.ok(drills.length);
 for(const t of drills)for(const q of t.questions)assert.ok(['history-1','history-2'].includes(q.unit),q.unit);
});
test('form variants change selected concepts; option positions are balanced for the actual sitting',()=>{
 for(const category of ['ctet','ugc_net']){const forms=ALL_INITIAL_TESTS.filter(t=>t.category===category&&t.syllabusSection==='full_mock');assert.ok(forms.length>=3);assert.notDeepEqual(new Set(forms[0].questions.map(q=>q.id)),new Set(forms[1].questions.map(q=>q.id)));}
 for(const t of ALL_INITIAL_TESTS){const p=prepareAttemptPaper(t,'test-seed');const n=[0,1,2,3].map(i=>count(p.questions,q=>q.correctAnswer===i));assert.ok(Math.max(...n)-Math.min(...n)<=1);}
 const full=prepareAttemptPaper(ALL_INITIAL_TESTS.find(t=>t.questions.length===150),'position-regression');
 assert.ok(full.questions.some((q,i,all)=>i>=4&&q.correctAnswer!==all[i%4].correctAnswer),'The answer key must not repeat a predictable four-position cycle');
});
