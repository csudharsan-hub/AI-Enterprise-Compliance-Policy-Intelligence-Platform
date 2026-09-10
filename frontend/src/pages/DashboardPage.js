/**
 * DashboardPage — role router
 *
 * Routes authenticated users to exactly ONE of three dashboards:
 *   1. AdminDashboard       → ADMIN
 *   2. EmployeeDashboard    → EMPLOYEE
 *   3. ReviewerDashboard    → LEGAL | HR | COMPLIANCE_OFFICER
 *
 * The three reviewer roles share ONE component; only their
 * visible data, permissions and accent colours differ (via ROLE_CONFIG).
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText, FiAlertOctagon, FiClock, FiCheckCircle,
  FiUpload, FiShield, FiUsers, FiActivity, FiGitMerge, FiArrowRight,
} from 'react-icons/fi';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

import AppLayout      from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge } from '../components/common/RiskBadge';
import { getDashboardStats } from '../services/analysisService';
import { useAuth }    from '../context/AuthContext';
import { getRiskColors, formatDateTime, getDocTypeLabel } from '../utils/riskUtils';
import { REVIEWER_ROLES } from '../config/roleConfig';

// Lazily imported so they're only bundled when the role needs them
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import ReviewerDashboard from './dashboards/ReviewerDashboard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Shared sub-components used only inside AdminDashboard ───────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-800 dark:text-white">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ComplianceGauge = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="card p-6 flex flex-col items-center">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Compliance Score
      </h3>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0"
            strokeWidth="12" className="dark:stroke-dark-700" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color}
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 326.7} 326.7`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}%</span>
          <span className="text-xs text-slate-400">compliance</span>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
        {score >= 80 ? 'Excellent compliance posture'
          : score >= 60 ? 'Moderate risk — review flagged items'
          : 'High risk — immediate review required'}
      </p>
    </div>
  );
};

// ─── Admin Dashboard (inline — only used by ADMIN role) ──────────────────────
function AdminDashboard() {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout title="Admin Dashboard">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    </AppLayout>
  );

  const safe     = stats?.safeCount     ?? 0;
  const medium   = stats?.mediumCount   ?? 0;
  const high     = stats?.highCount     ?? 0;
  const critical = stats?.criticalCount ?? 0;
  const total    = stats?.totalDocuments ?? 0;
  const score    = total > 0
    ? Math.max(0, Math.min(100,
        Math.round(100 - ((high * 30 + medium * 20 + critical * 40) / total))))
    : 100;

  const recent = stats?.recentReports ?? [];

  const doughnutData = {
    labels: ['Safe', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [safe, medium, high, critical],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'],
      borderWidth: 2, hoverOffset: 6,
    }],
  };

  const docTypeCounts = {};
  recent.forEach(r => {
    const t = getDocTypeLabel(r.documentType || 'OTHER');
    docTypeCounts[t] = (docTypeCounts[t] || 0) + 1;
  });
  const barData = {
    labels: Object.keys(docTypeCounts),
    datasets: [{
      label: 'Documents',
      data: Object.values(docTypeCounts),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  };

  return (
    <AppLayout
      title="Admin Dashboard"
      actions={
        <Link to="/upload" className="btn-primary text-sm py-2">
          <FiUpload size={15} /> Analyze Document
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome */}
        <div className="card p-5 bg-gradient-to-r from-primary-700 to-violet-700 border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiShield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Admin — {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-primary-200 text-sm">
                Full system access · {total} document{total !== 1 ? 's' : ''} in system
              </p>
            </div>
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiFileText}     label="Total Documents" value={total}                   color="bg-primary-600" />
          <StatCard icon={FiCheckCircle}  label="Approved"        value={stats?.approved ?? 0}    color="bg-green-600"   />
          <StatCard icon={FiClock}        label="Pending Review"  value={stats?.pendingReview ?? 0} color="bg-yellow-500" />
          <StatCard icon={FiAlertOctagon} label="Critical Risk"   value={critical}                color="bg-red-600"     />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <ComplianceGauge score={score} />
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
              Risk Distribution
            </h3>
            {total > 0 ? (
              <div className="max-w-[220px] mx-auto">
                <Doughnut data={doughnutData} options={{
                  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true } } },
                  maintainAspectRatio: true,
                }} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
              Recent Document Types
            </h3>
            {Object.keys(docTypeCounts).length > 0 ? (
              <Bar data={barData} options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                  y: { ticks: { stepSize: 1 }, grid: { color: 'rgba(148,163,184,0.1)' } },
                },
                maintainAspectRatio: true,
              }} />
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Risk breakdown tiles */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Safe',     val: safe,     color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',     icon: '✅' },
            { label: 'Medium',   val: medium,   color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: '⚠️' },
            { label: 'High',     val: high,     color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',             icon: '🔴' },
            { label: 'Critical', val: critical, color: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300',             icon: '🚨' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} className={`card p-4 text-center ${color}`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black">{val}</div>
              <div className="text-xs font-semibold">{label}</div>
            </div>
          ))}
        </div>

        {/* Admin quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/admin',   icon: FiUsers,    label: 'User Management', desc: 'Manage users & roles',   color: 'bg-primary-100 dark:bg-primary-900/20', iconColor: 'text-primary-600 dark:text-primary-400' },
            { to: '/audit',   icon: FiActivity, label: 'Audit Logs',      desc: 'All system activity',    color: 'bg-slate-100 dark:bg-dark-700',          iconColor: 'text-slate-600 dark:text-slate-400'    },
            { to: '/compare', icon: FiGitMerge, label: 'Version Compare', desc: 'Diff document versions', color: 'bg-indigo-100 dark:bg-indigo-900/20',    iconColor: 'text-indigo-600 dark:text-indigo-400'  },
          ].map(({ to, icon: Icon, label, desc, color, iconColor }) => (
            <Link key={to} to={to}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-primary-600 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <FiArrowRight className="text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0" size={16} />
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-700">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Activity</h3>
            <Link to="/history" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              No documents yet.{' '}
              <Link to="/upload" className="text-primary-600 hover:underline">Analyze one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-dark-700">
              {recent.map(r => {
                const colors = getRiskColors(r.riskLevel);
                return (
                  <Link to={`/report/${r.id || r._id}`} key={r.id || r._id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                        <FiFileText size={14} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-primary-600 transition-colors">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {getDocTypeLabel(r.documentType)} · {formatDateTime(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-sm font-bold" style={{ color: colors.hex }}>
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

      </div>
    </AppLayout>
  );
}

// ─── Role router ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const role     = user?.roles?.[0];

  // Dashboard 1 — Admin
  if (role === 'ADMIN')                    return <AdminDashboard />;
  // Dashboard 2 — Employee
  if (role === 'EMPLOYEE')                 return <EmployeeDashboard />;
  // Dashboard 3 — Reviewer (LEGAL | HR | COMPLIANCE_OFFICER)
  if (REVIEWER_ROLES.includes(role))       return <ReviewerDashboard />;

  // Fallback: unknown / new role → treat as Employee
  return <EmployeeDashboard />;
}
