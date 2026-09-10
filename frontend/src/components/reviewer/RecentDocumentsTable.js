/**
 * RecentDocumentsTable
 * Reusable table of recently analyzed documents (read-only rows with links).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import { RiskBadge, StatusBadge } from '../common/RiskBadge';
import { getRiskColors, getDocTypeLabel, formatDateTime } from '../../utils/riskUtils';

const RecentDocumentsTable = ({
  recent,
  accentColor = 'primary',
  emptyLabel   = 'No documents yet.',
  emptyAction  = { to: '/upload', label: 'Analyze one →' },
  title        = 'Recently Analyzed',
}) => {
  const linkColor = `text-${accentColor}-600 dark:text-${accentColor}-400`;
  const iconBg    = `bg-${accentColor}-50 dark:bg-${accentColor}-900/20`;
  const iconColor = `text-${accentColor}-500`;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-700">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
        <Link to="/history" className={`text-sm ${linkColor} hover:underline`}>
          View all
        </Link>
      </div>

      {/* Body */}
      {recent.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-400 text-sm">
          {emptyLabel}{' '}
          <Link to={emptyAction.to} className={`${linkColor} hover:underline`}>
            {emptyAction.label}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-dark-700">
          {recent.map(r => {
            const colors = getRiskColors(r.riskLevel);
            const rid    = r.id || r._id;
            return (
              <Link
                to={`/report/${rid}`}
                key={rid}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors group">

                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <FiFileText size={14} className={iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold text-slate-700 dark:text-slate-300 truncate transition-colors group-hover:${linkColor}`}>
                      {r.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getDocTypeLabel(r.documentType)} · {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold hidden sm:block" style={{ color: colors.hex }}>
                    {r.riskScore}
                  </span>
                  <RiskBadge level={r.riskLevel} />
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentDocumentsTable;
