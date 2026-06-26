const ipMap = new Map();

// Reset the map daily
let lastResetDate = new Date().toDateString();

function checkRateLimit(ip) {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    ipMap.clear();
    lastResetDate = today;
  }

  const count = ipMap.get(ip) || 0;
  if (count >= 5) {
    return false;
  }
  ipMap.set(ip, count + 1);
  return true;
}

const FMT_PROMPTS = {
  docstring: `Write only the docstring or JSDoc comment block to place directly above the function or class.
Include: a clear description, all parameters with types and descriptions, return value with type, any exceptions/errors raised, and one concise usage example.
Output ONLY the comment block. No explanation, no extra text, no markdown fences.`,
  readme: `Write a professional README section in Markdown for this code.
Include:
- Short description (2-3 sentences)
- Installation / setup note if relevant
- Usage code block with a real example
- Parameters table: | Name | Type | Required | Description |
- Return value description
- Notes on edge cases or limitations
Output only the Markdown content.`,
  inline: `Return the EXACT original code with added inline comments explaining what each logical block does.
Rules:
- Do NOT change any code whatsoever
- Add a comment above each logical section
- Add parameter/variable explanations where useful
- Keep comments concise and informative
Output the commented code only, no explanation.`,
  api: `Write a complete API reference in Markdown.
Include:
- Function/class signature
- Description
- Parameters table: | Name | Type | Required | Default | Description |
- Return type and description
- Error conditions and what triggers them
- A complete usage example with expected output
Output only the Markdown content.`
};

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit reached', limitReached: true });
  }

  const { code, lang, fmt, promptType } = req.body;

  if (!code || !lang || !promptType) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  let prompt = '';
  if (promptType === 'doc') {
    if (!fmt || !FMT_PROMPTS[fmt]) {
      return res.status(400).json({ error: 'Invalid or missing format parameter for documentation prompt' });
    }
    prompt = `You are a senior ${lang} developer writing production-quality documentation.
${FMT_PROMPTS[fmt]}

Code to document:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\``;
  } else if (promptType === 'bug') {
    prompt = `You are a senior ${lang} code reviewer and security engineer.
Analyse this code and find real bugs, security vulnerabilities, code smells, and performance issues.

Return ONLY a valid JSON array with no markdown fences, no explanation, no extra text. Format:
[{"severity":"high","issue":"Clear description of the problem","line":"line number or function name"}]

Severity values: "high", "medium", "low"
Find between 3 and 6 genuine issues. If the code is clean, return an empty array: []

Code to review:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\``;
  } else {
    return res.status(400).json({ error: 'Invalid promptType' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error (missing API key)' });
  }

  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 1500
        }
      })
    });

    if (!geminiRes.ok) {
      if (geminiRes.status === 429) {
        return res.status(429).json({ error: 'Server quota exhausted. Try again later.', serverQuotaExhausted: true });
      }
      return res.status(geminiRes.status).json({ error: 'Something went wrong', code: geminiRes.status });
    }

    const data = await geminiRes.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Something went wrong', code: 500 });
  }
}
