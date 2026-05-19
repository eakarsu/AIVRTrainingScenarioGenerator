require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(generalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/safety-training', require('./routes/safetyTraining'));
app.use('/api/surgical-procedures', require('./routes/surgicalProcedure'));
app.use('/api/customer-service', require('./routes/customerService'));
app.use('/api/vr-environments', require('./routes/vrEnvironment'));
app.use('/api/incident-reports', require('./routes/incidentReport'));
app.use('/api/assessment-questions', require('./routes/assessmentQuestion'));
app.use('/api/assessment-scores', require('./routes/assessmentScore'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/training-modules', require('./routes/trainingModule'));
app.use('/api/certifications', require('./routes/certification'));
app.use('/api/ai', require('./routes/aiFeatures'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // Use force: false to avoid data loss
    await sequelize.sync({ force: false });
    // Ensure ai_results table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(255),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    app.use('/api/adaptive-learning-paths', require('./routes/adaptiveLearningPaths')); app.use('/api/scenario-randomization', require('./routes/scenarioRandomization')); app.use('/api/performance-prediction', require('./routes/performancePrediction')); app.use('/api/skill-gap-identification', require('./routes/skillGapIdentification')); app.use('/api/incident-simulation', require('./routes/incidentSimulation')); app.use('/api/scorm-xapi-export', require('./routes/scormXapiExport'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-no-adaptive-difficulty-personalized-learning-paths', require('./routes/gapNoAdaptiveDifficultyPersonalizedLearningPaths'));
app.use('/api/gap-no-performance-prediction', require('./routes/gapNoPerformancePrediction'));
app.use('/api/gap-no-scenario-auto-generation-from-incident-data', require('./routes/gapNoScenarioAutoGenerationFromIncidentData'));
app.use('/api/gap-no-native-vr-platform-integration-unity-unreal-webxr', require('./routes/gapNoNativeVrPlatformIntegrationUnityUnrealWebxr'));
app.use('/api/gap-no-instructor-dashboard-with-student-progress-views', require('./routes/gapNoInstructorDashboardWithStudentProgressViews'));
app.use('/api/gap-no-completion-certificate-pdf-generation', require('./routes/gapNoCompletionCertificatePdfGeneration'));
app.use('/api/gap-no-multi-language-support', require('./routes/gapNoMultiLanguageSupport'));
app.use('/api/gap-no-webhooks', require('./routes/gapNoWebhooks'));
app.use('/api/gap-no-payment-subscription-integration-for-b2b-sales', require('./routes/gapNoPaymentSubscriptionIntegrationForB2bSales'));
app.use('/api/gap-no-scorm-xapi-lms-export', require('./routes/gapNoScormXapiLmsExport'));

// === Custom Views (mounted BEFORE 404 handler) ===
app.use('/api/custom-views', require('./routes/customViews'));

// 404 fallback for unknown /api routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
