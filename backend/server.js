require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
