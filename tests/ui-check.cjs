// Standalone component checks: PLAYWRIGHT_MODULE and CHROME_PATH can use existing local runtimes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');

(async () => {
  const { createServer } = await import('vite');
  const server = await createServer({ root: path.resolve(__dirname, '..'), server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}/tests/ui-harness.html`;
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 740 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page must fit the viewport');
  try {
    await page.goto(base);
    const trigger = page.getByRole('button', { name: 'Open paper manager', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Manage test papers', exact: true });
    await dialog.waitFor({ timeout: 4000 });
    assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Opening the dialog moves focus inside');
    await page.keyboard.press('Shift+Tab');
    assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Reverse tab stays inside');
    await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Forward tab stays inside');
    await page.getByLabel('JSON test papers', { exact: true }).fill('{}');
    await noOverflow();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.ok(await trigger.evaluate(el => el === document.activeElement), 'Closing returns focus to the trigger');

    await trigger.click();
    await page.getByRole('button', { name: 'Create custom paper', exact: true }).click();
    await page.getByLabel('Test title', { exact: true }).fill('UI remove and add fixture');
    await page.getByRole('button', { name: 'Add another question', exact: true }).click();
    await page.getByRole('button', { name: 'Add another question', exact: true }).click();
    await page.getByRole('button', { name: 'Delete question 2', exact: true }).click();
    await page.getByRole('button', { name: 'Add another question', exact: true }).click();
    for (let q = 1; q <= 3; q++) {
      await page.getByLabel(`Question ${q} text`, { exact: true }).fill(`Distinct question ${q}?`);
      for (const letter of ['A', 'B', 'C', 'D']) await page.getByLabel(`Question ${q}, option ${letter} text`, { exact: true }).fill(`${letter} answer ${q}`);
      await page.getByRole('radio', { name: `Question ${q}, correct answer ${['A', 'B', 'C'][q - 1]}`, exact: true }).check();
    }
    assert.equal(await page.getByRole('radio', { checked: true }).count(), 3, 'Every question retains its own selected key');
    await page.setViewportSize({ width: 320, height: 640 });
    await noOverflow();
    const save = page.getByRole('button', { name: 'Save new test paper', exact: true });
    await save.scrollIntoViewIfNeeded();
    const saveBox = await save.boundingBox();
    assert.ok(saveBox.y >= 0 && saveBox.y + saveBox.height <= 640, 'Save footer remains reachable at 320px');
    await fs.mkdir(path.resolve(__dirname, '../verification'), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, '../verification/ui-manual-320.png'), fullPage: true });
    await save.click();
    await page.getByText('Paper added', { exact: true }).waitFor();
    const paper = await page.evaluate(() => window.readUiTests().find(test => test.title === 'UI remove and add fixture'));
    assert.equal(new Set(paper.questions.map(q => q.id)).size, 3, 'Removing and adding never reuses a question ID');
    assert.deepEqual(paper.questions.map(q => q.correctAnswer), [0, 1, 2]);

    await page.goto(`${base}?view=analysis`);
    await page.getByRole('heading', { name: /Saved paper version/ }).waitFor();
    assert.equal(await page.getByText('Changed current question', { exact: true }).count(), 0);
    await page.getByText(attemptWarning, { exact: true }).waitFor();
    await page.getByRole('link', { name: 'NCERT topic reference', exact: true }).waitFor();
    assert.equal(await page.getByText(/percentile|official examination answer keys/i).count(), 0);
    await noOverflow();
    const layout = await page.locator('.solutions-workspace').evaluate(el => getComputedStyle(el).gridTemplateColumns);
    assert.equal(layout.trim().split(/\s+/).length, 1, 'Mobile solution workspace stacks in one column');
    await page.screenshot({ path: path.resolve(__dirname, '../verification/ui-results-320.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 }); await noOverflow();
    await page.screenshot({ path: path.resolve(__dirname, '../verification/ui-results-390.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 }); await noOverflow();
    await page.screenshot({ path: path.resolve(__dirname, '../verification/ui-results-desktop.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: named modal, focus trap/Escape/return, labelled editors, independent answer keys after remove/add, reachable mobile footer, immutable snapshot review, legacy/source labels and mobile results.');
  } finally { await browser.close(); await server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
const attemptWarning = 'Historical option order could not be confirmed for this imported record.';
