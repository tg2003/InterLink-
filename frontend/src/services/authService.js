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

  // Supervisor registration (PB-06, FR-03, US-02)
  async registerSupervisor(supervisorData) {
    const res = await api.post('/auth/register/supervisor', supervisorData);
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

  // Upload Profile Picture (Works for any role)
  async uploadProfilePicture(formData) {
    const res = await api.post('/auth/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Delete Profile Picture (Works for any role)
  async deleteProfilePicture() {
    const res = await api.delete('/auth/profile-picture');
    return res.data;
  },

  // Employer Profile
  async getEmployerProfile() {
    const res = await api.get('/auth/employer/profile');
    return res.data;
  },

  async updateEmployerProfile(data) {
    const isFormData = data instanceof FormData;
    const res = await api.put('/auth/employer/profile', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  // Admin Profile
  async getAdminProfile() {
    const res = await api.get('/auth/admin/profile');
    return res.data;
  },

  async updateAdminProfile(data) {
    const isFormData = data instanceof FormData;
    const res = await api.put('/auth/admin/profile', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },
};

export default authService;
