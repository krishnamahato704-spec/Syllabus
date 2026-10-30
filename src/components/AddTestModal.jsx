import React, { useState } from 'react';
import {
  X, Plus, Upload, Download, FileJson, Check, AlertCircle,
  BookOpen, HelpCircle, Save, Trash2
} from 'lucide-react';
import { addTestPaper, importTestPapersFromJSON, exportTestsAsJSON, downloadSyllabusBackupFile } from '../test-engine.js';

export default function AddTestModal({ onClose, onTestAdded }) {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'manual' | 'backup'
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Manual Test Creator Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ncert');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [correctMarks, setCorrectMarks] = useState(1);
  const [incorrectMarks, setIncorrectMarks] = useState(0);

  const [questions, setQuestions] = useState([
    {
      id: `custom-q-1`,
      section: 'all',
      subject: 'Social Science',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'Moderate',
      explanation: ''
    }
  ]);

  function handleImportJson() {
    if (!jsonText.trim()) {
      setStatusMessage({ text: 'Please paste JSON test content first.', type: 'error' });
      return;
    }
    try {
      const result = importTestPapersFromJSON(jsonText);
      setStatusMessage({
        text: `Successfully imported ${result.importedCount} new test paper(s)!`,
        type: 'success'
      });
      setTimeout(() => {
        onTestAdded();
        onClose();
      }, 1200);
    } catch (e) {
      setStatusMessage({ text: e.message || 'Error importing JSON.', type: 'error' });
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setJsonText(ev.target?.result || '');
      setStatusMessage({ text: `File "${file.name}" loaded into editor. Click Import to finalize.`, type: 'success' });
    };
    reader.onerror = () => {
      setStatusMessage({ text: 'Failed to read file.', type: 'error' });
    };
    reader.readAsText(file);
  }

  function handleAddQuestionRow() {
    setQuestions(prev => [
      ...prev,
      {
        id: `custom-q-${prev.length + 1}`,
        section: category === 'ctet' ? 'sst' : category === 'ugc_net' ? 'p2' : 'all',
        subject: 'History',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'Moderate',
        explanation: ''
      }
    ]);
  }

  function handleRemoveQuestion(idx) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  function handleUpdateQuestion(idx, field, value) {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function handleUpdateOption(qIdx, optIdx, value) {
    setQuestions(prev => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = value;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  }

  function handleSaveManualTest(e) {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ text: 'Please enter a test title.', type: 'error' });
      return;
    }
    const hasIncompleteQuestions = questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()));
    if (hasIncompleteQuestions) {
      setStatusMessage({ text: 'Please complete question text and all 4 options for every question.', type: 'error' });
      return;
    }

    try {
      addTestPaper({
        title,
        category,
        subCategory: 'Custom User Test',
        difficulty,
        targetExam: category === 'ncert' ? 'NCERT Class 6-10' : category === 'ctet' ? 'CTET Paper II' : category === 'ugc_net' ? 'UGC NET History' : 'PG History',
        totalQuestions: questions.length,
        totalMarks: questions.length * correctMarks,
        durationMinutes: Number(durationMinutes),
        markingScheme: { correct: Number(correctMarks), incorrect: Number(incorrectMarks) },
        syllabus: 'Custom syllabus questions added by user',
        questions
      });

      setStatusMessage({ text: 'Test Paper saved successfully into your library!', type: 'success' });
      setTimeout(() => {
        onTestAdded();
        onClose();
      }, 1000);
    } catch (err) {
      setStatusMessage({ text: err.message, type: 'error' });
    }
  }

  function handleDownloadSample() {
    const sample = [
      {
        id: "sample-custom-test-01",
        title: "Sample Custom Test · Social Science Assessment",
        category: "ncert",
        difficulty: "Moderate",
        targetExam: "NCERT Class 6-10",
        durationMinutes: 45,
        markingScheme: { correct: 1, incorrect: 0 },
        questions: [
          {
            id: "sq-1",
            section: "all",
            subject: "History",
            question: "Which inscription is considered the earliest epigraphic evidence for the performance of the Ashvamedha sacrifice in northern India?",
            options: [
              "Ayodhya Inscription of Dhanadeva",
              "Hathigumpha Inscription of Kharavela",
              "Besnagar Pillar Inscription of Heliodorus",
              "Junagadh Rock Inscription of Rudradaman"
            ],
            correctAnswer: 0,
            difficulty: "Moderate",
            explanation: "The Ayodhya Stone Inscription of King Dhanadeva mentions Senapati Pushyamitra Shunga performing two Ashvamedha sacrifices."
          }
        ]
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_test_paper_template.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  function handleExportTests() {
    const json = exportTestsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Testbook_All_Tests_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  return (
    <div className="testbook-modal-backdrop" role="dialog" aria-modal="true">
      <div className="testbook-modal-card large-modal">
        <div className="modal-header">
          <div className="header-left-title">
            <Plus size={22} className="text-accent" />
            <div>
              <h2>Update & Manage Test Papers</h2>
              <p>Add new tests as you progress, import question banks, or backup syllabus</p>
            </div>
          </div>
          <button type="button" className="modal-close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="add-test-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={16} /> Import Test Papers (JSON)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Plus size={16} /> Create Custom Test Form
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Download size={16} /> Backup & Exports
          </button>
        </div>

        {statusMessage.text && (
          <div className={`modal-status-msg ${statusMessage.type}`}>
            {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: IMPORT JSON */}
        {activeTab === 'import' && (
          <div className="modal-tab-body">
            <div className="import-helper-banner">
              <div>
                <strong>Import complete test papers via JSON</strong>
                <p>Paste your test structure or upload a `.json` file containing tests with questions, options, and explanations.</p>
              </div>
              <button
                type="button"
                className="button button-small button-quiet"
                onClick={handleDownloadSample}
              >
                <Download size={14} /> Download Sample JSON
              </button>
            </div>

            <div className="file-upload-zone">
              <label className="upload-btn-label">
                <Upload size={16} /> Upload JSON File
                <input
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
              <span className="muted" style={{ fontSize: '12px' }}>or paste raw JSON directly in the editor below:</span>
            </div>

            <textarea
              className="json-input-editor"
              rows={10}
              placeholder="Paste JSON test object or array of tests here..."
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
            />

            <div className="modal-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-confirm"
                onClick={handleImportJson}
              >
                Import Test Papers
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL TEST CREATOR FORM */}
        {activeTab === 'manual' && (
          <form className="modal-tab-body" onSubmit={handleSaveManualTest}>
            <div className="form-grid-2">
              <label className="field-label">
                Test Title *
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern India National Movement Mock 1"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </label>

              <label className="field-label">
                Target Category *
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="ncert">NCERT Class 6-10 Social Science</option>
                  <option value="ctet">CTET Paper 2 (Social Science)</option>
                  <option value="ugc_net">UGC NET History (Paper 1 & 2)</option>
                </select>
              </label>
            </div>

            <div className="form-grid-4">
              <label className="field-label">
                Difficulty
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label className="field-label">
                Duration (mins)
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                />
              </label>

              <label className="field-label">
                Marks per Correct
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={correctMarks}
                  onChange={e => setCorrectMarks(e.target.value)}
                />
              </label>

              <label className="field-label">
                Negative Marks
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  max={5}
                  value={incorrectMarks}
                  onChange={e => setIncorrectMarks(e.target.value)}
                />
              </label>
            </div>

            {/* Questions Builder Section */}
            <div className="questions-builder-header">
              <h3>Questions ({questions.length})</h3>
              <button
                type="button"
                className="button button-small"
                onClick={handleAddQuestionRow}
              >
                <Plus size={14} /> Add Another Question
              </button>
            </div>

            <div className="questions-builder-list">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="q-builder-card">
                  <div className="q-builder-card-top">
                    <span className="q-builder-num">Question {qIndex + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="btn-trash"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    className="builder-q-text"
                    placeholder={`Enter Question ${qIndex + 1} text...`}
                    value={q.question}
                    onChange={e => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                  />

                  <div className="builder-options-grid">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="builder-opt-row">
                        <label className="builder-radio-label">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === oIdx}
                            onChange={() => handleUpdateQuestion(qIndex, 'correctAnswer', oIdx)}
                          />
                          <span>({String.fromCharCode(65 + oIdx)})</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                          value={opt}
                          onChange={e => handleUpdateOption(qIndex, oIdx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    className="builder-exp-input"
                    placeholder="Explanation / Historical justification (optional but recommended)..."
                    value={q.explanation}
                    onChange={e => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit-confirm">
                <Save size={16} /> Save New Test Paper
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: BACKUP & EXPORTS */}
        {activeTab === 'backup' && (
          <div className="modal-tab-body">
            <div className="backup-panel-card">
              <div className="backup-card-info">
                <BookOpen size={24} className="text-accent" />
                <div>
                  <strong>Original Syllabus Backup</strong>
                  <p>As requested, a complete backup copy of the 1,602 subtopic Social Science syllabus is preserved safely.</p>
                </div>
              </div>
              <button
                type="button"
                className="button button-small"
                onClick={downloadSyllabusBackupFile}
              >
                <Download size={15} /> Download Syllabus Backup (.JSON)
              </button>
            </div>

            <div className="backup-panel-card">
              <div className="backup-card-info">
                <FileJson size={24} className="text-accent" />
                <div>
                  <strong>Export All Test Papers & Question Banks</strong>
                  <p>Download your complete test repository including custom tests and default tests for offline study.</p>
                </div>
              </div>
              <button
                type="button"
                className="button button-small button-quiet"
                onClick={handleExportTests}
              >
                <Download size={15} /> Export Tests JSON
              </button>
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
