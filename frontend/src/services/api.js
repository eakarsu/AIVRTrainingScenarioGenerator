import axios from 'axios';

const API_BASE = 'http://localhost:3402/api';

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

// ---- New AI feature APIs (Proposed NEW from audit) ----

// Adaptive assessment engine
export const adaptiveAssessmentAPI = {
  startSession: (data) => api.post('/adaptive-assessment/start', data),
  submitAnswer: (sessionId, data) => api.post(`/adaptive-assessment/${sessionId}/answer`, data),
  finishSession: (sessionId) => api.post(`/adaptive-assessment/${sessionId}/finish`),
  getSession: (sessionId) => api.get(`/adaptive-assessment/${sessionId}`),
  listSessions: () => api.get('/adaptive-assessment'),
  gradeAnswer: (data) => api.post('/adaptive-assessment/grade', data),
};

// Scenario-to-scene compiler
export const sceneCompilerAPI = {
  compile: (data) => api.post('/scene-compiler/compile', data),
  list: () => api.get('/scene-compiler'),
  getOne: (id) => api.get(`/scene-compiler/${id}`),
  download: (id) => api.get(`/scene-compiler/${id}/download`),
  delete: (id) => api.delete(`/scene-compiler/${id}`),
};

// Voice-driven roleplay simulator
export const roleplayAPI = {
  startSession: (data) => api.post('/roleplay/start', data),
  sendTurn: (sessionId, data) => api.post(`/roleplay/${sessionId}/turn`, data),
  endSession: (sessionId) => api.post(`/roleplay/${sessionId}/end`),
  getSession: (sessionId) => api.get(`/roleplay/${sessionId}`),
  listSessions: () => api.get('/roleplay'),
};

// Incident-to-curriculum loop
export const incidentLoopAPI = {
  triggerLoop: (incidentId) => api.post(`/incident-loop/${incidentId}/trigger`),
  list: () => api.get('/incident-loop'),
  getOne: (id) => api.get(`/incident-loop/${id}`),
};

// Compliance & certification expiry agent
export const complianceAgentAPI = {
  runScan: () => api.post('/compliance-agent/scan'),
  getDashboard: () => api.get('/compliance-agent/dashboard'),
  listAlerts: () => api.get('/compliance-agent/alerts'),
  draftReminder: (certId) => api.post(`/compliance-agent/certifications/${certId}/draft-reminder`),
  gapAnalysis: () => api.get('/compliance-agent/gap-analysis'),
};

// Direct AI feature endpoints (registered under /api/ai)
export const aiAPI = {
  generateScenario: (data) => api.post('/ai/generate-scenario', data),
  gradeAssessment: (data) => api.post('/ai/grade-assessment', data),
  adaptivePath: (data) => api.post('/ai/adaptive-path', data),
  performancePrediction: (data) => api.post('/ai/performance-prediction', data),
  incidentSimulation: (data) => api.post('/ai/incident-simulation', data),
  skillGapIdentification: (data) => api.post('/ai/skill-gap-identification', data),
  scenarioRandomization: (data) => api.post('/ai/scenario-randomization', data),
};

export default api;
