const express = require('express');
const router = express.Router();
const { VREnvironmentTemplate } = require('../models');
const { callOpenRouter, parseAIJson } = require('./ai');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await VREnvironmentTemplate.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { environmentType, setting, complexity } = req.body;
    const prompt = `Generate a VR environment template for a ${environmentType || 'training facility'} with setting: ${setting || 'indoor'}, complexity: ${complexity || 'medium'}. Return a JSON object with: title, description, environmentType, setting, lighting, interactiveElements (array of strings), complexity, polyCount (integer estimate).`;
    const systemPrompt = 'You are a VR environment designer and 3D artist. Generate a detailed VR environment template with immersive descriptions, interactive elements, lighting specifications, and technical details. Always respond with valid JSON only, no markdown formatting.';
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    const item = await VREnvironmentTemplate.create({ ...parsed, status: 'draft', aiGenerated: true });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
