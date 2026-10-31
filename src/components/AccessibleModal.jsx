import React, { useEffect, useRef } from 'react';

// Shared keyboard behavior for the paper manager and exam dialogs.
export default function AccessibleModal({ children, onClose, labelledBy, describedBy, className = '', closeOnBackdrop = true }) {
  const cardRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const card = cardRef.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...card.querySelectorAll('a[href], button, input, textarea, select, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length && !element.closest('[hidden], [inert]'));
    (focusable()[0] || card).focus({ preventScroll: true });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current?.();
      }
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        card.focus();
      } else if (event.shiftKey && (document.activeElement === first || !card.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !card.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
    function containFocus(event) {
      if (!card.contains(event.target)) (focusable()[0] || card).focus({ preventScroll: true });
    }
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', containFocus);
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className="testbook-modal-backdrop" onClick={event => { if (closeOnBackdrop && event.target === event.currentTarget) closeRef.current?.(); }}>
      <div ref={cardRef} className={`testbook-modal-card ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
