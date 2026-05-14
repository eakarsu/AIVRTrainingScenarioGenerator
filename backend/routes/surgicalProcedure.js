const express = require('express');
const router = express.Router();
const { SurgicalProcedure } = require('../models');
const { callOpenRouter, parseAIJson } = require('./ai');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await SurgicalProcedure.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await SurgicalProcedure.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/generate', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { specialty, procedureType, complexity } = req.body;
    const prompt = `Generate a VR surgical procedure practice scenario for ${specialty || 'general surgery'} specialty, procedure type: ${procedureType || 'standard procedure'}, complexity: ${complexity || 'intermediate'}. Return a JSON object with: title, description, procedureType, specialty, complexity, steps (array of step objects with stepNumber, action, details), equipment (array of strings), duration (in minutes).`;
    const systemPrompt = 'You are a medical education specialist. Generate a detailed surgical procedure practice scenario for VR training with step-by-step instructions, required equipment, and safety considerations. Always respond with valid JSON only, no markdown formatting.';
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResponse);
    if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    const item = await SurgicalProcedure.create({ ...parsed, status: 'draft', aiGenerated: true });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
