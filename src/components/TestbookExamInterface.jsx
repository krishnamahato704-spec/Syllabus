import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock, AlertCircle, CheckCircle2, Bookmark, HelpCircle,
  ChevronLeft, ChevronRight, Check, X, FileText, RotateCcw,
  Maximize2, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TestbookExamInterface({ test, onComplete, onExit }) {
  const [activeSectionId, setActiveSectionId] = useState(() => {
    return test.sections && test.sections.length > 0 ? test.sections[0].id : 'all';
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  // Status: 'answered' | 'unanswered' | 'marked' | 'marked_answered' | 'not_visited'
  const [statusMap, setStatusMap] = useState({});
  const [visitedSet, setVisitedSet] = useState(new Set([test.questions[0]?.id]));

  // Timer in seconds
  const totalSeconds = (test.durationMinutes || 60) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const startTimeRef = useRef(Date.now());

  // Filter questions for active section
  const sectionQuestions = useMemo(() => {
    if (!test.sections || test.sections.length <= 1) return test.questions;
    return test.questions.filter(q => (q.section || test.sections[0].id) === activeSectionId);
  }, [test, activeSectionId]);

  const currentQuestion = sectionQuestions[currentIndex] || test.questions[0];

  // Global question number
  const globalIndex = useMemo(() => {
    return test.questions.findIndex(q => q.id === currentQuestion?.id) + 1;
  }, [test.questions, currentQuestion]);

  // Mark current question as visited
  useEffect(() => {
    if (currentQuestion && !visitedSet.has(currentQuestion.id)) {
      setVisitedSet(prev => new Set(prev).add(currentQuestion.id));
    }
  }, [currentQuestion, visitedSet]);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function handleAutoSubmit() {
    setIsSubmitting(true);
    triggerConfetti();
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onComplete(userAnswers, statusMap, timeSpent);
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Answer selection
  function handleSelectOption(optionIndex) {
    if (!currentQuestion) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  }

  // Clear current response
  function handleClearResponse() {
    if (!currentQuestion) return;
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
    setStatusMap(prev => ({
      ...prev,
      [currentQuestion.id]: 'unanswered'
    }));
  }

  // Save & Next
  function handleSaveAndNext() {
    if (!currentQuestion) return;
    const isAnswered = userAnswers[currentQuestion.id] !== undefined && userAnswers[currentQuestion.id] !== null;
    const newStatus = isAnswered ? 'answered' : 'unanswered';

    setStatusMap(prev => ({
      ...prev,
      [currentQuestion.id]: newStatus
    }));

    if (currentIndex < sectionQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Find next section if available
      const secIdx = test.sections ? test.sections.findIndex(s => s.id === activeSectionId) : -1;
      if (secIdx !== -1 && secIdx < test.sections.length - 1) {
        const nextSec = test.sections[secIdx + 1];
        setActiveSectionId(nextSec.id);
        setCurrentIndex(0);
      }
    }
  }

  // Mark for Review & Next
  function handleMarkForReview() {
    if (!currentQuestion) return;
    const isAnswered = userAnswers[currentQuestion.id] !== undefined && userAnswers[currentQuestion.id] !== null;
    const newStatus = isAnswered ? 'marked_answered' : 'marked';

    setStatusMap(prev => ({
      ...prev,
      [currentQuestion.id]: newStatus
    }));

    if (currentIndex < sectionQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // Previous Question
  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  // Jump to Question
  function handleJumpToQuestion(targetIndex) {
    setCurrentIndex(targetIndex);
  }

  // Switch Section
  function handleSectionChange(secId) {
    setActiveSectionId(secId);
    setCurrentIndex(0);
  }

  // Final Submit
  function handleConfirmSubmit() {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    triggerConfetti();
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onComplete(userAnswers, statusMap, timeSpent);
  }

  function triggerConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }

  // Calculate stats for legend
  const stats = useMemo(() => {
    let answered = 0;
    let unanswered = 0;
    let marked = 0;
    let markedAnswered = 0;
    let notVisited = 0;

    test.questions.forEach(q => {
      const isVisited = visitedSet.has(q.id);
      const st = statusMap[q.id];
      const hasAnswer = userAnswers[q.id] !== undefined && userAnswers[q.id] !== null;

      if (!isVisited) {
        notVisited++;
      } else if (st === 'marked_answered') {
        markedAnswered++;
      } else if (st === 'marked') {
        marked++;
      } else if (hasAnswer || st === 'answered') {
        answered++;
      } else {
        unanswered++;
      }
    });

    return { answered, unanswered, marked, markedAnswered, notVisited };
  }, [test.questions, userAnswers, statusMap, visitedSet]);

  return (
    <div className="testbook-exam-container">
      {/* Top Header Bar */}
      <header className="testbook-topbar">
        <div className="testbook-title-wrap">
          <span className="exam-badge">{test.targetExam || test.category.toUpperCase()}</span>
          <h1 className="exam-title">{test.title}</h1>
        </div>

        <div className="testbook-topbar-right">
          <div className={`exam-timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
            <Clock size={18} className="timer-icon" />
            <span className="timer-text">{formatTime(timeLeft)}</span>
            <small className="timer-label">Time Left</small>
          </div>

          <div className="header-action-buttons">
            <button
              type="button"
              className="testbook-header-btn"
              onClick={() => setShowQuestionPaperModal(true)}
              title="View Question Paper"
            >
              <FileText size={16} /> Question Paper
            </button>
            <button
              type="button"
              className="testbook-header-btn"
              onClick={() => setShowInstructionsModal(true)}
              title="View Instructions"
            >
              <HelpCircle size={16} /> Instructions
            </button>
            <button
              type="button"
              className="testbook-submit-btn"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* Sections Tab Bar (for multi-section exams like CTET & UGC NET) */}
      {test.sections && test.sections.length > 1 && (
        <div className="testbook-sections-bar">
          <span className="sections-label">Sections:</span>
          <div className="sections-list" role="tablist">
            {test.sections.map(sec => {
              const countInSec = test.questions.filter(q => (q.section || test.sections[0].id) === sec.id).length;
              return (
                <button
                  key={sec.id}
                  role="tab"
                  aria-selected={activeSectionId === sec.id}
                  className={`section-tab-btn ${activeSectionId === sec.id ? 'active' : ''}`}
                  onClick={() => handleSectionChange(sec.id)}
                >
                  <span>{sec.name}</span>
                  <span className="sec-badge">{countInSec} Qs</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Examination Workspace */}
      <div className="testbook-main-workspace">
        {/* Left: Question Pane */}
        <div className="testbook-question-pane">
          <div className="question-meta-bar">
            <div className="q-number-box">
              <span className="q-label">Question {globalIndex}</span>
              <span className="q-section-name">
                {test.sections?.find(s => s.id === (currentQuestion.section || activeSectionId))?.name || 'Social Science'}
              </span>
            </div>
            <div className="q-marks-box">
              <span className="mark-pos">+{test.markingScheme?.correct || 1}</span>
              <span className="mark-neg">-{test.markingScheme?.incorrect || 0}</span>
              <span className="q-diff-badge">{currentQuestion.difficulty || 'Moderate'}</span>
            </div>
          </div>

          <div className="question-scroll-area">
            <div className="question-body">
              <p className="question-text">{currentQuestion.question}</p>
            </div>

            <div className="options-container" role="radiogroup" aria-label="Answer options">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === oIdx;
                const letter = String.fromCharCode(65 + oIdx);
                return (
                  <label
                    key={oIdx}
                    className={`option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(oIdx)}
                      className="sr-only"
                    />
                    <div className="option-prefix">{letter}</div>
                    <div className="option-text">{opt}</div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <footer className="testbook-actions-footer">
            <div className="footer-left">
              <button
                type="button"
                className="btn-mark-review"
                onClick={handleMarkForReview}
              >
                <Bookmark size={16} /> Mark for Review & Next
              </button>
              <button
                type="button"
                className="btn-clear"
                onClick={handleClearResponse}
              >
                Clear Response
              </button>
            </div>

            <div className="footer-right">
              <button
                type="button"
                className="btn-nav"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <button
                type="button"
                className="btn-save-next"
                onClick={handleSaveAndNext}
              >
                Save & Next <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </div>

        {/* Right: Question Palette Sidebar */}
        <aside className={`testbook-palette-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="palette-user-header">
            <div className="palette-avatar">CBT</div>
            <div className="palette-user-info">
              <strong>Candidate Assessment</strong>
              <span>Roll: {test.id.slice(-8).toUpperCase()}</span>
            </div>
            <button
              type="button"
              className="palette-collapse-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              {sidebarOpen ? '›' : '‹'}
            </button>
          </div>

          {/* Legend Grid */}
          <div className="palette-legend">
            <div className="legend-row">
              <span className="legend-pill answered">{stats.answered}</span>
              <span className="legend-txt">Answered</span>
              <span className="legend-pill unanswered">{stats.unanswered}</span>
              <span className="legend-txt">Not Answered</span>
            </div>
            <div className="legend-row">
              <span className="legend-pill marked">{stats.marked}</span>
              <span className="legend-txt">Marked for Review</span>
              <span className="legend-pill not-visited">{stats.notVisited}</span>
              <span className="legend-txt">Not Visited</span>
            </div>
            <div className="legend-row full">
              <span className="legend-pill marked-answered">{stats.markedAnswered}</span>
              <span className="legend-txt">Answered & Marked for Review</span>
            </div>
          </div>

          <div className="palette-section-title">
            <span>{test.sections?.find(s => s.id === activeSectionId)?.name || 'Question Palette'}</span>
            <span className="palette-count">{sectionQuestions.length} Questions</span>
          </div>

          {/* Question Grid */}
          <div className="palette-grid-wrap">
            <div className="palette-grid">
              {sectionQuestions.map((q, qIdx) => {
                const isCurrent = q.id === currentQuestion.id;
                const isVisited = visitedSet.has(q.id);
                const hasAnswer = userAnswers[q.id] !== undefined && userAnswers[q.id] !== null;
                const st = statusMap[q.id];

                let pillClass = 'not-visited';
                if (!isVisited) {
                  pillClass = 'not-visited';
                } else if (st === 'marked_answered') {
                  pillClass = 'marked-answered';
                } else if (st === 'marked') {
                  pillClass = 'marked';
                } else if (hasAnswer || st === 'answered') {
                  pillClass = 'answered';
                } else {
                  pillClass = 'unanswered';
                }

                if (isCurrent) {
                  pillClass += ' current-focus';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`palette-num-btn ${pillClass}`}
                    onClick={() => handleJumpToQuestion(qIdx)}
                    title={`Question ${qIdx + 1} (${pillClass})`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="palette-footer-actions">
            <button
              type="button"
              className="testbook-final-submit"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Entire Test
            </button>
          </div>
        </aside>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="testbook-modal-backdrop" role="dialog" aria-modal="true">
          <div className="testbook-modal-card submit-modal">
            <div className="modal-header">
              <ShieldAlert size={28} className="warn-icon" />
              <div>
                <h2>Confirm Test Submission</h2>
                <p>Are you sure you want to finish this test?</p>
              </div>
            </div>

            <div className="submit-summary-box">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Section Name</th>
                    <th>No. of Qs</th>
                    <th>Answered</th>
                    <th>Not Answered</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {(test.sections || [{ id: 'all', name: 'Social Science' }]).map(sec => {
                    const secQs = test.questions.filter(q => (q.section || test.sections?.[0]?.id || 'all') === sec.id);
                    const ansCount = secQs.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== null).length;
                    const markedCount = secQs.filter(q => statusMap[q.id] === 'marked' || statusMap[q.id] === 'marked_answered').length;
                    return (
                      <tr key={sec.id}>
                        <td>{sec.name}</td>
                        <td>{secQs.length}</td>
                        <td className="text-green">{ansCount}</td>
                        <td className="text-red">{secQs.length - ansCount}</td>
                        <td className="text-purple">{markedCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="strict-rule-note">
                <AlertCircle size={16} />
                <span>
                  <strong>Strict Assessment Rule:</strong> Once submitted, this test will be marked as <strong>Completed</strong> and will <strong>NOT</strong> be available for re-test. Full performance analysis and step-by-step solutions will be unlocked immediately.
                </span>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowSubmitModal(false)}
              >
                Resume Test
              </button>
              <button
                type="button"
                className="btn-submit-confirm"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Evaluating Score…' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION PAPER OVERVIEW MODAL */}
      {showQuestionPaperModal && (
        <div className="testbook-modal-backdrop" role="dialog" aria-modal="true">
          <div className="testbook-modal-card large-modal">
            <div className="modal-header">
              <FileText size={24} />
              <h2>Complete Question Paper · {test.title}</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setShowQuestionPaperModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="qp-scroll-container">
              {test.questions.map((q, idx) => (
                <div key={q.id} className="qp-row">
                  <div className="qp-num">Q{idx + 1}</div>
                  <div className="qp-content">
                    <p className="qp-question">{q.question}</p>
                    <div className="qp-options">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="qp-opt">
                          <span>({String.fromCharCode(65 + oi)})</span> {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowQuestionPaperModal(false)}
              >
                Close Question Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS MODAL */}
      {showInstructionsModal && (
        <div className="testbook-modal-backdrop" role="dialog" aria-modal="true">
          <div className="testbook-modal-card">
            <div className="modal-header">
              <HelpCircle size={24} />
              <h2>Testbook CBT Instructions</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setShowInstructionsModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="instructions-body">
              <ol>
                <li>The test follows the official pattern for <strong>{test.targetExam}</strong>.</li>
                <li>Total Duration: <strong>{test.durationMinutes} minutes</strong>. The countdown clock stops when time is up.</li>
                <li>Marking Scheme: <strong>+{test.markingScheme?.correct || 1} mark</strong> for correct answers, <strong>-{test.markingScheme?.incorrect || 0} marks</strong> for incorrect answers.</li>
                <li>Click <strong>Save & Next</strong> to record an answer. Use <strong>Mark for Review</strong> to flag doubts.</li>
                <li><strong>No Retest Allowed:</strong> Per system guidelines, once you submit, you can review detailed analytics, rank, and solutions, but cannot retake the test.</li>
              </ol>
            </div>
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn-submit-confirm"
                onClick={() => setShowInstructionsModal(false)}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
