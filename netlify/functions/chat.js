const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du är en psykologisk samtalspartner med följande egenskaper:

GRUNDLÄGGANDE APPROACH:
- Du är NEUTRAL och REFLEKTERANDE, inte automatiskt bekräftande
- Du ställer frågor som hjälper personen att tänka djupare
- Du pekar på motsägelser, alternativa perspektiv och blinda fläckar
- Du är empatisk men INTE terapeutisk eller diagnostiserande
- Du är ärlig när du inte håller med, men alltid respektfull

VAD DU GÖR:
- Lyssnar aktivt och återspeglar vad personen säger
- Ställer sokratiska frågor som utmanar antaganden
- Erbjuder alternativa perspektiv när det är relevant
- Normaliserar känslor utan att trivialisera dem
- Uppmuntrar till eget tänkande snarare än att ge råd

SÄKERHETSGRÄNSER (KRITISKT):
Vid tecken på självmordsrisk, akut fara, grov psykisk ohälsa eller pågående trauma:
- Uttrycka omtanke och oro direkt
- Rekommendera akut professionell hjälp
- Ge konkreta kontaktuppgifter: Självmordslinjen 90101, 112, 1177

TON OCH STIL:
- Lugn, varm men inte överdrivet positiv
- Direkt och ärlig när det behövs
- Skriv kortfattat (2-4 meningar per svar typiskt)
- Undvik psykologjargong och floskler
- Ställ ofta EN tydlig fråga som öppnar för reflektion`;

const CRISIS_KEYWORDS = {
    suicide: ['självmord', 'ta mitt liv', 'vill dö', 'hopplös', 'ingen mening', 'avsluta allt', 'bättre utan mig', 'orkar inte leva'],
    danger: ['ska göra slut', 'idag', 'ikväll', 'planerar', 'tabletter'],
    mental: ['röster', 'hör saker', 'ser saker', 'förföljs', 'psykos'],
    abuse: ['slår mig', 'misshandel', 'våldtar', 'övergrepp']
};

function detectCrisis(message, aiResponse) {
    const text = (message + ' ' + aiResponse).toLowerCase();
    let score = 0;
    
    const suicideMatches = CRISIS_KEYWORDS.suicide.filter(kw => text.includes(kw)).length;
    const dangerMatches = CRISIS_KEYWORDS.danger.filter(kw => text.includes(kw)).length;
    const mentalMatches = CRISIS_KEYWORDS.mental.filter(kw => text.includes(kw)).length;
    const abuseMatches = CRISIS_KEYWORDS.abuse.filter(kw => text.includes(kw)).length;
    
    if (suicideMatches >= 2) score += 10;
    if (dangerMatches >= 1 && suicideMatches >= 1) score += 15;
    if (mentalMatches >= 2) score += 8;
    if (abuseMatches >= 1) score += 10;
    
    return {
        detected: score >= 8,
        score: score,
        type: score >= 15 ? 'immediate_danger' : (suicideMatches >= 2 ? 'suicide' : null)
    };
}

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
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { message, history = [] } = JSON.parse(event.body);
        
        if (!message || typeof message !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid message' })
            };
        }
        
        const messages = [
            ...history.slice(-10).map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];
        
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: messages
        });
        
        const aiMessage = response.content[0].text;
        const crisisInfo = detectCrisis(message, aiMessage);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: aiMessage,
                crisisDetected: crisisInfo.detected,
                crisisType: crisisInfo.type
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: 'Något gick fel. Försök igen senare.'
            })
        };
    }
};
