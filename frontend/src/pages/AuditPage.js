import React, { useState, useEffect, useCallback } from 'react';
import { FiActivity, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AppLayout from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAuditLogs } from '../services/analysisService';
import { formatDateTime, getRoleLabel, getRoleColor } from '../utils/riskUtils';
import { toast } from 'react-toastify';

const ACTION_COLORS = {
  UPLOADED:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ANALYZED:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  APPROVED:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  REJECTED:'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  DELETED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  DOWNLOADED:'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  LOGIN:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  REGISTER:'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const ACTION_ICONS = {
  UPLOADED:'📤', ANALYZED:'🤖', APPROVED:'✅', REJECTED:'❌',
  DELETED:'🗑️', DOWNLOADED:'📥', LOGIN:'🔑', REGISTER:'🎉',
};

export default function AuditPage() {
  const [logs,       setLogs]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [action,     setAction]     = useState('');
  const [page,       setPage]       = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size:20 };
      if (action) params.action = action;
      const data = await getAuditLogs(params);
      setLogs(data.logs||[]);
      setPagination(data.pagination||{});
    } catch(e) { toast.error('Failed to load audit logs.'); }
    finally { setLoading(false); }
  }, [page, action]);

  useEffect(() => { load(); }, [load]);

  return (
    <AppLayout title="Audit Logs"
      actions={<button onClick={load} className="btn-secondary text-sm px-3"><FiRefreshCw size={15}/></button>}>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Filter */}
        <div className="card p-4 flex items-center gap-3">
          <FiActivity className="text-primary-600" size={18}/>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Action:</span>
          <select value={action} onChange={e=>{setAction(e.target.value);setPage(0);}} className="input-field text-sm w-auto min-w-[160px]">
            <option value="">All Actions</option>
            {Object.keys(ACTION_COLORS).map(a=><option key={a} value={a}>{a}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">{pagination.total||0} total entries</span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-800">
                  {['Action','User','Role','Resource','Timestamp'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {loading ? Array.from({length:8}).map((_,i)=>(
                  <tr key={i}>{[1,2,3,4,5].map(j=><td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-full"/></td>)}</tr>
                )) : logs.length===0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No audit logs found.</td></tr>
                ) : logs.map(log=>(
                  <tr key={log.id||log._id} className="hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action]||'bg-slate-100 text-slate-700'}`}>
                        <span>{ACTION_ICONS[log.action]||'•'}</span>{log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{log.userName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(log.userRole)}`}>
                        {getRoleLabel(log.userRole)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[250px]">
                      <p className="text-xs text-slate-500">{log.resourceType}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{log.resourceTitle||log.resourceId}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-dark-700">
              <p className="text-xs text-slate-500">Page {page+1} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={()=>setPage(p=>p-1)} disabled={page===0} className="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700"><FiChevronLeft size={16}/></button>
                <button onClick={()=>setPage(p=>p+1)} disabled={page>=pagination.pages-1} className="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700"><FiChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
