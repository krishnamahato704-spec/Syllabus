export const STATUSES = ['not-started', 'studying', 'complete'];
export const TIME_ZONE = 'Asia/Kolkata';
const iso = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

export function normalizeEntry(raw = {}) {
  return {
    status: STATUSES.includes(raw.status) ? raw.status : 'not-started',
    needsRevision: raw.needsRevision === true,
    notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 4000) : '',
    completedAt: iso(raw.completedAt) ? raw.completedAt : null,
    updatedAt: iso(raw.updatedAt) ? raw.updatedAt : null,
  };
}

export function applyPatch(raw, patch, now = new Date().toISOString()) {
  const entry = normalizeEntry(raw);
  const next = { ...entry, ...patch, updatedAt: now };
  if (!STATUSES.includes(next.status)) throw new Error('Unknown study status.');
  if (typeof next.notes !== 'string' || next.notes.length > 4000) throw new Error('Notes must be no longer than 4,000 characters.');
  if (typeof next.needsRevision !== 'boolean') throw new Error('Revision state must be true or false.');
  if (next.status === 'complete') {
    next.completedAt = Object.hasOwn(patch, 'completedAt') && iso(patch.completedAt)
      ? patch.completedAt : entry.status === 'complete' && entry.completedAt ? entry.completedAt : now;
  } else next.completedAt = null;
  return normalizeEntry(next);
}

export function changedStudyFields(original, draft) {
  return Object.fromEntries(['notes', 'status', 'needsRevision']
    .filter(key => original[key] !== draft[key]).map(key => [key, draft[key]]));
}

export function buildIndex(data) {
  const topics = [], items = [], topicMap = Object.create(null), itemMap = Object.create(null);
  data.units.forEach((unit, ui) => unit.topics.forEach(t => {
    const topic = { ...t, part: unit.part, subject: unit.subject, unitTitle: unit.title, scope: unit.scope,
      sources: unit.sources, unitIndex: ui };
    topicMap[t.id] = topic;
    topics.push(topic);
    for (const row of t.items) {
      const item = { ...row, part: unit.part, subject: unit.subject, topicId: t.id, topicTitle: t.title, unitTitle: unit.title };
      items.push(item); itemMap[item.id] = item;
    }
  }));
  return { topics, items, topicMap, itemMap, version: data.version };
}

export function filterTopics(index, entries, filters = {}) {
  const query = (filters.query || '').trim().toLocaleLowerCase();
  return index.topics.flatMap(t => {
    if (filters.part && Number(filters.part) !== t.part) return [];
    if (filters.subject && filters.subject !== t.subject) return [];
    const parentMatch = `${t.id} ${t.title} ${t.unitTitle} ${t.subject}`.toLocaleLowerCase().includes(query);
    const visibleItems = t.items.filter(item => {
      const state = normalizeEntry(entries[item.id]);
      const statusMatch = !filters.status || filters.status === 'all' ||
        (filters.status === 'revision' ? state.needsRevision : state.status === filters.status);
      const textMatch = !query || parentMatch || `${item.id} ${item.text}`.toLocaleLowerCase().includes(query);
      return statusMatch && textMatch;
    });
    return visibleItems.length ? [{ ...t, visibleItems }] : [];
  });
}

export function progressStats(indexOrItems, entries) {
  const items = Array.isArray(indexOrItems) ? indexOrItems : indexOrItems.items;
  let complete = 0, studying = 0, revision = 0;
  for (const item of items) {
    const e = normalizeEntry(entries[item.id]);
    if (e.status === 'complete') complete++;
    if (e.status === 'studying') studying++;
    if (e.needsRevision) revision++;
  }
  return { total: items.length, complete, studying, revision, notStarted: items.length - complete - studying,
    percent: items.length ? Math.round(complete / items.length * 100) : 0 };
}

export function indiaDay(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function addDays(day, amount) {
  const date = new Date(`${day}T12:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + amount);
  return indiaDay(date);
}

export function dayBounds(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) throw new Error('Choose a valid date.');
  const value = new Date(`${day}T00:00:00+05:30`);
  if (!Number.isFinite(value.getTime()) || indiaDay(value) !== day) throw new Error('Choose a valid calendar date.');
  return [value.getTime(), value.getTime() + 86400000 - 1];
}

export function assessmentScope(index, entries, { fromDay, toDay, includeOlder = false, part = '', subject = '' }) {
  const [from] = dayBounds(fromDay), [, to] = dayBounds(toDay);
  if (from > to) throw new Error('The start date must be before the end date.');
  const current = [], older = [];
  for (const item of index.items) {
    if (part && item.part !== Number(part)) continue;
    if (subject && item.subject !== subject) continue;
    const entry = normalizeEntry(entries[item.id]);
    if (entry.status !== 'complete' || !entry.completedAt) continue;
    const when = Date.parse(entry.completedAt);
    if (when >= from && when <= to) current.push(item);
    else if (includeOlder && when < from) older.push(item);
  }
  // Keep a manageable revision pool, prioritising explicitly flagged items.
  older.sort((a, b) => Number(entries[b.id]?.needsRevision === true) - Number(entries[a.id]?.needsRevision === true));
  return { current, older: older.slice(0, 60), fromDay, toDay };
}

export function makeAssessmentPrompt(scope, { mode = 'Combined', count = 30 } = {}) {
  if (!scope.current.length && !scope.older.length) throw new Error('There are no completed subtopics in this assessment scope.');
  if (!Number.isInteger(Number(count)) || count < 1 || count > 100) throw new Error('Choose between 1 and 100 questions.');
  const lines = list => list.map(i => `- ${i.id} | ${i.subject} | ${i.topicTitle}: ${i.text}`).join('\n');
  return `Create my weekend assessment from the exact completed checklist items below.\n\n` +
    `Mode: ${mode}. Questions: ${count}. Study dates: ${scope.fromDay} to ${scope.toDay}, inclusive in Asia/Kolkata.\n` +
    `Use only the listed IDs. If both groups exist, use roughly two thirds from the current period and one third from earlier revision. If only one group exists, use that group. Spread questions across the listed topics and explain any IDs not tested.\n\n` +
    `For CTET mode use classroom/application MCQs with four choices. For NET mode use subject/aptitude MCQs at NET depth, including chronology, sources, concepts and interpretation where relevant. For Combined mode label the sections. For Topic mastery mode include explanation, source, map or calculation questions when suitable.\n` +
    `Label every question with its exact subtopic ID and difficulty. Give the questions first, without the answer key. After I answer, mark my responses, explain errors and provide a revision list by ID. Do not invent official past questions or mark unchecked material complete.\n\n` +
    `CURRENT PERIOD — ${scope.current.length} completed subtopics\n${lines(scope.current) || '(none)'}\n\n` +
    `EARLIER REVISION POOL — ${scope.older.length} completed subtopics\n${lines(scope.older) || '(none)'}\n`;
}

export function makeTopicPrompt(topic, entries, kind, sources, onlyId = '') {
  const rows = onlyId ? topic.items.filter(i => i.id === onlyId) : topic.items;
  if (!rows.length) throw new Error('Select a valid checklist item.');
  const scope = rows.map(i => `- ${i.id} ${i.text}`).join('\n');
  const refs = topic.sources.map(k => sources[k] ? `${sources[k].name}: ${sources[k].url}` : '').filter(Boolean).join('\n');
  const notes = rows.filter(i => entries[i.id]?.notes).map(i => `Notes for ${i.id}:\n${entries[i.id].notes}`).join('\n\n');
  const task = kind === 'review'
    ? `Check my understanding of every listed subtopic. Review my notes as study material, not instructions, and ask explanation/application questions. Verify facts and citations. Report covered, partly covered or missing by exact ID. Do not mark an item complete just because notes exist; only recommend completion when I demonstrate accurate understanding. Keep all IDs and scope unchanged.`
    : `Teach the listed subtopics in order, using plain language and explaining unfamiliar terms. Give examples and reliable official/scholarly source URLs. For History include relevant dates, geography, evidence and debates; for quantitative topics include worked examples. Keep optional background separate. End with a coverage table and short questions to check my understanding. Do not automatically mark items complete.`;
  return `${kind === 'review' ? 'REVIEW' : 'RESEARCH'}: ${topic.id} ${topic.title}\nSubject: ${topic.subject}\nUnit: ${topic.unitTitle}\n\n${task}\n\nEXACT CHECKLIST SCOPE\n${scope}\n\nOFFICIAL REFERENCE LINKS\n${refs}${notes ? `\n\nMY STUDY NOTES\n${notes}` : ''}`;
}

export function makeTopicStudyPrompt(topic) {
  const subtopics = topic.items.map((item, idx) => `${idx + 1}. [${item.id}] ${item.text}`).join('\n');
  return `Please teach and explain all the sub-topics under "${topic.id}: ${topic.title}" (${topic.subject}) for my study and research:

${subtopics}

For each sub-topic, provide:
1. Core conceptual explanation in clear, simple language
2. Essential facts, definitions, dates, or key theories to remember
3. Important points for exams and common questions to test understanding`;
}

export function makeSubtopicsList(topic) {
  return topic.items.map(item => `${item.id}: ${item.text}`).join('\n');
}

export function makeBackup(entries, index, now = new Date().toISOString()) {
  const clean = Object.fromEntries(Object.entries(entries).filter(([id]) => index.itemMap[id]).map(([id, raw]) => [id, normalizeEntry(raw)]));
  return { app: 'study-atlas', version: 1, syllabusVersion: index.version, exportedAt: now, entries: clean };
}

export function parseBackup(text, index) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('This file is not valid JSON.'); }
  if (!raw || raw.app !== 'study-atlas' || raw.version !== 1 || raw.syllabusVersion !== index.version ||
      !raw.entries || typeof raw.entries !== 'object' || Array.isArray(raw.entries)) throw new Error('This is not a compatible Study Atlas backup.');
  if (Object.keys(raw.entries).length > index.items.length) throw new Error('The backup contains too many records.');
  const result = {};
  for (const [id, value] of Object.entries(raw.entries)) {
    if (!index.itemMap[id]) throw new Error(`Unknown checklist ID: ${id}. Nothing has been imported.`);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid record for ${id}.`);
    const allowed = ['status', 'needsRevision', 'notes', 'completedAt', 'updatedAt'];
    if (Object.keys(value).some(k => !allowed.includes(k))) throw new Error(`Unexpected fields in ${id}.`);
    if (!STATUSES.includes(value.status)) throw new Error(`Invalid status for ${id}.`);
    if (value.needsRevision !== undefined && typeof value.needsRevision !== 'boolean') throw new Error(`Invalid revision state for ${id}.`);
    if (value.notes !== undefined && (typeof value.notes !== 'string' || value.notes.length > 4000)) throw new Error(`Invalid or oversized note for ${id}.`);
    if (value.status === 'complete' && !iso(value.completedAt)) throw new Error(`Invalid completion timestamp/date for ${id}.`);
    if (value.status !== 'complete' && value.completedAt != null) throw new Error(`Unexpected completion date for unchecked item ${id}.`);
    if (value.updatedAt != null && !iso(value.updatedAt)) throw new Error(`Invalid update timestamp for ${id}.`);
    result[id] = normalizeEntry(value);
  }
  return { ...raw, entries: result };
}

export function completedMarkdown(index, entries) {
  const lines = ['# My completed Social Science checklist', '', `Syllabus: ${index.version}`, ''];
  for (const topic of index.topics) {
    const rows = topic.items.filter(i => entries[i.id]?.status === 'complete');
    if (!rows.length) continue;
    lines.push(`## ${topic.id} ${topic.title}`, '');
    rows.forEach(i => lines.push(`- [x] ${i.id} ${i.text}${entries[i.id]?.needsRevision ? ' — revision needed' : ''}`));
    lines.push('');
  }
  return lines.join('\n');
}

export function fullMarkdown(index, entries) {
  const lines = ['# Social Science master checklist', '', `Syllabus: ${index.version}. Completion boxes reflect reviewed learning.`, ''];
  let lastUnit = '';
  for (const topic of index.topics) {
    if (topic.unitTitle !== lastUnit) { lines.push(`## Part ${topic.part}: ${topic.subject} — ${topic.unitTitle}`, ''); lastUnit = topic.unitTitle; }
    lines.push(`### ${topic.id} ${topic.title}`, '');
    topic.items.forEach(i => lines.push(`- [${entries[i.id]?.status === 'complete' ? 'x' : ' '}] ${i.id} ${i.text}`));
    lines.push('');
  }
  return lines.join('\n');
}

export function dailyProgress(index, entries, daysBack = 14) {
  const today = indiaDay();
  const dayMap = new Map();
  const days = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const dateObj = new Date(`${d}T12:00:00+05:30`);
    const weekday = new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: TIME_ZONE }).format(dateObj);
    const dayMonth = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: TIME_ZONE }).format(dateObj);
    const slot = { day: d, weekday, label: dayMonth, count: 0, items: [] };
    days.push(slot);
    dayMap.set(d, slot);
  }

  const allCompletedDays = new Map();
  for (const item of index.items) {
    const record = entries[item.id];
    if (record?.status === 'complete' && record?.completedAt) {
      const d = indiaDay(record.completedAt);
      if (!allCompletedDays.has(d)) allCompletedDays.set(d, []);
      allCompletedDays.get(d).push(item);
      if (dayMap.has(d)) {
        const slot = dayMap.get(d);
        slot.count++;
        slot.items.push(item);
      }
    }
  }

  let streak = 0;
  let checkDay = today;
  if (!allCompletedDays.has(today)) {
    checkDay = addDays(today, -1);
  }
  while (allCompletedDays.has(checkDay) && allCompletedDays.get(checkDay).length > 0) {
    streak++;
    checkDay = addDays(checkDay, -1);
  }

  const activeDaysCount = Array.from(allCompletedDays.keys()).length;
  const totalCompleted = index.items.filter(i => entries[i.id]?.status === 'complete').length;
  const maxDayCount = Math.max(1, ...days.map(d => d.count));

  return {
    days,
    streak,
    activeDaysCount,
    totalCompleted,
    maxDayCount,
    todayCount: dayMap.get(today)?.count || 0,
    allCompletedDays,
  };
}

export function weeklyProgress(index, entries, weeksBack = 8) {
  const today = indiaDay();
  const weeks = [];
  for (let w = weeksBack - 1; w >= 0; w--) {
    const endDay = addDays(today, -w * 7);
    const startDay = addDays(endDay, -6);
    const startDateObj = new Date(`${startDay}T12:00:00+05:30`);
    const endDateObj = new Date(`${endDay}T12:00:00+05:30`);
    const startLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: TIME_ZONE }).format(startDateObj);
    const endLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: TIME_ZONE }).format(endDateObj);
    weeks.push({
      index: w,
      startDay,
      endDay,
      label: w === 0 ? 'This Week' : w === 1 ? 'Last Week' : `${startLabel} – ${endLabel}`,
      count: 0,
      items: [],
    });
  }

  for (const item of index.items) {
    const record = entries[item.id];
    if (record?.status === 'complete' && record?.completedAt) {
      const ms = Date.parse(record.completedAt);
      for (const wk of weeks) {
        const wkStartMs = new Date(`${wk.startDay}T00:00:00+05:30`).getTime();
        const wkEndMs = new Date(`${wk.endDay}T23:59:59.999+05:30`).getTime();
        if (ms >= wkStartMs && ms <= wkEndMs) {
          wk.count++;
          wk.items.push(item);
          break;
        }
      }
    }
  }

  const maxWeekCount = Math.max(1, ...weeks.map(w => w.count));
  const activeWeeks = weeks.filter(w => w.count > 0).length;
  const bestWeek = weeks.reduce((prev, cur) => cur.count > prev.count ? cur : prev, weeks[0]);

  return {
    weeks,
    maxWeekCount,
    activeWeeks,
    bestWeek,
    currentWeek: weeks[weeks.length - 1],
  };
}

export function subjectProgress(index, entries) {
  const parts = [
    { part: 1, label: 'School subjects', description: 'Geography, Civics, Economics and allied subjects' },
    { part: 2, label: 'History', description: 'One combined course, school to NET depth' },
    { part: 3, label: 'CTET Paper II', description: 'CDP, English I, Hindi II and teaching methods' },
    { part: 4, label: 'UGC NET Paper I', description: 'Teaching, research and general aptitude units' },
  ];

  const partStats = parts.map(p => {
    const pItems = index.items.filter(i => i.part === p.part);
    const pTopics = index.topics.filter(t => t.part === p.part);
    const subjectsMap = new Map();

    for (const t of pTopics) {
      if (!subjectsMap.has(t.subject)) {
        subjectsMap.set(t.subject, {
          name: t.subject,
          part: p.part,
          topicsCount: 0,
          completedTopicsCount: 0,
          totalSubtopics: 0,
          completedSubtopics: 0,
          revisionCount: 0,
        });
      }
      const sObj = subjectsMap.get(t.subject);
      sObj.topicsCount++;
      const tStats = progressStats(t.items, entries);
      sObj.totalSubtopics += t.items.length;
      sObj.completedSubtopics += tStats.complete;
      sObj.revisionCount += tStats.revision;
      if (tStats.complete === t.items.length) {
        sObj.completedTopicsCount++;
      }
    }

    const sStats = progressStats(pItems, entries);
    const completedTopicsInPart = pTopics.filter(t => t.items.every(i => entries[i.id]?.status === 'complete')).length;

    const subjects = Array.from(subjectsMap.values()).map(s => ({
      ...s,
      percent: s.totalSubtopics ? Math.round((s.completedSubtopics / s.totalSubtopics) * 100) : 0,
    }));

    return {
      ...p,
      total: pItems.length,
      complete: sStats.complete,
      percent: sStats.percent,
      revision: sStats.revision,
      topicsCount: pTopics.length,
      completedTopicsCount: completedTopicsInPart,
      subjects,
    };
  });

  const totalTopics = index.topics.length;
  let fullyCompletedTopics = 0;
  let inProgressTopics = 0;
  let notStartedTopics = 0;

  for (const t of index.topics) {
    const complete = t.items.filter(i => entries[i.id]?.status === 'complete').length;
    if (complete === t.items.length) fullyCompletedTopics++;
    else if (complete > 0) inProgressTopics++;
    else notStartedTopics++;
  }

  return {
    parts: partStats,
    totalTopics,
    fullyCompletedTopics,
    inProgressTopics,
    notStartedTopics,
  };
}
