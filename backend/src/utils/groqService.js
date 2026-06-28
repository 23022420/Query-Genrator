const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function generateSQL(prompt, schemaContext = '') {
  const schemaSection = schemaContext
    ? `\nDatabase Schema:\n${schemaContext}\n`
    : '';

  const systemPrompt = `You are an expert SQL query generator. Convert natural language to valid SQL.
${schemaSection}
Rules:
- Return ONLY a JSON object, no markdown, no extra text
- Format: {"sql": "...", "explanation": "...", "queryType": "SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|OTHER", "tablesUsed": ["..."], "estimatedRows": "..."}
- Write clean, optimized SQL
- Use proper SQL syntax
- If ambiguous, write the most common interpretation`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Convert to SQL: ${prompt}` }
    ],
    model: MODEL,
    temperature: 0.1,
    max_tokens: 1024
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { sql: raw, explanation: 'Generated SQL query', queryType: 'SELECT', tablesUsed: [], estimatedRows: 'Unknown' };
  }
}

async function explainSQL(sql) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a SQL expert. Explain SQL queries in simple, clear language. Return ONLY JSON: {"explanation": "...", "clauses": ["..."], "complexity": "Simple|Moderate|Complex"}'
      },
      { role: 'user', content: `Explain this SQL: ${sql}` }
    ],
    model: MODEL,
    temperature: 0.2,
    max_tokens: 512
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { explanation: raw, clauses: [], complexity: 'Unknown' };
  }
}

async function optimizeSQL(sql) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a SQL optimization expert. Return ONLY JSON: {"optimizedSQL": "...", "improvements": ["..."], "performanceGain": "Low|Medium|High"}'
      },
      { role: 'user', content: `Optimize this SQL: ${sql}` }
    ],
    model: MODEL,
    temperature: 0.1,
    max_tokens: 512
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { optimizedSQL: sql, improvements: [], performanceGain: 'Low' };
  }
}

async function analyzeDifficulty(sql) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Analyze SQL query difficulty. Return ONLY JSON: {"difficulty": "Easy|Medium|Hard", "reason": "...", "concepts": ["..."]}'
      },
      { role: 'user', content: `Analyze: ${sql}` }
    ],
    model: MODEL,
    temperature: 0.1,
    max_tokens: 256
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { difficulty: 'Easy', reason: 'Basic query', concepts: [] };
  }
}

async function autoFixSQL(sql, errorMessage = '') {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Fix SQL syntax errors. Return ONLY JSON: {"fixedSQL": "...", "issuesFound": ["..."], "changesMade": ["..."]}'
      },
      { role: 'user', content: `Fix this SQL${errorMessage ? ` (Error: ${errorMessage})` : ''}: ${sql}` }
    ],
    model: MODEL,
    temperature: 0.1,
    max_tokens: 512
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { fixedSQL: sql, issuesFound: [], changesMade: [] };
  }
}

async function parseSchemaFromText(schemaText) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Parse database schema text and return ONLY JSON: {"tables": [{"name": "...", "columns": [{"name": "...", "type": "...", "isPrimaryKey": false, "isForeignKey": false, "references": null, "nullable": true}]}]}'
      },
      { role: 'user', content: `Parse this schema: ${schemaText}` }
    ],
    model: MODEL,
    temperature: 0,
    max_tokens: 2048
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { tables: [] };
  }
}

async function detectDanger(sql) {
  const upperSQL = sql.toUpperCase().trim();
  const dangerPatterns = [
    { pattern: /\bDROP\b/i, reason: 'Contains DROP statement - permanently deletes database objects' },
    { pattern: /\bTRUNCATE\b/i, reason: 'Contains TRUNCATE - removes all rows from table' },
    { pattern: /\bDELETE\b(?!.*\bWHERE\b)/i, reason: 'DELETE without WHERE - will delete all rows' },
    { pattern: /\bUPDATE\b(?!.*\bWHERE\b)/i, reason: 'UPDATE without WHERE - will update all rows' },
    { pattern: /\bALTER\s+TABLE\b/i, reason: 'Alters table structure - may cause data loss' }
  ];

  for (const { pattern, reason } of dangerPatterns) {
    if (pattern.test(sql)) {
      return { isDangerous: true, reason, riskLevel: 'HIGH' };
    }
  }

  if (/\bDELETE\b/i.test(sql) || /\bDROP\b/i.test(sql)) {
    return { isDangerous: true, reason: 'Destructive operation detected', riskLevel: 'MEDIUM' };
  }

  return { isDangerous: false, reason: '', riskLevel: 'LOW' };
}

module.exports = { generateSQL, explainSQL, optimizeSQL, analyzeDifficulty, autoFixSQL, parseSchemaFromText, detectDanger };
