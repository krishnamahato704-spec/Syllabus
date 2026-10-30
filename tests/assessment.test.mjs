import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_INITIAL_TESTS, TEST_CATEGORIES } from '../src/data/tests-data.js';
import {
  submitTestAttempt, isTestCompleted, getAttemptForTest, addTestPaper,
  importTestPapersFromJSON, exportTestsAsJSON
} from '../src/test-engine.js';
import backupSyllabus from '../src/data/backup-syllabus.json' with { type: 'json' };

// Mock localStorage in Node environment if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: key => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: key => store.delete(key),
    clear: () => store.clear()
  };
}

test('Test categories include all major exam streams and sectionals', () => {
  const categoryIds = TEST_CATEGORIES.map(c => c.id);
  assert.ok(categoryIds.includes('ncert'));
  assert.ok(categoryIds.includes('ctet'));
  assert.ok(categoryIds.includes('ugc_net'));
  assert.ok(!categoryIds.includes('pg_history'), 'pg_history must be excluded per user request');
});

test('Default test paper bank contains at least 10 tests for each of the 3 exam categories', () => {
  const ncertTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ncert');
  const ctetTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ctet');
  const ugcNetTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ugc_net');
  const pgTests = ALL_INITIAL_TESTS.filter(t => t.category === 'pg_history');

  assert.ok(ncertTests.length >= 10, `Expected at least 10 NCERT tests, found ${ncertTests.length}`);
  assert.ok(ctetTests.length >= 10, `Expected at least 10 CTET tests, found ${ctetTests.length}`);
  assert.ok(ugcNetTests.length >= 10, `Expected at least 10 UGC NET tests, found ${ugcNetTests.length}`);
  assert.equal(pgTests.length, 0, 'No PG History tests should exist in bank');
  assert.ok(ALL_INITIAL_TESTS.length >= 50, `Expected at least 50 total tests, found ${ALL_INITIAL_TESTS.length}`);
});

test('NCERT tests strictly follow 50 questions for 50 marks format', () => {
  const ncertMock1 = ALL_INITIAL_TESTS.find(t => t.id === 'ncert-test-01');
  assert.ok(ncertMock1, 'NCERT Mock 1 must exist');
  assert.equal(ncertMock1.totalQuestions, 50);
  assert.equal(ncertMock1.totalMarks, 50);
  assert.equal(ncertMock1.durationMinutes, 60);
  assert.equal(ncertMock1.questions.length, 50);
  assert.equal(ncertMock1.markingScheme.correct, 1);
  assert.equal(ncertMock1.markingScheme.incorrect, 0);
});

test('CTET Paper 2 tests follow official 150 questions format with 4 sections', () => {
  const ctetMock1 = ALL_INITIAL_TESTS.find(t => t.id === 'ctet-full-01');
  assert.ok(ctetMock1, 'CTET Mock 1 must exist');
  assert.equal(ctetMock1.totalQuestions, 150);
  assert.equal(ctetMock1.totalMarks, 150);
  assert.equal(ctetMock1.durationMinutes, 150);
  assert.equal(ctetMock1.questions.length, 150);
  assert.equal(ctetMock1.sections.length, 4);

  const secIds = ctetMock1.sections.map(s => s.id);
  assert.ok(secIds.includes('cdp'), 'Must contain CDP section');
  assert.ok(secIds.includes('lang1'), 'Must contain Language 1 English section');
  assert.ok(secIds.includes('lang2'), 'Must contain Language 2 Hindi section');
  assert.ok(secIds.includes('sst'), 'Must contain Social Science section');
});

test('CTET sectional tests exist for CDP, English, Hindi, and Social Science', () => {
  const cdpSec = ALL_INITIAL_TESTS.find(t => t.id === 'ctet-sec-cdp-01');
  const engSec = ALL_INITIAL_TESTS.find(t => t.id === 'ctet-sec-eng-01');
  const hindiSec = ALL_INITIAL_TESTS.find(t => t.id === 'ctet-sec-hindi-01');
  const sstSec = ALL_INITIAL_TESTS.find(t => t.id === 'ctet-sec-sst-01');

  assert.ok(cdpSec, 'CTET CDP sectional test must exist');
  assert.ok(engSec, 'CTET English sectional test must exist');
  assert.ok(hindiSec, 'CTET Hindi sectional test must exist');
  assert.ok(sstSec, 'CTET Social Science sectional test must exist');
});

test('UGC NET History tests follow official Paper 1, Paper 2, and Combined mocks (+2 marks)', () => {
  const paper1 = ALL_INITIAL_TESTS.find(t => t.id === 'ugc-net-p1-01');
  assert.ok(paper1, 'UGC NET Paper 1 Mock must exist');
  assert.equal(paper1.totalQuestions, 50);
  assert.equal(paper1.totalMarks, 100);
  assert.equal(paper1.markingScheme.correct, 2);

  const combined = ALL_INITIAL_TESTS.find(t => t.id === 'ugc-net-full-01');
  assert.ok(combined, 'UGC NET Combined Mock must exist');
  assert.equal(combined.totalQuestions, 150);
  assert.equal(combined.totalMarks, 300);
});

test('Post-Graduation History is completely excluded from test papers as requested', () => {
  const pgTests = ALL_INITIAL_TESTS.filter(t => t.category === 'pg_history' || t.id.startsWith('pg-hist'));
  assert.equal(pgTests.length, 0, 'Zero PG History tests should exist in the active test bank');
});

test('Zero Recurring Questions: Every test paper in the bank has 100% unique questions with NO intra-test duplicates', () => {
  for (const testPaper of ALL_INITIAL_TESTS) {
    assert.ok(testPaper.questions && testPaper.questions.length > 0, `Test ${testPaper.id} must have questions`);
    assert.equal(
      testPaper.questions.length,
      testPaper.totalQuestions,
      `Test ${testPaper.id} questions length (${testPaper.questions.length}) must match totalQuestions (${testPaper.totalQuestions})`
    );

    const questionTexts = testPaper.questions.map(q => q.question.trim());
    const uniqueQuestions = new Set(questionTexts);

    // If there is any duplicate, identify the duplicate question text for diagnosis
    if (uniqueQuestions.size !== questionTexts.length) {
      const seen = new Set();
      const duplicates = [];
      for (const q of questionTexts) {
        if (seen.has(q)) duplicates.push(q);
        seen.add(q);
      }
      assert.fail(`Test ${testPaper.id} has ${duplicates.length} duplicate questions! First duplicate: "${duplicates[0]}"`);
    }

    assert.equal(
      uniqueQuestions.size,
      testPaper.questions.length,
      `Test ${testPaper.id} must have ZERO duplicate questions within the same test paper`
    );
  }
});

test('Expanded test paper bank contains ample tests across all syllabus sections', () => {
  const ncertTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ncert');
  const ctetTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ctet');
  const ugcNetTests = ALL_INITIAL_TESTS.filter(t => t.category === 'ugc_net');
  const pgTests = ALL_INITIAL_TESTS.filter(t => t.category === 'pg_history');

  assert.ok(ncertTests.length >= 12, `NCERT should have at least 12 tests, got ${ncertTests.length}`);
  assert.ok(ctetTests.length >= 15, `CTET should have at least 15 tests, got ${ctetTests.length}`);
  assert.ok(ugcNetTests.length >= 18, `UGC NET should have at least 18 tests, got ${ugcNetTests.length}`);
  assert.equal(pgTests.length, 0, 'PG History tests must be 0');
  assert.ok(ALL_INITIAL_TESTS.length >= 50, `Total tests should be >= 50, got ${ALL_INITIAL_TESTS.length}`);
});

test('Attempt submission computes score, accuracy, and section breakdown correctly', () => {
  const dummyTest = {
    id: 'test-calc-sample-01',
    title: 'Sample Calculation Test',
    category: 'ncert',
    totalMarks: 4,
    markingScheme: { correct: 1, incorrect: 0 },
    sections: [
      { id: 's1', name: 'Section 1' },
      { id: 's2', name: 'Section 2' }
    ],
    questions: [
      { id: 'q1', section: 's1', question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
      { id: 'q2', section: 's1', question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
      { id: 'q3', section: 's2', question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 },
      { id: 'q4', section: 's2', question: 'Q4', options: ['A', 'B', 'C', 'D'], correctAnswer: 3 }
    ]
  };

  const userAnswers = {
    q1: 0, // correct
    q2: 2, // incorrect (chose 2 instead of 1)
    q3: 2  // correct
    // q4 unattempted
  };

  const attempt = submitTestAttempt(dummyTest, userAnswers, {}, 120);

  assert.equal(attempt.testId, 'test-calc-sample-01');
  assert.equal(attempt.correctCount, 2);
  assert.equal(attempt.incorrectCount, 1);
  assert.equal(attempt.unattemptedCount, 1);
  assert.equal(attempt.score, 2);
  assert.equal(attempt.maxScore, 4);
  assert.equal(attempt.percentage, 50);
  assert.equal(attempt.accuracy, 67); // 2 correct out of 3 attempted = 66.6% -> 67%
  assert.equal(attempt.timeSpentSeconds, 120);
  assert.equal(attempt.completed, true);

  // Section breakdown
  assert.equal(attempt.sectionMap.s1.total, 2);
  assert.equal(attempt.sectionMap.s1.attempted, 2);
  assert.equal(attempt.sectionMap.s1.correct, 1);
  assert.equal(attempt.sectionMap.s2.total, 2);
  assert.equal(attempt.sectionMap.s2.attempted, 1);
  assert.equal(attempt.sectionMap.s2.correct, 1);
});

test('Strict Retest Policy: completed tests are locked and cannot be retaken', () => {
  const testId = 'test-calc-sample-01';
  assert.ok(isTestCompleted(testId), 'Test should now be marked as completed in storage');

  const dummyTest = {
    id: testId,
    title: 'Sample Calculation Test',
    category: 'ncert',
    questions: []
  };

  // Attempting to submit again must throw an error per the user requirement
  assert.throws(
    () => submitTestAttempt(dummyTest, {}, {}, 50),
    /already been completed and cannot be retaken/
  );

  const attempt = getAttemptForTest(testId);
  assert.ok(attempt, 'Attempt record must be retrievable for viewing performance');
  assert.equal(attempt.score, 2);
});

test('Custom test paper can be created and added to the bank', () => {
  const newTest = {
    title: 'My Custom Social Science Test',
    category: 'ncert',
    questions: [
      { id: 'cust-1', question: 'Custom Question 1', options: ['A', 'B'], correctAnswer: 0 }
    ]
  };

  const created = addTestPaper(newTest);
  assert.ok(created.id);
  assert.equal(created.title, 'My Custom Social Science Test');
  assert.equal(created.totalQuestions, 1);
});

test('Importing test papers from JSON validates input and updates test bank', () => {
  const json = JSON.stringify([
    {
      id: 'import-test-101',
      title: 'Imported Indian Geography Unit Test',
      category: 'ncert',
      questions: [
        { id: 'imp-1', question: 'Capital of India?', options: ['Delhi', 'Mumbai'], correctAnswer: 0 }
      ]
    }
  ]);

  const res = importTestPapersFromJSON(json);
  assert.equal(res.importedCount, 1);
  assert.equal(res.total, 1);

  // Invalid JSON should throw
  assert.throws(() => importTestPapersFromJSON('invalid json {{{'), /Invalid JSON/);
});

test('Backup of original Social Science syllabus is intact and complete', () => {
  assert.ok(backupSyllabus, 'Backup syllabus file must exist');
  const topics = backupSyllabus.units.flatMap(u => u.topics);
  const items = topics.flatMap(t => t.items);
  assert.equal(topics.length, 204, 'All 204 original syllabus topics must be preserved');
  assert.equal(items.length, 1602, 'All 1,602 original subtopics must be preserved');
});
