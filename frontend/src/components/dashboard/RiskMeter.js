import React, { useEffect, useState } from 'react';
import { FiShield, FiAlertTriangle, FiAlertOctagon, FiCheckCircle } from 'react-icons/fi';
import { getRiskColors } from '../../utils/riskUtils';

const RiskIcon = ({ level, size = 32 }) => {
  switch (level) {
    case 'Safe':
      return <FiCheckCircle size={size} />;
    case 'Medium':
      return <FiShield size={size} />;
    case 'High':
      return <FiAlertTriangle size={size} />;
    case 'Critical':
      return <FiAlertOctagon size={size} />;
    default:
      return <FiShield size={size} />;
  }
};

const RiskMeter = ({ riskScore, riskLevel, clauseCount, summary }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getRiskColors(riskLevel);

  // Animate score from 0 to actual value
  useEffect(() => {
    setAnimatedScore(0);
    const duration = 1200;
    const steps = 60;
    const increment = riskScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= riskScore) {
        setAnimatedScore(riskScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [riskScore]);

  // SVG arc for risk gauge
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="card p-6 animate-slide-up">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">
        Overall Risk Score
      </h2>

      {/* Gauge */}
      <div className="flex justify-center mb-4">
        <div className="relative" style={{ width: size, height: size / 2 + 24 }}>
          <svg
            width={size}
            height={size / 2 + strokeWidth}
            viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          >
            {/* Background arc */}
            <path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-dark-700"
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            <path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              fill="none"
              stroke={colors.hex}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span
              className="text-4xl font-black tabular-nums"
              style={{ color: colors.hex }}
            >
              {animatedScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              out of 100
            </span>
          </div>
        </div>
      </div>

      {/* Risk level badge */}
      <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl mb-4 ${colors.bg}`}>
        <span style={{ color: colors.hex }}>
          <RiskIcon level={riskLevel} size={20} />
        </span>
        <span
          className="text-lg font-bold"
          style={{ color: colors.hex }}
        >
          {riskLevel} Risk
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-4">
          {summary}
        </p>
      )}

      {/* Clauses count */}
      <div className="text-center">
        <span className="text-2xl font-bold text-slate-800 dark:text-white">{clauseCount}</span>
        <span className="text-sm text-slate-500 ml-1">
          {clauseCount === 1 ? 'red flag detected' : 'red flags detected'}
        </span>
      </div>

      {/* Scale legend */}
      <div className="mt-4 grid grid-cols-4 gap-1 text-center">
        {[
          { label: 'Safe', range: '0–20', color: '#22c55e' },
          { label: 'Medium', range: '21–50', color: '#f59e0b' },
          { label: 'High', range: '51–80', color: '#ef4444' },
          { label: 'Critical', range: '81–100', color: '#dc2626' },
        ].map((item) => (
          <div key={item.label} className="text-xs">
            <div
              className="h-1.5 rounded-full mb-1"
              style={{ backgroundColor: item.color }}
            />
            <div className="font-medium" style={{ color: item.color }}>
              {item.label}
            </div>
            <div className="text-slate-400">{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskMeter;
