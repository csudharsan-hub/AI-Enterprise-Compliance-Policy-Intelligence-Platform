import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiZap, FiFileText, FiUsers, FiGitMerge, FiArrowRight, FiMoon, FiSun, FiActivity } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon:FiZap,       title:'AI Document Classification',  desc:'Automatically identifies Privacy Policies, NDAs, Vendor Contracts, Employment Agreements and 6 more types with confidence scores.' },
  { icon:FiShield,    title:'Risk Detection Engine',        desc:'Detects 21 categories of dangerous clauses — from Data Selling to Forced Arbitration — with severity ratings and plain-English explanations.' },
  { icon:FiFileText,  title:'AI Rewrite Suggestions',       desc:'For every dangerous clause, AI generates a privacy-friendly, legally sound alternative your legal team can use immediately.' },
  { icon:FiGitMerge,  title:'Version Comparison',           desc:'Upload two versions of a document and AI highlights what was added, removed, or modified — critical for contract renewals.' },
  { icon:FiActivity,  title:'Compliance Score',             desc:'Every document receives both a Risk Score and a Compliance Score, giving leadership a clear executive view of organizational risk.' },
  { icon:FiUsers,     title:'Role-Based Access Control',    desc:'5 roles: Admin, Legal, HR, Compliance Officer, Employee. Each with tailored permissions for upload, analysis, and approval workflows.' },
];

const ROLES = [
  { role:'Employee',           perms:['Upload documents'],                                          color:'bg-slate-100 dark:bg-slate-800' },
  { role:'HR Team',            perms:['Upload','Analyze HR Policies'],                              color:'bg-green-50 dark:bg-green-900/20' },
  { role:'Legal Team',         perms:['Upload','Analyze','Approve','Reject'],                       color:'bg-blue-50 dark:bg-blue-900/20' },
  { role:'Compliance Officer', perms:['Full analysis','Audit logs','Approve/Reject'],               color:'bg-orange-50 dark:bg-orange-900/20' },
  { role:'Admin',              perms:['Everything','User management','Platform stats'],             color:'bg-purple-50 dark:bg-purple-900/20' },
];

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 text-slate-800 dark:text-slate-100">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center"><FiShield className="text-white" size={16}/></div>
            <div><p className="font-bold text-sm leading-none text-slate-800 dark:text-white">ComplianceAI</p><p className="text-xs text-slate-400 leading-none">Enterprise Platform</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">{isDark?<FiSun size={18}/>:<FiMoon size={18}/>}</button>
            <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Sign In</Link>
            <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-grid-pattern">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-medium mb-8">
            <FiZap size={14}/> Powered by Llama 3.3 70B · 4 Specialized AI Prompts
          </div>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-6">
            AI Enterprise<br/><span className="text-gradient">Compliance Platform</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-3xl mx-auto">
            Analyze thousands of legal documents in minutes. Detect risky clauses, classify document types, generate rewrite suggestions, compare versions, and manage compliance across your entire organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8">Start Free Trial <FiArrowRight size={18}/></Link>
            <Link to="/login"    className="btn-secondary text-base py-3 px-8">Sign In</Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            {['PDF · DOCX · TXT · URL','21 Risk Categories','Rewrite Suggestions','Version Comparison','Audit Logs','5 Role Types'].map(f=>(
              <span key={f} className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-400"/>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-dark-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Enterprise-Grade Features</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-12">Everything a legal and compliance team needs</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({icon:Icon,title,desc})=>(
              <div key={title} className="card p-6 card-hover">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <Icon className="text-primary-600 dark:text-primary-400" size={22}/>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role matrix */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Role-Based Permissions</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-10">Every team member gets exactly the access they need</p>
          <div className="space-y-3">
            {ROLES.map(({role,perms,color})=>(
              <div key={role} className={`card p-4 flex items-center gap-4 ${color}`}>
                <div className="w-32 flex-shrink-0"><p className="font-bold text-slate-800 dark:text-white text-sm">{role}</p></div>
                <div className="flex flex-wrap gap-2">
                  {perms.map(p=><span key={p} className="px-2.5 py-0.5 rounded-full bg-white dark:bg-dark-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-primary-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Reduce Manual Contract Review by 90%</h2>
          <p className="text-primary-200 mb-8">Join enterprise teams using AI to manage compliance at scale.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-primary-700 font-bold text-base hover:bg-primary-50 transition-colors">
            Get Started Free <FiArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200 dark:border-dark-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center"><FiShield className="text-white" size={12}/></div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">ComplianceAI Enterprise Platform</span>
          </div>
          <p>AI-powered legal document analysis. Not a substitute for professional legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
