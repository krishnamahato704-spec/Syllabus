import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../src/test-engine.js';

const values = new Map();
let failWrites = false;
globalThis.localStorage = { getItem:k=>values.get(k)??null, setItem:(k,v)=>{if(failWrites)throw new Error('QuotaExceededError');values.set(k,String(v));}, removeItem:k=>values.delete(k), clear:()=>values.clear() };
const paper = (id='fixture') => ({ id,title:'A checked fixture',category:'ncert',durationMinutes:1,markingScheme:{correct:2,incorrect:1},questions:[
  {id:'q1',section:'all',question:'Select the first letter of the alphabet.',options:['A','B','C','D'],correctAnswer:0,explanation:'A comes first.'},
  {id:'q2',section:'all',question:'What is two plus two?',options:['1','2','3','4'],correctAnswer:3,explanation:'2 + 2 = 4.'}
] });
beforeEach(()=>{values.clear();failWrites=false;engine.setAssessmentScope?.('local');});

test('cloud reconciliation adopts a newer draft and never replaces an existing completed result',()=>{
 const first=engine.saveDraft(paper(),{},Date.parse('2026-10-30T12:00:00Z'));
 const remote=engine.getAssessmentState();remote.drafts.fixture={...first,userAnswers:{q1:1},updatedAt:'2026-10-30T12:00:20.000Z'};
 engine.mergeRemoteAssessmentState(remote);assert.equal(engine.getDraft('fixture').userAnswers.q1,1);
 engine.mergeRemoteAssessmentState({...remote,drafts:{fixture:first}});assert.equal(engine.getDraft('fixture').userAnswers.q1,1);
 const result=engine.submitTestAttempt(paper(),{q1:0},{},25);const before=engine.getAttemptForTest('fixture');
 engine.mergeRemoteAssessmentState(remote);assert.deepEqual(engine.getAttemptForTest('fixture'),before);assert.equal(engine.getDraft('fixture'),null);
});
test('conflicting cloud sittings are rejected before any partial merge',()=>{
 engine.saveDraft(paper(),{},Date.parse('2026-10-30T12:00:00Z'));
 const remote=engine.getAssessmentState();remote.customTests.push(engine.validateTestPaper(paper('new-one')));
 remote.drafts.fixture.startedAt='2026-10-30T12:01:00.000Z';remote.drafts.fixture.deadline+=60000;
 const before=engine.getAssessmentState();assert.throws(()=>engine.mergeRemoteAssessmentState(remote),/conflict|different/i);assert.deepEqual(engine.getAssessmentState(),before);
});

test('a save failure does not return a successful completed record',()=>{
 failWrites=true;
 assert.throws(()=>engine.submitTestAttempt(paper(),{q1:0},{},10),/sav|storage|space/i);
 failWrites=false;assert.equal(engine.getAttemptForTest('fixture'),null);
});
test('scoring retains the actual negative score and never invents a percentile',()=>{
 const result=engine.submitTestAttempt(paper(),{q1:1,q2:0},{},10);
 assert.equal(result.score,-2);assert.equal(result.correctCount,0);assert.equal(result.incorrectCount,2);
 assert.equal(Object.hasOwn(result,'percentile'),false);
});
test('new completed records include the immutable paper used for marking',()=>{
 const input=paper();const result=engine.submitTestAttempt(input,{q1:0,q2:3},{},10);
 input.questions[0].question='Changed later';input.questions[0].correctAnswer=2;
 assert.equal(result.testSnapshot?.questions[0].question,'Select the first letter of the alphabet.');
 assert.equal(engine.getAttemptForTest('fixture').testSnapshot.questions[0].correctAnswer,0);
 assert.equal(result.score,4);
 assert.throws(()=>engine.submitTestAttempt(paper(),{q1:0},{},10),/completed|retak/i);
});
test('an import rejects missing options and persists none of the other incoming papers',()=>{
 const valid=paper('valid-import'),bad=paper('bad-import');delete bad.questions[0].options;
 assert.throws(()=>engine.importTestPapersFromJSON(JSON.stringify([valid,bad])),/option/i);
 assert.equal(engine.getStoredTests().some(t=>t.id==='valid-import'),false);
});
test('duplicate IDs, duplicate content and invalid answer keys are rejected before import',()=>{
 for(const mutate of [p=>p.questions[1].id='q1',p=>p.questions[1].question='[Mock 2] Q9: Select the first letter of the alphabet.',p=>p.questions[0].correctAnswer=7]){
  const p=paper();mutate(p);assert.throws(()=>engine.importTestPapersFromJSON(JSON.stringify(p)),/duplicat|repeat|answer/i);
 }
});
test('imports check finite durations, consistent marks, categories and section references',()=>{
 for(const mutate of [p=>p.durationMinutes=0,p=>p.totalMarks=100,p=>p.category='unsupported',p=>{p.sections=[{id:'one',name:'One'}];}]){
  const p=paper();mutate(p);assert.throws(()=>engine.addTestPaper(p),/duration|mark|category|section/i);
 }
});
test('draft answers and navigation survive reload-style reads without extending the deadline',()=>{
 assert.equal(typeof engine.saveDraft,'function');assert.equal(typeof engine.getDraft,'function');
 const d=engine.saveDraft(paper(),{},1000);
 assert.equal(d.deadline,61000);
 const answer=d.testSnapshot.questions[0].options.indexOf('A');
 engine.saveDraft(paper(),{userAnswers:{q1:answer},statusMap:{q1:'answered'},currentIndex:1,activeSectionId:'all',visitedIds:['q1','q2']},40000);
 const restored=engine.getDraft('fixture');
 assert.equal(restored.deadline,61000);assert.equal(restored.currentIndex,1);assert.equal(restored.userAnswers.q1,answer);
 assert.equal(engine.secondsUntil(restored.deadline,61001),0);
});
test('a resumed draft is marked against its saved option order even after the catalog changes',()=>{
 assert.equal(typeof engine.saveDraft,'function');
 const d=engine.saveDraft(paper(),{},1000),answer=d.testSnapshot.questions[0].options.indexOf('A');
 engine.saveDraft(paper(),{userAnswers:{q1:answer}},1100);
 const changed=paper();changed.questions[0].correctAnswer=2;
 const result=engine.submitTestAttempt(changed,{q1:answer},{},60);
 assert.equal(result.correctCount,1);assert.equal(result.score,2);assert.equal(engine.getDraft('fixture'),null);
});
test('the full backup restores custom papers, completed snapshots and in-progress drafts',()=>{
 assert.equal(typeof engine.exportAssessmentBackup,'function');assert.equal(typeof engine.importAssessmentBackup,'function');
 engine.addTestPaper(paper('completed-fixture'));engine.addTestPaper(paper('draft-fixture'));
 engine.submitTestAttempt(paper('completed-fixture'),{q1:0,q2:3},{},11);
 const d=engine.saveDraft(paper('draft-fixture'),{},1000);
 engine.saveDraft(paper('draft-fixture'),{userAnswers:{q1:d.testSnapshot.questions[0].options.indexOf('A')}},2000);
 const backup=engine.exportAssessmentBackup();values.clear();engine.importAssessmentBackup(backup);
 assert.equal(engine.getAttemptForTest('completed-fixture').score,4);
 assert.equal(engine.getDraft('draft-fixture').deadline,61000);
 assert.equal(engine.getStoredTests().some(t=>t.id==='completed-fixture'),true);
});
test('legacy scores are preserved with a clearly identified historical paper',()=>{
 const old=paper('old-custom');values.set('testbook_assessment_tests_v4',JSON.stringify([old]));
 values.set('testbook_assessment_attempts_v2',JSON.stringify({'old-custom':{testId:'old-custom',testTitle:old.title,category:'ncert',completed:true,submittedAt:'2026-10-28T10:00:00.000Z',score:2,maxScore:4,percentage:50,accuracy:100,correctCount:1,incorrectCount:0,unattemptedCount:1,totalQuestions:2,userAnswers:{q1:0},statusMap:{},timeSpentSeconds:10,sectionMap:{}}}));
 const attempt=engine.getAttemptForTest('old-custom');
 assert.equal(attempt.score,2);assert.equal(attempt.testSnapshot?.questions[0].options[0],'A');assert.match(attempt.legacyWarning||'',/version|legacy|histor/i);
});
test('separate account scopes cannot read each other or the local practice record',()=>{
 assert.equal(typeof engine.setAssessmentScope,'function');
 engine.submitTestAttempt(paper(),{q1:0},{},2);
 engine.setAssessmentScope('account-one');assert.equal(engine.getAttemptForTest('fixture'),null);
 engine.submitTestAttempt(paper('private'),{q1:0},{},2);
 engine.setAssessmentScope('account-two');assert.equal(engine.getAttemptForTest('private'),null);
 engine.setAssessmentScope('local');assert.equal(engine.getAttemptForTest('fixture').score,2);
});
