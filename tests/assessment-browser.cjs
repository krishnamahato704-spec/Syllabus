const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const base=process.env.TEST_URL||'http://127.0.0.1:4400';
const fixture={id:'browser-expiry-fixture',title:'Browser expiry fixture',category:'ctet',durationMinutes:0.02,totalMarks:1,markingScheme:{correct:1,incorrect:0},questions:[{id:'expiry-q',section:'all',question:'Choose the correct fixture option.',options:['Correct fixture option','Wrong one','Wrong two','Wrong three'],correctAnswer:0,explanation:'This is a synthetic browser regression fixture.'}]};
(async()=>{
 await fs.mkdir('verification',{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 try{
  await page.clock.install({time:new Date('2026-10-30T10:00:00Z')});await page.clock.pauseAt(new Date('2026-10-30T10:00:01Z'));
  fixture.sections=[{id:'all',name:'Practice'}];fixture.totalQuestions=1;fixture.targetExam='CTET practice';
  await context.addInitScript(test=>{if(!localStorage.getItem('study-atlas-assessment-v1:local'))localStorage.setItem('study-atlas-assessment-v1:local',JSON.stringify({version:1,customTests:[test],attempts:{},drafts:{},archivedTests:[],migrationWarnings:[]}));},fixture);
  await page.goto(base);await page.getByRole('searchbox').fill(fixture.title);await page.getByRole('button',{name:'Start Test',exact:true}).click();
  await page.getByText('Correct fixture option',{exact:true}).click();await page.getByRole('button',{name:'Save & Next',exact:true}).click();
  await page.clock.runFor(3500);await page.locator('.scorecard-tile.primary .big-score').waitFor({timeout:5000});
  assert.equal((await page.locator('.scorecard-tile.primary .big-score').textContent()).trim(),'1','A saved correct answer must survive automatic expiry');
  assert.deepEqual(errors,[]);await page.screenshot({path:'verification/expiry-pass.png',fullPage:true});
  console.log('PASS: saved response survives automatic timer expiry and is marked correct.');
 }catch(e){console.error(await page.url(),errors,await page.locator('body').innerText());await page.screenshot({path:'verification/assessment-failure.png',fullPage:true});throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
