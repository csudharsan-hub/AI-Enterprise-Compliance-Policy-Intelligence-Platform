/**
 * ReviewerStatCards
 * Renders the stats row for the Reviewer Dashboard.
 * Shows 5 cards for COMPLIANCE_OFFICER, 4 for others.
 */
import React from 'react';
import {
  FiFileText, FiClock, FiCheckCircle, FiAlertTriangle, FiAlertOctagon,
} from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xl font-black text-slate-800 dark:text-white">{value ?? 0}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  </div>
);

const ReviewerStatCards = ({ stats, role }) => {
  const total    = stats?.totalDocuments ?? 0;
  const pending  = stats?.pendingReview  ?? 0;
  const approved = stats?.approved       ?? 0;
  const high     = stats?.highCount      ?? 0;
  const critical = stats?.criticalCount  ?? 0;

  const baseCards = [
    { icon: FiFileText,      label: role === 'HR' ? 'Total Documents'  : 'Total Analyzed', value: total,    color: 'bg-slate-600'   },
    { icon: FiClock,         label: role === 'HR' ? 'Awaiting Review'  : 'Pending Review', value: pending,  color: 'bg-yellow-500'  },
    { icon: FiCheckCircle,   label: 'Approved',                                             value: approved, color: 'bg-green-600'   },
    { icon: FiAlertTriangle, label: role === 'HR' ? 'High Risk Docs'   : 'High / Critical', value: role === 'HR' ? high : high + critical, color: 'bg-red-500' },
  ];

  // Compliance Officer gets an extra Critical card + 5-col grid
  const cards = role === 'COMPLIANCE_OFFICER'
    ? [
        { icon: FiFileText,      label: 'Total Docs',     value: total,    color: 'bg-emerald-600' },
        { icon: FiClock,         label: 'Pending Review', value: pending,  color: 'bg-yellow-500'  },
        { icon: FiCheckCircle,   label: 'Approved',       value: approved, color: 'bg-green-600'   },
        { icon: FiAlertTriangle, label: 'High Risk',      value: high,     color: 'bg-orange-500'  },
        { icon: FiAlertOctagon,  label: 'Critical',       value: critical, color: 'bg-red-600'     },
      ]
    : baseCards;

  const gridCols = role === 'COMPLIANCE_OFFICER'
    ? 'grid-cols-2 lg:grid-cols-5'
    : 'grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {cards.map(c => <StatCard key={c.label} {...c} />)}
    </div>
  );
};

export default ReviewerStatCards;
