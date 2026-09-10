import api from './api';

// ── Analysis ────────────────────────────────────────────────────────────────
export const analyzeText = async (text, title = '') => {
  const { data } = await api.post('/analyze', { text, title });
  return data.data;
};

export const analyzeFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data.data;
};

export const analyzeUrl = async (url) => {
  const { data } = await api.post('/analyze-url', { url });
  return data.data;
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
};

// ── Reports / History ────────────────────────────────────────────────────────
export const getReports = async (params = {}) => {
  const { data } = await api.get('/reports', { params });
  return data.data;
};

export const getReport = async (id) => {
  const { data } = await api.get(`/reports/${id}`);
  return data.data;
};

export const deleteReport = async (id) => {
  const { data } = await api.delete(`/reports/${id}`);
  return data;
};

export const approveReport = async (id) => {
  const { data } = await api.post(`/reports/${id}/approve`);
  return data.data;
};

export const rejectReport = async (id, reason) => {
  const { data } = await api.post(`/reports/${id}/reject`, { reason });
  return data.data;
};

// ── Version Compare ──────────────────────────────────────────────────────────
export const compareReports = async (reportIdA, reportIdB) => {
  const { data } = await api.post('/compare', { reportIdA, reportIdB });
  return data.data;
};

export const getComparisons = async (params = {}) => {
  const { data } = await api.get('/compare', { params });
  return data.data;
};

// ── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (params = {}) => {
  const { data } = await api.get('/audit', { params });
  return data.data;
};

export const getMyAuditLogs = async (params = {}) => {
  const { data } = await api.get('/audit/my', { params });
  return data.data;
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async () => {
  const { data } = await api.get('/profile');
  return data.data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/profile', payload);
  return data.data;
};

// ── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data.data;
};

// ── Download helpers ─────────────────────────────────────────────────────────
export const downloadReportJSON = async (report) => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `compliance-report-${report.id || report._id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};
