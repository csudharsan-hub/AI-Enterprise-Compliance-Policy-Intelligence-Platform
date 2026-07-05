export const getRiskColors = (level) => {
  const l = (level || '').toUpperCase();
  switch (l) {
    case 'SAFE':     return { text:'text-green-600 dark:text-green-400',  bg:'bg-green-100 dark:bg-green-900/30',  border:'border-green-300',  badge:'badge-safe',     hex:'#22c55e', gradient:'from-green-500 to-green-600'  };
    case 'MEDIUM':   return { text:'text-yellow-600 dark:text-yellow-400',bg:'bg-yellow-100 dark:bg-yellow-900/30',border:'border-yellow-300', badge:'badge-medium',   hex:'#f59e0b', gradient:'from-yellow-500 to-orange-500' };
    case 'HIGH':     return { text:'text-red-600 dark:text-red-400',      bg:'bg-red-100 dark:bg-red-900/30',      border:'border-red-300',    badge:'badge-high',     hex:'#ef4444', gradient:'from-red-500 to-red-600'       };
    case 'CRITICAL': return { text:'text-red-700 dark:text-red-300',      bg:'bg-red-200 dark:bg-red-900/50',      border:'border-red-400',    badge:'badge-critical', hex:'#dc2626', gradient:'from-red-600 to-rose-700'      };
    default:         return { text:'text-slate-600 dark:text-slate-400',  bg:'bg-slate-100 dark:bg-slate-800',     border:'border-slate-300',  badge:'',               hex:'#64748b', gradient:'from-slate-400 to-slate-500'   };
  }
};

export const getSeverityColors = (severity) => {
  switch ((severity || '').toLowerCase()) {
    case 'high':
    case 'critical': return { badge:'badge-high',   hex:'#ef4444', bg:'bg-red-50 dark:bg-red-900/20'    };
    case 'medium':   return { badge:'badge-medium', hex:'#f59e0b', bg:'bg-yellow-50 dark:bg-yellow-900/20' };
    case 'low':      return { badge:'badge-safe',   hex:'#22c55e', bg:'bg-green-50 dark:bg-green-900/20' };
    default:         return { badge:'',             hex:'#64748b', bg:'bg-slate-50 dark:bg-slate-800'   };
  }
};

export const getStatusColors = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':       return 'badge-safe';
    case 'PENDING_REVIEW': return 'badge-medium';
    case 'UNDER_REVIEW':   return 'badge-medium';
    case 'REJECTED':       return 'badge-high';
    case 'ARCHIVED':       return '';
    default:               return '';
  }
};

export const getDocTypeLabel = (type) => {
  const map = {
    PRIVACY_POLICY:'Privacy Policy', TERMS_OF_SERVICE:'Terms of Service',
    NDA:'NDA', VENDOR_CONTRACT:'Vendor Contract', EMPLOYMENT_CONTRACT:'Employment Contract',
    PURCHASE_AGREEMENT:'Purchase Agreement', COMPLIANCE_POLICY:'Compliance Policy',
    HR_POLICY:'HR Policy', OTHER:'Other',
  };
  return map[type] || type || 'Unknown';
};

export const getSourceLabel = (type) => {
  const map = { paste:'Text', pdf:'PDF', docx:'DOCX', txt:'TXT', url:'URL' };
  return map[(type||'').toLowerCase()] || (type||'').toUpperCase();
};

export const getRoleLabel = (role) => {
  const map = {
    ADMIN:'Admin', LEGAL:'Legal Team', HR:'HR Team',
    COMPLIANCE_OFFICER:'Compliance Officer', EMPLOYEE:'Employee',
  };
  return map[role] || role;
};

export const getRoleColor = (role) => {
  const map = {
    ADMIN:'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    LEGAL:'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    HR:'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    COMPLIANCE_OFFICER:'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    EMPLOYEE:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return map[role] || map.EMPLOYEE;
};

export const formatDate  = (d) => d ? new Date(d).toLocaleDateString('en-US',{ year:'numeric', month:'short', day:'numeric' }) : '—';
export const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-US',{ year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
export const truncate = (s, n=100) => (!s||s.length<=n) ? s : s.slice(0,n)+'…';
