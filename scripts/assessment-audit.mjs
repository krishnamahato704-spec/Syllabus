import {writeFile,mkdir} from 'node:fs/promises';
import {ALL_INITIAL_TESTS,QUESTION_BANK,CATALOG_INFO} from '../src/data/tests-data.js';
import {canonicalStem} from '../src/assessment-validation.js';
const used=new Set(ALL_INITIAL_TESTS.flatMap(t=>t.questions.map(q=>q.id)));
const report={...CATALOG_INFO,reachableQuestions:used.size,uniqueBankStems:new Set(QUESTION_BANK.map(q=>canonicalStem(q.question))).size,papersByStream:Object.fromEntries(['ncert','ctet','ugc_net'].map(c=>[c,ALL_INITIAL_TESTS.filter(t=>t.category===c).length])),questionPools:Object.fromEntries(['all','cdp','lang1','lang2','sst','p1','p2'].map(s=>[s,QUESTION_BANK.filter(q=>q.section===s).length])),papers:ALL_INITIAL_TESTS.map(t=>({id:t.id,title:t.title,category:t.category,section:t.syllabusSection,questions:t.questions.length,distinctStems:new Set(t.questions.map(q=>canonicalStem(q.question))).size,minutes:t.durationMinutes,marks:t.totalMarks,answerPositions:[0,1,2,3].map(i=>t.questions.filter(q=>q.correctAnswer===i).length)}))};
await mkdir('verification',{recursive:true});await writeFile('verification/content-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,papers:report.papers.length},null,2));
