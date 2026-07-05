import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
          <FiShield className="text-white" size={18}/>
        </div>
        <span className="font-bold text-xl text-slate-800 dark:text-white">ComplianceAI</span>
      </div>
      <div className="text-center mb-8">
        <div className="text-[120px] font-black leading-none text-slate-200 dark:text-dark-800 select-none">404</div>
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={()=>window.history.back()} className="btn-secondary"><FiArrowLeft size={16}/>Go Back</button>
        <Link to={isAuthenticated?'/dashboard':'/'} className="btn-primary">
          <FiHome size={16}/>{isAuthenticated?'Dashboard':'Home'}
        </Link>
      </div>
    </div>
  );
}
