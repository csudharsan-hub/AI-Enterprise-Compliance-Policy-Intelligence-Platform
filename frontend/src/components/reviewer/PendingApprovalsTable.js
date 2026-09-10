/**
 * PendingApprovalsTable
 * Reusable table of PENDING_REVIEW documents with Approve / Reject actions.
 * Used inside ReviewerDashboard — role label and accent colour come from props.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { RiskBadge } from '../common/RiskBadge';
import { getRiskColors, getDocTypeLabel, formatDateTime } from '../../utils/riskUtils';
import LoadingSpinner from '../common/LoadingSpinner';

const PendingApprovalsTable = ({
  pending,
  actioning,
  onApprove,
  onReject,
  accentColor = 'primary',
  title = 'Pending Approvals',
}) => {
  const linkColor = `text-${accentColor}-600 dark:text-${accentColor}-400`;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-700">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FiClock className="text-yellow-500" size={16} />
          {title}
          {pending.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {pending.length}
            </span>
          )}
        </h3>
        <Link to="/history" className={`text-sm ${linkColor} hover:underline`}>
          View all
        </Link>
      </div>

      {/* Body */}
      {pending.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <FiCheckCircle size={32} className="text-green-400 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No pending approvals. All caught up!</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-dark-700">
          {pending.map(r => {
            const rid    = r.id || r._id;
            const colors = getRiskColors(r.riskLevel);
            const busy   = actioning === rid;

            return (
              <div key={rid}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">

                {/* Left — doc info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                    <FiFileText size={14} className="text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getDocTypeLabel(r.documentType)} · {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Right — badges + actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold hidden sm:block" style={{ color: colors.hex }}>
                    {r.riskScore}
                  </span>
                  <RiskBadge level={r.riskLevel} />
                  <Link to={`/report/${rid}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2">
                    View
                  </Link>
                  <button
                    onClick={() => onApprove(rid)}
                    disabled={busy}
                    className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1">
                    {busy ? <LoadingSpinner size="sm" /> : 'Approve'}
                  </button>
                  <button
                    onClick={() => onReject(rid)}
                    disabled={busy}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1">
                    {busy ? <LoadingSpinner size="sm" /> : 'Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsTable;
