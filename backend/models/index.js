const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
}, { timestamps: true });

const SafetyTrainingScenario = sequelize.define('SafetyTrainingScenario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  hazardType: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.STRING },
  vrEnvironment: { type: DataTypes.STRING },
  objectives: { type: DataTypes.JSON },
  duration: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const SurgicalProcedure = sequelize.define('SurgicalProcedure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  procedureType: { type: DataTypes.STRING },
  specialty: { type: DataTypes.STRING },
  complexity: { type: DataTypes.STRING },
  steps: { type: DataTypes.JSON },
  equipment: { type: DataTypes.JSON },
  duration: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const CustomerServiceSimulation = sequelize.define('CustomerServiceSimulation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  scenarioType: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.STRING },
  customerPersona: { type: DataTypes.STRING },
  issue: { type: DataTypes.TEXT },
  resolution: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const VREnvironmentTemplate = sequelize.define('VREnvironmentTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  environmentType: { type: DataTypes.STRING },
  setting: { type: DataTypes.STRING },
  lighting: { type: DataTypes.STRING },
  interactiveElements: { type: DataTypes.JSON },
  complexity: { type: DataTypes.STRING },
  polyCount: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const IncidentReport = sequelize.define('IncidentReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  incidentType: { type: DataTypes.STRING },
  severity: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY },
  rootCause: { type: DataTypes.TEXT },
  correctiveActions: { type: DataTypes.JSON },
  status: { type: DataTypes.STRING, defaultValue: 'open' },
  aiAnalyzed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  question: { type: DataTypes.TEXT, allowNull: false },
  questionType: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.STRING },
  options: { type: DataTypes.JSON },
  correctAnswer: { type: DataTypes.STRING },
  explanation: { type: DataTypes.TEXT },
  points: { type: DataTypes.INTEGER, defaultValue: 10 },
  aiGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const AssessmentScore = sequelize.define('AssessmentScore', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  traineeEmail: { type: DataTypes.STRING, allowNull: false },
  traineeName: { type: DataTypes.STRING, allowNull: false },
  moduleName: { type: DataTypes.STRING, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
  maxScore: { type: DataTypes.FLOAT, allowNull: false },
  percentage: { type: DataTypes.FLOAT },
  attemptDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  timeSpent: { type: DataTypes.INTEGER },
  passed: { type: DataTypes.BOOLEAN },
  feedback: { type: DataTypes.TEXT },
}, { timestamps: true });

const ComplianceRequirement = sequelize.define('ComplianceRequirement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  regulationType: { type: DataTypes.STRING },
  authority: { type: DataTypes.STRING },
  effectiveDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  priority: { type: DataTypes.STRING },
  applicableDepartments: { type: DataTypes.JSON },
  lastAuditDate: { type: DataTypes.DATEONLY },
}, { timestamps: true });

const TrainingModule = sequelize.define('TrainingModule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER },
  prerequisites: { type: DataTypes.JSON },
  learningObjectives: { type: DataTypes.JSON },
  format: { type: DataTypes.STRING },
  maxParticipants: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
}, { timestamps: true });

const CertificationRecord = sequelize.define('CertificationRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  traineeName: { type: DataTypes.STRING, allowNull: false },
  traineeEmail: { type: DataTypes.STRING, allowNull: false },
  certificationName: { type: DataTypes.STRING, allowNull: false },
  issuingBody: { type: DataTypes.STRING },
  issueDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  score: { type: DataTypes.FLOAT },
  certificateNumber: { type: DataTypes.STRING },
  renewalRequired: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = {
  sequelize,
  User,
  SafetyTrainingScenario,
  SurgicalProcedure,
  CustomerServiceSimulation,
  VREnvironmentTemplate,
  IncidentReport,
  AssessmentQuestion,
  AssessmentScore,
  ComplianceRequirement,
  TrainingModule,
  CertificationRecord,
};
