import React, { useState, useMemo } from 'react';
import {
  Award, CheckCircle2, XCircle, MinusCircle, Clock,
  BarChart3, FileText, ChevronLeft, ChevronRight,
  Check, X, ShieldAlert, ArrowLeft, Target, AlertCircle
} from 'lucide-react';

export default function TestAnalysisView({ test, attempt, onBackToHub }) {
  const paper = attempt.testSnapshot || test || { title: attempt.testTitle || 'Historical result', category: attempt.category, questions: [], markingScheme: {correct: 1, incorrect: 0}, sections: [] };
  const questions = paper?.questions || [];
  const [filterType, setFilterType] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unattempted'
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Format seconds to mm:ss or hh:mm:ss
  function formatTime(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    if (!sec) return '0m';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}h ${m % 60}m`;
    }
    return `${m}m ${s}s`;
  }

  // Filter questions based on attempt answers
  const filteredQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const userChoice = attempt.userAnswers?.[q.id];
      const isUnattempted = userChoice === undefined || userChoice === null;
      const isCorrect = !isUnattempted && userChoice === q.correctAnswer;
      const isIncorrect = !isUnattempted && userChoice !== q.correctAnswer;
      return {
        ...q,
        originalIndex: idx + 1,
        userChoice,
        isCorrect,
        isIncorrect,
        isUnattempted
      };
    }).filter(q => {
      if (filterType === 'correct') return q.isCorrect;
      if (filterType === 'incorrect') return q.isIncorrect;
      if (filterType === 'unattempted') return q.isUnattempted;
      return true;
    });
  }, [questions, attempt, filterType]);

  const activeQuestion = filteredQuestions[selectedQuestionIndex] || filteredQuestions[0];
  const attemptedCount = (attempt.correctCount || 0) + (attempt.incorrectCount || 0);
  const coverage = questions.length ? Math.round(attemptedCount / questions.length * 100) : 0;
  const source = activeQuestion?.source;
  const sourceUrl = typeof source?.url === 'string' && /^https?:\/\//i.test(source.url) ? source.url : null;

  return (
    <div className="testbook-analysis-container">
      {/* Top Banner Navigation */}
      <div className="analysis-topbar">
        <button
          type="button"
          className="analysis-back-btn"
          onClick={onBackToHub}
        >
          <ArrowLeft size={18} /> Back to test hub
        </button>
        <div className="analysis-title-wrap">
          <span className="exam-badge">{paper.targetExam || paper.category?.toUpperCase()}</span>
          <h1>Results & solutions · {paper.title}</h1>
        </div>
      </div>

      {/* Retest Lock Banner */}
      <div className="retest-lock-notice" role="status">
        <ShieldAlert size={20} className="lock-icon" />
        <div className="lock-copy">
          <strong>Completed paper · read-only review</strong>
          <span>
            Submitted on {new Date(attempt.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
            {' '}This scored sitting is locked under your no-retest policy. Use the solutions below to review your answers.
          </span>
        </div>
      </div>
      {attempt.legacyWarning && <div className="analysis-legacy-warning" role="note">
        <AlertCircle size={20} />
        <p>{typeof attempt.legacyWarning === 'string' ? attempt.legacyWarning : 'This older record has no saved paper version. The displayed questions and option order may differ from your original sitting.'}</p>
      </div>}

      {/* Performance Scorecard KPI Grid */}
      <div className="analysis-scorecard-grid">
        <div className="scorecard-tile primary">
          <div className="tile-top"><span>YOUR SCORE</span><Award size={20} /></div>
          <div className="tile-main-val">
            <span className="big-score">{attempt.score}</span>
            <span className="max-score">/ {attempt.maxScore}</span>
          </div>
          <small className="tile-sub">{attempt.percentage}% marks scored</small>
        </div>

        <div className="scorecard-tile">
          <div className="tile-top"><span>ACCURACY RATE</span><Target size={20} /></div>
          <div className="tile-main-val">
            <span className="big-score text-green">{attempt.accuracy}%</span>
          </div>
          <small className="tile-sub">{attempt.correctCount} correct of {attempt.correctCount + attempt.incorrectCount} attempted</small>
        </div>

        <div className="scorecard-tile">
          <div className="tile-top"><span>PAPER COVERAGE</span><FileText size={20} /></div>
          <div className="tile-main-val">
            <span className="big-score text-blue">{coverage}%</span>
          </div>
          <small className="tile-sub">{attemptedCount} of {questions.length} questions answered</small>
        </div>

        <div className="scorecard-tile">
          <div className="tile-top"><span>TIME SPENT</span><Clock size={20} /></div>
          <div className="tile-main-val">
            <span className="big-score">{formatTime(attempt.timeSpentSeconds)}</span>
          </div>
          <small className="tile-sub">Allotted: {paper.durationMinutes} mins</small>
        </div>

        <div className="scorecard-tile summary-breakdown">
          <div className="tile-top"><span>BREAKDOWN</span><BarChart3 size={20} /></div>
          <div className="breakdown-pills">
            <span className="pill-stat correct"><CheckCircle2 size={13} /> {attempt.correctCount} Correct</span>
            <span className="pill-stat incorrect"><XCircle size={13} /> {attempt.incorrectCount} Wrong</span>
            <span className="pill-stat unattempted"><MinusCircle size={13} /> {attempt.unattemptedCount} Skipped</span>
          </div>
        </div>
      </div>

      {/* Section-Wise Performance Table */}
      {attempt.sectionMap && Object.keys(attempt.sectionMap).length > 0 && (
        <section className="analysis-section-panel">
          <div className="section-panel-header">
            <h2>Sectional Performance Breakdown</h2>
            <span className="muted">Subject-level accuracy & score distribution</span>
          </div>
          <div className="analysis-table-wrap" tabIndex={0} role="region" aria-label="Section performance table">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th scope="col">Section</th>
                  <th scope="col">Questions</th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Correct</th>
                  <th scope="col">Wrong</th>
                  <th scope="col">Accuracy</th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attempt.sectionMap).map(([sId, sec]) => {
                  const secAcc = sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 100) : 0;
                  return (
                    <tr key={sId}>
                      <th scope="row" className="sec-name-cell">
                        <strong>{sec.name}</strong>
                      </th>
                      <td>{sec.total}</td>
                      <td>{sec.attempted}</td>
                      <td className="text-green font-bold">{sec.correct}</td>
                      <td className="text-red">{sec.incorrect}</td>
                      <td>
                        <div className="table-acc-bar">
                          <span>{secAcc}%</span>
                          <div className="mini-progress-track">
                            <span style={{ width: `${secAcc}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="font-bold text-accent">{sec.score} / {sec.maxScore}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Step-by-Step Solutions Workspace */}
      <section className="analysis-solutions-section">
        <div className="solutions-header">
          <div>
            <span className="eyebrow">ANSWER REVIEW</span>
            <h2>Solutions & Explanations</h2>
          </div>

          {/* Filter Chips */}
          <div className="solution-filter-chips">
            <button
              type="button"
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
              aria-pressed={filterType === 'all'}
              onClick={() => { setFilterType('all'); setSelectedQuestionIndex(0); }}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              className={`filter-chip correct ${filterType === 'correct' ? 'active' : ''}`}
              aria-pressed={filterType === 'correct'}
              onClick={() => { setFilterType('correct'); setSelectedQuestionIndex(0); }}
            >
              Correct ({attempt.correctCount})
            </button>
            <button
              type="button"
              className={`filter-chip incorrect ${filterType === 'incorrect' ? 'active' : ''}`}
              aria-pressed={filterType === 'incorrect'}
              onClick={() => { setFilterType('incorrect'); setSelectedQuestionIndex(0); }}
            >
              Incorrect ({attempt.incorrectCount})
            </button>
            <button
              type="button"
              className={`filter-chip unattempted ${filterType === 'unattempted' ? 'active' : ''}`}
              aria-pressed={filterType === 'unattempted'}
              onClick={() => { setFilterType('unattempted'); setSelectedQuestionIndex(0); }}
            >
              Skipped ({attempt.unattemptedCount})
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="empty-solutions">
            <p>No questions match the "{filterType}" filter.</p>
          </div>
        ) : (
          <div className="solutions-workspace">
            {/* Left/Main: Active Question Detailed Solution */}
            <div className="solution-detail-card">
              <div className="solution-meta-bar">
                <div className="sol-q-title">
                  <span className="sol-q-num">Question {activeQuestion.originalIndex || (selectedQuestionIndex + 1)}</span>
                  <span className="code-tag">{activeQuestion.subject || 'Social Science'}</span>
                  <span className="diff-tag">{activeQuestion.difficulty || 'Moderate'}</span>
                </div>

                <div className="sol-user-verdict">
                  {activeQuestion.isCorrect && (
                    <span className="verdict-tag correct"><Check size={14} /> Correct (+{paper.markingScheme?.correct ?? 1})</span>
                  )}
                  {activeQuestion.isIncorrect && (
                    <span className="verdict-tag incorrect"><X size={14} /> Incorrect ({paper.markingScheme?.incorrect ? `−${Math.abs(paper.markingScheme.incorrect)}` : '0'})</span>
                  )}
                  {activeQuestion.isUnattempted && (
                    <span className="verdict-tag unattempted">Not Attempted (0)</span>
                  )}
                </div>
              </div>

              {activeQuestion.passage?.text && <div className="review-passage">
                <h3>{activeQuestion.passage.title || 'Passage'}</h3>
                <p>{activeQuestion.passage.text}</p>
              </div>}
              <p className="sol-question-text">{activeQuestion.question}</p>

              {/* Options Breakdown */}
              <div className="sol-options-list">
                {activeQuestion.options.map((opt, oIdx) => {
                  const isCorrectAnswer = oIdx === activeQuestion.correctAnswer;
                  const isUserChoice = oIdx === activeQuestion.userChoice;
                  const letter = String.fromCharCode(65 + oIdx);

                  let optClass = 'sol-opt-row';
                  if (isCorrectAnswer) optClass += ' is-correct-answer';
                  if (isUserChoice && !isCorrectAnswer) optClass += ' is-wrong-choice';

                  return (
                    <div key={oIdx} className={optClass}>
                      <span className="sol-opt-letter">{letter}</span>
                      <span className="sol-opt-text">{opt}</span>
                      <div className="sol-opt-badges">
                        {isUserChoice && (
                          <span className={`badge-choice ${isCorrectAnswer ? 'correct' : 'wrong'}`}>
                            Your Choice {isCorrectAnswer ? '✓' : '✗'}
                          </span>
                        )}
                        {isCorrectAnswer && (
                          <span className="badge-correct-sol">Correct Answer ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Notes & Syllabus Context */}
              <div className="sol-explanation-box">
                <div className="sol-exp-title">
                  <FileText size={18} />
                  <strong>Explanation</strong>
                </div>
                <div className="sol-exp-body">
                  <p>{activeQuestion.explanation || 'No explanation was saved for this question.'}</p>
                  {activeQuestion.syllabusIds?.length>0&&<p className="solution-syllabus-ids">Syllabus topic IDs: {activeQuestion.syllabusIds.join(', ')} · {activeQuestion.topic}</p>}
                </div>
                {source && <div className="solution-source-reference">
                  <span>Topic reference: </span>
                  {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{source.name || 'Source reference'}</a> : <span>{source.name || 'No source link saved'}</span>}
                </div>}
              </div>

              {/* Navigation Footer */}
              <div className="sol-nav-footer">
                <button
                  type="button"
                  className="sol-nav-btn"
                  onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                  disabled={selectedQuestionIndex === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="sol-count-indicator">
                  {selectedQuestionIndex + 1} of {filteredQuestions.length} in this filter
                </span>
                <button
                  type="button"
                  className="sol-nav-btn"
                  onClick={() => setSelectedQuestionIndex(Math.min(filteredQuestions.length - 1, selectedQuestionIndex + 1))}
                  disabled={selectedQuestionIndex >= filteredQuestions.length - 1}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right: Solutions Palette Jump List */}
            <div className="solutions-palette-card">
              <div className="sol-palette-title">
                <span>Questions List</span>
                <small>{filteredQuestions.length} displayed</small>
              </div>
              <div className="sol-palette-grid">
                {filteredQuestions.map((q, qIndex) => {
                  let pillStatus = 'unattempted';
                  if (q.isCorrect) pillStatus = 'correct';
                  if (q.isIncorrect) pillStatus = 'incorrect';

                  const isCurrent = qIndex === selectedQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`sol-palette-btn ${pillStatus} ${isCurrent ? 'active-sol' : ''}`}
                      onClick={() => setSelectedQuestionIndex(qIndex)}
                      title={`Question ${q.originalIndex} (${pillStatus})`}
                      aria-label={`Question ${q.originalIndex}, ${pillStatus}`}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      {q.originalIndex}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

