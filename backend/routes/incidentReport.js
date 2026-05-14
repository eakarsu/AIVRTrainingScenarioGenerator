const express = require('express');
const router = express.Router();
const { IncidentReport } = require('../models');
const { callOpenRouter, parseAIJson } = require('./ai');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await IncidentReport.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await IncidentReport.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { incidentType, severity, description } = req.body;
    const prompt = `Analyze this incident and generate a structured report. Incident type: ${incidentType || 'workplace accident'}, severity: ${severity || 'medium'}, description: ${description || 'A workplace incident occurred'}. Return a JSON object with: title, description, incidentType, severity, location, date (YYYY-MM-DD format), rootCause, correctiveActions (array of strings), status.`;
    const systemPrompt = 'You are a workplace safety analyst and incident investigation expert. Analyze incident reports, identify root causes, and recommend corrective actions. Always respond with valid JSON only, no markdown formatting.';
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    const item = await IncidentReport.create({ ...parsed, aiAnalyzed: true });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
