const express = require('express');
const router = express.Router();
const { IncidentReport } = require('../models');
const { callOpenRouter } = require('./ai');

router.get('/', async (req, res) => {
  try {
    const items = await IncidentReport.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await IncidentReport.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await IncidentReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { incidentType, severity, description } = req.body;
    const prompt = `Analyze this incident and generate a structured report. Incident type: ${incidentType || 'workplace accident'}, severity: ${severity || 'medium'}, description: ${description || 'A workplace incident occurred that needs analysis'}. Return a JSON object with: title, description, incidentType, severity, location, date (YYYY-MM-DD format), rootCause, correctiveActions (array of strings), status.`;
    const systemPrompt = 'You are a workplace safety analyst and incident investigation expert. Analyze incident reports, identify root causes, and recommend corrective actions. Provide thorough and actionable analysis. Always respond with valid JSON only, no markdown formatting.';

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    }

    const item = await IncidentReport.create({
      ...parsed,
      aiAnalyzed: true,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
