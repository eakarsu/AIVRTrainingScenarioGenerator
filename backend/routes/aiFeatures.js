const express = require('express');
const { sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter, parseAIJson } = require('./ai');
const router = express.Router();

async function persist(userId, endpoint, inputData, result) {
  try {
    await sequelize.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
      { bind: [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)] }
    );
  } catch (e) { console.error('persist ai_results failed:', e.message); }
}

// POST /api/ai/generate-scenario — generate a training scenario from inputs
router.post('/generate-scenario', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { domain, difficulty, learningObjectives, durationMinutes, hazards } = req.body || {};
    const systemPrompt = 'You are a senior instructional designer for VR-based training. Always respond with valid JSON.';
    const prompt = `Design a VR training scenario.

Domain: ${domain || 'general safety'}
Difficulty: ${difficulty || 'intermediate'}
Learning objectives: ${JSON.stringify(learningObjectives || [])}
Target duration (minutes): ${durationMinutes || 30}
Hazards / context: ${JSON.stringify(hazards || [])}

Return JSON:
{
  "title": "",
  "summary": "",
  "objectives": ["..."],
  "environment": "",
  "scenes": [{ "name": "", "description": "", "interactions": ["..."], "estimatedSeconds": 0 }],
  "assessmentRubric": [{ "criterion": "", "weight": 0, "passingScore": 0 }],
  "expectedOutcomes": ["..."]
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'generate-scenario', { domain, difficulty }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/grade-assessment — grade an assessment submission
router.post('/grade-assessment', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { questions, answers, rubric } = req.body || {};
    if (!questions || !answers) return res.status(400).json({ error: 'questions and answers are required' });
    const systemPrompt = 'You are a fair, consistent training assessor. Always respond with valid JSON.';
    const prompt = `Grade this assessment submission.

Questions: ${JSON.stringify(questions)}
Answers: ${JSON.stringify(answers)}
Rubric: ${JSON.stringify(rubric || {})}

Return JSON:
{
  "scores": [{ "questionId": "", "score": 0, "maxScore": 0, "feedback": "" }],
  "totalScore": 0,
  "totalMax": 0,
  "passed": false,
  "summary": "",
  "weakAreas": ["..."]
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'grade-assessment', { qCount: questions.length }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/adaptive-path — adaptive learning path recommendation
router.post('/adaptive-path', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { learnerProfile, history, weakAreas, availableModules } = req.body || {};
    const systemPrompt = 'You are an adaptive-learning recommender for training. Always respond with valid JSON.';
    const prompt = `Recommend a personalized learning path.

Learner profile: ${JSON.stringify(learnerProfile || {})}
Recent training history: ${JSON.stringify(history || [])}
Identified weak areas: ${JSON.stringify(weakAreas || [])}
Available modules: ${JSON.stringify(availableModules || [])}

Return JSON:
{
  "path": [{ "moduleId": "", "title": "", "rationale": "", "expectedDifficulty": "easy|medium|hard", "expectedMinutes": 0 }],
  "estimatedCertificationReadinessPct": 0,
  "summary": ""
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'adaptive-path', { weakAreasCount: (weakAreas || []).length }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/performance-prediction — predict learner trajectory and certification readiness
router.post('/performance-prediction', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { learnerProfile, scoreHistory, targetCertification, hoursAvailablePerWeek } = req.body || {};
    if (!Array.isArray(scoreHistory) || scoreHistory.length === 0) {
      return res.status(400).json({ error: 'scoreHistory (non-empty array) is required' });
    }
    const systemPrompt = 'You are an expert learning-analytics forecaster. Always respond with valid JSON.';
    const prompt = `Predict this learner's performance trajectory.

Learner profile: ${JSON.stringify(learnerProfile || {})}
Score history (recent first): ${JSON.stringify(scoreHistory).slice(0, 5000)}
Target certification: ${targetCertification || 'general competence'}
Hours available per week: ${hoursAvailablePerWeek || 5}

Return JSON:
{
  "predictedNextAssessmentScore": 0,
  "trend": "improving|stable|declining",
  "weeksToCertificationReadiness": 0,
  "certificationProbabilityPct": 0,
  "skillGaps": [{ "skill": "", "severity": "low|medium|high" }],
  "interventions": [{ "action": "", "rationale": "", "priority": "low|medium|high" }],
  "summary": ""
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'performance-prediction', { historyLen: scoreHistory.length }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/incident-simulation — generate a real-world-style incident scenario.
//
// Env vars:
//   OPENROUTER_API_KEY (required) — endpoint returns 503 if unset.
//
// PRODUCT-DECISION: When the caller does not supply `seed_incident`, we
// default to a generic "industrial near-miss" prompt rather than coupling
// to any specific external incident database (OSHA / NTSB feeds require
// live integrations and per-domain ToS review).
router.post('/incident-simulation', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured', missing: 'OPENROUTER_API_KEY' });
    }
    const { domain, severity, seed_incident, hazards, learnerRole, durationMinutes } = req.body || {};
    // PRODUCT-DECISION: default seed when none provided.
    const seed = seed_incident || 'a recent industrial near-miss involving routine maintenance with an inattentive bystander and procedural shortcut';

    const systemPrompt = 'You are a senior safety instructional designer who builds realistic, training-grade incident simulations. Always respond with valid JSON.';
    const prompt = `Generate a real-world-style incident simulation scenario for VR training.

Domain: ${domain || 'general industrial safety'}
Severity target: ${severity || 'moderate'}
Seed incident: ${seed}
Hazards / context: ${JSON.stringify(hazards || [])}
Learner role: ${learnerRole || 'frontline operator'}
Target duration (minutes): ${durationMinutes || 25}

Return JSON:
{
  "title": string,
  "incidentNarrative": string,
  "rootCauseHypotheses": [{ "cause": string, "category": "human|equipment|process|environment", "likelihood_0_100": number }],
  "decisionPoints": [{ "moment": string, "options": [string], "correctOption": string, "rationale": string }],
  "expectedOutcomesByDecision": [{ "path": string, "outcome": string }],
  "debriefQuestions": [string],
  "complianceReferences": [string],
  "learningObjectives": [string]
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'incident-simulation', { domain, severity }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/skill-gap-identification — identify skill gaps from competency assessments.
//
// Env vars:
//   OPENROUTER_API_KEY (required) — endpoint returns 503 if unset.
router.post('/skill-gap-identification', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured', missing: 'OPENROUTER_API_KEY' });
    }
    const { learnerProfile, competencyScores, targetRole, certifications } = req.body || {};
    if (!Array.isArray(competencyScores) || competencyScores.length === 0) {
      return res.status(400).json({ error: 'competencyScores (non-empty array of {skill, score, max}) is required' });
    }

    const systemPrompt = 'You are a learning-analytics specialist who identifies actionable skill gaps. Always respond with valid JSON.';
    const prompt = `Identify skill gaps and prioritise remediation.

Learner profile: ${JSON.stringify(learnerProfile || {})}
Target role: ${targetRole || 'general operator'}
Held certifications: ${JSON.stringify(certifications || [])}
Competency scores: ${JSON.stringify(competencyScores).slice(0, 5000)}

Return JSON:
{
  "gaps": [{ "skill": string, "currentLevel": number, "targetLevel": number, "gapMagnitude": number, "priority": "low|medium|high|critical" }],
  "remediation": [{ "skill": string, "action": string, "estimatedHours": number, "modalities": ["self-study|coaching|simulation|mentorship"] }],
  "strengths": [string],
  "readinessFor_targetRole_pct": number,
  "summary": string
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'skill-gap-identification', { count: competencyScores.length, targetRole }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/scenario-randomization — produce randomised variants of a base scenario.
//
// Env vars:
//   OPENROUTER_API_KEY (required) — endpoint returns 503 if unset.
//
// PRODUCT-DECISION: Default `variantCount` is 3 (balanced for review effort
// vs coverage). Default `randomizationDimensions` covers actor-role,
// environment, and hazard-injection — three classic axes for VR training
// re-runs.
router.post('/scenario-randomization', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured', missing: 'OPENROUTER_API_KEY' });
    }
    const { baseScenario, variantCount, randomizationDimensions, difficultyShift } = req.body || {};
    if (!baseScenario) return res.status(400).json({ error: 'baseScenario is required' });

    // PRODUCT-DECISION defaults
    const variants = Math.max(1, Math.min(8, parseInt(variantCount, 10) || 3));
    const dims = Array.isArray(randomizationDimensions) && randomizationDimensions.length > 0
      ? randomizationDimensions
      : ['actor-role', 'environment', 'hazard-injection'];

    const systemPrompt = 'You produce diverse, training-relevant scenario variants while preserving the original learning objectives. Always respond with valid JSON.';
    const prompt = `Generate ${variants} randomised variants of the given base scenario.

Base scenario: ${typeof baseScenario === 'string' ? baseScenario : JSON.stringify(baseScenario).slice(0, 4000)}
Randomisation dimensions: ${JSON.stringify(dims)}
Difficulty shift (vs base): ${difficultyShift || 'neutral'}

Each variant must preserve the original learning objectives but differ along the listed dimensions.

Return JSON:
{
  "variants": [{
    "name": string,
    "summary": string,
    "differencesFromBase": [string],
    "preservedObjectives": [string],
    "newWildcards": [string],
    "expectedDifficulty": "easy|medium|hard"
  }],
  "coverageAnalysis": string
}`;
    const text = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(text) || { raw: text };
    await persist(req.user?.id, 'scenario-randomization', { variants, dims }, parsed);
    res.json({ result: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
