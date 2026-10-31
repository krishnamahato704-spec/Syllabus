import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AddTestModal from '../src/components/AddTestModal.jsx';
import TestAnalysisView from '../src/components/TestAnalysisView.jsx';
import { getStoredTests } from '../src/test-engine.js';
import '../src/styles.css';

const savedPaper = {
  id: 'ui-snapshot', title: 'Saved paper version', category: 'ncert', targetExam: 'NCERT practice',
  durationMinutes: 30, markingScheme: { correct: 1, incorrect: 0 },
  questions: Array.from({ length: 3 }, (_, i) => ({
    id: `saved-${i}`, question: `Saved question ${i + 1} with enough text to check mobile line wrapping.`,
    options: ['One', 'Two', 'Three', 'Four'], correctAnswer: 0, section: 'all', subject: 'History',
    explanation: '', source: { name: 'NCERT topic reference', url: 'https://ncert.nic.in/textbook.php' }
  }))
};
const attempt = {
  testSnapshot: savedPaper, legacyWarning: 'Historical option order could not be confirmed for this imported record.',
  submittedAt: '2026-10-30T10:00:00Z', userAnswers: { 'saved-0': 0, 'saved-1': 1 },
  score: 1, maxScore: 3, percentage: 33, accuracy: 50, correctCount: 1, incorrectCount: 1, unattemptedCount: 1,
  timeSpentSeconds: 65, sectionMap: { all: { name: 'History', total: 3, attempted: 2, correct: 1, incorrect: 1, score: 1, maxScore: 3 } }
};
function Harness() {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  if (new URLSearchParams(location.search).get('view') === 'analysis') {
    return <TestAnalysisView test={{ ...savedPaper, title: 'Current changed paper', questions: [{ ...savedPaper.questions[0], question: 'Changed current question' }] }} attempt={attempt} onBackToHub={() => {}} />;
  }
  return <><button onClick={() => setOpen(true)}>Open paper manager</button><button>Outside action</button>{added && <p>Paper added</p>}{open && <AddTestModal onClose={() => setOpen(false)} onTestAdded={() => setAdded(true)} />}</>;
}
window.readUiTests = getStoredTests;
createRoot(document.getElementById('root')).render(<Harness />);
