const test = require('node:test'); const assert = require('node:assert/strict'); const p = require('../domain/scenarioWorkflow');
test('rights and consent are mandatory', () => assert.throws(() => p.validateAsset({ uri: 's3://a' }), /rights/));
test('accepted asset is explicit', () => assert.equal(p.validateAsset({ uri: 's3://a', rightsBasis: 'licensed', consentStatus: 'granted' }), true));
test('render is version pinned', () => assert.throws(() => p.transition({ status: 'editing', version: 1 }, 'render_queued', {}), /versions/));
test('review is independent and moderated', () => assert.throws(() => p.transition({ status: 'review', version: 1, creatorId: 'a' }, 'approved', { reviewerId: 'a', moderationStatus:'passed', disclosureConfirmed:true }), /independent/));
test('evaluation covers accessibility', () => assert.equal(p.validateEvaluation({ quality: 1, timing: 1, layout: 1, accessibility: 1, multilingual: 1 }), true));
test('Unity WebXR delivery can dead-letter', () => assert.equal(p.acceptPlatformReceipt({ platform: 'webxr', idempotencyKey: '1', status: 'dead_letter' }), true));
test('tenant scope matches',()=>assert.equal(p.assertScope({tenantId:'t'},{tenantId:'t'}),true));
test('tenant crossover fails',()=>assert.throws(()=>p.assertScope({tenantId:'t'},{tenantId:'x'}),/tenant/));
