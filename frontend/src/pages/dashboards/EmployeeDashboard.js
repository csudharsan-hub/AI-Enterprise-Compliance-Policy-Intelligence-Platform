import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUpload, FiFileText, FiClock, FiCheckCircle,
  FiAlertCircle, FiArrowRight, FiInfo,
} from 'react-icons/fi';
import AppLayout from '../../components/common/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RiskBadge, StatusBadge } from '../../components/common/RiskBadge';
import { getDashboardStats, getReports } from '../../services/analysisService';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getDocTypeLabel } from '../../utils/riskUtils';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getReports({ size: 5, sortBy: 'createdAt', order: 'desc', page: 0 }),
    ])
      .then(([s, r]) => { setStats(s); setRecent(r.reports || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout title="My Dashboard">
      <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
    </AppLayout>
  );

  const total   = stats?.totalDocuments ?? 0;
  const pending = stats?.pendingReview  ?? 0;
  const approved= stats?.approved       ?? 0;
  const rejected= stats?.rejectedCount  ?? 0;

  return (
    <AppLayout title="My Dashboard"
      actions={
        <Link to="/upload" className="btn-primary text-sm py-2">
          <FiUpload size={15} /> Submit Document
        </Link>
      }>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Welcome banner */}
        <div className="card p-5 bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiFileText size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Hello, {user?.name?.split(' ')[0]}!
              </h2>
              <p className="text-blue-200 text-sm">
                Submit documents for compliance review. Track status below.
              </p>
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <FiInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            As an <strong>Employee</strong>, you can submit documents for AI compliance analysis.
            Legal and Compliance teams will review and approve your submissions.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FiFileText,    label: 'Total Submitted', value: total,    color: 'bg-blue-600'   },
            { icon: FiClock,       label: 'Pending Review',  value: pending,  color: 'bg-yellow-500' },
            { icon: FiCheckCircle, label: 'Approved',        value: approved, color: 'bg-green-600'  },
            { icon: FiAlertCircle, label: 'Rejected',        value: rejected, color: 'bg-red-500'    },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/upload"
            className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow group border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <FiUpload size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                Submit New Document
              </p>
              <p className="text-xs text-slate-500 mt-0.5">PDF, DOCX, TXT or paste text</p>
            </div>
            <FiArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
          </Link>

          <Link to="/history"
            className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
              <FiClock size={22} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                View My Submissions
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Track review status &amp; results</p>
            </div>
            <FiArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
          </Link>
        </div>

        {/* Recent submissions */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-dark-700">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">My Recent Submissions</h3>
            <Link to="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiFileText size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No submissions yet.</p>
              <Link to="/upload" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Submit your first document →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-dark-700">
              {recent.map(r => (
                <Link to={`/report/${r.id || r._id}`} key={r.id || r._id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <FiFileText size={14} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 transition-colors">
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-400">{getDocTypeLabel(r.documentType)} · {formatDateTime(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <RiskBadge level={r.riskLevel} />
                    <StatusBadge status={r.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
