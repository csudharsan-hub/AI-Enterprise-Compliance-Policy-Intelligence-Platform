import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiBriefcase, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import AppLayout from '../components/common/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/analysisService';
import { formatDate, getDocTypeLabel, getRoleLabel, getRoleColor } from '../utils/riskUtils';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ name:'', department:'', jobTitle:'', currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => {
    getProfile().then(d => { setData(d); setForm(f=>({...f, name:d.user.name||'', department:d.user.department||'', jobTitle:d.user.jobTitle||''})); })
      .catch(()=>toast.error('Failed to load profile.')).finally(()=>setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match.');
    setSaving(true);
    try {
      const payload = { name:form.name, department:form.department, jobTitle:form.jobTitle };
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const d = await updateProfile(payload);
      updateUser(d.user); setData(p=>({...p, user:d.user}));
      setForm(f=>({...f, currentPassword:'', newPassword:'', confirmPassword:''}));
      toast.success('Profile updated!');
    } catch(e) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return <AppLayout title="Profile"><div className="flex items-center justify-center h-64"><LoadingSpinner size="lg"/></div></AppLayout>;

  const stats   = data?.stats||{};
  const recent  = stats?.recentReports||[];
  const role    = data?.user?.roles?.[0];

  return (
    <AppLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card p-6 bg-gradient-to-r from-primary-700 to-violet-700 border-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-black text-white">{data?.user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{data?.user?.name}</h2>
              <p className="text-primary-200 text-sm">{data?.user?.email}</p>
              {role && <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${getRoleColor(role)}`}>{getRoleLabel(role)}</span>}
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-2xl font-black text-white">{stats.totalDocuments||0}</p>
              <p className="text-primary-200 text-xs">Documents</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Edit form */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2"><FiUser className="text-primary-600" size={18}/>Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              {[{icon:FiUser,label:'Full Name',key:'name',type:'text',placeholder:'Your full name'},{icon:FiBriefcase,label:'Department',key:'department',type:'text',placeholder:'e.g. Legal, HR'},{icon:FiBriefcase,label:'Job Title',key:'jobTitle',type:'text',placeholder:'e.g. Compliance Officer'}].map(({icon:Icon,label,key,type,placeholder})=>(
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder={placeholder} className="input-field pl-9" disabled={saving}/>
                  </div>
                </div>
              ))}
              <div><label className="label"><FiMail size={12} className="inline mr-1"/>Email</label><input type="email" value={data?.user?.email||''} className="input-field opacity-60 cursor-not-allowed" disabled/><p className="text-xs text-slate-400 mt-1">Email cannot be changed</p></div>
              <hr className="border-slate-200 dark:border-dark-700"/>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Change Password (optional)</p>
              {[{key:'currentPassword',label:'Current Password'},{key:'newPassword',label:'New Password'},{key:'confirmPassword',label:'Confirm New Password'}].map(({key,label})=>(
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
                    <input type={showPw?'text':'password'} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} placeholder="••••••••" className="input-field pl-9 pr-9" disabled={saving}/>
                    {key==='currentPassword'&&<button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw?<FiEyeOff size={14}/>:<FiEye size={14}/>}</button>}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving?<><LoadingSpinner size="sm" color="white"/>Saving…</>:<><FiSave size={15}/>Save Changes</>}
              </button>
            </form>
          </div>

          {/* Recent reports */}
          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Recent Reports</h3>
            {recent.length===0
              ? <div className="text-center py-10"><p className="text-3xl mb-2">📄</p><p className="text-sm text-slate-400">No reports yet.</p></div>
              : <div className="space-y-2">
                  {recent.map(r=>(
                    <a key={r.id||r._id} href={`/report/${r.id||r._id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-700 hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors group">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate group-hover:text-primary-600 transition-colors">{r.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{getDocTypeLabel(r.documentType)} · {formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-500">{r.riskScore}</span>
                        <RiskBadge level={r.riskLevel}/>
                      </div>
                    </a>
                  ))}
                </div>
            }
            {/* Stats */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-dark-700 grid grid-cols-2 gap-3">
              {[{l:'Total',v:stats.totalDocuments||0},{l:'Avg Risk',v:`${stats.avgRiskScore||0}/100`},{l:'Critical',v:stats.criticalCount||0},{l:'Approved',v:stats.approved||0}].map(({l,v})=>(
                <div key={l} className="p-2.5 rounded-lg bg-slate-50 dark:bg-dark-700 text-center">
                  <p className="text-lg font-black text-slate-800 dark:text-white">{v}</p>
                  <p className="text-xs text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
