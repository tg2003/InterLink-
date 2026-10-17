import api from './api';

export const jobService = {
  // Create / Publish an internship vacancy (verified employer only)
  async createJob(jobData) {
    const res = await api.post('/jobs', jobData);
    return res.data;
  },

  // Get all vacancies posted by the logged in employer
  async getMyJobs() {
    const res = await api.get('/jobs/my-jobs');
    return res.data;
  },

  // Get single vacancy by id
  async getJobById(id) {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },

  // Update vacancy details
  async updateJob(id, updateData) {
    const res = await api.put(`/jobs/${id}`, updateData);
    return res.data;
  },

  // Toggle vacancy availability (open/closed)
  async toggleAvailability(id) {
    const res = await api.patch(`/jobs/${id}/toggle-availability`);
    return res.data;
  },

  // Delete vacancy
  async deleteJob(id) {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },

  // Browse all public vacancies
  async getAllJobs(params = {}) {
    const res = await api.get('/jobs', { params });
    return res.data;
  },
};

export default jobService;
