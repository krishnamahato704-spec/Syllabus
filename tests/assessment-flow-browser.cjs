const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const base=process.env.TEST_URL||'http://127.0.0.1:4400';
const key='study-atlas-assessment-v1:local';
const state=()=>({version:1,customTests:[],attempts:{},drafts:{},archivedTests:[],migrationWarnings:[]});
(async()=>{
 await fs.mkdir('verification',{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const errors=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page-level horizontal overflow');
 try{
  await page.goto(base);await page.getByRole('heading',{name:'Choose your next practice.'}).waitFor();
  await noOverflow();await page.screenshot({path:'verification/hub-desktop.png'});
  const card=page.locator('.sa-paper').filter({has:page.getByRole('heading',{name:'CTET · English I · Form 1',exact:true})});
  await card.getByRole('button',{name:'Start Test',exact:true}).click();
  await page.getByRole('article',{name:'Reading passage'}).waitFor();
  const optionsBefore=await page.locator('.option-text').allTextContents();
  await page.locator('.option-card').nth(2).click();
  await page.getByRole('button',{name:'Mark for Review & Next',exact:true}).click();
  let s=await saved(),id=Object.keys(s.drafts)[0],d=s.drafts[id];const deadline=d.deadline,questionId=d.testSnapshot.questions[0].id;
  assert.equal(d.userAnswers[questionId],2);assert.equal(d.currentIndex,1);assert.equal(d.statusMap[questionId],'marked_answered');
  await page.reload();await page.getByText('Question 2',{exact:true}).waitFor();s=await saved();assert.equal(s.drafts[id].deadline,deadline);assert.equal(s.drafts[id].currentIndex,1);
  await page.getByRole('button',{name:'Previous',exact:true}).click();assert.deepEqual(await page.locator('.option-text').allTextContents(),optionsBefore);assert.ok(await page.getByRole('radio').nth(2).isChecked());
  await page.getByRole('button',{name:'Save & Exit',exact:true}).click();await page.getByRole('heading',{name:'Continue a saved sitting'}).waitFor();
  await page.getByRole('button',{name:'Download progress',exact:true}).click();
  const backup=await saved();assert.equal(backup.drafts[id].deadline,deadline);
  await page.locator('.sa-resume').getByRole('button').click();await page.getByRole('button',{name:'Submit Test',exact:true}).first().click();
  await page.getByRole('dialog').getByRole('button',{name:'Yes, Submit Test',exact:true}).click();
  await page.getByRole('heading',{name:/Results & solutions/}).waitFor();s=await saved();assert.equal(s.attempts[id].userAnswers[questionId],2);assert.ok(!s.drafts[id]);assert.ok(s.attempts[id].testSnapshot);assert.ok(!Object.hasOwn(s.attempts[id],'percentile'));
  await page.screenshot({path:'verification/results-desktop.png'});
  await page.reload();await page.getByRole('heading',{name:/Results & solutions/}).waitFor();
  await page.getByRole('button',{name:'Back to test hub'}).click();
  await page.getByRole('searchbox').fill('English I · Form 1');assert.equal(await page.getByRole('button',{name:'Start Test',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:'View results',exact:true}).count(),1);
  await page.getByRole('searchbox').fill('');await page.getByRole('button',{name:'Add a test',exact:true}).click();
  const dialog=page.getByRole('dialog');await dialog.waitFor();assert.ok(await dialog.evaluate(e=>e.contains(document.activeElement)));
  await dialog.getByLabel('JSON test papers',{exact:true}).fill(JSON.stringify({id:'bad-import',title:'Must not persist',category:'ctet',questions:[{id:'x',question:'Bad key',options:['a','b','c','d'],correctAnswer:9}]}));
  await dialog.getByRole('button',{name:/Import.*Paper/}).click();assert.match(await dialog.innerText(),/correct answer.*0 to 3/i);assert.ok(!(await saved()).customTests.some(t=>t.id==='bad-import'));
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  for(const width of [320,390]){
   await page.setViewportSize({width,height:844});await noOverflow();await page.screenshot({path:`verification/hub-${width}.png`});
   await page.getByRole('searchbox').fill('CTET · CDP · Form 2');await page.getByRole('button',{name:/^(Start Test|Resume Test)$/}).click();
   assert.ok(await page.locator('.testbook-question-pane').evaluate(e=>e.getBoundingClientRect().width>=innerWidth-2));
   await noOverflow();await page.screenshot({path:`verification/exam-${width}.png`});
   await page.getByRole('button',{name:'Open question navigator',exact:true}).click();await page.locator('aside').getByRole('button',{name:'Close question navigator',exact:true}).waitFor();
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Open question navigator',exact:true}).getAttribute('aria-expanded'),'false');
   await page.getByRole('button',{name:'Save & Exit',exact:true}).click();
   await page.getByRole('searchbox').fill('');
  }
  // A second fresh browser demonstrates the backup contains the full sitting.
  const second=await browser.newPage({viewport:{width:390,height:844}});await second.goto(base);
  await second.getByLabel('Choose progress backup').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'study-atlas-assessment',version:1,state:backup}))});
  await second.getByRole('button',{name:'Merge backup',exact:true}).click();await second.locator('.sa-resume').waitFor();
  const restored=await second.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(restored.drafts[id].deadline,deadline);assert.equal(restored.drafts[id].userAnswers[questionId],2);await second.close();
  assert.deepEqual(errors,[]);console.log('PASS: refresh/resume, original deadline, stable options, review flags, manual marking, read-only results, bad import rejection, full backup restore, 320/390px hub/exam and drawer keyboard behaviour.');
 }catch(e){console.error('URL',page.url(),'errors',errors);await page.screenshot({path:'verification/flow-failure.png',fullPage:true});throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
