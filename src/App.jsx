import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Award, CheckCircle2, Clock, Search, Filter,
  PlusCircle, Download, ArrowRight, ShieldAlert, Sparkles,
  BarChart2, FileText, Check, AlertCircle, RefreshCw, Layers,
  HelpCircle, ChevronRight, Bookmark, Lock, ExternalLink
} from 'lucide-react';
import {
  getStoredTests, getAllAttempts, isTestCompleted, getAttemptForTest,
  submitTestAttempt, downloadSyllabusBackupFile
} from './test-engine.js';
import { TEST_CATEGORIES } from './data/tests-data.js';
import TestbookExamInterface from './components/TestbookExamInterface.jsx';
import TestAnalysisView from './components/TestAnalysisView.jsx';
import AddTestModal from './components/AddTestModal.jsx';

export default function App() {
  // Navigation / View State: 'hub' | 'exam' | 'analysis'
  const [currentView, setCurrentView] = useState('hub');
  const [activeTestId, setActiveTestId] = useState(null);
  const [analysisTestId, setAnalysisTestId] = useState(null);

  // Tests & Attempts State
  const [tests, setTests] = useState(() => getStoredTests());
  const [attempts, setAttempts] = useState(() => getAllAttempts());

  // Filter & Search State - default to CTET Paper 2 (no 'all' tab per requirements)
  const [selectedCategory, setSelectedCategory] = useState('ctet');
  const [selectedSection, setSelectedSection] = useState('all');
  const [quickBurstOnly, setQuickBurstOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unattempted' | 'completed'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'questions' | 'marks' | 'duration'

  // Modals & Notifications
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Refresh data on mount or storage event
  useEffect(() => {
    function handleStorageSync() {
      setTests(getStoredTests());
      setAttempts(getAllAttempts());
    }
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // Sync title with active screen
  useEffect(() => {
    if (currentView === 'exam' && activeTestId) {
      const activeTest = tests.find(t => t.id === activeTestId);
      document.title = activeTest ? `${activeTest.title} · Live Exam` : 'Online Exam · Testbook';
    } else if (currentView === 'analysis' && analysisTestId) {
      const anTest = tests.find(t => t.id === analysisTestId);
      document.title = anTest ? `Performance Analysis · ${anTest.title}` : 'Analysis · Testbook';
    } else {
      document.title = 'Testbook Assessment Hub · NCERT, CTET & UGC NET History';
    }
  }, [currentView, activeTestId, analysisTestId, tests]);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  // Reload tests and attempts from engine
  function reloadData() {
    setTests(getStoredTests());
    setAttempts(getAllAttempts());
  }

  // Handle Starting a Test
  function handleStartTest(testId) {
    // Retest Check: Per requirement, completed tests cannot be retaken
    if (isTestCompleted(testId)) {
      showToast('⚠️ This test has already been completed. Retests are locked per policy. Opening your Analysis.');
      setAnalysisTestId(testId);
      setCurrentView('analysis');
      window.scrollTo(0, 0);
      return;
    }

    setActiveTestId(testId);
    setCurrentView('exam');
    window.scrollTo(0, 0);
  }

  // Handle Test Submission
  function handleTestComplete(arg1, arg2, arg3, arg4) {
    let targetTest;
    let uAnswers;
    let sMap;
    let tSeconds;

    if (arg1 && arg1.questions) {
      targetTest = arg1;
      uAnswers = arg2 || {};
      sMap = arg3 || {};
      tSeconds = arg4 || 0;
    } else {
      targetTest = tests.find(t => t.id === activeTestId);
      uAnswers = arg1 || {};
      sMap = arg2 || {};
      tSeconds = arg3 || 0;
    }

    if (!targetTest) {
      showToast('Error: Test not found for evaluation');
      return;
    }

    try {
      const attempt = submitTestAttempt(targetTest, uAnswers, sMap, tSeconds);
      reloadData();
      setActiveTestId(null);
      setAnalysisTestId(targetTest.id);
      setCurrentView('analysis');
      window.scrollTo(0, 0);
      showToast(`🎉 Test submitted successfully! Your score: ${attempt.score}/${attempt.maxScore}`);
    } catch (e) {
      showToast(e.message || 'Error submitting test');
    }
  }

  // Handle viewing analysis for an attempted test
  function handleViewAnalysis(testId) {
    setAnalysisTestId(testId);
    setCurrentView('analysis');
    window.scrollTo(0, 0);
  }

  // Back to Hub
  function handleBackToHub() {
    setActiveTestId(null);
    setAnalysisTestId(null);
    setCurrentView('hub');
    window.scrollTo(0, 0);
  }

  // Download syllabus backup file
  async function handleDownloadSyllabusBackup() {
    const success = await downloadSyllabusBackupFile();
    if (success) {
      showToast('✅ Syllabus backup file (Social_Science_Syllabus_Backup.json) downloaded!');
    } else {
      showToast('⚠️ Downloading backup directly from syllabus dataset...');
      try {
        const raw = await import('./data/backup-syllabus.json');
        const blob = new Blob([JSON.stringify(raw.default || raw, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Social_Science_Syllabus_Backup.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        showToast('✅ Backup downloaded successfully!');
      } catch (err) {
        showToast('Could not download backup file.');
      }
    }
  }

  // Switch exam category and reset sub-section filter
  function handleCategoryChange(catId) {
    setSelectedCategory(catId);
    setSelectedSection('all');
    setQuickBurstOnly(false);
  }

  // Active Category Definition
  const activeCategoryObj = useMemo(() => {
    return TEST_CATEGORIES.find(c => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  // Filtered and Sorted Tests
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // Primary category
      if (selectedCategory === 'attempted') {
        if (!attempts[test.id]) return false;
      } else if (test.category !== selectedCategory) {
        return false;
      }

      // Sectional filter within category (for CTET, UGC NET, NCERT, PG)
      if (selectedCategory !== 'attempted' && selectedSection !== 'all') {
        if (selectedSection === 'quick_sprint') {
          if (!test.isQuickBurst && test.durationMinutes > 30 && test.syllabusSection !== 'quick_sprint') {
            return false;
          }
        } else if (selectedSection === 'full_mock') {
          if (test.syllabusSection !== 'full_mock' && test.syllabusSection !== 'combined_mock') {
            return false;
          }
        } else if (test.syllabusSection !== selectedSection) {
          return false;
        }
      }

      // Quick Burst sprint filter
      if (quickBurstOnly && !test.isQuickBurst && test.durationMinutes > 30) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && test.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      const isDone = Boolean(attempts[test.id]);
      if (statusFilter === 'completed' && !isDone) return false;
      if (statusFilter === 'unattempted' && isDone) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = test.title.toLowerCase().includes(q);
        const matchesTarget = (test.targetExam || '').toLowerCase().includes(q);
        const matchesSyllabus = (test.syllabus || '').toLowerCase().includes(q);
        const matchesSubCategory = (test.subCategory || '').toLowerCase().includes(q);
        return matchesTitle || matchesTarget || matchesSyllabus || matchesSubCategory;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'questions') return b.totalQuestions - a.totalQuestions;
      if (sortBy === 'marks') return b.totalMarks - a.totalMarks;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return 0;
    });
  }, [tests, attempts, selectedCategory, selectedSection, quickBurstOnly, selectedDifficulty, statusFilter, searchQuery, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalAvailable = tests.length;
    const attemptedKeys = Object.keys(attempts);
    const attemptedCount = attemptedKeys.length;
    let totalScoreObtained = 0;
    let totalMaxScore = 0;
    let totalAccuracySum = 0;

    attemptedKeys.forEach(k => {
      const att = attempts[k];
      if (att) {
        totalScoreObtained += att.score || 0;
        totalMaxScore += att.maxScore || 1;
        totalAccuracySum += att.accuracy || 0;
      }
    });

    const averageAccuracy = attemptedCount > 0 ? Math.round(totalAccuracySum / attemptedCount) : 0;
    const averageScorePct = totalMaxScore > 0 ? Math.round((totalScoreObtained / totalMaxScore) * 100) : 0;

    return {
      totalAvailable,
      attemptedCount,
      remainingCount: Math.max(0, totalAvailable - attemptedCount),
      averageAccuracy,
      averageScorePct
    };
  }, [tests, attempts]);

  // RENDER: Exam Interface
  if (currentView === 'exam' && activeTestId) {
    const activeTest = tests.find(t => t.id === activeTestId);
    if (!activeTest) {
      return (
        <div className="testbook-not-found">
          <h2>Test Not Found</h2>
          <button className="tb-btn tb-btn-primary" onClick={handleBackToHub}>Back to Hub</button>
        </div>
      );
    }
    return (
      <TestbookExamInterface
        test={activeTest}
        onComplete={handleTestComplete}
        onExit={handleBackToHub}
      />
    );
  }

  // RENDER: Analysis Interface
  if (currentView === 'analysis' && analysisTestId) {
    const anTest = tests.find(t => t.id === analysisTestId);
    const attempt = getAttemptForTest(analysisTestId);

    if (!anTest || !attempt) {
      return (
        <div className="testbook-not-found">
          <h2>Attempt record not found for this test</h2>
          <button className="tb-btn tb-btn-primary" onClick={handleBackToHub}>Back to Hub</button>
        </div>
      );
    }

    return (
      <TestAnalysisView
        test={anTest}
        attempt={attempt}
        onBackToHub={handleBackToHub}
      />
    );
  }

  // RENDER: Hub View (Default)
  return (
    <div className="testbook-hub-container">
      {/* Testbook Navigation Topbar */}
      <header className="testbook-topbar">
        <div className="topbar-left">
          <div className="testbook-brand-badge">
            <span className="brand-icon">
              <Award size={22} />
            </span>
            <div className="brand-text">
              <span className="brand-name">TESTBOOK<span className="brand-pro">PRO</span></span>
              <span className="brand-sub">Assessment & Test Series Hub</span>
            </div>
          </div>
        </div>

        {/* Global Hub Search Bar */}
        <div className="topbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            placeholder="Search NCERT, CTET Paper 2, UGC NET History or PG tests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Hub Action Buttons */}
        <div className="topbar-actions">
          <button
            type="button"
            className="tb-btn tb-btn-outline"
            onClick={handleDownloadSyllabusBackup}
            title="Download original Social Science syllabus backup JSON"
          >
            <Download size={16} /> Syllabus Backup
          </button>
          <button
            type="button"
            className="tb-btn tb-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={16} /> Add / Import Tests
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="hub-main-content">
        {/* Modern Header Banner with Exam Focus */}
        <section className="hub-hero-banner">
          <div className="hero-text-col">
            <span className="hero-eyebrow">STANDARDIZED COMPUTER BASED TEST (CBT) SERIES</span>
            <h1>Comprehensive Test Assessment Platform</h1>
            <p>
              Targeted examination preparation with official blueprint mocks and dedicated 
              <strong> short-burst sectional tests</strong> for 
              <strong> CTET Paper 2</strong> (CDP, English, Hindi, Social Science), 
              <strong> UGC NET History</strong> (Paper 1 & Paper 2), 
              <strong> NCERT Class 6–10</strong>, and 
              <strong> Post-Graduation History</strong>.
            </p>
            <div className="hero-highlights-strip">
              <span className="hero-tag">40+ Standardized Tests</span>
              <span className="hero-tag">⚡ 15–30 Min Quick Sectionals</span>
              <span className="hero-tag">Detailed Solutions & Diagnostics</span>
              <span className="hero-tag">Retest Integrity Lockout</span>
            </div>
          </div>

          {/* Assessment Velocity Card */}
          <div className="hero-kpi-card">
            <div className="kpi-card-header">
              <h3>Assessment Velocity</h3>
              <span className="kpi-status-badge">Active Profile</span>
            </div>
            <div className="kpi-grid">
              <div className="kpi-item">
                <span className="kpi-num">{stats.attemptedCount}</span>
                <span className="kpi-label">Completed Tests</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-num">{stats.remainingCount}</span>
                <span className="kpi-label">Available Tests</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-num">{stats.averageAccuracy}%</span>
                <span className="kpi-label">Avg. Accuracy</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-num">{stats.averageScorePct}%</span>
                <span className="kpi-label">Avg. Score</span>
              </div>
            </div>
            {stats.attemptedCount > 0 && (
              <div className="kpi-policy-notice">
                <Lock size={13} /> Completed tests are locked for retest. Review solutions anytime.
              </div>
            )}
          </div>
        </section>

        {/* Primary Exam Stream Tabs */}
        <nav className="category-nav-bar" aria-label="Exam Streams">
          <div className="category-tabs-scroll">
            {TEST_CATEGORIES.map(cat => {
              const count = tests.filter(t => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span className="cat-btn-name">{cat.name}</span>
                  <span className="cat-btn-badge">{count}</span>
                </button>
              );
            })}
            {/* Attempted Tab */}
            <button
              type="button"
              className={`category-tab-btn ${selectedCategory === 'attempted' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('attempted')}
            >
              <span className="cat-btn-name">My Completed Tests</span>
              <span className="cat-btn-badge">{stats.attemptedCount}</span>
            </button>
          </div>
        </nav>

        {/* Dedicated Syllabus Section Navigator for the Active Category */}
        {activeCategoryObj && selectedCategory !== 'attempted' && (
          <div className="syllabus-section-bar">
            <div className="syllabus-section-header">
              <div className="section-label-group">
                <Layers size={16} className="section-icon" />
                <span className="section-label-title">{activeCategoryObj.shortName} Syllabus Sections:</span>
                <span className="section-label-desc">Select a specific unit or take a quick 15–30 min practice sprint</span>
              </div>
              <button
                type="button"
                className={`quick-burst-toggle ${quickBurstOnly ? 'active' : ''}`}
                onClick={() => setQuickBurstOnly(prev => !prev)}
                title="Filter for 15-30 minute quick burst tests"
              >
                <Sparkles size={13} />
                <span>{quickBurstOnly ? 'Showing Quick Sprints (≤30m)' : '⚡ Quick Sprints Only (≤30m)'}</span>
              </button>
            </div>

            <div className="syllabus-chips-scroll">
              {activeCategoryObj.sections?.map(sec => {
                const isSecActive = selectedSection === sec.id;
                let secCount = 0;
                if (sec.id === 'all') {
                  secCount = tests.filter(t => t.category === selectedCategory).length;
                } else if (sec.id === 'quick_sprint') {
                  secCount = tests.filter(t => t.category === selectedCategory && (t.isQuickBurst || t.durationMinutes <= 30 || t.syllabusSection === 'quick_sprint')).length;
                } else if (sec.id === 'full_mock') {
                  secCount = tests.filter(t => t.category === selectedCategory && (t.syllabusSection === 'full_mock' || t.syllabusSection === 'combined_mock')).length;
                } else {
                  secCount = tests.filter(t => t.category === selectedCategory && t.syllabusSection === sec.id).length;
                }

                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`syllabus-chip-btn ${isSecActive ? 'active' : ''} ${sec.id === 'quick_sprint' ? 'sprint-chip' : ''}`}
                    onClick={() => {
                      setSelectedSection(sec.id);
                      if (sec.id === 'quick_sprint') setQuickBurstOnly(false);
                    }}
                  >
                    <span>{sec.label}</span>
                    <span className="chip-count">{secCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter and Sorting Toolbar */}
        <div className="hub-toolbar">
          <div className="toolbar-left">
            <span className="results-count">
              Showing <strong>{filteredTests.length}</strong> test papers
              {activeCategoryObj && ` in ${activeCategoryObj.name}`}
              {selectedSection !== 'all' && ` · ${selectedSection.replace('_', ' ').toUpperCase()}`}
              {quickBurstOnly && ' (Quick Sprints ≤30m)'}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>

          <div className="toolbar-right">
            <label className="toolbar-filter-item">
              <span className="filter-label">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High (Advanced)</option>
              </select>
            </label>

            <label className="toolbar-filter-item">
              <span className="filter-label">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="unattempted">Unattempted Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </label>

            <label className="toolbar-filter-item">
              <span className="filter-label">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="default">Default Order</option>
                <option value="duration">Shortest Time (Quickest)</option>
                <option value="questions">Most Questions</option>
                <option value="marks">Highest Marks</option>
              </select>
            </label>
          </div>
        </div>

        {/* Test Cards Grid */}
        {filteredTests.length === 0 ? (
          <div className="empty-tests-state">
            <AlertCircle size={44} className="empty-icon" />
            <h3>No test papers found for this selection</h3>
            <p>Try resetting the section filter, search query, or difficulty level.</p>
            <button
              type="button"
              className="tb-btn tb-btn-outline"
              onClick={() => {
                setSelectedSection('all');
                setQuickBurstOnly(false);
                setSearchQuery('');
                setSelectedDifficulty('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="tests-grid">
            {filteredTests.map(test => {
              const attempt = attempts[test.id];
              const isDone = Boolean(attempt && attempt.completed);

              return (
                <article
                  key={test.id}
                  className={`test-card ${isDone ? 'is-completed' : ''} ${test.isQuickBurst || test.durationMinutes <= 30 ? 'is-quick-burst' : ''}`}
                >
                  {/* Card Top Row: Target Exam & Duration Badge */}
                  <div className="card-top-row">
                    <div className="card-exam-breadcrumb">
                      <span className="exam-target-text">
                        {test.targetExam || test.category.toUpperCase()}
                      </span>
                      {test.isSectional && (
                        <span className="sectional-subtext">· Sectional Test</span>
                      )}
                    </div>
                    {test.durationMinutes <= 30 ? (
                      <span className="quick-sprint-badge">
                        ⚡ {test.durationMinutes}m Sprint
                      </span>
                    ) : (
                      <span className="duration-pill">
                        <Clock size={12} /> {test.durationMinutes} Mins
                      </span>
                    )}
                  </div>

                  {/* Card Title & Syllabus */}
                  <h3 className="card-title">{test.title}</h3>
                  <p className="card-syllabus-text">
                    {test.syllabus || 'Standardized curriculum assessment for comprehensive performance evaluation.'}
                  </p>

                  {/* Test Specs: Clean Typographic Line (No Pill Sandwiches) */}
                  <div className="card-meta-line">
                    <span className="meta-point"><strong>{test.totalQuestions}</strong> Questions</span>
                    <span className="meta-sep">·</span>
                    <span className="meta-point"><strong>{test.totalMarks}</strong> Marks</span>
                    <span className="meta-sep">·</span>
                    <span className="meta-point">+{test.markingScheme?.correct || 1} / {test.markingScheme?.incorrect || 0}</span>
                    <span className="meta-sep">·</span>
                    <span className={`meta-diff ${test.difficulty === 'High' ? 'diff-high' : 'diff-mod'}`}>
                      {test.difficulty}
                    </span>
                  </div>

                  {/* Sections breakdown if full mock with multiple sections */}
                  {test.sections && test.sections.length > 1 && (
                    <div className="card-sections-preview">
                      <span className="sections-preview-label">Sections:</span>
                      <span className="sections-preview-names">
                        {test.sections.map(s => s.name.split(' (')[0]).join(' · ')}
                      </span>
                    </div>
                  )}

                  {/* Card Footer: Status & Action Button */}
                  <div className="card-action-footer">
                    {isDone ? (
                      <div className="completed-action-wrap">
                        <div className="score-summary-pill">
                          <span className="score-val">
                            Score: <strong>{attempt.score}</strong>/{attempt.maxScore}
                          </span>
                          <span className="acc-val">{attempt.accuracy}% Accuracy</span>
                        </div>
                        <button
                          type="button"
                          className="tb-btn tb-btn-success full-width"
                          onClick={() => handleViewAnalysis(test.id)}
                        >
                          <BarChart2 size={16} /> View Analysis & Solutions
                        </button>
                        <span className="retest-lock-notice">
                          <Lock size={12} /> Retest locked · Solutions available
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="tb-btn tb-btn-primary full-width"
                        onClick={() => handleStartTest(test.id)}
                      >
                        Start Test <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="hub-footer">
        <div className="footer-content">
          <div className="footer-left">
            <strong>Testbook Assessment Hub</strong>
            <span>Standardized Computer Based Tests for NCERT, CTET Paper 2, UGC NET & Master's History.</span>
          </div>
          <div className="footer-right">
            <button
              type="button"
              className="footer-link-btn"
              onClick={handleDownloadSyllabusBackup}
            >
              <Download size={14} /> Download Syllabus Backup
            </button>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle size={14} /> Import More Test Papers
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Import Tests Modal */}
      {showAddModal && (
        <AddTestModal
          onClose={() => setShowAddModal(false)}
          onTestAdded={() => {
            reloadData();
            showToast('✅ Test library updated successfully!');
          }}
        />
      )}

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="hub-toast-notification" role="status">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')}>×</button>
        </div>
      )}
    </div>
  );
}
