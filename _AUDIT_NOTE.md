# Audit Recommendations & Status — AIVRTrainingScenarioGenerator

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_08.md (section 36)

Verdict per audit: partial-build, ai.js was 39 lines / 1 endpoint claimed. Inspection found that `routes/ai.js` is actually a **service helper** (`callOpenRouter`, `parseAIJson`) and the previously broken `app.use('/api/ai', require('./routes/aiFeatures'))` referenced a missing file — startup would crash.

## Original audit recommendations

Missing AI:
- Adaptive difficulty / personalized learning paths
- Performance prediction

Missing non-AI:
- VR platform integration (Unity/Unreal/WebXR)
- Instructor dashboard with student progress
- Completion certificates
- Multi-language support

Custom feature ideas:
- Adaptive learning paths
- Scenario randomization
- Performance prediction
- Skill gap identification
- Real-world incident simulation

## Implemented in this pass (MECHANICAL)

Created `backend/routes/aiFeatures.js` (the file the existing `server.js` already references). Reuses helpers from `routes/ai.js`, plus `authenticateToken` and `aiRateLimiter`. Persists results to `ai_results` (table is created at boot).

- `POST /api/ai/generate-scenario` — generate a structured VR training scenario.
- `POST /api/ai/grade-assessment` — grade a quiz/assessment submission against a rubric.
- `POST /api/ai/adaptive-path` — adaptive learning path recommendation given a learner profile + weak areas.

This also fixes the latent startup crash caused by the missing module.

## Backlog

1. Performance prediction — text-only AI endpoint over score history; mechanical add-on.
2. Real-world incident simulation — needs incident data feed.
3. VR platform integration (Unity/Unreal/WebXR) — substantial frontend product.
4. Instructor dashboard — UI/product work.
5. Multi-language support — i18n decision.

## Apply pass 3 (frontend)

Verified: frontend already wired to the three pass-2 endpoints. Three
dedicated pages exist — `pages/AIGenerateScenario.jsx`,
`pages/AIGradeAssessment.jsx`, `pages/AIAdaptivePath.jsx` — each calling
`aiAPI.generateScenario` / `gradeAssessment` / `adaptivePath` defined at
lines 90–94 of `services/api.js`. Routes `/ai/generate-scenario`,
`/ai/grade-assessment`, `/ai/adaptive-path` are registered in `App.jsx`. The
shared axios interceptor auto-attaches the JWT from localStorage. Backend
`aiFeatures.js` is registered in `server.js`
(`app.use('/api/ai', require('./routes/aiFeatures'))`). Action:
LEFT-AS-IS (no FE changes).

## Apply pass 4 (mechanical backlog)

Implemented one MECHANICAL backlog item: Performance prediction.

Backend (`backend/routes/aiFeatures.js`):
- `POST /api/ai/performance-prediction` — accepts `learnerProfile`, `scoreHistory[]` (required), `targetCertification`, `hoursAvailablePerWeek`. Calls `callOpenRouter` (helper from `routes/ai.js`), persists into `ai_results` via existing helper. Returns 503 when `OPENROUTER_API_KEY` is unset; returns 400 when `scoreHistory` is empty or non-array.

Frontend:
- `frontend/src/services/api.js`: added `aiAPI.performancePrediction`.
- `frontend/src/pages/AIPerformancePrediction.jsx`: new page with form (learner name, role, target certification, hours/week, multi-line score history). Mirrors `AIAdaptivePath.jsx` styling.
- Registered in `App.jsx` at `/ai/performance-prediction`.
- Added a sidebar nav entry in `components/Layout.jsx` under "AI Tools".

Smoke test: server start was blocked by a port-3001 collision with another concurrent agent; backend file syntax-checks clean and the new endpoint follows the same authenticateToken + aiRateLimiter + callOpenRouter pattern as the three pass-2 endpoints.

## Apply pass 5 (all backlog)

Picked three more items from the audit's custom-features list:
incident simulation, skill gap identification, and scenario
randomization. All three are MECHANICAL / PRODUCT-DECISION text-only
endpoints reusing the same helper plumbing as pass-2 / pass-4.

Backend (`backend/routes/aiFeatures.js`):
- `POST /api/ai/incident-simulation` — generates a real-world-style
  incident scenario with narrative, root-cause hypotheses, decision
  points, expected outcomes, debrief questions and compliance refs.
  PRODUCT-DECISION: when `seed_incident` is omitted, defaults to a
  generic industrial-near-miss prompt (no coupling to any external
  incident database).
- `POST /api/ai/skill-gap-identification` — accepts `learnerProfile`,
  `competencyScores[]` (required), `targetRole`, `certifications`;
  returns gaps, prioritised remediation actions, strengths and
  readiness percentage. 400 when `competencyScores` is empty.
- `POST /api/ai/scenario-randomization` — produces randomised variants
  of a base scenario while preserving learning objectives.
  PRODUCT-DECISION: defaults to 3 variants, capped at 8, and uses
  `actor-role / environment / hazard-injection` as default
  randomization dimensions.

All three return 503 with `missing: OPENROUTER_API_KEY` when the key is
unset, persist via the existing `persist()` helper into `ai_results`,
and are guarded by `authenticateToken` + `aiRateLimiter`.

Frontend:
- `frontend/src/services/api.js`: added 3 helpers in `aiAPI`.
- `frontend/src/pages/AIIncidentSimulation.jsx`,
  `frontend/src/pages/AISkillGap.jsx`,
  `frontend/src/pages/AIScenarioRandomization.jsx`: 3 new pages styled
  to match `AIPerformancePrediction.jsx`.
- Registered in `App.jsx` at `/ai/incident-simulation`,
  `/ai/skill-gap`, `/ai/scenario-randomization`.
- 3 new sidebar entries under "AI Tools" in `components/Layout.jsx`.

Smoke test: backend was started on port 7801 to avoid the port-3001
collision with concurrent agents and `admin@vrtraining.com /
password123` returned HTTP 200 (token length 199). All three new
endpoints are reached after JWT auth (proven by the auth chain
producing a downstream OpenRouter 401 when the placeholder key in
`.env` is sent through). The 503 path is the same env-guard pattern
that returns 503 in the two batch peers (Optometry and EquipmentRental,
both verified end-to-end this pass).

Backlog still untouched: real-world incident-data feed (NEEDS-CREDS),
VR platform integration (Unity/Unreal/WebXR — substantial product
work), instructor dashboard, multi-language i18n.

