import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiShield, FiEye, FiEyeOff, FiCheck, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ROLES = [
  { value:'EMPLOYEE',           label:'Employee',           desc:'Upload & view documents' },
  { value:'HR',                 label:'HR Team',            desc:'Upload & analyze HR policies' },
  { value:'LEGAL',              label:'Legal Team',         desc:'Upload, analyze & approve' },
  { value:'COMPLIANCE_OFFICER', label:'Compliance Officer', desc:'Full access + audit logs' },
  { value:'ADMIN',              label:'Admin',              desc:'Platform administration' },
];

const PwRule = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met?'text-green-600 dark:text-green-400':'text-slate-400'}`}>
    <FiCheck size={11} className={met?'opacity-100':'opacity-30'}/>{label}
  </div>
);

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'EMPLOYEE', department:'', jobTitle:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const pwRules = { length:form.password.length>=6, upper:/[A-Z]/.test(form.password), lower:/[a-z]/.test(form.password), num:/\d/.test(form.password) };

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name    = 'Name is required';
    if (!form.email)           e.email   = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)        e.password = 'Password is required';
    else if (!Object.values(pwRules).every(Boolean)) e.password = 'Password does not meet requirements';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role, form.department, form.jobTitle);
      toast.success('Account created! Welcome to ComplianceAI.');
      navigate('/dashboard');
    } catch (err) { toast.error(err.message||'Registration failed.'); }
    finally { setLoading(false); }
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
          <h2 className="text-3xl font-black text-white leading-tight mb-6">Start analyzing legal documents in minutes.</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{l:'Free to use',i:'✅'},{l:'All document types',i:'📄'},{l:'AI-powered',i:'🤖'},{l:'Secure & private',i:'🔒'},{l:'Role-based access',i:'👥'},{l:'Audit logs',i:'📊'}].map(({l,i})=>(
              <div key={l} className="flex items-center gap-2 text-sm text-slate-300 bg-dark-800 px-3 py-2 rounded-lg">
                <span>{i}</span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center"><FiShield className="text-white" size={14}/></div>
            <span className="font-bold text-lg dark:text-white">ComplianceAI</span>
          </div>

          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Free forever · No credit card required</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="John Smith"
                  className={`input-field pl-9 ${errors.name?'border-red-400':''}`} disabled={loading}/>
              </div>
              {errors.name&&<p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com"
                  className={`input-field pl-9 ${errors.email?'border-red-400':''}`} disabled={loading}/>
              </div>
              {errors.email&&<p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <select value={form.role} onChange={e=>set('role',e.target.value)} className="input-field" disabled={loading}>
                {ROLES.map(r=><option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
              </select>
            </div>

            {/* Department + Job Title in 2 cols */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Department</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                  <input type="text" value={form.department} onChange={e=>set('department',e.target.value)} placeholder="Legal"
                    className="input-field pl-9 text-sm" disabled={loading}/>
                </div>
              </div>
              <div>
                <label className="label">Job Title</label>
                <input type="text" value={form.jobTitle} onChange={e=>set('jobTitle',e.target.value)} placeholder="Manager"
                  className="input-field text-sm" disabled={loading}/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                <input type={showPw?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder="Create a strong password" autoComplete="new-password"
                  className={`input-field pl-9 pr-9 ${errors.password?'border-red-400':''}`} disabled={loading}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw?<FiEyeOff size={15}/>:<FiEye size={15}/>}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <PwRule met={pwRules.length} label="6+ characters"/>
                  <PwRule met={pwRules.upper}  label="Uppercase letter"/>
                  <PwRule met={pwRules.lower}  label="Lowercase letter"/>
                  <PwRule met={pwRules.num}    label="One number"/>
                </div>
              )}
              {errors.password&&<p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                <input type="password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)}
                  placeholder="Repeat your password" autoComplete="new-password"
                  className={`input-field pl-9 ${errors.confirmPassword?'border-red-400':''}`} disabled={loading}/>
              </div>
              {errors.confirmPassword&&<p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading?<><LoadingSpinner size="sm" color="white"/>Creating account…</>:'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
