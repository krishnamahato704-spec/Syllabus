import {SCHOOL_QUESTIONS} from './school-questions.js';
import {NET_QUESTIONS} from './net-questions.js';
import {validateTestPaper,prepareAttemptPaper,canonicalStem} from '../assessment-validation.js';
export const QUESTION_BANK=[...SCHOOL_QUESTIONS,...NET_QUESTIONS];
export const UNIT_NAMES={
 teaching:'Teaching aptitude',research:'Research aptitude',comprehension:'Reading comprehension',communication:'Communication',
 'mathematical-reasoning':'Mathematical reasoning','logical-reasoning':'Logical reasoning','data-interpretation':'Data interpretation',
 ict:'ICT',environment:'People, development and environment','higher-education':'Higher education',
 'history-1':'Unit 1 · Sources, prehistory and early states','history-2':'Unit 2 · Mauryas to the post-Gupta period',
 'history-3':'Unit 3 · Early medieval India','history-4':'Unit 4 · Medieval sources and Delhi Sultanate',
 'history-5':'Unit 5 · Medieval administration and economy','history-6':'Unit 6 · Medieval society and culture',
 'history-7':'Unit 7 · Colonial expansion and governance','history-8':'Unit 8 · Colonial economy, society and reform',
 'history-9':'Unit 9 · National movement and independent India','history-10':'Unit 10 · Historical method and historiography'};
export const TEST_CATEGORIES=[
 {id:'ncert',name:'NCERT foundations',shortName:'NCERT',description:'Selected school Social Science concepts; use the full checklist for Class 6–12 coverage.',sections:[{id:'all',label:'All foundations'},{id:'mixed',label:'Mixed practice'},{id:'history',label:'History'},{id:'geography',label:'Geography'},{id:'civics',label:'Political Science / Civics'},{id:'economics',label:'Economics'}]},
 {id:'ctet',name:'CTET Paper II',shortName:'CTET',description:'Social Studies / Social Science, CDP, English I and Hindi II.',sections:[{id:'all',label:'All CTET papers'},{id:'full_mock',label:'Full paper · 150 questions'},{id:'cdp',label:'Child Development & Pedagogy'},{id:'lang1',label:'English Language I'},{id:'lang2',label:'Hindi Language II'},{id:'sst',label:'Social Studies / Social Science'},{id:'pedagogy',label:'Pedagogy drills'},{id:'content',label:'Social Science content'}]},
 {id:'ugc_net',name:'UGC NET History',shortName:'UGC NET',description:'General Paper I and History Paper II, with all ten units of each.',sections:[{id:'all',label:'All NET papers'},{id:'full_mock',label:'Combined · 150 questions'},{id:'p1',label:'General Paper I'},{id:'p2',label:'History Paper II'},{id:'ancient',label:'Ancient India · Units 1–2'},{id:'early-medieval',label:'Early medieval · Unit 3'},{id:'medieval',label:'Medieval · Units 4–6'},{id:'modern',label:'Modern · Units 7–9'},{id:'historiography',label:'Historical method · Unit 10'}]}
];
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function selectQuestions(pool,n,seed){
 const unique=[...new Map(pool.map(q=>[canonicalStem(q.question),q])).values()];
 if(unique.length<n)throw new Error('Not enough distinct questions for '+seed+': '+unique.length+'/'+n);
 const form=Number(seed.match(/form-(\d+)/)?.[1]||1),family=seed.replace(/form-\d+/,'forms');
 const ordered=unique.map(q=>({q,rank:hash(family+':'+q.id)})).sort((a,b)=>a.rank-b.rank||a.q.id.localeCompare(b.q.id));
 const offset=((form-1)*n+Math.floor((form-1)/2))%ordered.length;
 return [...ordered.slice(offset),...ordered.slice(0,offset)].slice(0,n).map(x=>structuredClone(x.q));
}
const from=(section,p=()=>true)=>QUESTION_BANK.filter(q=>q.section===section&&p(q));
function groupPassages(pool){return [...new Set(pool.map(q=>q.passage?.id).filter(Boolean))].map(id=>pool.filter(q=>q.passage?.id===id));}
function language(section,seed){
 const pool=from(section),groups=groupPassages(pool);
 // Keep each reading set intact: two unseen passages per language.
 const choose=(p,salt)=>{const candidates=groups.filter(g=>p(g));if(!candidates.length)throw new Error('Reading groups not ready for '+section);const form=Number(seed.match(/form-(\d+)/)?.[1]||1);return candidates[(form-1)%candidates.length];};
 const reading=section==='lang1'?[...choose(g=>g.length===10&&g[0].passage.type!=='poem','prose'),...choose(g=>g.length===5&&g[0].passage.type==='poem','poem')]:[...choose(g=>g.length===8,'eight'),...choose(g=>g.length===7,'seven')];
 return [...reading,...selectQuestions(pool.filter(q=>q.kind==='pedagogy'),15,seed+'pedagogy')];
}
function cdp(seed){return [['development',15],['inclusion',5],['learning',10]].flatMap(([d,n])=>selectQuestions(from('cdp',q=>q.domain===d),n,seed+d));}
function sst(seed){return [...selectQuestions(from('sst',q=>q.kind==='content'),40,seed+'content'),...selectQuestions(from('sst',q=>q.kind==='pedagogy'),20,seed+'pedagogy')];}
const p1units=Object.keys(UNIT_NAMES).filter(k=>!k.startsWith('history-'));
function p1(seed){return p1units.flatMap(u=>selectQuestions(from('p1',q=>q.unit===u),5,seed+u));}
function p2(seed){return Array.from({length:10},(_,i)=>'history-'+(i+1)).flatMap(u=>selectQuestions(from('p2',q=>q.unit===u),10,seed+u));}
const papers=[];
function paper(id,title,category,syllabusSection,questions,durationMinutes,note){
 const mark=category==='ugc_net'?2:1;
 const raw={id:'sa2-'+id,title,category,syllabusSection,questions,durationMinutes,totalMarks:questions.length*mark,markingScheme:{correct:mark,incorrect:0},version:'2026-10-30-v2',targetExam:category==='ncert'?'NCERT practice':category==='ctet'?'CTET Paper II':'UGC NET History',
 isSectional:syllabusSection!=='full_mock',isQuickBurst:durationMinutes<=30,coverage:{origin:'Authored practice',note:note||'Selected concepts. Questions can recur across papers; this is a finite practice bank, not complete syllabus coverage.'}};
 const validated=validateTestPaper(raw);papers.push(prepareAttemptPaper(validated,id));return validated;
}
for(let f=1;f<=3;f++){
 const seed='form-'+f;
 paper('ncert-mixed-'+f,'NCERT · Mixed foundations · Form '+f,'ncert','mixed',selectQuestions(from('all'),50,seed),60);
 for(const d of ['history','geography','civics','economics'])paper('ncert-'+d+'-'+f,'NCERT · '+({civics:'Civics'}[d]||d[0].toUpperCase()+d.slice(1))+' · Form '+f,'ncert',d,selectQuestions(from('all',q=>q.domain===d),10,seed+d),15);
 paper('ctet-full-'+f,'CTET Paper II · Full practice · Form '+f,'ctet','full_mock',[...cdp(seed),...language('lang1',seed),...language('lang2',seed),...sst(seed)],150,'150 questions: CDP 30; English I 30; Hindi II 30; Social Science 60. Online practice for the official OMR exam; selected concepts, with overlap across forms.');
 for(const [section,qs,mins,label] of [['cdp',cdp(seed),30,'CDP'],['lang1',language('lang1',seed),30,'English I'],['lang2',language('lang2',seed),30,'Hindi II'],['sst',sst(seed),60,'Social Science']])paper('ctet-'+section+'-'+f,'CTET · '+label+' · Form '+f,'ctet',section,qs,mins);
 paper('net-full-'+f,'UGC NET · Combined practice · Form '+f,'ugc_net','full_mock',[...p1(seed),...p2(seed)],180,'Paper I: 5 questions per unit. History: 10 per unit is an app practice balance, not an official unit-wise weighting. Concepts recur across forms.');
 paper('net-p1-'+f,'NET · General Paper I · Form '+f,'ugc_net','p1',p1(seed),60,'50 questions, 5 per unit. The separate 60-minute limit is a practice choice; the actual exam has a combined 180-minute session.');
 paper('net-p2-'+f,'NET · History Paper II · Form '+f,'ugc_net','p2',p2(seed),120,'100 questions, 10 per unit is an app practice balance. The separate 120-minute limit is a practice choice.');
}
for(const d of ['development','inclusion','learning'])paper('ctet-cdp-'+d,'CTET CDP · '+d[0].toUpperCase()+d.slice(1),'ctet','cdp',selectQuestions(from('cdp',q=>q.domain===d),Math.min(15,from('cdp',q=>q.domain===d).length),d),20);
for(const s of ['lang1','lang2'])paper('ctet-'+s+'-pedagogy','CTET · '+(s==='lang1'?'English':'Hindi')+' pedagogy','ctet','pedagogy',selectQuestions(from(s,q=>q.kind==='pedagogy'),20,s),25);
for(const d of ['history','geography','civics'])paper('ctet-sst-'+d,'CTET Social Science · '+d,'ctet','content',selectQuestions(from('sst',q=>q.domain===d&&q.kind==='content'),15,d),20);
paper('ctet-sst-pedagogy','CTET · Social Science pedagogy','ctet','pedagogy',selectQuestions(from('sst',q=>q.kind==='pedagogy'),25,'socialped'),30);
for(const u of p1units)paper('net-unit-'+u,'NET Paper I · '+UNIT_NAMES[u],'ugc_net','p1',selectQuestions(from('p1',q=>q.unit===u),8,u),15);
for(let i=1;i<=10;i++){const u='history-'+i;paper('net-unit-'+u,'NET History · '+UNIT_NAMES[u],'ugc_net','p2',selectQuestions(from('p2',q=>q.unit===u),14,u),20);}
for(const [key,units,label] of [['ancient',[1,2],'Ancient India'],['early-medieval',[3],'Early medieval India'],['medieval',[4,5,6],'Medieval India'],['modern',[7,8,9],'Modern India'],['historiography',[10],'Historical method']]){
 const pool=from('p2',q=>units.some(n=>q.unit==='history-'+n));
 paper('net-period-'+key,'NET History · '+label+' drill','ugc_net',key,selectQuestions(pool,Math.min(25,pool.length),key),30);
}
export const ALL_INITIAL_TESTS=papers;
export const CATALOG_INFO={questions:QUESTION_BANK.length,papers:papers.length,version:'2026-10-30-v2',note:'Authored practice with topic references. Each paper has distinct stems; different papers reuse a finite bank. Selected questions do not certify full syllabus mastery.'};

