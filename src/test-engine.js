// test-engine.js - Testbook Assessment Engine and Storage Manager
import { ALL_INITIAL_TESTS } from './data/tests-data.js';

const STORAGE_TESTS_KEY = 'testbook_assessment_tests_v2';
const STORAGE_ATTEMPTS_KEY = 'testbook_assessment_attempts_v2';

// Initialize tests in localStorage if not already present
export function getStoredTests() {
  try {
    const raw = localStorage.getItem(STORAGE_TESTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(ALL_INITIAL_TESTS));
      return ALL_INITIAL_TESTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const initialMap = new Map(ALL_INITIAL_TESTS.map(t => [t.id, t]));
      const updated = parsed.map(t => {
        if (initialMap.has(t.id)) {
          const init = initialMap.get(t.id);
          return { ...init, ...t, syllabusSection: init.syllabusSection, isSectional: init.isSectional, isQuickBurst: init.isQuickBurst };
        }
        return t;
      });
      const existingIds = new Set(updated.map(t => t.id));
      const missing = ALL_INITIAL_TESTS.filter(t => !existingIds.has(t.id));
      const merged = [...updated, ...missing];
      localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(merged));
      return merged;
    }
    return ALL_INITIAL_TESTS;
  } catch (e) {
    console.error('Error reading stored tests:', e);
    return ALL_INITIAL_TESTS;
  }
}

// Get single test by ID
export function getTestById(id) {
  const tests = getStoredTests();
  return tests.find(t => t.id === id) || null;
}

// Get all attempts map { [testId]: attemptData }
export function getAllAttempts() {
  try {
    const raw = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.error('Error reading attempts:', e);
    return {};
  }
}

// Check if a test was completed (retake is strictly forbidden per user requirements)
export function isTestCompleted(testId) {
  const attempts = getAllAttempts();
  return Boolean(attempts[testId] && attempts[testId].completed);
}

// Get attempt for a specific test
export function getAttemptForTest(testId) {
  const attempts = getAllAttempts();
  return attempts[testId] || null;
}

// Submit a completed test
export function submitTestAttempt(test, userAnswers, statusMap, timeSpentSeconds) {
  // Check if already completed
  if (isTestCompleted(test.id)) {
    throw new Error('This test has already been completed and cannot be retaken.');
  }

  const marking = test.markingScheme || { correct: 1, incorrect: 0 };
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let totalScore = 0;

  const sectionMap = {};
  if (test.sections && test.sections.length > 0) {
    test.sections.forEach(s => {
      sectionMap[s.id] = {
        name: s.name,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        score: 0,
        maxScore: 0
      };
    });
  }

  test.questions.forEach((q, idx) => {
    const chosen = userAnswers[q.id];
    const secId = q.section || (test.sections && test.sections[0] ? test.sections[0].id : 'default');
    if (!sectionMap[secId]) {
      sectionMap[secId] = { name: 'Section', total: 0, attempted: 0, correct: 0, incorrect: 0, score: 0, maxScore: 0 };
    }

    const marksForQuestion = marking.correct;
    sectionMap[secId].total += 1;
    sectionMap[secId].maxScore += marksForQuestion;

    if (chosen === undefined || chosen === null) {
      unattemptedCount += 1;
    } else {
      sectionMap[secId].attempted += 1;
      if (chosen === q.correctAnswer) {
        correctCount += 1;
        totalScore += marksForQuestion;
        sectionMap[secId].correct += 1;
        sectionMap[secId].score += marksForQuestion;
      } else {
        incorrectCount += 1;
        if (marking.incorrect) {
          totalScore -= Math.abs(marking.incorrect);
          sectionMap[secId].score -= Math.abs(marking.incorrect);
        }
        sectionMap[secId].incorrect += 1;
      }
    }
  });

  const totalAttempted = correctCount + incorrectCount;
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const maxScore = test.totalMarks || (test.questions.length * marking.correct);
  const percentage = maxScore > 0 ? Math.max(0, Math.round((totalScore / maxScore) * 100)) : 0;

  // Estimated percentile based on benchmark score
  const percentile = Math.min(99.9, Math.max(10, Math.round(percentage * 0.95 + (accuracy * 0.05))));

  const attemptRecord = {
    testId: test.id,
    testTitle: test.title,
    category: test.category,
    completed: true,
    submittedAt: new Date().toISOString(),
    timeSpentSeconds: timeSpentSeconds || 0,
    userAnswers,
    statusMap,
    score: Math.max(0, totalScore),
    maxScore,
    percentage,
    accuracy,
    percentile,
    correctCount,
    incorrectCount,
    unattemptedCount,
    totalQuestions: test.questions.length,
    sectionMap
  };

  const allAttempts = getAllAttempts();
  allAttempts[test.id] = attemptRecord;
  try {
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(allAttempts));
  } catch (e) {
    console.error('Failed to save attempt in localStorage:', e);
  }

  return attemptRecord;
}

// Add a new custom test paper
export function addTestPaper(newTest) {
  if (!newTest.title || !newTest.category || !Array.isArray(newTest.questions) || newTest.questions.length === 0) {
    throw new Error('Test must have a title, category, and at least one question.');
  }

  const id = newTest.id || `custom-test-${Date.now()}`;
  const formattedTest = {
    ...newTest,
    id,
    totalQuestions: newTest.questions.length,
    totalMarks: newTest.totalMarks || newTest.questions.length,
    durationMinutes: newTest.durationMinutes || Math.max(15, newTest.questions.length),
    difficulty: newTest.difficulty || 'Moderate',
    markingScheme: newTest.markingScheme || { correct: 1, incorrect: 0 },
    createdAt: new Date().toISOString().split('T')[0]
  };

  const current = getStoredTests();
  const updated = [formattedTest, ...current];
  localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(updated));
  return formattedTest;
}

// Import test papers from JSON file / text
export function importTestPapersFromJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format. Please check the file.');
  }

  const testsToImport = Array.isArray(parsed) ? parsed : [parsed];
  const validTests = [];

  for (const t of testsToImport) {
    if (!t.title || !Array.isArray(t.questions) || t.questions.length === 0) {
      continue;
    }
    const cleanId = t.id || `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    validTests.push({
      ...t,
      id: cleanId,
      totalQuestions: t.questions.length,
      totalMarks: t.totalMarks || t.questions.length,
      durationMinutes: t.durationMinutes || Math.max(20, t.questions.length),
      difficulty: t.difficulty || 'Moderate',
      createdAt: new Date().toISOString().split('T')[0]
    });
  }

  if (validTests.length === 0) {
    throw new Error('No valid test papers found in the JSON file. Ensure questions are provided.');
  }

  const current = getStoredTests();
  const existingIds = new Set(current.map(t => t.id));
  const newOnes = validTests.filter(t => !existingIds.has(t.id));
  const combined = [...newOnes, ...current];
  localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(combined));

  return { importedCount: newOnes.length, total: validTests.length };
}

// Export all test papers as JSON
export function exportTestsAsJSON() {
  const tests = getStoredTests();
  return JSON.stringify(tests, null, 2);
}

// Download syllabus backup helper
export async function downloadSyllabusBackupFile() {
  try {
    const res = await fetch('./src/data/backup-syllabus.json');
    if (!res.ok) throw new Error('Backup file not available');
    const text = await res.text();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Social_Science_Syllabus_Backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch (e) {
    console.error('Backup download failed:', e);
    return false;
  }
}
