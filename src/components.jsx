import React, { useEffect, useRef } from 'react';

const paths = {
  book: <><path d="M12 5C8 2 4 3 2 4v15c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-2-7-1-10 1Z" /><path d="M12 5v15M5 8h4m-4 4h4m6-4h4m-4 4h4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12M3 6l1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 2v6m10-6v6M3 11h18m-12 5 2 2 4-4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  back: <path d="M20 12H5m6-6-6 6 6 6" />,
  check: <path d="m4 12 5 5L20 6" />,
  flag: <><path d="M5 22V3m0 0c5-4 9 4 15 0v11c-6 4-10-4-15 0" /></>,
  note: <><path d="M14 3H4v18h16V9Z" /><path d="M14 3v6h6M7 13h10M7 17h7" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
  upload: <><path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4" /></>,
  cloud: <path d="M7 19a5 5 0 1 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1-1 12Z" />,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /></>,
  link: <><path d="m10 13 4-4m-5 7-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m-2 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m10 2 4 0 1 3 3 1 3-1 2 4-2 3 0 3 1 3-4 3-3-1-3 1-2-1-3 1-3-3 1-3-1-3-2-2 2-4 3 1 3-1Z" /></>,
  chart: <><path d="M18 20V10M12 20V4M6 20v-6" /></>,
  trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>,
  flame: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></>,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
  logout: <><path d="M10 4H3v16h7m4-13 5 5-5 5m-7-5h12" /></>,
};
export function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.book}</svg>;
}
export function ProgressBar({ value = 0, label }) {
  return <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label || 'Completion'}><span style={{ width: `${value}%` }} /></div>;
}
export function EmptyState({ icon = 'book', title, children, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={28} /></span><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function Modal({ title, children, onClose, className = '', busy = false }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.showModal(); return () => ref.current?.close(); }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby="modal-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
    <div className="modal-head"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}
export function ExternalLink({ href, children, className = '' }) {
  return <a href={href} target="_blank" rel="noreferrer" className={className}>{children}<Icon name="arrow" size={15} /></a>;
}
