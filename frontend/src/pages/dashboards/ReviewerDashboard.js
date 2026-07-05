/**
 * ReviewerDashboard
 * ONE shared dashboard component for LEGAL, HR, and COMPLIANCE_OFFICER roles.
 *
 * Layout is IDENTICAL for every reviewer.
 * Only these things change based on role (driven by ROLE_CONFIG):
 *   - Welcome banner gradient + tagline
 *   - Info message
 *   - Stat card labels
 *   - Quick-action links
 *   - Visible sections (ComplianceGauge/DocTypeBar visible only for COMPLIANCE_OFFICER)
 *   - Pending approvals table title
 *   - Recent documents table title
 *   - Accent colour on links and hover states
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Link }      from 'react-router-dom';
import { FiShield, FiUpload, FiInfo } from 'react-icons/fi';
import { toast }     from 'react-toastify';

import AppLayout              from '../../components/common/AppLayout';
import LoadingSpinner         from '../../components/common/LoadingSpinner';
import RolePermissionWrapper  from '../../components/reviewer/RolePermissionWrapper';
import ReviewerStatCards      from '../../components/reviewer/ReviewerStatCards';
import ReviewerQuickActions   from '../../components/reviewer/ReviewerQuickActions';
import PendingApprovalsTable  from '../../components/reviewer/PendingApprovalsTable';
import RecentDocumentsTable   from '../../components/reviewer/RecentDocumentsTable';
import { ComplianceGauge, RiskDoughnut, DocTypeBar } from '../../components/reviewer/ComplianceWidget';

import { getDashboardStats, getReports, approveReport, rejectReport } from '../../services/analysisService';
import { useAuth }       from '../../context/AuthContext';
import { getRoleConfig } from '../../config/roleConfig';
import { PERMISSIONS }   from '../../config/roleConfig';

// ─── Role-specific titles ────────────────────────────────────────────────────
const PENDING_TITLES = {
  LEGAL:               'Pending Legal Review',
  HR:                  'Pending HR Approvals',
  COMPLIANCE_OFFICER:  'Pending Compliance Approvals',
};

const RECENT_TITLES = {
  LEGAL:               'Recently Analyzed',
  HR:                  'Recent HR Documents',
  COMPLIANCE_OFFICER:  'Recent Documents',
};

const EMPTY_LABELS = {
  LEGAL:               'No documents yet.',
  HR:                  'No HR documents yet.',
  COMPLIANCE_OFFICER:  'No documents yet.',
};

// ─── Compliance score calculator ─────────────────────────────────────────────
const calcScore = (stats) => {
  const total    = stats?.totalDocuments ?? 0;
  const high     = stats?.highCount      ?? 0;
  const medium   = stats?.mediumCount    ?? 0;
  const critical = stats?.criticalCount  ?? 0;
  if (total === 0) return 100;
  return Math.max(0, Math.min(100,
    Math.round(100 - ((high * 30 + medium * 20 + critical * 40) / total)),
  ));
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReviewerDashboard() {
  const { user }  = useAuth();
  const role      = user?.roles?.[0];
  const config    = getRoleConfig(role);

  const [stats,     setStats]     = useState(null);
  const [pending,   setPending]   = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actioning, setActioning] = useState(null);

  // ── Data load ──────────────────────────────────────────────────────────────
  const load = useCallback(() =>
    Promise.all([
      getDashboardStats(),
      getReports({ size: 6, status: 'PENDING_REVIEW', sortBy: 'createdAt', order: 'asc',  page: 0 }),
      getReports({ size: 6,                            sortBy: 'createdAt', order: 'desc', page: 0 }),
    ]).then(([s, p, r]) => {
      setStats(s);
      setPending(p.reports || []);
      setRecent(r.reports  || []);
    }),
  []);

  useEffect(() => {
    load().catch(console.error).finally(() => setLoading(false));
  }, [load]);

  // ── Approval handlers ──────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await approveReport(id);
      setPending(prev => prev.filter(r => (r.id || r._id) !== id));
      toast.success('Document approved.');
    } catch (e) {
      toast.error(e.message || 'Approval failed.');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (required):');
    if (!reason?.trim()) return;
    setActioning(id);
    try {
      await rejectReport(id, reason);
      setPending(prev => prev.filter(r => (r.id || r._id) !== id));
      toast.success('Document rejected.');
    } catch (e) {
      toast.error(e.message || 'Rejection failed.');
    } finally {
      setActioning(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return (
    <AppLayout title="Reviewer Dashboard">
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    </AppLayout>
  );

  const accentColor    = config.accentColor || 'primary';
  const score          = calcScore(stats);
  const isCompliance   = role === 'COMPLIANCE_OFFICER';

  return (
    <AppLayout
      title="Reviewer Dashboard"
      actions={
        <Link to="/upload" className="btn-primary text-sm py-2">
          <FiUpload size={15} />
          {role === 'HR' ? ' Upload HR Document' : ' Analyze Document'}
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── 1. Welcome banner ─────────────────────────────────────────── */}
        <div className={`card p-5 bg-gradient-to-r ${config.gradient} border-0`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiShield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {config.label} — {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-white/80 text-sm">{config.tagline}</p>
            </div>
          </div>
        </div>

        {/* ── 2. Role info message ───────────────────────────────────────── */}
        {config.infoMessage && (
          <div className={`flex items-start gap-3 p-4 rounded-xl
            bg-${accentColor}-50 dark:bg-${accentColor}-900/20
            border border-${accentColor}-200 dark:border-${accentColor}-800`}>
            <FiInfo className={`text-${accentColor}-600 flex-shrink-0 mt-0.5`} size={16} />
            <p className={`text-sm text-${accentColor}-700 dark:text-${accentColor}-300`}>
              As <strong>{config.label}</strong>, {config.infoMessage}
            </p>
          </div>
        )}

        {/* ── 3. Stat cards (role-aware) ─────────────────────────────────── */}
        <ReviewerStatCards stats={stats} role={role} />

        {/* ── 4. Charts section (COMPLIANCE_OFFICER only) ───────────────── */}
        {isCompliance && (
          <div className="grid lg:grid-cols-3 gap-6">
            <ComplianceGauge score={score} />
            <RiskDoughnut stats={stats} />
            <DocTypeBar recent={recent} barColor="#059669" />
          </div>
        )}

        {/* ── 5. Quick actions (role-specific links) ────────────────────── */}
        <ReviewerQuickActions role={role} />

        {/* ── 6. Pending approvals (approve/reject — LEGAL, HR, COMPLIANCE) */}
        <RolePermissionWrapper permission={PERMISSIONS.CAN_APPROVE}>
          <PendingApprovalsTable
            pending={pending}
            actioning={actioning}
            onApprove={handleApprove}
            onReject={handleReject}
            accentColor={accentColor}
            title={PENDING_TITLES[role] || 'Pending Approvals'}
          />
        </RolePermissionWrapper>

        {/* ── 7. Recent documents (all reviewers see this) ──────────────── */}
        <RecentDocumentsTable
          recent={recent}
          accentColor={accentColor}
          title={RECENT_TITLES[role] || 'Recent Documents'}
          emptyLabel={EMPTY_LABELS[role] || 'No documents yet.'}
          emptyAction={{ to: '/upload', label: role === 'HR' ? 'Upload one →' : 'Analyze one →' }}
        />

      </div>
    </AppLayout>
  );
}
