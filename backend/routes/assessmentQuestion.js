const express = require('express');
const router = express.Router();
const { AssessmentQuestion } = require('../models');
const { callOpenRouter } = require('./ai');

router.get('/', async (req, res) => {
  try {
    const items = await AssessmentQuestion.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await AssessmentQuestion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await AssessmentQuestion.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await AssessmentQuestion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await AssessmentQuestion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { category, difficulty, questionType } = req.body;
    const prompt = `Generate an assessment question for VR training. Category: ${category || 'safety'}, difficulty: ${difficulty || 'intermediate'}, question type: ${questionType || 'multiple-choice'}. Return a JSON object with: title, question, questionType, category, difficulty, options (array of strings, 4 options for multiple-choice), correctAnswer, explanation, points (integer).`;
    const systemPrompt = 'You are an educational assessment specialist. Generate high-quality assessment questions for VR training programs that test practical knowledge and critical thinking. Always respond with valid JSON only, no markdown formatting.';

    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsed;
    try {
      parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: aiResponse });
    }

    const item = await AssessmentQuestion.create({
      ...parsed,
      aiGenerated: true,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
