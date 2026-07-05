import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiClock, FiExternalLink } from 'react-icons/fi';
import { getRiskColors, getSourceTypeLabel, formatDateTime } from '../../utils/riskUtils';
import { getReportPDFUrl, getReportJSONUrl } from '../../services/analysisService';
import { RiskBadge } from '../common/RiskBadge';

const StatCard = ({ label, value, colorClass }) => (
  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-dark-700">
    <div className={`text-2xl font-black ${colorClass}`}>{value}</div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{label}</div>
  </div>
);

const ResultsSummary = ({ report }) => {
  const navigate = useNavigate();
  const colors = getRiskColors(report.riskLevel);

  const highCount = report.clauses?.filter(
    (c) => c.severity === 'High' || c.severity === 'Critical'
  ).length || 0;
  const medCount = report.clauses?.filter((c) => c.severity === 'Medium').length || 0;
  const lowCount = report.clauses?.filter((c) => c.severity === 'Low').length || 0;

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('tos_token');
    const url = `${process.env.REACT_APP_API_URL || '/api'}${getReportPDFUrl(report._id).replace('/api', '')}`;
    // Use fetch with auth header for PDF download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tos-guard-report-${report._id}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  const handleDownloadJSON = () => {
    const token = localStorage.getItem('tos_token');
    const url = `${process.env.REACT_APP_API_URL || '/api'}${getReportJSONUrl(report._id).replace('/api', '')}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tos-guard-report-${report._id}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <div className="card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate">
            {report.title}
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {getSourceTypeLabel(report.sourceType)}
            </span>
            {report.sourceURL && (
              <a
                href={report.sourceURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
              >
                <FiExternalLink size={11} />
                View Source
              </a>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <FiClock size={11} />
              {formatDateTime(report.createdAt)}
            </span>
          </div>
        </div>
        <RiskBadge level={report.riskLevel} className="flex-shrink-0 text-sm" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Flags"
          value={report.clauses?.length || 0}
          colorClass="text-slate-700 dark:text-slate-200"
        />
        <StatCard
          label="High/Critical"
          value={highCount}
          colorClass="text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Medium"
          value={medCount}
          colorClass="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="Low"
          value={lowCount}
          colorClass="text-green-600 dark:text-green-400"
        />
      </div>

      {/* Risk score bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
          <span style={{ color: colors.hex }}>{report.riskScore}/100</span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${report.riskScore}%`,
              backgroundColor: colors.hex,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleDownloadPDF} className="btn-secondary flex-1">
          <FiDownload size={16} />
          Download PDF
        </button>
        <button onClick={handleDownloadJSON} className="btn-secondary flex-1">
          <FiDownload size={16} />
          Download JSON
        </button>
        <button
          onClick={() => navigate(`/report/${report._id}`)}
          className="btn-primary flex-1"
        >
          <FiExternalLink size={16} />
          View Full Report
        </button>
      </div>
    </div>
  );
};

export default ResultsSummary;
