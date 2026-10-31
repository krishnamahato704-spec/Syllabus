import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Clock,Bookmark,HelpCircle,ChevronLeft,ChevronRight,X,FileText,ArrowLeft,List,Save,Download,AlertCircle} from 'lucide-react';
import AccessibleModal from './AccessibleModal.jsx';
import {getDraft,saveDraft,secondsUntil,getAssessmentState} from '../test-engine.js';

export default function TestbookExamInterface({test:catalogTest,onComplete,onExit}){
 const [initial]=useState(()=>getDraft(catalogTest.id)||saveDraft(catalogTest));
 const test=initial.testSnapshot;
 const [draft,setDraft]=useState(initial),latest=useRef(initial);
 const [timeLeft,setTimeLeft]=useState(()=>secondsUntil(initial.deadline));
 const [saveError,setSaveError]=useState(''),errorRef=useRef('');
 const [isSubmitting,setIsSubmitting]=useState(false),submitting=useRef(false),autoFailed=useRef(false);
 const [modal,setModal]=useState(''),[sidebarOpen,setSidebarOpen]=useState(()=>matchMedia('(min-width: 901px)').matches);
 const finishRef=useRef(null),drawerRef=useRef(null),drawerTrigger=useRef(null);
 const userAnswers=draft.userAnswers,statusMap=draft.statusMap;
 const sectionQuestions=useMemo(()=>test.questions.filter(q=>q.section===draft.activeSectionId),[test,draft.activeSectionId]);
 const currentQuestion=sectionQuestions[draft.currentIndex]||sectionQuestions[0];
 const globalIndex=test.questions.findIndex(q=>q.id===currentQuestion.id)+1;
 const locked=timeLeft===0||isSubmitting;
 function update(patch){
  if(submitting.current)return;
  const next={...latest.current,...patch};latest.current=next;setDraft(next);
  try{const saved=saveDraft(catalogTest,next);latest.current=saved;setDraft(saved);setSaveError('');errorRef.current='';}
  catch(e){setSaveError(e.message);errorRef.current=e.message;}
 }
 async function finish(){
  if(submitting.current)return;
  submitting.current=true;setIsSubmitting(true);setModal('');
  const d=latest.current;
  try{await onComplete(d.testSnapshot,d.userAnswers,d.statusMap,Math.max(0,Math.min(Math.ceil(d.testSnapshot.durationMinutes*60),Math.ceil((Date.now()-Date.parse(d.startedAt))/1000))));}
  catch(e){autoFailed.current=true;submitting.current=false;setIsSubmitting(false);setSaveError(e.message||'Submission was not saved. Keep this page open and retry.');errorRef.current=e.message;}
 }
 finishRef.current=finish;
 useEffect(()=>{
  const tick=()=>{const left=secondsUntil(latest.current.deadline);setTimeLeft(left);if(left===0&&!autoFailed.current&&!submitting.current)finishRef.current();};
  tick();const timer=setInterval(tick,500);document.addEventListener('visibilitychange',tick);window.addEventListener('pageshow',tick);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);window.removeEventListener('pageshow',tick);};
 },[]);
 useEffect(()=>{
  if(!latest.current.visitedIds.includes(currentQuestion.id))update({visitedIds:[...latest.current.visitedIds,currentQuestion.id]});
 },[currentQuestion.id]);
 useEffect(()=>{
  const before=e=>{if(errorRef.current){e.preventDefault();e.returnValue='';}};
  window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);
 },[]);
 useEffect(()=>{
  if(!sidebarOpen||matchMedia('(min-width:901px)').matches)return;
  const previous=document.activeElement;
  const controls=()=>[...drawerRef.current.querySelectorAll('button:not(:disabled)')];
  controls()[0]?.focus();
  const key=e=>{
   if(e.key==='Escape'){e.preventDefault();setSidebarOpen(false);}
   if(e.key==='Tab'){const list=controls(),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[sidebarOpen]);
 const stats=useMemo(()=>{
  const n={answered:0,unanswered:0,marked:0,markedAnswered:0,notVisited:0};
  for(const q of test.questions){
   const visited=draft.visitedIds.includes(q.id),answer=Object.hasOwn(userAnswers,q.id),marked=['marked','marked_answered'].includes(statusMap[q.id]);
   if(!visited)n.notVisited++;else if(marked&&answer)n.markedAnswered++;else if(marked)n.marked++;else if(answer)n.answered++;else n.unanswered++;
  }return n;
 },[draft,test,userAnswers,statusMap]);
 function select(choice){if(locked)return;const d=latest.current,marked=['marked','marked_answered'].includes(d.statusMap[currentQuestion.id]);update({userAnswers:{...d.userAnswers,[currentQuestion.id]:choice},statusMap:{...d.statusMap,[currentQuestion.id]:marked?'marked_answered':'answered'}});}
 function clear(){if(locked)return;const d=latest.current,answers={...d.userAnswers};delete answers[currentQuestion.id];update({userAnswers:answers,statusMap:{...d.statusMap,[currentQuestion.id]:['marked','marked_answered'].includes(d.statusMap[currentQuestion.id])?'marked':'unanswered'}});}
 function advance(mark){
  if(locked)return;const d=latest.current,answer=Object.hasOwn(d.userAnswers,currentQuestion.id);
  const status=mark?(answer?'marked_answered':'marked'):(answer?'answered':'unanswered');
  let nav={};if(d.currentIndex<sectionQuestions.length-1)nav.currentIndex=d.currentIndex+1;
  else{const next=test.sections[test.sections.findIndex(s=>s.id===d.activeSectionId)+1];if(next)nav={activeSectionId:next.id,currentIndex:0};else setModal('submit');}
  update({statusMap:{...d.statusMap,[currentQuestion.id]:status},...nav});
 }
 function exit(){try{saveDraft(catalogTest,latest.current);onExit();}catch(e){setSaveError(e.message);errorRef.current=e.message;}}
 function downloadUnsaved(){
  let state;try{state=getAssessmentState();}catch{state={version:1,customTests:[test],attempts:{},drafts:{},archivedTests:[],migrationWarnings:[]};}
  state.drafts[test.id]=latest.current;
  const blob=new Blob([JSON.stringify({app:'study-atlas-assessment',version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='study-atlas-unsaved-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);
 }
 const formatTime=seconds=>{const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return(h?h.toString().padStart(2,'0')+':':'')+m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0');};
 const questionStatus=q=>!draft.visitedIds.includes(q.id)?'not-visited':['marked','marked_answered'].includes(statusMap[q.id])?(Object.hasOwn(userAnswers,q.id)?'marked-answered':'marked'):Object.hasOwn(userAnswers,q.id)?'answered':'unanswered';
 return <div className="testbook-exam-container">
  <header className="testbook-topbar">
   <div className="testbook-title-wrap"><span className="exam-badge">{test.targetExam}</span><h1 className="exam-title">{test.title}</h1></div>
   <div className="testbook-topbar-right">
    <div className={'exam-timer '+(timeLeft<300?'timer-warning':'')} role="timer" aria-label="Time remaining"><Clock size={18}/><span className="timer-text">{formatTime(timeLeft)}</span><small className="timer-label">Time Left</small></div>
    <div className="header-action-buttons">
     <button className="testbook-header-btn" onClick={()=>setModal('paper')}><FileText size={16}/><span>Question Paper</span></button>
     <button className="testbook-header-btn" onClick={()=>setModal('instructions')}><HelpCircle size={16}/><span>Instructions</span></button>
     <button className="testbook-header-btn" onClick={exit} disabled={isSubmitting}><Save size={16}/><span>Save & Exit</span></button>
     <button className="testbook-submit-btn" onClick={()=>setModal('submit')} disabled={locked}>Submit Test</button>
     <button ref={drawerTrigger} className="palette-mobile-toggle" aria-label="Open question navigator" aria-expanded={sidebarOpen} aria-controls="question-navigator" onClick={()=>setSidebarOpen(true)}><List size={20}/><span>Questions</span></button>
    </div>
   </div>
  </header>
  <div className="exam-save-status" role="status">{saveError?'Changes need attention':'Answers saved on this device. The deadline continues if you leave.'}</div>
  {saveError&&<div className="notice error" role="alert"><AlertCircle size={19}/><span>{saveError}</span><button className="text-button" onClick={()=>{if(timeLeft===0){autoFailed.current=false;finish();}else update({});}}>{timeLeft===0?'Retry submission':'Retry saving'}</button><button className="text-button" onClick={downloadUnsaved}><Download size={16}/>Download responses</button></div>}
  {test.sections.length>1&&<div className="testbook-sections-bar"><span className="sections-label">Sections:</span><div className="sections-list" role="tablist" aria-label="Assessment sections">{test.sections.map(sec=><button key={sec.id} role="tab" aria-selected={draft.activeSectionId===sec.id} className={'section-tab-btn '+(draft.activeSectionId===sec.id?'active':'')} onClick={()=>{update({activeSectionId:sec.id,currentIndex:0});setSidebarOpen(false);}} disabled={isSubmitting}><span>{sec.name}</span><span className="sec-badge">{test.questions.filter(q=>q.section===sec.id).length} Qs</span></button>)}</div></div>}
  <div className="testbook-main-workspace">
   <div className="testbook-question-pane" inert={sidebarOpen&&matchMedia('(max-width:900px)').matches?true:undefined}>
    <div className="question-meta-bar"><div className="q-number-box"><span className="q-label">Question {globalIndex}</span><span className="q-section-name">{test.sections.find(s=>s.id===draft.activeSectionId)?.name}</span></div><div className="q-marks-box"><span className="mark-pos">+{test.markingScheme.correct}</span><span className="mark-neg">−{test.markingScheme.incorrect}</span></div></div>
    <div className="question-scroll-area">
     {currentQuestion.passage&&<article className={'exam-passage '+currentQuestion.passage.type} aria-label="Reading passage"><h2>{currentQuestion.passage.title}</h2><p>{currentQuestion.passage.text}</p></article>}
     <div className="question-body"><p className="question-text" id="active-question">{currentQuestion.question}</p></div>
     <fieldset className="options-container" aria-labelledby="active-question" disabled={locked}><legend className="sr-only">Choose one answer</legend>{currentQuestion.options.map((opt,i)=><label key={i} className={'option-card '+(userAnswers[currentQuestion.id]===i?'selected':'')}><input type="radio" name={'answer-'+currentQuestion.id} checked={userAnswers[currentQuestion.id]===i} onChange={()=>select(i)} className="sr-only"/><span className="option-prefix">{String.fromCharCode(65+i)}</span><span className="option-text">{opt}</span></label>)}</fieldset>
    </div>
    <footer className="testbook-actions-footer"><div className="footer-left"><button className="btn-mark-review" disabled={locked} onClick={()=>advance(true)}><Bookmark size={16}/>Mark for Review & Next</button><button className="btn-clear" disabled={locked||!Object.hasOwn(userAnswers,currentQuestion.id)} onClick={clear}>Clear Response</button></div><div className="footer-right"><button className="btn-nav" disabled={isSubmitting||draft.currentIndex===0} onClick={()=>update({currentIndex:draft.currentIndex-1})}><ChevronLeft size={18}/>Previous</button><button className="btn-save-next" disabled={locked} onClick={()=>advance(false)}>Save & Next<ChevronRight size={18}/></button></div></footer>
   </div>
   {sidebarOpen&&<button className="palette-drawer-scrim" aria-label="Close question navigator" onClick={()=>setSidebarOpen(false)}/>}
   <aside ref={drawerRef} id="question-navigator" className={'testbook-palette-sidebar '+(sidebarOpen?'open':'closed')} aria-label="Question navigator" inert={!sidebarOpen?true:undefined}>
    <div className="palette-user-header"><div className="palette-user-info"><strong>Question navigator</strong><span>{test.questions.length} questions · saved answers</span></div><button className="palette-collapse-btn" aria-label="Close question navigator" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div>
    <div className="palette-legend">
     <div className="legend-row"><span className="legend-pill answered">{stats.answered}</span><span className="legend-txt">Answered</span><span className="legend-pill unanswered">{stats.unanswered}</span><span className="legend-txt">Not answered</span></div>
     <div className="legend-row"><span className="legend-pill marked">{stats.marked}</span><span className="legend-txt">Review</span><span className="legend-pill not-visited">{stats.notVisited}</span><span className="legend-txt">Not visited</span></div>
     <div className="legend-row full"><span className="legend-pill marked-answered">{stats.markedAnswered}</span><span className="legend-txt">Answered & marked for review</span></div>
    </div>
    <div className="palette-section-title">{test.sections.find(s=>s.id===draft.activeSectionId)?.name}</div>
    <div className="palette-grid-wrap"><div className="palette-grid">{sectionQuestions.map((q,index)=>{const number=test.questions.findIndex(i=>i.id===q.id)+1,status=questionStatus(q);return <button key={q.id} className={'palette-num-btn '+status+(q.id===currentQuestion.id?' current-focus':'')} aria-label={'Question '+number+', '+status.replaceAll('-',' ')} aria-current={q.id===currentQuestion.id?'true':undefined} onClick={()=>{update({currentIndex:index});if(matchMedia('(max-width:900px)').matches)setSidebarOpen(false);}} disabled={isSubmitting}>{number}</button>;})}</div></div>
    <div className="palette-footer-actions"><button className="testbook-final-submit" onClick={()=>setModal('submit')} disabled={locked}>Submit Entire Test</button></div>
   </aside>
   {!sidebarOpen&&<button className="palette-desktop-reopen" aria-label="Open question navigator" onClick={()=>setSidebarOpen(true)}><List size={20}/></button>}
  </div>
  {modal==='submit'&&<AccessibleModal onClose={()=>setModal('')} labelledBy="submit-title" className="submit-modal">
   <div className="modal-header"><div><h2 id="submit-title">Submit this scored attempt?</h2><p>Check the unanswered and review counts before finishing.</p></div><button className="modal-close-icon" aria-label="Close submission dialog" onClick={()=>setModal('')}><X size={20}/></button></div>
   <div className="modal-tab-body"><div className="submit-summary-box"><table className="summary-table"><thead><tr><th>Section</th><th>Questions</th><th>Answered</th><th>Unanswered</th><th>Review</th></tr></thead><tbody>{test.sections.map(sec=>{const qs=test.questions.filter(q=>q.section===sec.id),answered=qs.filter(q=>Object.hasOwn(userAnswers,q.id)).length;return <tr key={sec.id}><td>{sec.name}</td><td>{qs.length}</td><td>{answered}</td><td>{qs.length-answered}</td><td>{qs.filter(q=>['marked','marked_answered'].includes(statusMap[q.id])).length}</td></tr>;})}</tbody></table><p className="strict-rule-note">A scored attempt is kept for review and cannot be retaken. Answered questions marked for review are included in marking.</p></div></div>
   <div className="modal-footer-actions"><button className="btn-cancel" onClick={()=>setModal('')}>Resume Test</button><button className="btn-submit-confirm" onClick={finish} disabled={isSubmitting}>Yes, Submit Test</button></div>
  </AccessibleModal>}
  {modal==='paper'&&<AccessibleModal onClose={()=>setModal('')} labelledBy="paper-title" className="large-modal">
   <div className="modal-header"><h2 id="paper-title">Question paper · {test.title}</h2><button className="modal-close-icon" aria-label="Close question paper" onClick={()=>setModal('')}><X size={20}/></button></div>
   <div className="modal-tab-body qp-scroll-container">{test.questions.map((q,index)=><div key={q.id} className="qp-row"><span className="qp-num">Q{index+1}</span><div className="qp-content">{q.passage&&<details><summary>{q.passage.title}</summary><p style={{whiteSpace:'pre-wrap'}}>{q.passage.text}</p></details>}<p className="qp-question">{q.question}</p>{q.options.map((o,i)=><div className="qp-opt" key={i}><span>({String.fromCharCode(65+i)})</span>{o}</div>)}</div></div>)}</div>
   <div className="modal-footer-actions"><button className="btn-cancel" onClick={()=>setModal('')}>Close question paper</button></div>
  </AccessibleModal>}
  {modal==='instructions'&&<AccessibleModal onClose={()=>setModal('')} labelledBy="instructions-title">
   <div className="modal-header"><h2 id="instructions-title">Practice instructions</h2><button className="modal-close-icon" aria-label="Close instructions" onClick={()=>setModal('')}><X size={20}/></button></div>
   <div className="modal-tab-body instructions-body"><ol><li>This is authored practice for {test.targetExam}, not an official past paper or certified readiness prediction.</li><li>You have {test.durationMinutes} minutes. The original deadline continues through refresh or Save & Exit; at expiry the stored responses are submitted.</li><li>Correct: +{test.markingScheme.correct}. Incorrect: −{test.markingScheme.incorrect}. Unanswered: 0.</li><li>Choosing an answer saves it on this device. Save & Next moves through the paper. Mark for Review retains a response and flags it; it still counts in marking.</li><li>After submission, the scored sitting is read-only. Its exact questions and option order stay with the result.</li><li>Topic references and explanations are in the review. Questions can recur across different papers; no paper repeats a question within the same sitting.</li><li>Download a progress backup before clearing browser data or moving work to another device.</li></ol></div>
   <div className="modal-footer-actions"><button className="btn-submit-confirm" onClick={()=>setModal('')}>Return to test</button></div>
  </AccessibleModal>}
 </div>;
}

