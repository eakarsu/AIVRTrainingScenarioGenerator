import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const createCrudAPI = (resource) => ({
  getAll: () => api.get(`/${resource}`),
  getOne: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`),
  generate: (data) => api.post(`/${resource}/generate`, data),
});

export const safetyTrainingAPI = createCrudAPI('safety-training');
export const surgicalProcedureAPI = createCrudAPI('surgical-procedures');
export const customerServiceAPI = createCrudAPI('customer-service');
export const vrEnvironmentAPI = createCrudAPI('vr-environments');
export const incidentReportAPI = createCrudAPI('incident-reports');
export const assessmentQuestionAPI = createCrudAPI('assessment-questions');
export const assessmentScoreAPI = createCrudAPI('assessment-scores');
export const complianceAPI = createCrudAPI('compliance');
export const trainingModuleAPI = createCrudAPI('training-modules');
export const certificationAPI = createCrudAPI('certifications');

export default api;
