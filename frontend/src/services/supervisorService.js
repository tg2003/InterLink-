import api from './api';

const supervisorService = {
  // Get supervisor account status, joinStatus, review notes & university info
  getStatus: async () => {
    const res = await api.get('/supervisor/status');
    return res.data;
  },

  // Submit or re-submit join request to university head (US-02, FR-04)
  sendJoinRequest: async (data) => {
    const res = await api.post('/supervisor/join-request', data);
    return res.data;
  },

  // Supervisor overview statistics (students count, logs count, categories)
  getStats: async () => {
    const res = await api.get('/supervisor/stats');
    return res.data;
  },

  // Enrolled students under supervisor's university only (PB-09, FR-16)
  getStudents: async (params = {}) => {
    const res = await api.get('/supervisor/students', { params });
    return res.data;
  },

  // Single student progress logs (FR-09, US-05, FR-16)
  getStudentProgress: async (studentId) => {
    const res = await api.get(`/supervisor/students/${studentId}/progress`);
    return res.data;
  },

  // All student progress logs feed from this university (FR-09)
  getAllProgressLogs: async (params = {}) => {
    const res = await api.get('/supervisor/progress-logs', { params });
    return res.data;
  },

  // Supervisor profile
  getProfile: async () => {
    const res = await api.get('/supervisor/profile');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/supervisor/profile', profileData);
    return res.data;
  },
};

export default supervisorService;
