import React from 'react';

const sizes = { sm:'w-4 h-4 border-2', md:'w-8 h-8 border-2', lg:'w-12 h-12 border-3', xl:'w-16 h-16 border-4' };

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const c = color === 'white'
    ? 'border-white/30 border-t-white'
    : 'border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400';
  return <div className={`${sizes[size]} rounded-full animate-spin ${c} ${className}`} role="status" aria-label="Loading" />;
};

export const LoadingOverlay = ({ text = 'Analyzing document...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">{text}</p>
      <p className="text-slate-400 text-sm mt-1">Running 4 AI analysis modules…</p>
    </div>
    <div className="flex gap-1.5 mt-1">
      {[0,1,2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />
      ))}
    </div>
  </div>
);

export default LoadingSpinner;
