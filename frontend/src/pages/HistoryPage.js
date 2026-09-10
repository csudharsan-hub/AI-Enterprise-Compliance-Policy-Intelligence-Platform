import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiTrash2, FiDownload, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import { RiskBadge, StatusBadge } from '../components/common/RiskBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getReports, deleteReport, downloadReportJSON, getReport } from '../services/analysisService';
import { formatDate, getDocTypeLabel, getSourceLabel, getRiskColors } from '../utils/riskUtils';

const SkeletonRow = () => (
  <tr>{[1,2,3,4,5,6,7].map(i=><td key={i} className="px-4 py-3"><div className="skeleton h-4 rounded w-full"/></td>)}</tr>
);

export default function HistoryPage() {
  const navigate = useNavigate();
  const [reports,    setReports]    = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filters,    setFilters]    = useState({ search:'', riskLevel:'', status:'', sortBy:'createdAt', order:'desc', page:0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { size:10, sortBy:filters.sortBy, order:filters.order, page:filters.page };
      if (filters.search)   params.search   = filters.search;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;
      if (filters.status)   params.status   = filters.status;
      const data = await getReports(params);
      setReports(data.reports || []);
      setPagination(data.pagination || {});
    } catch (e) { toast.error('Failed to load history.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, filters.search ? 400 : 0);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeletingId(id);
    try { await deleteReport(id); setReports(p=>p.filter(r=>(r.id||r._id)!==id)); toast.success('Deleted.'); }
    catch (e) { toast.error(e.message); } finally { setDeletingId(null); }
  };

  const handleDownload = async (id) => {
    try { const r = await getReport(id); downloadReportJSON(r); }
    catch (e) { toast.error(e.message); }
  };

  const set = (k, v) => setFilters(p=>({...p,[k]:v,page:k!=='page'?0:v}));

  return (
    <AppLayout title="Analysis History">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
              <input type="text" placeholder="Search by title…" value={filters.search} onChange={e=>set('search',e.target.value)} className="input-field pl-9 text-sm"/>
            </div>
            <select value={filters.riskLevel} onChange={e=>set('riskLevel',e.target.value)} className="input-field text-sm w-auto min-w-[140px]">
              <option value="">All Risk Levels</option>
              {['SAFE','MEDIUM','HIGH','CRITICAL'].map(l=><option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filters.status} onChange={e=>set('status',e.target.value)} className="input-field text-sm w-auto min-w-[160px]">
              <option value="">All Statuses</option>
              {['PENDING_REVIEW','APPROVED','REJECTED','ARCHIVED'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
            <select value={`${filters.sortBy}-${filters.order}`} onChange={e=>{const[s,o]=e.target.value.split('-');setFilters(p=>({...p,sortBy:s,order:o,page:0}));}} className="input-field text-sm w-auto min-w-[150px]">
              <option value="createdAt-desc">Date (Newest)</option>
              <option value="createdAt-asc">Date (Oldest)</option>
              <option value="riskScore-desc">Risk Score (High)</option>
              <option value="riskScore-asc">Risk Score (Low)</option>
            </select>
            <button onClick={load} className="btn-secondary text-sm px-3" title="Refresh"><FiRefreshCw size={15}/></button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-800">
                  {['Title','Type','Source','Risk','Score','Status','Date','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i}/>)
                : reports.length===0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No reports found. Try adjusting your filters.
                  </td></tr>
                ) : reports.map(r=>{
                  const rid = r.id||r._id;
                  const colors = getRiskColors(r.riskLevel);
                  return (
                    <tr key={rid} className="hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]"><p className="font-medium text-slate-800 dark:text-slate-200 truncate">{r.title}</p></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{getDocTypeLabel(r.documentType)}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded-full font-medium text-slate-600 dark:text-slate-400">{getSourceLabel(r.sourceType)}</span></td>
                      <td className="px-4 py-3"><RiskBadge level={r.riskLevel}/></td>
                      <td className="px-4 py-3 font-bold" style={{color:colors.hex}}>{r.riskScore}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={()=>navigate(`/report/${rid}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View"><FiEye size={15}/></button>
                          <button onClick={()=>handleDownload(rid)} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Download"><FiDownload size={15}/></button>
                          <button onClick={()=>handleDelete(rid)} disabled={deletingId===rid} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40" title="Delete">
                            {deletingId===rid ? <LoadingSpinner size="sm"/> : <FiTrash2 size={15}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-dark-700">
              <p className="text-xs text-slate-500">Showing {(pagination.page)*10+1}–{Math.min((pagination.page+1)*10,pagination.total)} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <button onClick={()=>set('page',filters.page-1)} disabled={!pagination.hasPrev} className="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700"><FiChevronLeft size={16}/></button>
                <span className="text-sm text-slate-600 dark:text-slate-400">{pagination.page+1} / {pagination.pages}</span>
                <button onClick={()=>set('page',filters.page+1)} disabled={!pagination.hasNext} className="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700"><FiChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
