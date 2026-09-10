import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const SeverityPieChart = ({ clauses }) => {
  const counts = {
    High: clauses.filter((c) => c.severity === 'High' || c.severity === 'Critical').length,
    Medium: clauses.filter((c) => c.severity === 'Medium').length,
    Low: clauses.filter((c) => c.severity === 'Low').length,
  };

  const data = {
    labels: ['High / Critical', 'Medium', 'Low'],
    datasets: [
      {
        data: [counts.High, counts.Medium, counts.Low],
        backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
        borderColor: ['#dc2626', '#d97706', '#16a34a'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  const hasData = counts.High + counts.Medium + counts.Low > 0;
  if (!hasData) return null;

  return (
    <div className="card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Clause Severity Breakdown
      </h3>
      <div className="max-w-xs mx-auto">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export const ClauseTypeBarChart = ({ clauses }) => {
  const typeCounts = {};
  clauses.forEach((c) => {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
  });

  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) return null;

  const colorMap = {
    'Data Selling': '#dc2626',
    'Forced Arbitration': '#b91c1c',
    'AI Model Training': '#7c3aed',
    'Biometric Data': '#9333ea',
    "Children's Data": '#db2777',
    'Tracking Cookies': '#ea580c',
    'Location Tracking': '#d97706',
    'Account Termination': '#ef4444',
    'Auto Renewal': '#f59e0b',
    'Data Sharing': '#f97316',
    'Third-Party Sharing': '#fb923c',
    'User Content License': '#0ea5e9',
    'Data Retention': '#06b6d4',
    'Personal Information Collection': '#10b981',
    'Payment Renewal': '#8b5cf6',
    'Subscription Cancellation': '#6366f1',
    'Privacy Risks': '#ec4899',
    Other: '#64748b',
  };

  const data = {
    labels: sorted.map(([type]) =>
      type.length > 20 ? type.substring(0, 18) + '...' : type
    ),
    datasets: [
      {
        label: 'Occurrences',
        data: sorted.map(([, count]) => count),
        backgroundColor: sorted.map(([type]) => colorMap[type] || '#64748b'),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x} clause${ctx.parsed.x !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.15)' },
        ticks: {
          stepSize: 1,
          font: { size: 11 },
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="card p-6 animate-fade-in">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        Top Clause Types
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
};
