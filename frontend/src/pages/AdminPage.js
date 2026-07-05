import React, { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiFileText, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllUsers, updateUserRole, getAdminStats } from '../services/analysisService';
import { getRoleLabel, getRoleColor, formatDateTime } from '../utils/riskUtils';

const ROLES = ['ADMIN','LEGAL','HR','COMPLIANCE_OFFICER','EMPLOYEE'];

export default function AdminPage() {
  const [users,   setUsers]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null);

  useEffect(() => {
    Promise.all([getAllUsers(), getAdminStats()])
      .then(([u, s]) => { setUsers(u); setStats(s); })
      .catch(() => toast.error('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    setSaving(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers(p => p.map(u => (u.id||u._id)===userId ? { ...u, roles:[role] } : u));
      toast.success(`Role updated to ${getRoleLabel(role)}`);
    } catch(e) { toast.error(e.message); }
    finally { setSaving(null); }
  };

  if (loading) return <AppLayout title="Admin Panel"><div className="flex items-center justify-center h-64"><LoadingSpinner size="lg"/></div></AppLayout>;

  return (
    <AppLayout title="Admin Panel">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Platform stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {icon:FiFileText,    label:'Total Documents', val:stats.totalDocuments,  color:'bg-primary-600'},
              {icon:FiAlertTriangle,label:'Critical',        val:stats.criticalCount,   color:'bg-red-600'},
              {icon:FiAlertTriangle,label:'High Risk',        val:stats.highCount,       color:'bg-orange-500'},
              {icon:FiClock,       label:'Pending Review',   val:stats.pendingReview,   color:'bg-yellow-500'},
              {icon:FiShield,      label:'Approved',         val:stats.approved,        color:'bg-green-600'},
            ].map(({icon:Icon,label,val,color})=>(
              <div key={label} className="card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={18} className="text-white"/>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800 dark:text-white">{val??0}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User management */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-dark-700">
            <FiUsers className="text-primary-600" size={20}/>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">User Management</h2>
            <span className="ml-auto text-xs text-slate-400">{users.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-800">
                  {['User','Email','Current Role','Documents','Joined','Change Role'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {users.map(u=>{
                  const uid = u.id||u._id;
                  const role = u.roles?.[0];
                  return (
                    <tr key={uid} className="hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-400 text-sm font-bold">{u.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(role)}`}>
                          {getRoleLabel(role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">{u.totalDocuments||0}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select defaultValue={role} onChange={e=>handleRoleChange(uid,e.target.value)} disabled={saving===uid}
                            className="input-field text-xs py-1 w-auto min-w-[150px]">
                            {ROLES.map(r=><option key={r} value={r}>{getRoleLabel(r)}</option>)}
                          </select>
                          {saving===uid && <LoadingSpinner size="sm"/>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
