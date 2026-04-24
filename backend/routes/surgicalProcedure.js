const express = require('express');
const router = express.Router();
const { SurgicalProcedure } = require('../models');
const { callOpenRouter } = require('./ai');

router.get('/', async (req, res) => {
  try {
    const items = await SurgicalProcedure.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await SurgicalProcedure.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await SurgicalProcedure.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { specialty, procedureType, complexity } = req.body;
    const prompt = `Generate a VR surgical procedure practice scenario for ${specialty || 'general surgery'} specialty, procedure type: ${procedureType || 'standard procedure'}, complexity: ${complexity || 'intermediate'}. Return a JSON object with: title, description, procedureType, specialty, complexity, steps (array of step objects with stepNumber, action, details), equipment (array of strings), duration (in minutes).`;
    const systemPrompt = 'You are a medical education specialist. Generate a detailed surgical procedure practice scenario for VR training with step-by-step instructions, required equipment, and safety considerations. Always respond with valid JSON only, no markdown formatting.';

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    }

    const item = await SurgicalProcedure.create({
      ...parsed,
      status: 'draft',
      aiGenerated: true,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
