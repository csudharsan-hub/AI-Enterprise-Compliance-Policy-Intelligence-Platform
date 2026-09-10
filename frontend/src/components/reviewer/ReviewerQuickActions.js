/**
 * ReviewerQuickActions
 * Renders the quick-action link cards for the Reviewer Dashboard.
 * The set of actions comes from ROLE_CONFIG[role].quickActions.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiUpload, FiFileText, FiGitMerge, FiActivity, FiArrowRight,
} from 'react-icons/fi';
import { getRoleConfig, QUICK_ACTION_LABELS } from '../../config/roleConfig';

const ICON_MAP = {
  FiUpload:   FiUpload,
  FiFileText: FiFileText,
  FiGitMerge: FiGitMerge,
  FiActivity: FiActivity,
};

// Per-role accent colours for the quick-action cards
const ACCENT = {
  LEGAL:               { card: 'bg-violet-100 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', hover: 'group-hover:text-violet-600' },
  HR:                  { card: 'bg-green-100 dark:bg-green-900/20',   icon: 'text-green-600 dark:text-green-400',   hover: 'group-hover:text-green-600'  },
  COMPLIANCE_OFFICER:  { card: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', hover: 'group-hover:text-emerald-600' },
};

// Secondary accent for non-first cards
const SECONDARY = [
  { card: 'bg-blue-100 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   hover: 'group-hover:text-blue-600'   },
  { card: 'bg-indigo-100 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400', hover: 'group-hover:text-indigo-600' },
  { card: 'bg-slate-100 dark:bg-dark-700',      icon: 'text-slate-600 dark:text-slate-400', hover: 'group-hover:text-slate-600'  },
];

const ReviewerQuickActions = ({ role }) => {
  const config  = getRoleConfig(role);
  const primary = ACCENT[role] || ACCENT.LEGAL;
  const actions = config.quickActions || [];

  const cols = actions.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4';

  return (
    <div className={`grid ${cols} gap-4`}>
      {actions.map(({ to, labelKey, desc }, idx) => {
        const meta  = QUICK_ACTION_LABELS[labelKey] || { label: labelKey, icon: 'FiFileText' };
        const Icon  = ICON_MAP[meta.icon] || FiFileText;
        const color = idx === 0 ? primary : SECONDARY[(idx - 1) % SECONDARY.length];

        return (
          <Link key={to + labelKey} to={to}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color.card}`}>
              <Icon size={20} className={color.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-slate-800 dark:text-white text-sm transition-colors ${color.hover}`}>
                {meta.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
            <FiArrowRight className="text-slate-300 flex-shrink-0" size={16} />
          </Link>
        );
      })}
    </div>
  );
};

export default ReviewerQuickActions;
