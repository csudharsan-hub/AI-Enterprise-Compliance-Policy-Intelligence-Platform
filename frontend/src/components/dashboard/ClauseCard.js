import React, { useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiInfo,
  FiFileText,
} from 'react-icons/fi';
import { SeverityBadge } from '../common/RiskBadge';
import { getSeverityHex } from '../../utils/riskUtils';

const TYPE_ICONS = {
  'Data Selling': '💰',
  'Data Sharing': '🔗',
  'Third-Party Sharing': '🤝',
  'Auto Renewal': '🔄',
  'Forced Arbitration': '⚖️',
  'Account Termination': '🚫',
  'User Content License': '📝',
  'Tracking Cookies': '🍪',
  'Location Tracking': '📍',
  'Biometric Data': '👆',
  'AI Model Training': '🤖',
  "Children's Data": '👶',
  'Data Retention': '🗄️',
  'Payment Renewal': '💳',
  'Subscription Cancellation': '❌',
  'Personal Information Collection': '👤',
  'Privacy Risks': '🔒',
  Other: '⚠️',
};

const ClauseCard = ({ clause, index }) => {
  const [expanded, setExpanded] = useState(false);
  const severityHex = getSeverityHex(clause.severity);
  const icon = TYPE_ICONS[clause.type] || '⚠️';

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200 animate-slide-up hover:shadow-md dark:hover:shadow-dark-800"
      style={{
        borderColor: `${severityHex}40`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        style={{ backgroundColor: `${severityHex}12` }}
        onClick={() => setExpanded((p) => !p)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {clause.type}
              </h3>
              <SeverityBadge severity={clause.severity} />
            </div>
            {!expanded && (
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5 max-w-xs sm:max-w-md">
                {clause.plain_english}
              </p>
            )}
          </div>
        </div>
        <button
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-2"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 py-4 space-y-4 bg-white dark:bg-dark-800 border-t border-slate-100 dark:border-dark-700">
          {/* Original text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiFileText size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Original Clause
              </span>
            </div>
            <blockquote className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-700 rounded-lg px-4 py-3 border-l-3 italic leading-relaxed"
              style={{ borderLeftColor: severityHex, borderLeftWidth: 3 }}>
              "{clause.original_text}"
            </blockquote>
          </div>

          {/* Plain English */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiInfo size={14} className="text-blue-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                What This Means
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {clause.plain_english}
            </p>
          </div>

          {/* Why dangerous */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiAlertTriangle size={14} style={{ color: severityHex }} />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Why It Matters
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: severityHex }}>
              {clause.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClauseList = ({ clauses }) => {
  if (!clauses || clauses.length === 0) {
    return (
      <div className="card p-12 text-center animate-fade-in">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
          No Red Flags Detected
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          The AI did not detect any dangerous clauses in this document.
        </p>
      </div>
    );
  }

  const highClauses = clauses.filter((c) => c.severity === 'High' || c.severity === 'Critical');
  const mediumClauses = clauses.filter((c) => c.severity === 'Medium');
  const lowClauses = clauses.filter((c) => c.severity === 'Low');

  return (
    <div className="space-y-3">
      {/* High/Critical first */}
      {highClauses.map((clause, i) => (
        <ClauseCard key={`high-${i}`} clause={clause} index={i} />
      ))}
      {mediumClauses.map((clause, i) => (
        <ClauseCard key={`med-${i}`} clause={clause} index={highClauses.length + i} />
      ))}
      {lowClauses.map((clause, i) => (
        <ClauseCard key={`low-${i}`} clause={clause} index={highClauses.length + mediumClauses.length + i} />
      ))}
    </div>
  );
};

export default ClauseCard;
