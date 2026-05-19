const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');

// Optional ipKeyGenerator import for IPv6-safe rate limiting
let ipKeyGenerator;
try {
  ({ ipKeyGenerator } = require('express-rate-limit'));
} catch (e) {
  ipKeyGenerator = (req) => req.ip;
}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user && req.user.id) ? String(req.user.id) : (ipKeyGenerator ? ipKeyGenerator(req) : req.ip),
});

router.use(limiter);

// In-memory rules store for scenario generation rules (CRUD)
let RULES = [
  { id: 1, name: 'Beginner Warehouse Safety', difficulty: 'beginner', environment: 'warehouse', industry: 'logistics', maxDurationMin: 15, enabled: true },
  { id: 2, name: 'Intermediate Surgical Prep', difficulty: 'intermediate', environment: 'operating-room', industry: 'healthcare', maxDurationMin: 25, enabled: true },
  { id: 3, name: 'Advanced Fire Response', difficulty: 'advanced', environment: 'industrial-plant', industry: 'manufacturing', maxDurationMin: 40, enabled: true },
  { id: 4, name: 'Expert Crisis De-escalation', difficulty: 'expert', environment: 'customer-floor', industry: 'retail', maxDurationMin: 30, enabled: true },
];
let RULE_SEQ = 5;

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];
const VALID_ENVIRONMENTS = ['warehouse', 'operating-room', 'industrial-plant', 'customer-floor', 'office', 'construction-site', 'classroom', 'vehicle-cabin'];

// VIZ 1: Scenario library chart
// GET /api/custom-views/scenario-library-chart
router.get('/scenario-library-chart', authenticateToken, async (req, res) => {
  try {
    const categories = [
      { label: 'Safety', count: 32, color: '#ef4444' },
      { label: 'Surgical', count: 18, color: '#06b6d4' },
      { label: 'Customer Svc', count: 24, color: '#10b981' },
      { label: 'Compliance', count: 14, color: '#f59e0b' },
      { label: 'Incident Sim', count: 21, color: '#8b5cf6' },
      { label: 'Assessment', count: 27, color: '#6366f1' },
    ];
    const total = categories.reduce((a, b) => a + b.count, 0);
    res.json({
      success: true,
      title: 'Scenario Library Distribution',
      total,
      categories,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VIZ 2: Competency heatmap (trainee x skill)
// GET /api/custom-views/competency-heatmap
router.get('/competency-heatmap', authenticateToken, async (req, res) => {
  try {
    const trainees = ['Alice Chen', 'Bob Patel', 'Carla Rios', 'Diego Park', 'Eve Mensah', 'Frank Liu'];
    const skills = ['Hazard ID', 'Tool Use', 'Comms', 'Decision', 'Compliance', 'Recovery'];
    // Deterministic pseudo-data 0-100
    const matrix = trainees.map((t, i) =>
      skills.map((s, j) => Math.round(((i * 17 + j * 23 + 31) % 71) + 25))
    );
    res.json({
      success: true,
      title: 'Trainee Competency Heatmap',
      trainees,
      skills,
      matrix,
      scale: { min: 0, max: 100, unit: '% mastery' },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NON-VIZ 1: Training curriculum PDF
// GET /api/custom-views/training-curriculum-pdf
router.get('/training-curriculum-pdf', authenticateToken, async (req, res) => {
  try {
    const modules = [
      { code: 'M01', title: 'VR Safety Fundamentals', hours: 4, difficulty: 'beginner' },
      { code: 'M02', title: 'Hazard Identification Drills', hours: 6, difficulty: 'beginner' },
      { code: 'M03', title: 'Equipment Operation Sim', hours: 8, difficulty: 'intermediate' },
      { code: 'M04', title: 'Emergency Response Protocol', hours: 10, difficulty: 'advanced' },
      { code: 'M05', title: 'Crisis Leadership', hours: 12, difficulty: 'expert' },
    ];
    const lines = [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    ];
    const textParts = [
      'BT /F1 16 Tf 50 740 Td (VR Training Curriculum) Tj ET',
      'BT /F1 10 Tf 50 720 Td (Generated: ' + new Date().toISOString() + ') Tj ET',
    ];
    let y = 690;
    modules.forEach((m) => {
      textParts.push(`BT /F1 11 Tf 50 ${y} Td (${m.code} - ${m.title} | ${m.hours}h | ${m.difficulty}) Tj ET`);
      y -= 18;
    });
    const stream = textParts.join('\n');
    const streamObj = `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`;
    const fontObj = '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
    const body = lines.concat([streamObj, fontObj]).join('\n');
    const pdf = body + '\ntrailer << /Size 6 /Root 1 0 R >>\n%%EOF';

    res.json({
      success: true,
      title: 'VR Training Curriculum',
      filename: 'vr-training-curriculum.pdf',
      mimeType: 'application/pdf',
      modules,
      totalHours: modules.reduce((a, b) => a + b.hours, 0),
      pdfBase64: Buffer.from(pdf, 'utf-8').toString('base64'),
      pageCount: 1,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NON-VIZ 2: Scenario generation rules editor (CRUD)
// GET = list, POST = create, PUT /:id = update, DELETE /:id = delete
router.get('/scenario-rules', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    rules: RULES,
    difficulties: VALID_DIFFICULTIES,
    environments: VALID_ENVIRONMENTS,
    count: RULES.length,
  });
});

router.post('/scenario-rules', authenticateToken, async (req, res) => {
  try {
    const { name, difficulty, environment, industry, maxDurationMin, enabled } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: 'invalid difficulty', allowed: VALID_DIFFICULTIES });
    }
    if (environment && !VALID_ENVIRONMENTS.includes(environment)) {
      return res.status(400).json({ error: 'invalid environment', allowed: VALID_ENVIRONMENTS });
    }
    const rule = {
      id: RULE_SEQ++,
      name,
      difficulty: difficulty || 'beginner',
      environment: environment || 'classroom',
      industry: industry || 'general',
      maxDurationMin: typeof maxDurationMin === 'number' ? maxDurationMin : 20,
      enabled: enabled !== false,
    };
    RULES.push(rule);
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/scenario-rules/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = RULES.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'rule not found' });
    const { name, difficulty, environment, industry, maxDurationMin, enabled } = req.body || {};
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ error: 'invalid difficulty', allowed: VALID_DIFFICULTIES });
    }
    if (environment && !VALID_ENVIRONMENTS.includes(environment)) {
      return res.status(400).json({ error: 'invalid environment', allowed: VALID_ENVIRONMENTS });
    }
    RULES[idx] = {
      ...RULES[idx],
      ...(name !== undefined && { name }),
      ...(difficulty !== undefined && { difficulty }),
      ...(environment !== undefined && { environment }),
      ...(industry !== undefined && { industry }),
      ...(maxDurationMin !== undefined && { maxDurationMin }),
      ...(enabled !== undefined && { enabled }),
    };
    res.json({ success: true, rule: RULES[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/scenario-rules/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const before = RULES.length;
    RULES = RULES.filter(r => r.id !== id);
    if (RULES.length === before) return res.status(404).json({ error: 'rule not found' });
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
