import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-dark-900 p-12">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center"><FiShield size={20} className="text-white"/></div>
            <div><p className="font-bold text-white text-lg leading-none">ComplianceAI</p><p className="text-slate-500 text-xs">Enterprise Platform</p></div>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">AI-powered legal document analysis for enterprise teams.</h2>
          <p className="text-slate-400 leading-relaxed mb-8">Analyze thousands of contracts, NDAs, and privacy policies in minutes — not days.</p>
          <div className="space-y-3">
            {['AI Document Classification','Risk Detection & Scoring','Rewrite Suggestions','Version Comparison','Audit Logs & Role Management'].map(f=>(
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0"/>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center"><FiShield className="text-white" size={14}/></div>
            <span className="font-bold text-lg dark:text-white">ComplianceAI</span>
          </div>

          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Sign in to your enterprise account</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input type="email" value={form.email} onChange={e=>handle('email',e.target.value)}
                  placeholder="you@company.com" autoComplete="email" disabled={loading}
                  className={`input-field pl-10 ${errors.email?'border-red-400':''}`}/>
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input type={showPw?'text':'password'} value={form.password} onChange={e=>handle('password',e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" disabled={loading}
                  className={`input-field pl-10 pr-10 ${errors.password?'border-red-400':''}`}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw?<FiEyeOff size={16}/>:<FiEye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading?<><LoadingSpinner size="sm" color="white"/>Signing in…</>:'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700">
            <p className="text-xs font-semibold text-slate-500 mb-1">Demo Credentials</p>
            <p className="text-xs text-slate-400">Register a new account to get started.</p>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
