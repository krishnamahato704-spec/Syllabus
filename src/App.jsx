import React, { useEffect, useMemo, useRef, useState } from 'react';
import syllabus from './data/syllabus.json';
import {
  buildIndex, filterTopics, progressStats, normalizeEntry, applyPatch, indiaDay, addDays,
  assessmentScope, makeAssessmentPrompt, makeTopicPrompt, dailyProgress, weeklyProgress, subjectProgress
} from './study.js';
import { Icon, ProgressBar, EmptyState, Modal, ExternalLink } from './components.jsx';

const index = buildIndex(syllabus);
const STORAGE_KEY = 'study_atlas_checklist_v2';
const partLabels = { 1: 'School subjects', 2: 'History', 3: 'CTET Paper II', 4: 'UGC NET Paper I' };
const partDescriptions = {
  1: 'Geography, Civics, Economics and allied subjects',
  2: 'One course, from school foundations to NET depth',
  3: 'CDP, English I, Hindi II and teaching methods',
  4: 'Teaching, research and the general aptitude units'
};
const shortDate = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(value));
const download = (name, text, type = 'text/plain;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
};

function readInitialEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('study-atlas-preview-v1');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const data = parsed.entries ? parsed.entries : parsed;
    if (typeof data !== 'object' || Array.isArray(data)) return {};
    return data;
  } catch {
    return {};
  }
}

export default function App() {
  const [entries, setEntries] = useState(readInitialEntries);
  const [route, setRoute] = useState(location.hash.slice(1) || 'overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [part, setPart] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);
  const [toast, setToast] = useState('');
  const [prompt, setPrompt] = useState(null);
  const sidebarRef = useRef(null);

  const stats = useMemo(() => progressStats(index, entries), [entries]);
  const topics = useMemo(() => filterTopics(index, entries, { query, part, subject, status }), [query, part, subject, status, entries]);
  const currentTopic = route.startsWith('topic/') ? index.topicMap[route.slice(6)] : null;
  const page = route.startsWith('topic/') ? 'topic' : route;

  function persist(next) {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setToast('Browser storage error. Your changes remain in memory for this session.');
    }
  }

  function update(id, patch) {
    const now = new Date().toISOString();
    const next = { ...entries, [id]: applyPatch(entries[id], patch, now) };
    persist(next);
    return true;
  }

  useEffect(() => {
    const fn = () => { setRoute(location.hash.slice(1) || 'overview'); setMobileNav(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', fn); return () => window.removeEventListener('hashchange', fn);
  }, []);

  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 4000); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { setVisibleCount(24); }, [query, part, subject, status]);
  useEffect(() => { document.title = currentTopic ? `${currentTopic.id} ${currentTopic.title} · Study Atlas` : 'Study Atlas · Social Science'; }, [currentTopic]);

  useEffect(() => {
    const key = e => {
      if (e.key === '/' && page === 'syllabus' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest('input,textarea,select,[contenteditable="true"]')) {
        e.preventDefault(); document.querySelector('.search-box input')?.focus();
      }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [page]);

  function navigate(target) { location.hash = target; setMobileNav(false); }
  function browse(nextPart = '', nextSubject = '', nextStatus = 'all') {
    setPart(String(nextPart)); setSubject(nextSubject); setQuery(''); setStatus(nextStatus); navigate('syllabus');
  }
  function openPrompt(topic, kind, itemId = '') {
    setPrompt({ title: `${kind === 'review' ? 'Check understanding' : 'Research'} · ${itemId || topic.id}`, text: makeTopicPrompt(topic, entries, kind, syllabus.sources, itemId) });
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setToast('Assessment prompt copied! Paste it into your AI.'); }
    catch { setToast('Could not copy automatically. You can download or select the prompt text.'); }
  }

  const activeMain = page === 'topic' ? 'syllabus' : page;
  const mainNav = [
    ['overview', 'grid', 'Overview'],
    ['syllabus', 'list', 'Syllabus'],
    ['progress', 'chart', 'Overall Progress'],
    ['weekend', 'calendar', 'Weekend Review']
  ];

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content').focus(); }}>Skip to content</a>
    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside ref={sidebarRef} className={`sidebar ${mobileNav ? 'is-open' : ''}`} aria-label="Study navigation" role={mobileNav ? 'dialog' : undefined} aria-modal={mobileNav ? true : undefined} onClick={e => { if (e.target.closest('a')) setMobileNav(false); }}>
      <button className="icon-button nav-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><Icon name="close" /></button>
      <a href="#overview" className="brand"><span className="brand-mark"><Icon name="book" size={26} /></span><span>Study Atlas<small>SOCIAL SCIENCE</small></span></a>
      <nav className="main-nav">{mainNav.map(([target, icon, label]) => <a key={target} href={`#${target}`} aria-current={activeMain === target ? 'page' : undefined}><Icon name={icon} /><span>{label}</span>{target === 'weekend' && stats.revision > 0 && <b className="nav-count">{stats.revision}</b>}</a>)}</nav>
      <div className="nav-label">YOUR STUDY PARTS</div>
      <nav className="parts-nav">{[1,2,3,4].map(n => {
        const ps = progressStats(index.items.filter(i => i.part === n), entries);
        return <button key={n} className={part === String(n) && activeMain === 'syllabus' ? 'selected' : ''} onClick={() => browse(n)}><span className="part-number">0{n}</span><span className="part-nav-copy">{partLabels[n]}<small>{ps.complete} of {ps.total} complete</small></span><Icon name="chevron" size={15} /></button>;
      })}</nav>
      <div className="sidebar-note"><Icon name="info" size={17} /><p>History is one combined checklist, from school foundations to NET depth.</p></div>
      <div className="sidebar-bottom"><span className="status-dot green" /><span>Autosaved in this browser</span></div>
    </aside>

    <div className="main-shell" inert={mobileNav ? true : undefined}>
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Icon name="menu" /></button>
        <div className="breadcrumb">Study Atlas <Icon name="chevron" size={13} /><span>{page === 'topic' ? currentTopic?.id || 'Topic' : mainNav.find(n => n[0] === page)?.[2] || 'Overview'}</span></div>
        <div className="topbar-actions">
          <div className="topbar-progress" title={`${stats.complete} of ${stats.total} subtopics completed`}>
            <span>Progress: <b>{stats.percent}%</b></span>
            <div className="topbar-progress-bar"><span style={{ width: `${stats.percent}%` }} /></div>
            <span className="source-date">{stats.complete}/{stats.total}</span>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        {page === 'overview' && <Overview {...{ entries, stats, navigate, browse }} />}
        {page === 'syllabus' && <>
          <PageHeading eyebrow="THE COMPLETE CHECKLIST" title="A clear path through your subjects." description="Select a topic, study its subtopics, and check each one as you complete it." />
          <div className="syllabus-toolbar">
            <label className="search-box"><Icon name="search" /><input type="search" aria-label="Search topics, subtopics or IDs" placeholder="Search a topic, concept or ID…" value={query} onChange={e => { setQuery(e.target.value); setPart(''); setSubject(''); }} /><kbd>/</kbd></label>
            <div className="filter-row">
              <label><span className="sr-only">Study part</span><select aria-label="Study part" value={part} onChange={e => { setPart(e.target.value); setSubject(''); }}>{[['','All four parts'],...Object.entries(partLabels)].map(([v,t]) => <option value={v} key={v}>{t}</option>)}</select></label>
              <label><span className="sr-only">Subject</span><select aria-label="Subject" value={subject} onChange={e => setSubject(e.target.value)}><option value="">All subjects</option>{[...new Set(index.topics.filter(t => !part || t.part === Number(part)).map(t => t.subject))].map(s => <option key={s}>{s}</option>)}</select></label>
              <label><span className="sr-only">Learning status</span><select aria-label="Learning status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All topics</option><option value="complete">Completed</option><option value="not-started">Incomplete / Pending</option><option value="revision">Needs revision</option></select></label>
            </div>
          </div>
          <div className="results-meta"><span><strong>{topics.length}</strong> main topics{query && <> matching “{query}”</>}</span><button className="text-button" onClick={() => { setQuery(''); setPart(''); setSubject(''); setStatus('all'); }}>Clear filters</button></div>
          {topics.length ? <div className="topic-grid">{topics.slice(0,visibleCount).map(t => <TopicCard key={t.id} topic={t} entries={entries} navigate={navigate} />)}</div> : <EmptyState icon="search" title="No topics match these filters">Try a different concept, ID or learning status.</EmptyState>}
          {topics.length > visibleCount && <div className="load-more"><button className="button button-quiet" onClick={() => setVisibleCount(n => n + 24)}>Show more topics <span>{Math.min(24,topics.length-visibleCount)} more</span></button></div>}
        </>}
        {page === 'topic' && (currentTopic ? <>
          <button className="text-button back-link" onClick={() => navigate('syllabus')}><Icon name="back" size={17} />Back to syllabus</button>
          <div className="topic-heading"><div><span className="eyebrow">PART {currentTopic.part} / {currentTopic.subject}</span><div className="topic-id-title"><span className="code-tag">{currentTopic.id}</span><h1>{currentTopic.title}</h1></div><p>{currentTopic.unitTitle.replace(/ - NET Unit [IVX]+$/,'')}</p></div><span className="topic-count">{progressStats(currentTopic.items, entries).complete}<small>/ {currentTopic.items.length} complete</small></span></div>
          <ProgressBar value={progressStats(currentTopic.items, entries).percent} label={`${currentTopic.id} completion`} />
          <div className="topic-actions"><button className="button" onClick={() => openPrompt(currentTopic,'research')}><Icon name="spark" size={17} />Research this topic</button><button className="button button-quiet" onClick={() => openPrompt(currentTopic,'review')}><Icon name="check" size={17} />Check my understanding</button></div>
          <div className="learning-guide"><strong>How to use this checklist</strong><span>Check each subtopic when you have studied and understood it. Completed items automatically become available for your weekend assessment and revision prompts.</span></div>
          <section className="checklist-panel" aria-label="Topic subtopics"><div className="panel-label"><span>{currentTopic.items.length} SUBTOPICS</span><span>STATUS & ACTIONS</span></div>
            {currentTopic.items.map(item => <SubtopicRow key={item.id} item={item} state={normalizeEntry(entries[item.id])} onChange={patch => update(item.id, patch)} />)}
          </section>
          <section className="topic-sources"><h2>Reference links for this unit</h2><p>Official syllabus references.</p><div className="source-links">{currentTopic.sources.map(k => syllabus.sources[k] && <ExternalLink key={k} href={syllabus.sources[k].url}>{syllabus.sources[k].name}</ExternalLink>)}</div></section>
        </> : <EmptyState title="This topic ID is not in the checklist" action={<button className="button" onClick={() => browse()}>Browse the syllabus</button>}>Use one of the original numbered topics.</EmptyState>)}
        {page === 'progress' && <OverallProgressTab index={index} entries={entries} stats={stats} browse={browse} />}
        {page === 'weekend' && <WeekendDashboard index={index} entries={entries} onPrompt={setPrompt} navigate={navigate} />}
        {!['overview','syllabus','topic','progress','weekend'].includes(page) && <EmptyState title="This page is not available" action={<button className="button" onClick={() => navigate('overview')}>Go to overview</button>}>Your checklist is available from the navigation.</EmptyState>}
        <footer className="page-footer"><span>Study Atlas</span><span>204 topics · 1,602 subtopics · One combined History course</span></footer>
      </main>
    </div>
    {toast && <div className="toast" role="status"><Icon name="info" size={18} /><span>{toast}</span><button aria-label="Dismiss message" onClick={() => setToast('')}><Icon name="close" size={16} /></button></div>}
    {prompt && <Modal title={prompt.title} className="prompt-modal" onClose={() => setPrompt(null)}><p className="modal-description">Copy this assessment prompt into the AI of your choice. Its scope comes strictly from the subtopics you completed.</p><textarea aria-label="Prepared AI prompt" className="prompt-text" readOnly value={prompt.text} onFocus={e => e.target.select()} /><div className="modal-actions"><button className="button button-quiet" onClick={() => download('assessment-prompt.txt', prompt.text)}><Icon name="download" size={17} />Download prompt</button><button className="button" onClick={() => copy(prompt.text)}>Copy prompt<Icon name="arrow" size={17} /></button></div></Modal>}
  </div>;
}

function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}

function Overview({ entries, stats, navigate, browse }) {
  const next = index.topics.find(t => t.items.some(i => entries[i.id]?.status !== 'complete' || entries[i.id]?.needsRevision)) || index.topics[0];
  const recent = index.items.filter(i => entries[i.id]?.updatedAt && entries[i.id]?.status === 'complete').sort((a,b) => Date.parse(entries[b.id].updatedAt)-Date.parse(entries[a.id].updatedAt)).slice(0,4);
  const completedThisWeek = assessmentScope(index, entries, { fromDay: addDays(indiaDay(), -6), toDay: indiaDay() }).current.length;

  return <>
    <PageHeading eyebrow="YOUR LEARNING WORKSPACE" title="Social Science, one topic at a time." description="The complete school, CTET and NET checklist. Check subtopics off as you complete them and assess yourself every weekend."><span className="edition-badge"><Icon name="book" size={17} />Social Science Atlas</span></PageHeading>
    <div className="stat-grid">
      {[['check','Completed',stats.complete,'of 1,602 subtopics'],
        ['clock','Remaining',stats.total - stats.complete,'pending completion'],
        ['flag','To revisit',stats.revision,'flagged for revision'],
        ['calendar','This week',completedThisWeek,'completed in the last 7 days']
      ].map(([icon,label,value,detail]) => <div className="stat-card" key={label}><span className="stat-icon"><Icon name={icon} size={19} /></span><span className="stat-label">{label}</span><strong>{value.toLocaleString('en-IN')}</strong><small>{detail}</small></div>)}
    </div>
    <div className="overview-middle">
      <section className="continue-card">
        <span className="eyebrow">{stats.complete < stats.total ? 'CURRENT TOPIC' : 'CHECKLIST COMPLETE'}</span>
        <span className="continue-code">{next.id} / {next.subject}</span>
        <h2>{next.title}</h2>
        <p>{next.items.length} subtopics. Open the checklist, mark items complete as you study, and assess them every weekend.</p>
        <button className="button" onClick={() => navigate(`topic/${next.id}`)}>Open topic checklist<Icon name="arrow" size={17} /></button>
        <div className="map-lines" aria-hidden="true"><span /><span /><span /><span /><b>01</b></div>
      </section>
      <section className="overall-card">
        <div className="section-top"><h2>Overall progress</h2><span>{stats.complete}/{stats.total}</span></div>
        <div className="progress-orbit" style={{'--progress':`${stats.percent*3.6}deg`}}>
          <span><strong>{stats.percent}%</strong><small>complete</small></span>
        </div>
        <p><button className="text-button" onClick={() => navigate('progress')}>View detailed progress breakdown →</button></p>
      </section>
    </div>
    <div className="section-top section-spaced">
      <div><span className="eyebrow">THE FOUR PARTS</span><h2>Your study map</h2></div>
      <button className="text-button" onClick={() => browse()}>View full syllabus<Icon name="arrow" size={16} /></button>
    </div>
    <div className="part-grid">
      {[1,2,3,4].map(n => {
        const items = index.items.filter(i => i.part === n);
        const s = progressStats(items, entries);
        const count = index.topics.filter(t => t.part === n).length;
        return <button className={`part-card part-${n}`} key={n} onClick={() => browse(n)}>
          <div className="part-card-top"><span>PART 0{n}</span><Icon name="arrow" size={18} /></div>
          <h3>{partLabels[n]}</h3>
          <p>{partDescriptions[n]}</p>
          <div className="part-card-bottom"><span>{count} topics · {items.length} subtopics</span><b>{s.percent}%</b></div>
          <ProgressBar value={s.percent} label={`${partLabels[n]} progress`} />
        </button>;
      })}
    </div>
    <div className="overview-bottom">
      <section className="panel recent-panel">
        <div className="section-top"><h2>Recent completions</h2><Icon name="clock" size={18} /></div>
        {recent.length ? recent.map(i => <button className="recent-row" key={i.id} onClick={() => navigate(`topic/${i.topicId}`)}><span className="code-tag">{i.id}</span><span>{i.text}<small>{i.topicTitle}</small></span><time>{shortDate(entries[i.id].completedAt || entries[i.id].updatedAt)}</time></button>) : <p className="muted empty-copy">Items you check complete will appear here as your recent study log.</p>}
      </section>
      <section className="routine-card">
        <Icon name="calendar" size={25} />
        <h2>Weekend progress & self-test</h2>
        <p>Review your day-by-day and week-by-week progress dashboard, then generate a targeted assessment prompt from completed subtopics.</p>
        <button className="text-button" onClick={() => navigate('weekend')}>Open weekend dashboard<Icon name="arrow" size={16} /></button>
      </section>
    </div>
  </>;
}

function TopicCard({ topic, entries, navigate }) {
  const s = progressStats(topic.items, entries);
  return <button className="topic-card" onClick={() => navigate(`topic/${topic.id}`)}>
    <div className="topic-card-top"><span className="code-tag">{topic.id}</span><span className="topic-subject">{topic.subject}</span><Icon name="arrow" size={17} /></div>
    <h2>{topic.title}</h2>
    <p>{topic.unitTitle.replace(/ - NET Unit [IVX]+$/,'')}</p>
    <div className="topic-preview">
      {topic.visibleItems.slice(0, 2).map(i => <span key={i.id}><i className={entries[i.id]?.status === 'complete' ? 'checked' : ''}>{entries[i.id]?.status === 'complete' && <Icon name="check" size={10} />}</i>{i.text}</span>)}
    </div>
    <div className="topic-card-bottom"><span>{s.complete}/{s.total} complete</span><span>{s.revision > 0 ? `${s.revision} to revisit` : s.complete === s.total ? 'Complete' : `${s.total - s.complete} remaining`}</span></div>
    <ProgressBar value={s.percent} label={`${topic.id} progress`} />
  </button>;
}

function SubtopicRow({ item, state, onChange }) {
  const isComplete = state.status === 'complete';
  return <div className={`subtopic-row ${isComplete ? 'is-complete' : ''}`}>
    <input
      type="checkbox"
      id={`complete-${item.id}`}
      checked={isComplete}
      onChange={e => onChange({ status: e.target.checked ? 'complete' : 'not-started' })}
      aria-label={`Mark ${item.id} complete`}
    />
    <div className="subtopic-copy">
      <label htmlFor={`complete-${item.id}`}>
        <span className="item-id">{item.id}</span>
        <span>{item.text}</span>
      </label>
      <div className="row-status">
        {state.needsRevision && <span className="badge revision">Needs revision</span>}
        {isComplete && state.completedAt && <small>Completed {shortDate(state.completedAt)}</small>}
      </div>
    </div>
    <div className="subtopic-actions">
      <button
        className={`icon-button ${state.needsRevision ? 'flagged' : ''}`}
        onClick={() => onChange({ needsRevision: !state.needsRevision })}
        aria-pressed={state.needsRevision}
        aria-label={`${state.needsRevision ? 'Remove' : 'Add'} revision flag for ${item.id}`}
        title={state.needsRevision ? 'Remove revision flag' : 'Flag for weekend revision'}
      >
        <Icon name="flag" size={17} />
      </button>
    </div>
  </div>;
}

/* OVERALL PROGRESS TAB */
function OverallProgressTab({ index, entries, stats, browse }) {
  const prog = useMemo(() => subjectProgress(index, entries), [index, entries]);

  return <>
    <PageHeading
      eyebrow="PORTFOLIO MASTERY"
      title="Overall progress till now."
      description="Track cumulative completion across all 4 parts, 204 topics and 1,602 subtopics."
    />

    <div className="progress-kpi-grid">
      <div className="kpi-card">
        <div className="kpi-card-top"><span>SUBTOPICS COMPLETED</span><Icon name="check" size={18} /></div>
        <strong>{stats.complete.toLocaleString('en-IN')}</strong>
        <small>{stats.percent}% of total 1,602 subtopics</small>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-top"><span>REMAINING SUBTOPICS</span><Icon name="clock" size={18} /></div>
        <strong>{(stats.total - stats.complete).toLocaleString('en-IN')}</strong>
        <small>{100 - stats.percent}% left to complete</small>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-top"><span>TOPICS FINISHED (100%)</span><Icon name="award" size={18} /></div>
        <strong>{prog.fullyCompletedTopics}</strong>
        <small>out of 204 main syllabus topics</small>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-top"><span>TOPICS IN PROGRESS</span><Icon name="trending" size={18} /></div>
        <strong>{prog.inProgressTopics}</strong>
        <small>partially completed topics</small>
      </div>
      <div className="kpi-card">
        <div className="kpi-card-top"><span>REVISION FLAGGED</span><Icon name="flag" size={18} /></div>
        <strong>{stats.revision}</strong>
        <small>topics to revisit this weekend</small>
      </div>
    </div>

    <section className="milestones-card">
      <div className="section-top">
        <div>
          <span className="eyebrow">DISTRIBUTION</span>
          <h2>Topic completion status</h2>
        </div>
        <span className="muted">{prog.totalTopics} total topics</span>
      </div>
      <div className="distribution-bar" role="progressbar" aria-label="Topic status distribution">
        <div className="dist-seg complete" style={{ width: `${(prog.fullyCompletedTopics / prog.totalTopics) * 100}%` }} title={`Completed: ${prog.fullyCompletedTopics} topics`} />
        <div className="dist-seg studying" style={{ width: `${(prog.inProgressTopics / prog.totalTopics) * 100}%` }} title={`In Progress: ${prog.inProgressTopics} topics`} />
        <div className="dist-seg unstarted" style={{ width: `${(prog.notStartedTopics / prog.totalTopics) * 100}%` }} title={`Not Started: ${prog.notStartedTopics} topics`} />
      </div>
      <div className="dist-legend">
        <div className="legend-item"><span className="legend-dot complete" /><span><strong>{prog.fullyCompletedTopics}</strong> Fully Completed</span></div>
        <div className="legend-item"><span className="legend-dot studying" /><span><strong>{prog.inProgressTopics}</strong> In Progress</span></div>
        <div className="legend-item"><span className="legend-dot unstarted" /><span><strong>{prog.notStartedTopics}</strong> Unstarted</span></div>
      </div>
    </section>

    <div className="section-top section-spaced">
      <div>
        <span className="eyebrow">BREAKDOWN BY PART & SUBJECT</span>
        <h2>Subject-by-subject syllabus mastery</h2>
      </div>
    </div>

    {prog.parts.map(p => (
      <div className="master-part-card" key={p.part}>
        <div className="master-part-header">
          <div>
            <span className="eyebrow">PART 0{p.part}</span>
            <h3>{p.label}</h3>
            <p>{p.description}</p>
          </div>
          <div className="master-part-stats">
            <strong>{p.percent}%</strong>
            <small>{p.complete} of {p.total} subtopics ({p.completedTopicsCount}/{p.topicsCount} topics)</small>
          </div>
        </div>
        <ProgressBar value={p.percent} label={`Part ${p.part} progress`} />

        <div className="subject-table">
          {p.subjects.map(s => (
            <div className="subject-row" key={s.name}>
              <div className="subject-name">
                <span className="code-tag">{s.name}</span>
              </div>
              <div className="subject-topics-count">
                {s.completedTopicsCount}/{s.topicsCount} topics finished
              </div>
              <ProgressBar value={s.percent} label={`${s.name} subtopic completion`} />
              <div className="subject-percent">
                {s.percent}%
              </div>
              <div className="subject-action">
                <button className="text-button" onClick={() => browse(p.part, s.name)}>
                  Checklist ({s.completedSubtopics}/{s.totalSubtopics}) →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>;
}

/* WEEKEND REVIEW & DAY-BY-DAY / WEEK-BY-WEEK DASHBOARD */
function WeekendDashboard({ index, entries, onPrompt, navigate }) {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week'
  const [dayRange, setDayRange] = useState(14); // 7, 14, 30
  const [weekRange, setWeekRange] = useState(8); // 4, 8, 12

  const daily = useMemo(() => dailyProgress(index, entries, dayRange), [index, entries, dayRange]);
  const weekly = useMemo(() => weeklyProgress(index, entries, weekRange), [index, entries, weekRange]);

  // Assessment form state
  const [from, setFrom] = useState(addDays(indiaDay(), -6));
  const [to, setTo] = useState(indiaDay());
  const [older, setOlder] = useState(true);
  const [mode, setMode] = useState('Combined');
  const [count, setCount] = useState(30);
  const [part, setPart] = useState('');

  let scope, error = '';
  try {
    scope = assessmentScope(index, entries, { fromDay: from, toDay: to, includeOlder: older, part });
  } catch (e) {
    error = e.message;
  }

  function applyQuickPeriod(days) {
    setFrom(addDays(indiaDay(), -(days - 1)));
    setTo(indiaDay());
  }

  return <>
    <PageHeading
      eyebrow="WEEKEND REVIEW & VELOCITY"
      title="Study Progress Dashboard."
      description="Monitor your daily and weekly momentum, review what you finished, and build assessment prompts."
    />

    <div className="dashboard-controls">
      <div className="view-tabs" role="tablist" aria-label="Progress view mode">
        <button
          className={`view-tab-btn ${viewMode === 'day' ? 'active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'day'}
          onClick={() => setViewMode('day')}
        >
          <Icon name="calendar" size={16} /> Day-by-Day View
        </button>
        <button
          className={`view-tab-btn ${viewMode === 'week' ? 'active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'week'}
          onClick={() => setViewMode('week')}
        >
          <Icon name="chart" size={16} /> Week-by-Week View
        </button>
      </div>

      <div className="range-chips">
        <span className="muted" style={{ fontSize: '12px' }}>Time window:</span>
        {viewMode === 'day' ? (
          [7, 14, 30].map(d => (
            <button
              key={d}
              className={`chip-btn ${dayRange === d ? 'active' : ''}`}
              onClick={() => { setDayRange(d); applyQuickPeriod(d); }}
            >
              Last {d} days
            </button>
          ))
        ) : (
          [4, 8, 12].map(w => (
            <button
              key={w}
              className={`chip-btn ${weekRange === w ? 'active' : ''}`}
              onClick={() => setWeekRange(w)}
            >
              Last {w} weeks
            </button>
          ))
        )}
      </div>
    </div>

    {viewMode === 'day' ? (
      <>
        <div className="metrics-strip">
          <div className="metric-tile">
            <div className="metric-tile-top"><span>CURRENT STREAK</span><Icon name="flame" size={18} /></div>
            <strong>{daily.streak} {daily.streak === 1 ? 'day' : 'days'}</strong>
            <small>{daily.streak > 0 ? 'Consecutive active study days' : 'Check a subtopic to start a streak'}</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>COMPLETED TODAY</span><Icon name="check" size={18} /></div>
            <strong>{daily.todayCount}</strong>
            <small>subtopics finished today</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>ACTIVE DAYS IN RANGE</span><Icon name="clock" size={18} /></div>
            <strong>{daily.days.filter(d => d.count > 0).length} of {dayRange}</strong>
            <small>days with completed topics</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>TOTAL IN THIS PERIOD</span><Icon name="target" size={18} /></div>
            <strong>{daily.days.reduce((acc, d) => acc + d.count, 0)}</strong>
            <small>subtopics completed in last {dayRange} days</small>
          </div>
        </div>

        <section className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <span className="eyebrow">DAY-BY-DAY ACTIVITY</span>
              <h2>Daily subtopics completed</h2>
            </div>
            <span>Showing last {dayRange} days (Asia/Kolkata)</span>
          </div>

          <div className="bar-chart-container" role="img" aria-label="Daily completion bar chart">
            {daily.days.map(d => {
              const heightPct = daily.maxDayCount > 0 ? Math.max(d.count > 0 ? 12 : 3, (d.count / daily.maxDayCount) * 100) : 3;
              const isToday = d.day === indiaDay();
              return (
                <div className="chart-bar-item" key={d.day}>
                  <span className="bar-val-badge">{d.count > 0 ? d.count : ''}</span>
                  <div className="chart-bar-fill-wrap">
                    <div
                      className={`chart-bar-fill ${d.count > 0 ? 'has-data' : ''} ${isToday ? 'is-today' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day} (${d.weekday}): ${d.count} subtopics completed`}
                    />
                  </div>
                  <div className="bar-date-label">
                    <span className="bar-day-name">{d.weekday}</span>
                    <span>{d.label.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {daily.days.some(d => d.count > 0) && (
          <section className="log-panel">
            <div className="log-panel-header">
              <h2>Recent daily completion log</h2>
              <span className="muted">Subtopics finished during this window</span>
            </div>
            {daily.days.filter(d => d.count > 0).reverse().map(d => (
              <div className="log-group" key={d.day}>
                <div className="log-group-title">
                  <span>{d.label} ({d.weekday})</span>
                  <span className="log-count-badge">{d.count} completed</span>
                </div>
                <div className="log-items-grid">
                  {d.items.map(item => (
                    <button className="log-item-card" key={item.id} onClick={() => navigate(`topic/${item.topicId}`)}>
                      <span className="code-tag">{item.id}</span>
                      <span>{item.text}</span>
                      <Icon name="arrow" size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </>
    ) : (
      <>
        <div className="metrics-strip">
          <div className="metric-tile">
            <div className="metric-tile-top"><span>BEST STUDY WEEK</span><Icon name="award" size={18} /></div>
            <strong>{weekly.bestWeek?.count || 0}</strong>
            <small>{weekly.bestWeek?.label || 'In this window'}</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>THIS CURRENT WEEK</span><Icon name="calendar" size={18} /></div>
            <strong>{weekly.currentWeek?.count || 0}</strong>
            <small>subtopics completed so far</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>ACTIVE WEEKS</span><Icon name="trending" size={18} /></div>
            <strong>{weekly.activeWeeks} of {weekRange}</strong>
            <small>weeks with study activity</small>
          </div>
          <div className="metric-tile">
            <div className="metric-tile-top"><span>WEEKLY AVERAGE</span><Icon name="target" size={18} /></div>
            <strong>{Math.round(weekly.weeks.reduce((acc, w) => acc + w.count, 0) / weekRange)}</strong>
            <small>subtopics completed per week</small>
          </div>
        </div>

        <section className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <span className="eyebrow">WEEK-BY-WEEK VELOCITY</span>
              <h2>Weekly subtopics completed</h2>
            </div>
            <span>Showing last {weekRange} weeks</span>
          </div>

          <div className="bar-chart-container" role="img" aria-label="Weekly completion bar chart">
            {weekly.weeks.map(w => {
              const heightPct = weekly.maxWeekCount > 0 ? Math.max(w.count > 0 ? 12 : 3, (w.count / weekly.maxWeekCount) * 100) : 3;
              const isCurrent = w.index === 0;
              return (
                <div className="chart-bar-item" key={w.label}>
                  <span className="bar-val-badge">{w.count > 0 ? w.count : ''}</span>
                  <div className="chart-bar-fill-wrap">
                    <div
                      className={`chart-bar-fill ${w.count > 0 ? 'has-data' : ''} ${isCurrent ? 'is-today' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${w.label}: ${w.count} subtopics completed`}
                    />
                  </div>
                  <div className="bar-date-label">
                    <span className="bar-day-name">{w.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </>
    )}

    {/* ASSESSMENT GENERATOR LINKED TO PROGRESS */}
    <div className="section-top section-spaced">
      <div>
        <span className="eyebrow">SELF-ASSESSMENT</span>
        <h2>Generate weekend test prompt</h2>
      </div>
      <div className="range-chips">
        <button className="chip-btn" onClick={() => applyQuickPeriod(7)}>This week</button>
        <button className="chip-btn" onClick={() => applyQuickPeriod(14)}>Past 2 weeks</button>
        <button className="chip-btn" onClick={() => applyQuickPeriod(30)}>Past month</button>
      </div>
    </div>

    <div className="weekend-layout">
      <section className="panel assessment-form">
        <h2>Choose test scope</h2>
        <p className="muted">Only completed subtopics from this period will be tested.</p>

        <div className="date-fields">
          <label className="field-label">From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label className="field-label">To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        </div>

        <label className="field-label">Study part
          <select value={part} onChange={e => setPart(e.target.value)}>
            <option value="">All parts</option>
            {Object.entries(partLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>

        <div className="date-fields">
          <label className="field-label">Assessment mode
            <select value={mode} onChange={e => setMode(e.target.value)}>
              {['Combined', 'CTET', 'NET', 'Topic mastery'].map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="field-label">Questions
            <input type="number" value={count} min={1} max={100} onChange={e => setCount(Number(e.target.value))} />
          </label>
        </div>

        <label className="checkbox-label include-older">
          <input type="checkbox" checked={older} onChange={e => setOlder(e.target.checked)} />
          <span>Include earlier completed material for revision<small>Up to 60 items; revision flags come first.</small></span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button
          className="button full-width"
          disabled={!!error || !scope || (scope.current.length + scope.older.length) === 0 || !Number.isInteger(count) || count < 1 || count > 100}
          onClick={() => onPrompt({ title: 'Your weekend assessment prompt', text: makeAssessmentPrompt(scope, { mode, count }) })}
        >
          <Icon name="spark" size={18} />Build assessment prompt<Icon name="arrow" size={18} />
        </button>
        <p className="small-help">Copies a prompt formulated from your exact completed subtopic IDs to paste into your AI assistant.</p>
      </section>

      <section className="panel assessment-scope">
        <div className="section-top"><h2>What will be included</h2><Icon name="list" size={20} /></div>
        <div className="scope-numbers">
          <div><strong>{scope?.current.length || 0}</strong><span>completed in this period</span></div>
          <div><strong>{scope?.older.length || 0}</strong><span>earlier revision items</span></div>
        </div>
        {scope && (scope.current.length + scope.older.length) > 0 ? (
          <div className="scope-list">
            {[...scope.current, ...scope.older].slice(0, 18).map(i => (
              <button key={i.id} onClick={() => navigate(`topic/${i.topicId}`)}>
                <span className="code-tag">{i.id}</span>
                <span>{i.text}</span>
              </button>
            ))}
            {(scope.current.length + scope.older.length) > 18 && (
              <p className="muted">And {(scope.current.length + scope.older.length) - 18} more eligible items in the prompt.</p>
            )}
          </div>
        ) : (
          <EmptyState icon="calendar" title="No completed items in this period">
            As you check subtopics complete, their completion dates make them available here for assessment.
          </EmptyState>
        )}
      </section>
    </div>
  </>;
}
