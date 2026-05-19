const express = require('express');
const router = express.Router();
const { SafetyTrainingScenario } = require('../models');
const { callOpenRouter, parseAIJson } = require('./ai');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// GET /api/safety-training
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await SafetyTrainingScenario.findAndCountAll({
      order: [['createdAt', 'DESC']], limit, offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/safety-training/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SafetyTrainingScenario.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/safety-training
router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await SafetyTrainingScenario.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/safety-training/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SafetyTrainingScenario.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/safety-training/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SafetyTrainingScenario.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/safety-training/generate
router.post('/generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { industry, hazardType, difficulty } = req.body;
    const prompt = `Generate a VR safety training scenario for the ${industry || 'general'} industry focusing on ${hazardType || 'workplace hazards'} at ${difficulty || 'intermediate'} difficulty level. Return a JSON object with these fields: title, description, hazardType, industry, difficulty, vrEnvironment, objectives (array of strings), duration (in minutes).`;
    const systemPrompt = 'You are an expert in workplace safety training. Generate a detailed VR safety training scenario with realistic hazards, learning objectives, and immersive VR environment descriptions. Always respond with valid JSON only, no markdown formatting.';

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });

    const item = await SafetyTrainingScenario.create({ ...parsed, status: 'draft', aiGenerated: true });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
