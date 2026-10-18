import api from './api';

const universityService = {
  // Master list of universities (PB-21)
  getMasterList: async () => {
    const res = await api.get('/university/master-list');
    return res.data;
  },

  // University Dashboard Statistics
  getStats: async () => {
    const res = await api.get('/university/stats');
    return res.data;
  },

  // Supervisor Management (FR-05, US-03, US-10)
  getSupervisors: async (params = {}) => {
    const res = await api.get('/university/supervisors', { params });
    return res.data;
  },

  updateSupervisorStatus: async (id, status, reviewNotes = '') => {
    const res = await api.patch(`/university/supervisors/${id}/status`, { status, reviewNotes });
    return res.data;
  },

  // Enrolled Students Directory (PB-05, US-10, FR-16)
  getStudents: async (params = {}) => {
    const res = await api.get('/university/students', { params });
    return res.data;
  },

  // Student Progress Logs (FR-09, US-10)
  getStudentProgress: async (studentId) => {
    const res = await api.get(`/university/students/${studentId}/progress`);
    return res.data;
  },

  // All University Progress Logs Feed
  getAllProgressLogs: async (params = {}) => {
    const res = await api.get('/university/progress-logs', { params });
    return res.data;
  },

  // University Profile Settings
  getProfile: async () => {
    const res = await api.get('/university/profile');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/university/profile', profileData);
    return res.data;
  },
};

export default universityService;
