import api from './api';

export const studentService = {
  // ─── Profile ──────────────────────────────────────────────
  async getMyProfile() {
    const res = await api.get('/student/profile');
    return res.data;
  },

  async updateMyProfile(formData) {
    // formData is a FormData object — pass Content-Type: undefined so axios
    // auto-sets multipart/form-data with the correct boundary.
    // The request interceptor in api.js still attaches the JWT header.
    const res = await api.put('/student/profile', formData, {
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  // ─── Progress Logs ────────────────────────────────────────
  async getMyProgressLogs() {
    const res = await api.get('/student/progress-logs');
    return res.data;
  },

  async addProgressLog(logData) {
    const res = await api.post('/student/progress-logs', logData);
    return res.data;
  },

  async deleteProgressLog(logId) {
    const res = await api.delete(`/student/progress-logs/${logId}`);
    return res.data;
  },

  // ─── Job Applications ─────────────────────────────────────
  async getMyApplications() {
    const res = await api.get('/student/applications');
    return res.data;
  },

  async applyForJob(jobId) {
    const res = await api.post(`/student/apply/${jobId}`);
    return res.data;
  },

  async withdrawApplication(appId) {
    const res = await api.delete(`/student/applications/${appId}`);
    return res.data;
  },
};

export default studentService;
