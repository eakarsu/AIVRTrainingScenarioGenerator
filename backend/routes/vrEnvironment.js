const express = require('express');
const router = express.Router();
const { VREnvironmentTemplate } = require('../models');
const { callOpenRouter } = require('./ai');

router.get('/', async (req, res) => {
  try {
    const items = await VREnvironmentTemplate.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await VREnvironmentTemplate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { environmentType, setting, complexity } = req.body;
    const prompt = `Generate a VR environment template for a ${environmentType || 'training facility'} with setting: ${setting || 'indoor'}, complexity: ${complexity || 'medium'}. Return a JSON object with: title, description, environmentType, setting, lighting, interactiveElements (array of strings), complexity, polyCount (integer estimate).`;
    const systemPrompt = 'You are a VR environment designer and 3D artist. Generate a detailed VR environment template with immersive descriptions, interactive elements, lighting specifications, and technical details. Always respond with valid JSON only, no markdown formatting.';

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    }

    const item = await VREnvironmentTemplate.create({
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
