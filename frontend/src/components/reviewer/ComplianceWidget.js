/**
 * ComplianceWidget
 * SVG gauge + score label. Shown only for COMPLIANCE_OFFICER role.
 * Also exports RiskDoughnut and DocTypeBar used in the same section.
 */
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { getDocTypeLabel } from '../../utils/riskUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ── Compliance gauge ─────────────────────────────────────────────────────────
export const ComplianceGauge = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent posture'
    : score >= 60 ? 'Moderate risk — review flagged items'
    : 'High risk — immediate action required';

  return (
    <div className="card p-6 flex flex-col items-center">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Compliance Score
      </h3>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-dark-700" />
          <circle cx="60" cy="60" r="52" fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${(score / 100) * 326.7} 326.7`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}%</span>
          <span className="text-xs text-slate-400">compliance</span>
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">{label}</p>
    </div>
  );
};

// ── Risk doughnut ─────────────────────────────────────────────────────────────
export const RiskDoughnut = ({ stats }) => {
  const safe     = stats?.safeCount     ?? 0;
  const medium   = stats?.mediumCount   ?? 0;
  const high     = stats?.highCount     ?? 0;
  const critical = stats?.criticalCount ?? 0;
  const total    = safe + medium + high + critical;

  const data = {
    labels: ['Safe', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [safe, medium, high, critical],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  return (
    <div className="card p-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Risk Distribution
      </h3>
      {total > 0 ? (
        <div className="max-w-[200px] mx-auto">
          <Doughnut data={data} options={{
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true } } },
            maintainAspectRatio: true,
          }} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          No data yet
        </div>
      )}
    </div>
  );
};

// ── Doc-type bar ──────────────────────────────────────────────────────────────
export const DocTypeBar = ({ recent, barColor = '#7c3aed' }) => {
  const counts = {};
  (recent || []).slice(0, 5).forEach(r => {
    const t = getDocTypeLabel(r.documentType || 'OTHER');
    counts[t] = (counts[t] || 0) + 1;
  });

  const data = {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Docs',
      data: Object.values(counts),
      backgroundColor: barColor,
      borderRadius: 6,
    }],
  };

  return (
    <div className="card p-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Doc Types (Recent)
      </h3>
      {Object.keys(counts).length > 0 ? (
        <Bar data={data} options={{
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { ticks: { stepSize: 1 }, grid: { color: 'rgba(148,163,184,0.1)' } },
          },
          maintainAspectRatio: true,
        }} />
      ) : (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          No data yet
        </div>
      )}
    </div>
  );
};
