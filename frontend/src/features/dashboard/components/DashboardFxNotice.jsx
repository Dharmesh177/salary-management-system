import { useState } from 'react';
import { DASHBOARD_MESSAGES } from '../messages.js';

const FX_NOTICE_STORAGE_KEY = 'dashboard.fxNotice.dismissed';

function readDismissed() {
  try {
    return window.localStorage.getItem(FX_NOTICE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistDismissed() {
  try {
    window.localStorage.setItem(FX_NOTICE_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage errors and keep the banner dismissed for this session only.
  }
}

export default function DashboardFxNotice() {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed) {
    return null;
  }

  function handleDismiss() {
    setDismissed(true);
    persistDismissed();
  }

  return (
    <aside className="dashboard-fx-notice" aria-label={DASHBOARD_MESSAGES.fxNoticeTitle}>
      <div className="dashboard-fx-notice-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </div>

      <p className="dashboard-fx-notice-message">{DASHBOARD_MESSAGES.fxNoticeMessage}</p>

      <button
        type="button"
        className="dashboard-fx-notice-close"
        aria-label={DASHBOARD_MESSAGES.fxNoticeDismissLabel}
        onClick={handleDismiss}
      >
        ×
      </button>
    </aside>
  );
}
