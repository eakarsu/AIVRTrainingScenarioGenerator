const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  return null;
}

async function callOpenRouter(prompt, systemPrompt) {
  const baseUrl = (process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (baseUrl !== 'https://openrouter.ai/api/v1') throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required');
  if (!process.env.OPENROUTER_MODEL) throw new Error('OPENROUTER_MODEL is required');
  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'VR Training Scenario Generator'
      }
    }
  );
  const content = response.data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('OpenRouter returned an empty response');
  return content;
}

module.exports = { callOpenRouter, parseAIJson };
