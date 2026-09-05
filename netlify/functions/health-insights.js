const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

const SYSTEM_PROMPT = `Du analyserar en användares egna hälsologgar på Tryggman — en plattform för mäns psykiska hälsa.

Du får tre listor med data: mående (1-10 skala, med datum), aktivitet (fritext om vad personen gjorde för att må bra, med datum), och ångest (ja/nej per dag).

DITT UPPDRAG:
- Hitta faktiska, konkreta mönster i DEN HÄR PERSONENS data — inte generella påståenden om psykisk hälsa
- Om ett mönster inte syns tydligt i datan, säg det ärligt istället för att hitta på ett samband
- Var kortfattad: 3-5 meningar, aldrig mer
- Skriv varmt och rakt, inte kliniskt eller som en rapport
- Avsluta gärna med EN konkret, genomförbar reflektion eller fråga till personen

VIKTIGT:
- Du ställer ingen diagnos och ger inga medicinska råd
- Om datan visar tecken på återkommande svårt mående eller ångest, uppmuntra personen att prata med sin terapeut i appen eller söka professionellt stöd — men gör det naturligt, inte alarmerande
- Skriv på svenska`;

exports.handler = async (event) => {
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
    const { moodLog = [], activityLog = [], anxietyLog = [] } = JSON.parse(event.body);

    const dataSummary = `
MÅENDE (senaste loggarna, 1-10):
${moodLog.map(e => `${e.date}: ${e.mood}${e.note ? ' — "' + e.note + '"' : ''}`).join('\n') || 'Inga loggar'}

AKTIVITET (vad personen gjort för att må bra):
${activityLog.map(e => `${e.date}: ${e.text}`).join('\n') || 'Inga loggar'}

ÅNGEST (ja/nej per dag):
${anxietyLog.map(e => `${e.date}: ${e.anxiety ? 'Ja' : 'Nej'}`).join('\n') || 'Inga loggar'}
    `.trim();

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Här är min data. Ge mig en kort, personlig insikt:\n\n${dataSummary}` }],
    });

    const insight = response.content?.[0]?.text || null;

    if (!insight) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'No insight generated' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ insight }) };
  } catch (err) {
    console.error('health-insights error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};