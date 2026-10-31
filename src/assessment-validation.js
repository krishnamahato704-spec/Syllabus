export const clone = value => JSON.parse(JSON.stringify(value));
export const canonicalStem = text => String(text).replace(/^\[[^\]]*\]\s*Q\d+(?:\s*\([^)]*\))?\s*:\s*/u,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
export function validId(value,label='ID'){if(typeof value!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/.test(value))throw new Error(label+' must use letters, numbers, dots, colons, underscores or dashes (up to 120 characters).');return value;}
const text=(value,label,max=5000)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error(label+' must be nonempty text, up to '+max+' characters.');return value.trim();};
const optionalText=(value,max=8000)=>typeof value==='string'?value.slice(0,max):'';
export const validISO=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
export function newId(prefix='custom'){return prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12));}
export function validateTestPaper(raw,{legacy=false}={}){
 if(!plain(raw))throw new Error('Each test must be an object.');
 const id=validId(raw.id,'Test ID'),title=text(raw.title,'Test title',300);
 if(!['ncert','ctet','ugc_net'].includes(raw.category)&&!legacy)throw new Error('Choose a supported test category: ncert, ctet or ugc_net.');
 if(!Array.isArray(raw.questions)||!raw.questions.length||raw.questions.length>300)throw new Error('A test needs between 1 and 300 questions.');
 const durationMinutes=raw.durationMinutes??Math.max(15,raw.questions.length);
 if(typeof durationMinutes!=='number'||!Number.isFinite(durationMinutes)||durationMinutes<=0||durationMinutes>600)throw new Error('Test duration must be a positive number up to 600 minutes.');
 const marking=raw.markingScheme??{correct:1,incorrect:0};
 if(!plain(marking)||typeof marking.correct!=='number'||!Number.isFinite(marking.correct)||marking.correct<=0||marking.correct>100||typeof marking.incorrect!=='number'||!Number.isFinite(marking.incorrect)||Math.abs(marking.incorrect)>100)throw new Error('Marking needs positive correct marks and a finite wrong-answer penalty.');
 const markingScheme={correct:marking.correct,incorrect:Math.abs(marking.incorrect)},totalMarks=raw.questions.length*marking.correct;
 if(raw.totalMarks!=null&&(typeof raw.totalMarks!=='number'||Math.abs(raw.totalMarks-totalMarks)>0.000001))throw new Error('Total marks must equal the number of questions × marks per correct answer.');
 const ids=new Set(),stems=new Set();let sections;
 if(raw.sections!=null){
  if(!Array.isArray(raw.sections)||!raw.sections.length||raw.sections.length>30)throw new Error('Sections must be a nonempty list.');
  const seen=new Set();sections=raw.sections.map(s=>{if(!plain(s))throw new Error('Invalid section.');const sid=validId(s.id,'Section ID');if(seen.has(sid))throw new Error('Duplicate section ID.');seen.add(sid);return{id:sid,name:text(s.name,'Section name',150)};});
 }
 const questions=raw.questions.map((q,index)=>{
  const label='Question '+(index+1);if(!plain(q))throw new Error(label+' is not a valid question.');
  const qid=validId(q.id,label+' ID');if(ids.has(qid))throw new Error('Duplicate question ID: '+qid+'.');ids.add(qid);
  const question=text(q.question,label+' text',12000),stem=canonicalStem(question);
  if(stems.has(stem)&&!legacy)throw new Error('Repeated question content in '+label+'; changing a question number does not create a new question.');stems.add(stem);
  if(!Array.isArray(q.options)||q.options.length!==4)throw new Error(label+' needs exactly four answer options.');
  const options=q.options.map((o,i)=>text(o,label+' option '+(i+1),3000));
  if(new Set(options.map(canonicalStem)).size!==4&&!legacy)throw new Error(label+' has duplicate options.');
  if(!Number.isInteger(q.correctAnswer)||q.correctAnswer<0||q.correctAnswer>3)throw new Error(label+' correct answer must be an option index from 0 to 3.');
  const section=q.section??sections?.[0]?.id??'all';validId(section,'Question section');
  if(sections&&!sections.some(s=>s.id===section))throw new Error(label+' refers to an unknown section: '+section+'.');
  let source;
  if(q.source!=null){if(!plain(q.source))throw new Error(label+' source must contain a name and URL.');let url;try{url=new URL(q.source.url);}catch{throw new Error(label+' source URL is invalid.');}if(!['http:','https:'].includes(url.protocol))throw new Error(label+' source must use an HTTP(S) URL.');source={name:text(q.source.name,label+' source name',300),url:url.href};}
  let passage;
  if(q.passage!=null){if(!plain(q.passage))throw new Error(label+' passage is invalid.');passage={id:validId(q.passage.id,'Passage ID'),title:text(q.passage.title,'Passage title',300),text:text(q.passage.text,'Passage text',30000),type:['prose','poem','drama','data'].includes(q.passage.type)?q.passage.type:'prose'};}
  return {id:qid,question,options,correctAnswer:q.correctAnswer,section,subject:optionalText(q.subject,200)||optionalText(q.topic,200)||'Practice',explanation:optionalText(q.explanation),difficulty:q.difficulty==='High'?'High':'Moderate',...(source&&{source}),...(passage&&{passage}),domain:optionalText(q.domain,100),unit:optionalText(q.unit,100),topic:optionalText(q.topic,300),kind:optionalText(q.kind,100)||'content',syllabusIds:Array.isArray(q.syllabusIds)?q.syllabusIds.filter(v=>typeof v==='string').slice(0,30):[]};
 });
 if(!sections)sections=[...new Set(questions.map(q=>q.section))].map(s=>({id:s,name:s==='all'?'Practice':({cdp:'Child Development & Pedagogy',lang1:'English Language I',lang2:'Hindi Language II',sst:'Social Science',p1:'General Paper I',p2:'History Paper II'}[s]||s)}));
 return {id,title,category:raw.category,durationMinutes,totalMarks,totalQuestions:questions.length,markingScheme,sections,questions,difficulty:raw.difficulty==='High'?'High':'Moderate',targetExam:optionalText(raw.targetExam,300)||raw.category,subCategory:optionalText(raw.subCategory,200)||'Custom practice',syllabusSection:optionalText(raw.syllabusSection,100)||'custom',syllabus:optionalText(raw.syllabus,1000),isSectional:raw.isSectional===true,isQuickBurst:raw.isQuickBurst===true,createdAt:optionalText(raw.createdAt,40),version:optionalText(raw.version,100)||'custom-1',...(raw.coverage&&plain(raw.coverage)?{coverage:clone(raw.coverage)}:{}),...(legacy?{legacy:true,readOnly:true}:{})};
}
export function validateResponses(paper,answers={},statuses={}){
 if(!plain(answers)||!plain(statuses))throw new Error('Answers and review states must be objects.');
 const ids=new Set(paper.questions.map(q=>q.id));
 for(const [id,choice] of Object.entries(answers))if(!ids.has(id)||!Number.isInteger(choice)||choice<0||choice>3)throw new Error('Invalid answer for '+id+'.');
 for(const [id,status] of Object.entries(statuses))if(!ids.has(id)||!['answered','unanswered','marked','marked_answered','not_visited'].includes(status))throw new Error('Invalid review status for '+id+'.');
 return {userAnswers:clone(answers),statusMap:clone(statuses)};
}
export function gradePaper(paper,answers={},statuses={}){
 const {userAnswers,statusMap}=validateResponses(paper,answers,statuses);
 const sectionMap=Object.fromEntries(paper.sections.map(s=>[s.id,{name:s.name,total:0,attempted:0,correct:0,incorrect:0,score:0,maxScore:0}]));
 let correctCount=0,incorrectCount=0,unattemptedCount=0,score=0;
 for(const q of paper.questions){
  const section=sectionMap[q.section];section.total++;section.maxScore+=paper.markingScheme.correct;
  if(!Object.hasOwn(userAnswers,q.id)){unattemptedCount++;continue;}section.attempted++;
  if(userAnswers[q.id]===q.correctAnswer){correctCount++;score+=paper.markingScheme.correct;section.correct++;section.score+=paper.markingScheme.correct;}
  else{incorrectCount++;score-=paper.markingScheme.incorrect;section.incorrect++;section.score-=paper.markingScheme.incorrect;}
 }
 score=Number(score.toFixed(6));const attempted=correctCount+incorrectCount;
 return {userAnswers,statusMap,score,maxScore:paper.totalMarks,percentage:Math.round(score/paper.totalMarks*100),accuracy:attempted?Math.round(correctCount/attempted*100):0,correctCount,incorrectCount,unattemptedCount,totalQuestions:paper.questions.length,sectionMap};
}
function hash(seed){let result=2166136261;for(const c of seed)result=Math.imul(result^c.charCodeAt(0),16777619);return result>>>0;}
export function prepareAttemptPaper(paper,seed){
 const next=clone(paper),offset=hash(String(seed))%4;
 const positions=next.questions.map((_,i)=>(i+offset)%4);let positionState=hash(seed+':positions');
 for(let i=positions.length-1;i>0;i--){positionState=(Math.imul(positionState,1664525)+1013904223)>>>0;const j=positionState%(i+1);[positions[i],positions[j]]=[positions[j],positions[i]];}
 next.questions=next.questions.map((q,index)=>{
  const correct=q.options[q.correctAnswer],wrong=q.options.filter((_,i)=>i!==q.correctAnswer);
  let state=hash(seed+':'+q.id);for(let i=wrong.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
  const target=positions[index],options=[...wrong];options.splice(target,0,correct);return {...q,options,correctAnswer:target};
 });return next;
}
