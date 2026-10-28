// Run with Playwright available: node tests/browser-check.cjs
// PLAYWRIGHT_MODULE and CHROME_PATH may point to an existing local installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const url = process.env.TEST_URL || 'http://localhost:3000';
const baseURL = url.endsWith('.html') ? url : url.replace(/\/$/, '') + '/';

(async () => {
  await fs.mkdir('verification', { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const overflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
  const route = async name => { await page.goto(`${baseURL}#${name}`); await page.locator('main').waitFor(); };
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('study-atlas-preview-v1')));
  try {
    await route('overview');
    await page.getByText("You're in preview mode.", { exact: true }).waitFor();
    assert.equal(await page.locator('.stat-card strong').first().textContent(), '0');
    await overflow(); await page.screenshot({ path:'verification/desktop-overview.png', fullPage:true });
    await route('syllabus');
    await page.keyboard.press('/'); assert.equal(await page.locator('.search-box input').evaluate(el => el === document.activeElement), true);
    await page.getByRole('searchbox').fill('H004.04');
    assert.equal(await page.locator('.topic-card').count(), 1);
    await page.locator('.topic-card').click();
    await page.getByRole('checkbox', { name:'Mark H004.04 complete', exact:true }).check();
    const completedAt = (await stored()).entries['H004.04'].completedAt;
    assert.ok(completedAt);
    await page.getByRole('button', { name:'Notes for H004.04', exact:true }).click();
    await page.getByLabel('Your notes', { exact:true }).fill('नगर नियोजन: compare drainage, streets and sources.');
    await page.getByRole('checkbox', { name:'Revisit this subtopic' }).check();
    await page.getByRole('button', { name:'Save notes', exact:true }).click();
    await page.locator('dialog').waitFor({ state:'detached' });
    assert.equal((await stored()).entries['H004.04'].completedAt, completedAt);
    await page.reload();
    await page.getByRole('checkbox', { name:'Mark H004.04 complete', exact:true }).waitFor();
    assert.equal(await page.getByRole('checkbox', { name:'Mark H004.04 complete', exact:true }).isChecked(), true);
    assert.match(await page.locator('.note-snippet').textContent(), /नगर नियोजन/);
    await page.getByRole('button', { name:'Research prompt for H004.04', exact:true }).click();
    const research = await page.getByRole('textbox', { name:'Prepared AI prompt' }).inputValue();
    assert.match(research, /H004\.04/); assert.match(research, /https:\/\//);
    assert.doesNotMatch(research, /- H004\.03/);
    await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state:'detached' });
    await overflow(); await page.screenshot({ path:'verification/desktop-topic.png', fullPage:true });
    await route('weekend');
    await page.getByRole('button', { name:'Build assessment prompt', exact:true }).click();
    const weekend = await page.getByRole('textbox', { name:'Prepared AI prompt' }).inputValue();
    assert.match(weekend, /H004\.04/); assert.doesNotMatch(weekend, /- H004\.03/);
    await page.keyboard.press('Escape');
    await page.getByLabel('From', { exact:true }).fill('2030-01-01');
    await page.getByRole('alert').filter({ hasText:'The start date' }).waitFor();
    assert.equal(await page.getByRole('button', { name:'Build assessment prompt' }).isDisabled(), true);
    await route('settings');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name:'Export backup', exact:true }).click();
    const download = await downloadPromise;
    const downloaded = await fs.readFile(await download.path(), 'utf8');
    const backup = JSON.parse(downloaded); assert.equal(backup.entries['H004.04'].needsRevision, true);
    await page.locator('input[type=file]').setInputFiles({ name:'invalid.json', mimeType:'application/json', buffer:Buffer.from('{"broken":true}') });
    await page.getByRole('status').filter({ hasText:'not a compatible' }).waitFor();
    assert.equal(await page.locator('dialog').count(), 0);
    await page.locator('input[type=file]').setInputFiles({ name:'backup.json', mimeType:'application/json', buffer:Buffer.from(downloaded) });
    await page.getByRole('button', { name:'Merge progress', exact:true }).click();
    await page.locator('dialog').waitFor({ state:'detached' });
    assert.equal((await stored()).entries['H004.04'].completedAt, completedAt);
    await page.getByRole('button', { name:'Sign in with Google', exact:true }).first().click();
    await page.getByRole('status').filter({ hasText:'needs the Firebase setup' }).waitFor();
    await page.getByRole('button', { name:'Dismiss message', exact:true }).click();
    await overflow(); await page.screenshot({ path:'verification/desktop-settings.png', fullPage:true, animations:'disabled' });
    await route('syllabus');
    await page.getByRole('searchbox').fill('HI002.01');
    assert.equal(await page.locator('.topic-card').count(), 1);
    await page.locator('.topic-card').click();
    await page.getByRole('checkbox', { name:'Mark HI002.01 complete', exact:true }).waitFor();
    assert.equal(await page.getByRole('checkbox', { name:'Mark HI002.01 complete', exact:true }).isVisible(), true);
    await overflow();
    await page.setViewportSize({ width:390, height:844 });
    await route('overview'); await overflow();
    await page.screenshot({ path:'verification/mobile-overview.png', fullPage:true, animations:'disabled' });
    await page.getByRole('button', { name:'Open navigation', exact:true }).click();
    await page.getByRole('dialog', { name:'Study navigation' }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name:'Open navigation' }).getAttribute('aria-expanded'), 'false');
    await route('topic/H004'); await overflow();
    await page.screenshot({ path:'verification/mobile-topic.png', fullPage:true });
    await page.getByRole('button', { name:'Notes for H004.04', exact:true }).click();
    await overflow(); await page.screenshot({ path:'verification/mobile-notes.png', fullPage:true });
    await page.keyboard.press('Escape');
    for (const r of ['syllabus','weekend','settings']) { await route(r); await overflow(); }
    await page.setViewportSize({ width:320, height:700 });
    for (const r of ['overview','syllabus','topic/H004','weekend','settings']) { await route(r); await overflow(); }
    // A separate browser context must begin with its own empty preview.
    const second = await browser.newContext(); const clean = await second.newPage();
    await clean.goto(`${baseURL}#overview`); await clean.getByText("You're in preview mode.", { exact:true }).waitFor();
    assert.equal(await clean.locator('.stat-card strong').first().textContent(), '0');
    await second.close();
    assert.deepEqual(errors, []);
    console.log('PASS: desktop/mobile pages, ID and Hindi search, completion persistence, notes/revision, exact prompt scopes, date errors, export/import, setup notice, account-isolated preview, no page errors or horizontal overflow (1440/390/320px).');
  } catch (error) {
    await page.screenshot({ path:'verification/failure.png', fullPage:true }); throw error;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
