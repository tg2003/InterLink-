import api from './api';

export const authService = {
  // Fetch approved universities for Student dropdown
  async getApprovedUniversities() {
    const res = await api.get('/auth/universities');
    return res.data;
  },

  // Student registration
  async registerStudent(studentData) {
    const res = await api.post('/auth/register/student', studentData);
    return res.data;
  },

  // University registration
  async registerUniversity(universityData) {
    const res = await api.post('/auth/register/university', universityData);
    return res.data;
  },

  // Employer registration
  async registerEmployer(employerData) {
    const res = await api.post('/auth/register/employer', employerData);
    return res.data;
  },

  // Unified login
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  // Profile verification
  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
