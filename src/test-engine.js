import { ALL_INITIAL_TESTS } from './data/tests-data.js';
import { ALL_INITIAL_TESTS as LEGACY_TESTS } from './data/legacy-tests-data.js';
import backupSyllabus from './data/backup-syllabus.json' with { type: 'json' };
import { clone, validId, newId, validateTestPaper, validateResponses, gradePaper, prepareAttemptPaper, validISO } from './assessment-validation.js';
export { validateTestPaper, canonicalStem, newId } from './assessment-validation.js';

export const ASSESSMENT_CHANGE_EVENT='study-atlas-assessment-change';
const PREFIX='study-atlas-assessment-v1:';
let scope='local';
const emptyState=()=>({version:1,customTests:[],attempts:{},drafts:{},archivedTests:[],migrationWarnings:[]});
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value);
export function setAssessmentScope(next='local'){validId(next,'Account scope');scope=next;}
export function getAssessmentScope(){return scope;}
function readJSON(key){let raw;try{raw=localStorage.getItem(key);}catch{throw new Error('Browser storage cannot be read. Allow storage or use another browser.');}if(!raw)return null;try{return JSON.parse(raw);}catch{throw new Error('Saved assessment data could not be read. Export a recovery backup before clearing browser storage.');}}
function persist(state){
 try{localStorage.setItem(PREFIX+scope,JSON.stringify(state));}
 catch{throw new Error('Progress was not saved. Browser storage may be blocked or full. Keep this page open, download a backup and retry.');}
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(ASSESSMENT_CHANGE_EVENT,{detail:{scope}}));
}
function migrate(){
 const next=emptyState();if(scope!=='local')return next;
 const papers=readJSON('testbook_assessment_tests_v4'),attempts=readJSON('testbook_assessment_attempts_v2');
 if(!papers&&!attempts)return next;
 const oldPapers=Array.isArray(papers)?papers:[],known=new Map(LEGACY_TESTS.map(t=>[t.id,t]));
 for(const p of oldPapers)if(p?.id)known.set(p.id,p);
 const builtinIds=new Set(LEGACY_TESTS.map(t=>t.id));
 for(const p of oldPapers.filter(t=>!builtinIds.has(t?.id))){try{next.customTests.push(validateTestPaper(p));}catch{next.migrationWarnings.push('An earlier custom paper ('+String(p?.title||p?.id||'unknown').slice(0,200)+') needs repair. Its original data remains in the recovery backup.');}}
 for(const [id,a] of Object.entries(plain(attempts)?attempts:{})){
  try{
   validId(id);if(!plain(a)||!a.completed)continue;
   let testSnapshot=null;try{if(known.has(id))testSnapshot=validateTestPaper(known.get(id),{legacy:true});}catch{}
   const {percentile,...saved}=clone(a);
   next.attempts[id]={...saved,legacy:true,legacyWarning:'Legacy result: its original question version was not recorded. The available historical paper is shown for reference; the saved score is unchanged.',...(testSnapshot&&{testSnapshot})};
   if(testSnapshot&&!next.customTests.some(t=>t.id===id))next.archivedTests.push(testSnapshot);
  }catch{next.migrationWarnings.push('An invalid historical record was retained in the recovery backup.');}
 }
 next.migratedAt=new Date().toISOString();persist(next);return next;
}
function readState(){
 const saved=readJSON(PREFIX+scope);if(!saved)return migrate();
 if(saved.version!==1||!Array.isArray(saved.customTests)||!Array.isArray(saved.archivedTests)||!plain(saved.attempts)||!plain(saved.drafts))throw new Error('Saved data uses an unsupported structure. Download a recovery backup before resetting storage.');
 return saved;
}
export function getAssessmentState(){return clone(readState());}
export function getStoredTests(){const s=readState(),ids=new Set();return [...s.customTests,...ALL_INITIAL_TESTS,...s.archivedTests].filter(t=>{if(ids.has(t.id))return false;ids.add(t.id);return true;});}
export function getTestById(id){return getStoredTests().find(t=>t.id===id)||null;}
export function getAllAttempts(){return clone(readState().attempts);}
export function isTestCompleted(id){return !!readState().attempts[id]?.completed;}
export function getAttemptForTest(id){return clone(readState().attempts[id]||null);}
export function getAllDrafts(){return clone(readState().drafts);}
export function getDraft(id){return clone(readState().drafts[id]||null);}
export const secondsUntil=(deadline,now=Date.now())=>Math.max(0,Math.ceil((deadline-now)/1000));
export function saveDraft(test,patch={},now=Date.now()){
 const s=readState();if(s.attempts[test.id]?.completed)throw new Error('This test is completed; open its solutions.');
 let d=s.drafts[test.id];
 if(!d){const snapshot=prepareAttemptPaper(validateTestPaper(test),test.id+':'+now);d={testId:snapshot.id,testSnapshot:snapshot,startedAt:new Date(now).toISOString(),deadline:now+snapshot.durationMinutes*60000,userAnswers:{},statusMap:{},visitedIds:[],currentIndex:0,activeSectionId:snapshot.sections[0].id};}
 const response=validateResponses(d.testSnapshot,patch.userAnswers??d.userAnswers,patch.statusMap??d.statusMap);
 const section=patch.activeSectionId??d.activeSectionId;if(!d.testSnapshot.sections.some(s=>s.id===section))throw new Error('Unknown assessment section.');
 const sectionLength=d.testSnapshot.questions.filter(q=>q.section===section).length,currentIndex=patch.currentIndex??d.currentIndex;
 if(!Number.isInteger(currentIndex)||currentIndex<0||currentIndex>=Math.max(1,sectionLength))throw new Error('Invalid question navigation position.');
 const visitedIds=patch.visitedIds??d.visitedIds,ids=new Set(d.testSnapshot.questions.map(q=>q.id));
 if(!Array.isArray(visitedIds)||visitedIds.some(id=>!ids.has(id)))throw new Error('Invalid visited-question list.');
 d={...d,...response,activeSectionId:section,currentIndex,visitedIds:[...new Set(visitedIds)],updatedAt:new Date(now).toISOString()};
 s.drafts[test.id]=d;persist(s);return clone(d);
}
export function submitTestAttempt(test,userAnswers={},statusMap={},timeSpentSeconds=0){
 const s=readState();if(s.attempts[test.id]?.completed)throw new Error('This test has already been completed and cannot be retaken.');
 const snapshot=clone(s.drafts[test.id]?.testSnapshot||validateTestPaper(test)),graded=gradePaper(snapshot,userAnswers,statusMap);
 if(!Number.isFinite(timeSpentSeconds)||timeSpentSeconds<0)throw new Error('Invalid test time.');
 const result={testId:snapshot.id,testTitle:snapshot.title,category:snapshot.category,completed:true,submittedAt:new Date().toISOString(),timeSpentSeconds:Math.min(Math.round(timeSpentSeconds),Math.ceil(snapshot.durationMinutes*60)),testSnapshot:snapshot,...graded};
 s.attempts[test.id]=result;delete s.drafts[test.id];persist(s);return clone(result);
}
export function addTestPaper(raw){
 const s=readState(),paper=validateTestPaper({...raw,id:raw.id||newId('custom')});
 if([...s.customTests,...ALL_INITIAL_TESTS,...s.archivedTests].some(t=>t.id===paper.id))throw new Error('This test ID already exists. Use a new version/ID for a new paper.');
 s.customTests.unshift(paper);persist(s);return clone(paper);
}
export function importTestPapersFromJSON(text){
 if(typeof text!=='string'||text.length>12000000)throw new Error('Choose a JSON test file smaller than 12 MB.');
 let parsed;try{parsed=JSON.parse(text);}catch{throw new Error('Invalid JSON format. Please check the file.');}
 const rows=Array.isArray(parsed)?parsed:[parsed];if(!rows.length||rows.length>200)throw new Error('Import between 1 and 200 papers at a time.');
 const incoming=rows.map(t=>validateTestPaper({...t,id:t?.id||newId('imported')})),seen=new Set();
 for(const t of incoming){if(seen.has(t.id))throw new Error('Duplicate test ID in the import: '+t.id+'.');seen.add(t.id);}
 const s=readState(),existing=new Set([...s.customTests,...ALL_INITIAL_TESTS,...s.archivedTests].map(t=>t.id));
 const additions=incoming.filter(t=>!existing.has(t.id));if(additions.length){s.customTests=[...additions,...s.customTests];persist(s);}
 return {importedCount:additions.length,total:incoming.length};
}
export function exportTestsAsJSON(){return JSON.stringify(getStoredTests().filter(t=>!t.readOnly),null,2);}
function validateBackup(text){
 if(typeof text!=='string'||text.length>16000000)throw new Error('Choose a progress backup smaller than 16 MB.');
 let raw;try{raw=JSON.parse(text);}catch{throw new Error('Invalid JSON backup.');}
 if(raw.app!=='study-atlas-assessment'||raw.version!==1||!plain(raw.state))throw new Error('This is not a compatible assessment progress backup.');
 const s=raw.state;if(!Array.isArray(s.customTests)||s.customTests.length>200||!plain(s.attempts)||!plain(s.drafts)||!Array.isArray(s.archivedTests))throw new Error('The backup structure is invalid.');
 const next=emptyState(),ids=new Set();
 for(const t of s.customTests){const p=validateTestPaper(t);if(ids.has(p.id))throw new Error('Duplicate paper IDs in backup.');ids.add(p.id);next.customTests.push(p);}
 for(const t of s.archivedTests)next.archivedTests.push(validateTestPaper(t,{legacy:true}));
 for(const [id,a] of Object.entries(s.attempts)){
  validId(id);if(!plain(a)||a.testId!==id||a.completed!==true||!validISO(a.submittedAt)||!Number.isFinite(a.score)||!Number.isFinite(a.maxScore)||a.maxScore<=0)throw new Error('Invalid completed record: '+id+'.');
  const paper=a.testSnapshot?validateTestPaper(a.testSnapshot,{legacy:!!a.legacy}):null;
  if(paper&&paper.id!==id)throw new Error('Attempt paper ID does not match its snapshot.');
  if(!paper&&!a.legacy)throw new Error('A completed attempt needs its paper snapshot.');
  if(!a.legacy){const grade=gradePaper(paper,a.userAnswers,a.statusMap);for(const key of ['score','maxScore','correctCount','incorrectCount','unattemptedCount'])if(a[key]!==grade[key])throw new Error('Saved marks do not match the recorded answers for '+id+'.');}
  const {percentile,...clean}=a;next.attempts[id]={...clone(clean),...(paper&&{testSnapshot:paper})};
 }
 for(const [id,d] of Object.entries(s.drafts)){
  validId(id);if(!plain(d)||d.testId!==id||!validISO(d.startedAt)||!Number.isFinite(d.deadline)||(d.updatedAt!=null&&!validISO(d.updatedAt)))throw new Error('Invalid draft: '+id+'.');
  const paper=validateTestPaper(d.testSnapshot);if(paper.id!==id||Math.abs(d.deadline-(Date.parse(d.startedAt)+paper.durationMinutes*60000))>1)throw new Error('Draft deadline does not match its original start.');
  validateResponses(paper,d.userAnswers,d.statusMap);
  if(!paper.sections.some(s=>s.id===d.activeSectionId)||!Number.isInteger(d.currentIndex)||d.currentIndex<0||d.currentIndex>=paper.questions.filter(q=>q.section===d.activeSectionId).length||!Array.isArray(d.visitedIds)||d.visitedIds.some(id=>!paper.questions.some(q=>q.id===id)))throw new Error('Invalid draft navigation.');
  next.drafts[id]={...clone(d),testSnapshot:paper};
 }
 next.migrationWarnings=Array.isArray(s.migrationWarnings)?s.migrationWarnings.filter(v=>typeof v==='string').slice(0,100):[];return next;
}
export function exportAssessmentBackup(){return JSON.stringify({app:'study-atlas-assessment',version:1,exportedAt:new Date().toISOString(),state:readState()},null,2);}
export function previewAssessmentBackup(text){const s=validateBackup(text);return{customTests:s.customTests.length,attempts:Object.keys(s.attempts).length,drafts:Object.keys(s.drafts).length};}
export function importAssessmentBackup(text){
 const incoming=validateBackup(text),s=readState(),customIds=new Set([...s.customTests,...ALL_INITIAL_TESTS].map(t=>t.id));
 s.customTests.push(...incoming.customTests.filter(t=>!customIds.has(t.id)));
 for(const [id,a] of Object.entries(incoming.attempts))if(!s.attempts[id])s.attempts[id]=a;
 for(const [id,d] of Object.entries(incoming.drafts))if(!s.attempts[id]&&!s.drafts[id])s.drafts[id]=d;
 for(const id of Object.keys(s.drafts))if(s.attempts[id])delete s.drafts[id];
 const archived=new Set(s.archivedTests.map(t=>t.id));s.archivedTests.push(...incoming.archivedTests.filter(t=>!archived.has(t.id)));
 s.migrationWarnings=[...new Set([...(s.migrationWarnings||[]),...incoming.migrationWarnings])];persist(s);
 return {attempts:Object.keys(incoming.attempts).length,drafts:Object.keys(incoming.drafts).length};
}
// Cloud reconciliation differs from a user-requested backup restore: a newer
// edit of the same sitting can arrive from another device. Validate and plan
// the entire merge before writing anything.
export function mergeRemoteAssessmentState(state){
 const incoming=validateBackup(JSON.stringify({app:'study-atlas-assessment',version:1,state})),s=readState(),before=JSON.stringify(s);
 const order=value=>value&&typeof value==='object'?(Array.isArray(value)?value.map(order):Object.fromEntries(Object.keys(value).sort().map(k=>[k,order(value[k])]))):value;
 const same=(a,b)=>JSON.stringify(order(a))===JSON.stringify(order(b));
 const changedDraftIds=[];
 for(const paper of incoming.customTests){const existing=s.customTests.find(t=>t.id===paper.id);if(existing&&!same(existing,paper))throw new Error('Cloud paper conflict for '+paper.id+'. Keep a backup and use a new paper ID.');if(!existing)s.customTests.push(paper);}
 for(const [id,attempt] of Object.entries(incoming.attempts))if(!s.attempts[id])s.attempts[id]=attempt;
 for(const [id,draft] of Object.entries(incoming.drafts)){
  if(s.attempts[id])continue;const existing=s.drafts[id];
  if(existing){
   if(existing.startedAt!==draft.startedAt||existing.deadline!==draft.deadline||!same(existing.testSnapshot,draft.testSnapshot))throw new Error('Cloud sitting conflict for '+id+'. Different sittings were kept on their original devices. Export a backup.');
   const localTime=Date.parse(existing.updatedAt||existing.startedAt),remoteTime=Date.parse(draft.updatedAt||draft.startedAt);
   if(remoteTime===localTime&&!same(existing,draft))throw new Error('Cloud draft conflict for '+id+'. Keep a local backup before resolving concurrent edits.');
   if(remoteTime<=localTime)continue;
  }
  s.drafts[id]=draft;changedDraftIds.push(id);
 }
 for(const id of Object.keys(s.drafts))if(s.attempts[id])delete s.drafts[id];
 if(JSON.stringify(s)!==before)persist(s);
 return {changedDraftIds};
}
export function exportRecoveryBackup(){return JSON.stringify({app:'study-atlas-recovery',exportedAt:new Date().toISOString(),current:localStorage.getItem(PREFIX+scope),legacyTests:scope==='local'?localStorage.getItem('testbook_assessment_tests_v4'):null,legacyAttempts:scope==='local'?localStorage.getItem('testbook_assessment_attempts_v2'):null},null,2);}
export async function downloadSyllabusBackupFile(){
 const blob=new Blob([JSON.stringify(backupSyllabus,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Social_Science_Syllabus_Backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);return true;
}

