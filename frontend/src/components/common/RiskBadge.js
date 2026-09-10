import React from 'react';
import { getRiskColors, getSeverityColors, getStatusColors } from '../../utils/riskUtils';

export const RiskBadge = ({ level, className = '' }) => {
  const { badge } = getRiskColors(level);
  return <span className={`${badge} ${className}`}>{level}</span>;
};

export const SeverityBadge = ({ severity, className = '' }) => {
  const { badge } = getSeverityColors(severity);
  return <span className={`${badge} ${className}`}>{severity}</span>;
};

export const StatusBadge = ({ status, className = '' }) => {
  const badge = getStatusColors(status);
  const label = (status || '').replace(/_/g, ' ');
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge} ${className}`}>{label}</span>;
};

export default RiskBadge;
