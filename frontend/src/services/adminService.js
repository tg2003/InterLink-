import api from './api';

const adminService = {
  // Stats overview
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // University Approvals
  getUniversities: async (params = {}) => {
    const res = await api.get('/admin/universities', { params });
    return res.data;
  },

  updateUniversityStatus: async (id, status, note = '') => {
    const res = await api.patch(`/admin/universities/${id}/status`, { status, note });
    return res.data;
  },

  deleteUniversity: async (id) => {
    const res = await api.delete(`/admin/universities/${id}`);
    return res.data;
  },

  // Employer Verification
  getEmployers: async (params = {}) => {
    const res = await api.get('/admin/employers', { params });
    return res.data;
  },

  updateEmployerStatus: async (id, status, note = '') => {
    const res = await api.patch(`/admin/employers/${id}/status`, { status, note });
    return res.data;
  },

  deleteEmployer: async (id) => {
    const res = await api.delete(`/admin/employers/${id}`);
    return res.data;
  },

  // Student Directory
  getStudents: async (params = {}) => {
    const res = await api.get('/admin/students', { params });
    return res.data;
  },

  deleteStudent: async (id) => {
    const res = await api.delete(`/admin/students/${id}`);
    return res.data;
  },

  // System Audit Logs
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },

  clearAuditLogs: async () => {
    const res = await api.post('/admin/audit-logs/clear');
    return res.data;
  },

  // Platform Settings
  getSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await api.put('/admin/settings', settingsData);
    return res.data;
  },
};

export default adminService;
