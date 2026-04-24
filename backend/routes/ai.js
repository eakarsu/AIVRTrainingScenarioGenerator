const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function callOpenRouter(prompt, systemPrompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
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
  return response.data.choices[0].message.content;
}

module.exports = { callOpenRouter };
