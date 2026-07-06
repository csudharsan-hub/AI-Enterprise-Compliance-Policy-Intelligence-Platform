import React, { useState, useEffect } from 'react';
import { FiGitMerge, FiPlus, FiMinus, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getReports, compareReports } from '../services/analysisService';
import { getRiskColors, formatDateTime } from '../utils/riskUtils';

export default function ComparePage() {
  const [reports,    setReports]    = useState([]);
  const [idA,        setIdA]        = useState('');
  const [idB,        setIdB]        = useState('');
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [loadingRep, setLoadingRep] = useState(true);

  useEffect(() => {
    getReports({ size:50, sortBy:'createdAt', order:'desc', page:0 })
      .then(d => setReports(d.reports||[]))
      .catch(()=>{})
      .finally(()=>setLoadingRep(false));
  }, []);

  const handleCompare = async () => {
    if (!idA||!idB) return toast.error('Select two reports to compare.');
    if (idA===idB)  return toast.error('Select two different reports.');
    setLoading(true); setResult(null);
    try { setResult(await compareReports(idA, idB)); toast.success('Comparison complete!'); }
    catch(e) { toast.error(e.message); } finally { setLoading(false); }
  };

  const reportA = reports.find(r=>(r.id||r._id)===idA);
  const reportB = reports.find(r=>(r.id||r._id)===idB);

  return (
    <AppLayout title="Version Comparison">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Selector */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FiGitMerge className="text-primary-600" size={18}/> Compare Two Document Versions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {[{label:'Version A (Older)',val:idA,set:setIdA},{label:'Version B (Newer)',val:idB,set:setIdB}].map(({label,val,set})=>(
              <div key={label}>
                <label className="label">{label}</label>
                {loadingRep ? <div className="input-field h-10 skeleton"/> :
                <select value={val} onChange={e=>set(e.target.value)} className="input-field">
                  <option value="">— Select report —</option>
                  {reports.map(r=>{const rid=r.id||r._id;return<option key={rid} value={rid}>{r.title} ({r.riskScore}/100)</option>;})}
                </select>}
              </div>
            ))}
          </div>

          {idA && idB && reportA && reportB && (
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[reportA,reportB].map((r,i)=>{
                const c=getRiskColors(r.riskLevel);
                return (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Version {i===0?'A':'B'}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(r.createdAt)}</p>
                    <p className="text-sm font-black mt-1" style={{color:c.hex}}>Risk: {r.riskScore}/100 — {r.riskLevel}</p>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={handleCompare} disabled={loading||!idA||!idB} className="btn-primary w-full">
            {loading ? <><LoadingSpinner size="sm" color="white"/>Comparing…</> : <><FiGitMerge size={16}/>Run AI Comparison</>}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-5 animate-slide-up">
            {/* Summary */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">Comparison Summary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{result.aiSummary}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {label:'Risk A', val:`${result.riskScoreA}/100`, color: getRiskColors('HIGH').hex},
                  {label:'Risk B', val:`${result.riskScoreB}/100`, color: getRiskColors('HIGH').hex},
                  {label:'Delta',  val:(result.riskDelta>0?'+':'')+result.riskDelta, color: result.riskDelta>0?'#ef4444':result.riskDelta<0?'#22c55e':'#64748b'},
                ].map(({label,val,color})=>(
                  <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700 text-center">
                    <p className="text-xl font-black" style={{color}}>{val}</p>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Added / Removed / Modified */}
            {[
              {label:'Added Clauses',    items:result.addedClauses,    icon:FiPlus,  color:'text-red-600 dark:text-red-400',    bg:'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'},
              {label:'Removed Clauses',  items:result.removedClauses,  icon:FiMinus, color:'text-green-600 dark:text-green-400',bg:'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'},
              {label:'Modified Clauses', items:result.modifiedClauses, icon:FiEdit,  color:'text-yellow-600 dark:text-yellow-400',bg:'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'},
            ].filter(s=>s.items?.length>0).map(({label,items,icon:Icon,color,bg})=>(
              <div key={label} className={`card p-5 border ${bg}`}>
                <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${color}`}>
                  <Icon size={15}/>{label} ({items.length})
                </h4>
                <ul className="space-y-2">
                  {items.map((item,i)=>(
                    <li key={i} className={`flex items-start gap-2 text-sm ${color}`}>
                      <Icon size={12} className="flex-shrink-0 mt-1"/>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {result.addedClauses?.length===0 && result.removedClauses?.length===0 && result.modifiedClauses?.length===0 && (
              <div className="card p-8 text-center"><p className="text-2xl mb-2">✅</p><p className="text-slate-500">No significant legal changes detected between versions.</p></div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
