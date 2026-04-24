const express = require('express');
const router = express.Router();
const { AssessmentScore } = require('../models');

router.get('/', async (req, res) => {
  try {
    const items = await AssessmentScore.findAll({ order: [['attemptDate', 'DESC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await AssessmentScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (data.score != null && data.maxScore != null) {
      data.percentage = Math.round((data.score / data.maxScore) * 100 * 100) / 100;
    }
    const item = await AssessmentScore.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await AssessmentScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const data = req.body;
    if (data.score != null && data.maxScore != null) {
      data.percentage = Math.round((data.score / data.maxScore) * 100 * 100) / 100;
    }
    await item.update(data);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await AssessmentScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
