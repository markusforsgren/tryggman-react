const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `Du är en psykologisk samtalspartner på Tryggman — en plattform för mäns psykiska hälsa.

GRUNDLÄGGANDE APPROACH:
- Du är NEUTRAL och REFLEKTERANDE, inte automatiskt bekräftande
- Du ställer frågor som hjälper personen att tänka djupare
- Du är empatisk men INTE terapeutisk eller diagnostiserande
- Du förstår att många män har svårt att prata om känslor och möter varje man med respekt

SÄKERHETSGRÄNSER (KRITISKT):
Vid tecken på självmordsrisk, akut fara eller grov psykisk ohälsa:
- Uttrycka omtanke och oro direkt
- Ge konkreta kontaktuppgifter: Mind Självmordslinjen 90101, 112 vid akut fara, 1177 Vårdguiden

TON OCH STIL:
- Lugn, varm men inte överdrivet positiv
- Kortfattad — 2-4 meningar per svar typiskt
- Ställ ofta EN tydlig fråga som öppnar för reflektion
- Tala alltid svenska`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);

    // Stödjer både gammalt format { message, history } och nytt format { messages, model, system }
    let messages;
    if (body.messages) {
      // Nytt format från App.jsx
      messages = body.messages;
    } else if (body.message) {
      // Gammalt format
      const history = (body.history || []).slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));
      messages = [...history, { role: 'user', content: body.message }];
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: body.system || SYSTEM_PROMPT,
      messages: messages
    });

    const aiMessage = response.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: [{ text: aiMessage }],
        message: aiMessage,
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};