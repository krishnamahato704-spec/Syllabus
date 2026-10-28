import React, { useEffect, useMemo, useRef, useState } from 'react';
import syllabus from './data/syllabus.json';
import { firebaseConfig } from './firebase-config.js';
import { createCloudStore } from './cloud.js';
import { buildIndex, filterTopics, progressStats, normalizeEntry, applyPatch, changedStudyFields, indiaDay, addDays,
  assessmentScope, makeAssessmentPrompt, makeTopicPrompt, makeBackup, parseBackup, completedMarkdown, fullMarkdown } from './study.js';
import { Icon, ProgressBar, EmptyState, Modal, ExternalLink } from './components.jsx';

const index = buildIndex(syllabus);
const PREVIEW_KEY = 'study-atlas-preview-v1';
const partLabels = { 1: 'School subjects', 2: 'History', 3: 'CTET Paper II', 4: 'UGC NET Paper I' };
const partDescriptions = { 1: 'Geography, Civics, Economics and allied subjects', 2: 'One course, from school foundations to NET depth', 3: 'CDP, English I, Hindi II and teaching methods', 4: 'Teaching, research and the general aptitude units' };
const shortDate = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(value));
const download = (name, text, type = 'text/plain;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
};
function readPreview() {
  try { const raw = localStorage.getItem(PREVIEW_KEY); return { entries: raw ? parseBackup(raw, index).entries : {}, error: '' }; }
  catch { return { entries: {}, error: 'Saved preview data could not be read. It has not been overwritten. Import a backup or make a new change to start again.' }; }
}

export default function App() {
  const previewStart = useMemo(readPreview, []);
  const [preview, setPreview] = useState(previewStart.entries);
  const [previewSaved, setPreviewSaved] = useState(!previewStart.error);
  const [cloud, setCloud] = useState({ configured: false, phase: 'checking', user: null, entries: {}, pending: [], error: '' });
  const store = useRef(null);
  const [route, setRoute] = useState(location.hash.slice(1) || 'overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [part, setPart] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);
  const [toast, setToast] = useState(previewStart.error);
  const [prompt, setPrompt] = useState(null);
  const [noteItem, setNoteItem] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const inputRef = useRef(null);
  const sidebarRef = useRef(null);
  const previewMode = cloud.phase === 'unconfigured' || cloud.phase === 'signedout';
  const entries = cloud.user ? cloud.entries : previewMode ? preview : {};
  const accountKey = cloud.user?.uid || 'preview';
  const canEdit = !importBusy && (previewMode || (cloud.phase === 'ready' && online));
  const stats = useMemo(() => progressStats(index, entries), [entries]);
  const topics = useMemo(() => filterTopics(index, entries, { query, part, subject, status }), [query, part, subject, status, entries]);
  const currentTopic = route.startsWith('topic/') ? index.topicMap[route.slice(6)] : null;
  const page = route.startsWith('topic/') ? 'topic' : route;

  useEffect(() => {
    try { store.current = createCloudStore(firebaseConfig, index, setCloud); }
    catch (e) { setCloud(c => ({ ...c, phase: 'error', error: e.message })); }
    return () => store.current?.destroy();
  }, []);
  useEffect(() => {
    const fn = () => { setRoute(location.hash.slice(1) || 'overview'); setMobileNav(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', fn); return () => window.removeEventListener('hashchange', fn);
  }, []);
  useEffect(() => {
    const fn = () => setOnline(navigator.onLine);
    window.addEventListener('online', fn); window.addEventListener('offline', fn);
    return () => { window.removeEventListener('online', fn); window.removeEventListener('offline', fn); };
  }, []);
  useEffect(() => { setPrompt(null); setNoteItem(null); setImportPreview(null); }, [accountKey]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 6500); return () => clearTimeout(id); }, [toast]);
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
  useEffect(() => {
    if (!mobileNav) return;
    const previous = document.activeElement;
    const container = sidebarRef.current;
    const controls = () => [...container.querySelectorAll('a[href],button:not(:disabled)')].filter(el => el.getClientRects().length);
    controls()[0]?.focus();
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); setMobileNav(false); }
      if (e.key === 'Tab') {
        const list = controls(), first = list[0], last = list.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    const originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = originalOverflow; previous?.focus(); };
  }, [mobileNav]);

  function navigate(target) { location.hash = target; setMobileNav(false); }
  function browse(nextPart = '', nextStatus = 'all') {
    setPart(String(nextPart)); setSubject(''); setQuery(''); setStatus(nextStatus); navigate('syllabus');
  }
  function persistPreview(next) {
    setPreview(next);
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify(makeBackup(next, index))); setPreviewSaved(true); }
    catch { setPreviewSaved(false); setToast('Browser storage is unavailable. Your changes remain in this tab; download a backup before closing it.'); }
  }
  async function update(id, patch) {
    if (!canEdit) { setToast('Wait for cloud sync or reconnect before editing.'); return false; }
    try {
      if (previewMode) persistPreview({ ...preview, [id]: applyPatch(preview[id], patch) });
      else await store.current.patch(id, patch);
      return true;
    } catch (e) { setToast(e.message); return false; }
  }
  function openPrompt(topic, kind, itemId = '') {
    setPrompt({ title: `${kind === 'review' ? 'Check understanding' : 'Research'} · ${itemId || topic.id}`, text: makeTopicPrompt(topic, entries, kind, syllabus.sources, itemId) });
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setToast('Prompt copied. Paste it into the AI you use.'); }
    catch { setToast('Automatic copying is unavailable here. Select the prompt text and copy it manually.'); }
  }
  async function signIn() {
    if (!store.current?.configured) { navigate('settings'); setToast('Google sign-in needs the Firebase setup in the publishing guide. You can try the checklist in preview mode.'); return; }
    setAuthBusy(true); try { await store.current.signIn(); } catch (e) { setToast(e.message); } finally { setAuthBusy(false); }
  }
  async function signOut() {
    setAuthBusy(true); try { await store.current.signOut(); } catch (e) { setToast(e.message); } finally { setAuthBusy(false); }
  }
  async function readImport(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 32 * 1024 * 1024) throw new Error('Choose a Study Atlas backup smaller than 32 MB.');
      const parsed = parseBackup(await file.text(), index);
      setImportPreview({ ...parsed, owner: accountKey });
    } catch (e) { setToast(e.message); }
  }
  async function confirmImport() {
    if (!canEdit || !importPreview) return;
    if (importPreview.owner !== accountKey) { setImportPreview(null); setToast('The account changed. Select the backup again.'); return; }
    setImportBusy(true); setImportProgress('Starting import…');
    try {
      if (previewMode) persistPreview({ ...preview, ...importPreview.entries });
      else await store.current.importRecords(importPreview.entries, (n, total) => setImportProgress(`${n} of ${total} records saved`));
      setToast('Backup merged into your current progress.'); setImportPreview(null);
    } catch (e) { setToast(e.message); }
    finally { setImportBusy(false); setImportProgress(''); }
  }
  const cloudLabel = cloud.user ? cloud.pending.length ? 'Saving changes…' : cloud.phase === 'ready' && online ? 'Synced to your account' : cloud.phase === 'offline' || !online ? 'Offline · editing paused' : cloud.phase === 'error' ? 'Sync needs attention' : 'Loading your progress…'
    : previewMode ? previewSaved ? 'Preview · saved in this browser' : 'Preview · unsaved changes' : 'Checking your account…';
  const activeMain = page === 'topic' ? 'syllabus' : page;
  const mainNav = [['overview', 'grid', 'Overview'], ['syllabus', 'list', 'Syllabus'], ['weekend', 'calendar', 'Weekend review'], ['settings', 'settings', 'Sources & settings']];

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
      <div className="sidebar-bottom"><span className={`status-dot ${cloud.user && cloud.phase === 'ready' && online ? 'green' : ''}`} /><span>{cloudLabel}</span></div>
    </aside>

    <div className="main-shell" inert={mobileNav ? true : undefined}>
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(!mobileNav)}><Icon name="menu" /></button>
        <div className="breadcrumb">My workspace <Icon name="chevron" size={13} /><span>{page === 'topic' ? currentTopic?.id || 'Topic' : mainNav.find(n => n[0] === page)?.[2] || 'Overview'}</span></div>
        <div className="topbar-actions"><span className="source-date">Source base · 28 Oct 2026</span>
          {cloud.user ? <><span className="avatar" title={cloud.user.email}>{(cloud.user.name || cloud.user.email).slice(0,1).toUpperCase()}</span><span className="account-name">{cloud.user.name || cloud.user.email}</span><button className="icon-button" title="Sign out" aria-label="Sign out" disabled={authBusy || cloud.pending.length > 0 || importBusy} onClick={signOut}><Icon name="logout" /></button></>
            : <button className="button button-small" onClick={signIn} disabled={authBusy}><Icon name="user" size={17} />{authBusy ? 'Opening sign-in…' : 'Sign in with Google'}</button>}
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        {cloud.error && <div className="notice error" role="alert"><Icon name="info" /><span>{cloud.error}</span><button onClick={() => store.current?.retry()} className="text-button">Retry sync</button></div>}
        {cloud.user && (!online || cloud.phase === 'offline') && <div className="notice" role="status"><Icon name="cloud" /><span>You can read your checklist while offline. Reconnect to save changes.</span></div>}
        {page === 'overview' && <Overview {...{ entries, stats, navigate, browse, previewMode, signIn }} />}
        {page === 'syllabus' && <>
          <PageHeading eyebrow="THE COMPLETE CHECKLIST" title="A clear path through your subjects." description="Choose a topic, study its subtopics, and check each one when you understand it." />
          <div className="syllabus-toolbar">
            <label className="search-box"><Icon name="search" /><input type="search" aria-label="Search topics, subtopics or IDs" placeholder="Search a topic, concept or ID…" value={query} onChange={e => { setQuery(e.target.value); setPart(''); setSubject(''); }} /><kbd>/</kbd></label>
            <div className="filter-row"><label><span className="sr-only">Study part</span><select aria-label="Study part" value={part} onChange={e => { setPart(e.target.value); setSubject(''); }}>{[['','All four parts'],...Object.entries(partLabels)].map(([v,t]) => <option value={v} key={v}>{t}</option>)}</select></label>
              <label><span className="sr-only">Subject</span><select aria-label="Subject" value={subject} onChange={e => setSubject(e.target.value)}><option value="">All subjects</option>{[...new Set(index.topics.filter(t => !part || t.part === Number(part)).map(t => t.subject))].map(s => <option key={s}>{s}</option>)}</select></label>
              <label><span className="sr-only">Learning status</span><select aria-label="Learning status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Any status</option><option value="not-started">Not started</option><option value="studying">Studying</option><option value="complete">Complete</option><option value="revision">Needs revision</option></select></label>
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
          <div className="topic-actions"><button className="button" onClick={() => openPrompt(currentTopic,'research')}><Icon name="spark" size={17} />Research this topic</button><button className="button button-quiet" onClick={() => openPrompt(currentTopic,'review')}><Icon name="check" size={17} />Check my understanding</button><span className="save-label"><Icon name="cloud" size={15} />{cloudLabel}</span></div>
          <div className="learning-guide"><strong>When to check a box</strong><span>After studying, checking the facts and answering questions on that subtopic. Copying a prompt does not mark it complete.</span></div>
          <section className="checklist-panel" aria-label="Topic subtopics"><div className="panel-label"><span>{currentTopic.items.length} SUBTOPICS</span><span>PROGRESS & NOTES</span></div>
            {currentTopic.items.map(item => <SubtopicRow key={item.id} item={item} state={normalizeEntry(entries[item.id])} disabled={!canEdit || cloud.pending.includes(item.id)} onChange={patch => update(item.id,patch)} onNotes={() => setNoteItem(item)} onResearch={() => openPrompt(currentTopic,'research',item.id)} />)}
          </section>
          <section className="topic-sources"><h2>Reference links for this unit</h2><p>Use these official sources alongside your research.</p><div className="source-links">{currentTopic.sources.map(k => syllabus.sources[k] && <ExternalLink key={k} href={syllabus.sources[k].url}>{syllabus.sources[k].name}</ExternalLink>)}</div></section>
        </> : <EmptyState title="This topic ID is not in the checklist" action={<button className="button" onClick={() => browse()}>Browse the syllabus</button>}>Use one of the original numbered topics.</EmptyState>)}
        {page === 'weekend' && <Weekend entries={entries} onPrompt={setPrompt} navigate={navigate} />}
        {page === 'settings' && <Settings {...{ entries, cloud, canEdit, importBusy, signIn, inputRef }} onBackup={() => download(`study-atlas-backup-${indiaDay()}.json`,JSON.stringify(makeBackup(entries,index),null,2),'application/json')} onComplete={() => download('completed-study-checklist.md',completedMarkdown(index,entries))} onFull={() => download('master-study-checklist.md',fullMarkdown(index,entries))} />}
        {!['overview','syllabus','topic','weekend','settings'].includes(page) && <EmptyState title="This page is not available" action={<button className="button" onClick={() => navigate('overview')}>Go to overview</button>}>Your checklist is available from the navigation.</EmptyState>}
        <footer className="page-footer"><span>Study Atlas</span><span>204 topics · 1,602 subtopics · One combined History course</span></footer>
      </main>
    </div>
    <input className="sr-only" ref={inputRef} type="file" accept=".json,application/json" aria-label="Import a progress backup" onChange={readImport} />
    {toast && <div className="toast" role="status"><Icon name="info" size={18} /><span>{toast}</span><button aria-label="Dismiss message" onClick={() => setToast('')}><Icon name="close" size={16} /></button></div>}
    {prompt && <Modal title={prompt.title} className="prompt-modal" onClose={() => setPrompt(null)}><p className="modal-description">Copy this into the AI you use. Its scope comes from the checklist IDs below.</p><textarea aria-label="Prepared AI prompt" className="prompt-text" readOnly value={prompt.text} onFocus={e => e.target.select()} /><div className="modal-actions"><button className="button button-quiet" onClick={() => download('study-prompt.txt',prompt.text)}><Icon name="download" size={17} />Download text</button><button className="button" onClick={() => copy(prompt.text)}>Copy prompt<Icon name="arrow" size={17} /></button></div></Modal>}
    {noteItem && <NotesModal item={noteItem} entry={normalizeEntry(entries[noteItem.id])} disabled={!canEdit || cloud.pending.includes(noteItem.id)} onClose={() => setNoteItem(null)} onSave={async patch => { if (await update(noteItem.id,patch)) setNoteItem(null); }} />}
    {importPreview && <Modal title="Import your saved progress" onClose={() => setImportPreview(null)} busy={importBusy}><p>This backup contains <strong>{Object.keys(importPreview.entries).length} subtopic records</strong>. It will merge into {cloud.user ? 'your signed-in account' : 'this browser’s preview progress'}.</p><p>Records with the same IDs will use the backup's status, notes and completion dates. Other existing records stay as they are.</p><p className="muted">The entire file has been validated. If a cloud import is interrupted, the saved count is reported and you can retry the same file.</p>{importBusy && <p role="status">{importProgress}</p>}<div className="modal-actions"><button className="button button-quiet" disabled={importBusy} onClick={() => setImportPreview(null)}>Cancel</button><button className="button" disabled={importBusy || !canEdit} onClick={confirmImport}>{importBusy ? 'Importing…' : 'Merge progress'}</button></div></Modal>}
  </div>;
}

function PageHeading({ eyebrow, title, description, children }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>;
}

function Overview({ entries, stats, navigate, browse, previewMode, signIn }) {
  const next = index.topics.find(t => t.items.some(i => entries[i.id]?.status === 'studying' || entries[i.id]?.needsRevision)) || index.topics.find(t => t.items.some(i => entries[i.id]?.status !== 'complete')) || index.topics[0];
  const recent = index.items.filter(i => entries[i.id]?.updatedAt).sort((a,b) => Date.parse(entries[b.id].updatedAt)-Date.parse(entries[a.id].updatedAt)).slice(0,4);
  const completedThisWeek = assessmentScope(index,entries,{fromDay:addDays(indiaDay(),-6),toDay:indiaDay()}).current.length;
  return <>
    <PageHeading eyebrow="YOUR LEARNING WORKSPACE" title="Social Science, one topic at a time." description="The complete school, CTET and NET checklist, with a place for your progress."><span className="edition-badge"><Icon name="book" size={17} />Master checklist · v2</span></PageHeading>
    <div className="stat-grid">{[['check','Completed',stats.complete,'of 1,602 subtopics'],['clock','Studying',stats.studying,'currently in progress'],['flag','To revisit',stats.revision,'flagged for revision'],['calendar','This week',completedThisWeek,'completed in the last 7 days']].map(([icon,label,value,detail]) => <div className="stat-card" key={label}><span className="stat-icon"><Icon name={icon} size={19} /></span><span className="stat-label">{label}</span><strong>{value.toLocaleString('en-IN')}</strong><small>{detail}</small></div>)}</div>
    <div className="overview-middle"><section className="continue-card"><span className="eyebrow">{stats.studying || stats.revision ? 'CONTINUE STUDYING' : 'A PLACE TO BEGIN'}</span><span className="continue-code">{next.id} / {next.subject}</span><h2>{next.title}</h2><p>{next.items.length} clearly listed subtopics. Open the checklist, prepare your notes and check your understanding.</p><button className="button" onClick={() => navigate(`topic/${next.id}`)}>Open topic<Icon name="arrow" size={17} /></button><div className="map-lines" aria-hidden="true"><span /><span /><span /><span /><b>01</b></div></section>
      <section className="overall-card"><div className="section-top"><h2>Overall progress</h2><span>{stats.complete}/{stats.total}</span></div><div className="progress-orbit" style={{'--progress':`${stats.percent*3.6}deg`}}><span><strong>{stats.percent}%</strong><small>complete</small></span></div><p>A main topic is complete when every one of its subtopics has been studied and checked.</p></section></div>
    <div className="section-top section-spaced"><div><span className="eyebrow">THE FOUR PARTS</span><h2>Your study map</h2></div><button className="text-button" onClick={() => browse()}>View full syllabus<Icon name="arrow" size={16} /></button></div>
    <div className="part-grid">{[1,2,3,4].map(n => {
      const items=index.items.filter(i=>i.part===n), s=progressStats(items,entries), count=index.topics.filter(t=>t.part===n).length;
      return <button className={`part-card part-${n}`} key={n} onClick={() => browse(n)}><div className="part-card-top"><span>PART 0{n}</span><Icon name="arrow" size={18} /></div><h3>{partLabels[n]}</h3><p>{partDescriptions[n]}</p><div className="part-card-bottom"><span>{count} topics · {items.length} subtopics</span><b>{s.percent}%</b></div><ProgressBar value={s.percent} label={`${partLabels[n]} progress`} /></button>;
    })}</div>
    <div className="overview-bottom"><section className="panel recent-panel"><div className="section-top"><h2>Recent work</h2><Icon name="clock" size={18} /></div>{recent.length ? recent.map(i => <button className="recent-row" key={i.id} onClick={() => navigate(`topic/${i.topicId}`)}><span className="code-tag">{i.id}</span><span>{i.text}<small>{i.topicTitle}</small></span><time>{shortDate(entries[i.id].updatedAt)}</time></button>) : <p className="muted empty-copy">Your recent subtopics will appear here after you start studying.</p>}</section><section className="routine-card"><Icon name="calendar" size={25} /><h2>Make the weekend test specific.</h2><p>Use completed subtopic IDs from a date range, then add earlier material for revision.</p><button className="text-button" onClick={() => navigate('weekend')}>Prepare an assessment prompt<Icon name="arrow" size={16} /></button></section></div>
    {previewMode && <div className="preview-note"><Icon name="cloud" /><span><strong>You're in preview mode.</strong> Progress stays in this browser. Google sign-in connects your private checklist across devices once Firebase is configured.</span><button className="text-button" onClick={signIn}>Connect sign-in<Icon name="arrow" size={15} /></button></div>}
  </>;
}

function TopicCard({ topic, entries, navigate }) {
  const s=progressStats(topic.items,entries);
  return <button className="topic-card" onClick={() => navigate(`topic/${topic.id}`)}><div className="topic-card-top"><span className="code-tag">{topic.id}</span><span className="topic-subject">{topic.subject}</span><Icon name="arrow" size={17} /></div><h2>{topic.title}</h2><p>{topic.unitTitle.replace(/ - NET Unit [IVX]+$/,'')}</p><div className="topic-preview">{topic.visibleItems.slice(0,2).map(i=><span key={i.id}><i className={entries[i.id]?.status==='complete'?'checked':''}>{entries[i.id]?.status==='complete'&&<Icon name="check" size={10}/>}</i>{i.text}</span>)}</div><div className="topic-card-bottom"><span>{s.complete}/{s.total} complete</span><span>{s.revision>0?`${s.revision} to revisit`:s.studying>0?'Studying':s.complete===s.total?'Complete':'Not started'}</span></div><ProgressBar value={s.percent} label={`${topic.id} progress`}/></button>;
}

function SubtopicRow({ item, state, disabled, onChange, onNotes, onResearch }) {
  return <div className={`subtopic-row ${state.status==='complete'?'is-complete':''}`}><input type="checkbox" id={`complete-${item.id}`} checked={state.status==='complete'} disabled={disabled} onChange={e=>onChange({status:e.target.checked?'complete':'studying'})} aria-label={`Mark ${item.id} complete`} /><div className="subtopic-copy"><label htmlFor={`complete-${item.id}`}><span className="item-id">{item.id}</span><span>{item.text}</span></label>{state.notes&&<button className="note-snippet" onClick={onNotes}>{state.notes.slice(0,150)}{state.notes.length>150?'…':''}</button>}<div className="row-status">{state.status==='studying'&&<span className="badge">Studying</span>}{state.needsRevision&&<span className="badge revision">Needs revision</span>}{state.status==='complete'&&state.completedAt&&<small>Completed {shortDate(state.completedAt)}</small>}</div></div><div className="subtopic-actions">{state.status==='not-started'&&<button className="start-button" disabled={disabled} onClick={()=>onChange({status:'studying'})}>Start</button>}<button className={`icon-button ${state.needsRevision?'flagged':''}`} disabled={disabled} onClick={()=>onChange({needsRevision:!state.needsRevision})} aria-pressed={state.needsRevision} aria-label={`${state.needsRevision?'Remove':'Add'} revision flag for ${item.id}`} title="Revision flag"><Icon name="flag" size={17}/></button><button className={`icon-button ${state.notes?'has-note':''}`} onClick={onNotes} aria-label={`Notes for ${item.id}`} title="Notes and status"><Icon name="note" size={18}/></button><button className="icon-button" onClick={onResearch} aria-label={`Research prompt for ${item.id}`} title="Research prompt"><Icon name="spark" size={17}/></button></div></div>;
}

function NotesModal({ item, entry, disabled, onClose, onSave }) {
  const original = useRef(entry);
  const [notes,setNotes]=useState(entry.notes),[status,setStatus]=useState(entry.status),[revision,setRevision]=useState(entry.needsRevision),[saving,setSaving]=useState(false);
  return <Modal title={`${item.id} · Notes & progress`} onClose={onClose} busy={saving}><p className="modal-description">{item.text}</p><label className="field-label">Learning status<select value={status} disabled={disabled||saving} onChange={e=>setStatus(e.target.value)}><option value="not-started">Not started</option><option value="studying">Studying</option><option value="complete">Complete — studied and checked</option></select></label><label className="field-label">Your notes<textarea autoFocus className="notes-text" value={notes} onChange={e=>setNotes(e.target.value)} maxLength={4000} disabled={disabled||saving} placeholder="Sources, explanations, questions or corrections…"/></label><div className="notes-bottom"><label className="checkbox-label"><input type="checkbox" checked={revision} disabled={disabled||saving} onChange={e=>setRevision(e.target.checked)}/>Revisit this subtopic</label><small>{notes.length}/4,000</small></div><div className="modal-actions"><button className="button button-quiet" disabled={saving} onClick={onClose}>Cancel</button><button className="button" disabled={disabled||saving} onClick={async()=>{const patch=changedStudyFields(original.current,{notes,status,needsRevision:revision});if(!Object.keys(patch).length){onClose();return;}setSaving(true);await onSave(patch);setSaving(false);}}>{saving?'Saving…':'Save notes'}</button></div></Modal>;
}

function Weekend({ entries, onPrompt, navigate }) {
  const [from,setFrom]=useState(addDays(indiaDay(),-6)),[to,setTo]=useState(indiaDay()),[older,setOlder]=useState(true),[mode,setMode]=useState('Combined'),[count,setCount]=useState(30),[part,setPart]=useState('');
  let scope,error='';try{scope=assessmentScope(index,entries,{fromDay:from,toDay:to,includeOlder:older,part});}catch(e){error=e.message;}
  return <><PageHeading eyebrow="LEARN · CHECK · REVISIT" title="A weekend review of your actual work." description="Prepare questions from completed subtopics. Unchecked items stay outside the assessment scope."/><div className="weekend-layout"><section className="panel assessment-form"><h2>Choose the scope</h2><p className="muted">Completion dates use India time (Asia/Kolkata).</p><div className="date-fields"><label className="field-label">From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="field-label">To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div><label className="field-label">Study part<select value={part} onChange={e=>setPart(e.target.value)}><option value="">All parts</option>{Object.entries(partLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><div className="date-fields"><label className="field-label">Assessment mode<select value={mode} onChange={e=>setMode(e.target.value)}>{['Combined','CTET','NET','Topic mastery'].map(m=><option key={m}>{m}</option>)}</select></label><label className="field-label">Questions<input type="number" value={count} min={1} max={100} onChange={e=>setCount(Number(e.target.value))}/></label></div><label className="checkbox-label include-older"><input type="checkbox" checked={older} onChange={e=>setOlder(e.target.checked)}/><span>Include earlier completed material for revision<small>Up to 60 items; revision flags come first.</small></span></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button full-width" disabled={!!error||!scope||(scope.current.length+scope.older.length)===0||!Number.isInteger(count)||count<1||count>100} onClick={()=>onPrompt({title:'Your weekend assessment prompt',text:makeAssessmentPrompt(scope,{mode,count})})}><Icon name="spark" size={18}/>Build assessment prompt<Icon name="arrow" size={18}/></button><p className="small-help">Copy it into your AI chat. Questions come first; marking and explanations follow after you answer.</p></section><section className="panel assessment-scope"><div className="section-top"><h2>What will be included</h2><Icon name="list" size={20}/></div><div className="scope-numbers"><div><strong>{scope?.current.length||0}</strong><span>completed in this period</span></div><div><strong>{scope?.older.length||0}</strong><span>earlier revision items</span></div></div>{scope&&scope.current.length+scope.older.length>0?<div className="scope-list">{[...scope.current,...scope.older].slice(0,18).map(i=><button key={i.id} onClick={()=>navigate(`topic/${i.topicId}`)}><span className="code-tag">{i.id}</span><span>{i.text}</span></button>)}{scope.current.length+scope.older.length>18&&<p className="muted">And {scope.current.length+scope.older.length-18} more eligible items in the prompt.</p>}</div>:<EmptyState icon="calendar" title="No completed items in this scope">After you study and check subtopics, their completion dates will make them available here.</EmptyState>}</section></div><section className="weekend-principles"><div><span>01</span><h3>Keep the scope exact.</h3><p>Every question carries an original subtopic ID.</p></div><div><span>02</span><h3>Check understanding.</h3><p>Explain answers and use sources or calculations where relevant.</p></div><div><span>03</span><h3>Bring weak items back.</h3><p>Flag them for revision without erasing previous completion.</p></div></section></>;
}

function Settings({ entries, cloud, canEdit, importBusy, signIn, inputRef, onBackup, onComplete, onFull }) {
  return <><PageHeading eyebrow="YOUR DATA & REFERENCES" title="Keep your work portable." description="Back up your progress, connect your account and return to the official source material."/><div className="settings-grid"><section className="panel"><div className="section-top"><h2>Progress backups</h2><Icon name="download"/></div><p>Download a backup before moving between preview and your signed-in account. Imports merge records by their exact IDs.</p><div className="settings-buttons"><button className="button" onClick={onBackup}><Icon name="download" size={17}/>Export backup</button><button className="button button-quiet" disabled={!canEdit||importBusy} onClick={()=>inputRef.current?.click()}><Icon name="upload" size={17}/>Import backup</button></div><hr/><button className="download-row" onClick={onComplete}><span><strong>Completed checklist</strong><small>Markdown for your AI review and assessments</small></span><Icon name="download" size={19}/></button><button className="download-row" onClick={onFull}><span><strong>Full checklist with your progress</strong><small>All 1,602 subtopics, original IDs intact</small></span><Icon name="download" size={19}/></button></section><section className="panel cloud-panel"><div className="section-top"><h2>Sign-in & cloud sync</h2><Icon name="cloud"/></div><span className={`connection-tag ${cloud.user&&cloud.phase==='ready'?'connected':''}`}>{cloud.user?cloud.phase==='ready'?'Connected to your account':'Connecting / needs attention':cloud.configured?'Ready for sign-in':'Setup required for publishing'}</span><p>{cloud.user?'Your own checklist records sync through your Firebase account. Other users have their own private progress.':'Google sign-in connects progress between your phone and computer. The publishing package includes the Firebase connection and security rules.'}</p>{!cloud.user&&<button className="button button-quiet" onClick={signIn}>Sign in with Google<Icon name="arrow" size={17}/></button>}<details className="setup-details"><summary>Publishing setup guide</summary><ol><li>Create a Firebase web app and enable Google sign-in.</li><li>Create Firestore and publish the supplied <code>firestore.rules</code>.</li><li>Put its public web configuration in <code>src/firebase-config.js</code>.</li><li>Import the source project into Google AI Studio through GitHub.</li><li>Add the app's preview/published hostnames to Firebase's authorised domains.</li><li>Test sign-in and the same completed item on two devices before relying on cloud sync.</li></ol><p>The downloadable single HTML is a preview. Google authentication needs an authorised HTTP(S) site.</p><ExternalLink href="https://ai.google.dev/gemini-api/docs/aistudio-build-mode">Google AI Studio import guide</ExternalLink><ExternalLink href="https://firebase.google.com/docs/auth/web/google-signin">Firebase Google sign-in guide</ExternalLink></details></section></div><section className="panel exam-panel"><h2>Exam structures & study boundaries</h2><p className="muted">One combined History course supplies the subject content. CTET teaching methods remain in Part III.</p><div className="exam-columns">{syllabus.exams.map(e=><details key={e.title}><summary>{e.title}</summary><ul>{e.items.map(t=><li key={t}>{t}</li>)}</ul></details>)}</div></section><section className="references-section"><div className="section-top"><div><span className="eyebrow">OFFICIAL REFERENCE LINKS</span><h2>Return to the source.</h2></div><span className="source-date">Checked 28 October 2026</span></div><div className="reference-grid">{Object.entries(syllabus.sources).map(([k,s])=><ExternalLink key={k} href={s.url}>{s.name}</ExternalLink>)}</div></section></>;
}
