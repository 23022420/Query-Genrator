const QueryHistory = require('../models/QueryHistory');
const DBSchema = require('../models/DBSchema');
const User = require('../models/User');
const { generateSQL, explainSQL, optimizeSQL, analyzeDifficulty, autoFixSQL, detectDanger } = require('../utils/groqService');

exports.generateQuery = async (req, res) => {
  try {
    const { prompt, schemaId } = req.body;

    let schemaContext = '';
    if (schemaId) {
      const schema = await DBSchema.findOne({ _id: schemaId, user: req.user._id });
      if (schema) schemaContext = schema.rawSchema || JSON.stringify(schema.tables);
    }

    const result = await generateSQL(prompt, schemaContext);
    const danger = await detectDanger(result.sql || '');
    const difficulty = await analyzeDifficulty(result.sql || '');

    // Save to history
    const history = await QueryHistory.create({
      user: req.user._id,
      prompt,
      generatedSQL: result.sql || '',
      explanation: result.explanation || '',
      queryType: result.queryType || 'SELECT',
      difficulty: difficulty.difficulty || 'Easy',
      difficultyReason: difficulty.reason || '',
      isDangerous: danger.isDangerous,
      dangerReason: danger.reason
    });

    // Increment user query count
    await User.findByIdAndUpdate(req.user._id, { $inc: { queryCount: 1 } });

    res.json({
      success: true,
      data: {
        historyId: history._id,
        sql: result.sql,
        explanation: result.explanation,
        queryType: result.queryType,
        tablesUsed: result.tablesUsed || [],
        estimatedRows: result.estimatedRows || 'Unknown',
        difficulty: difficulty.difficulty,
        difficultyReason: difficulty.reason,
        concepts: difficulty.concepts || [],
        isDangerous: danger.isDangerous,
        dangerReason: danger.reason,
        riskLevel: danger.riskLevel
      }
    });
  } catch (err) {
    console.error('Generate query error:', err);
    res.status(500).json({ error: 'Failed to generate SQL. Check your Groq API key.' });
  }
};

exports.explainQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required.' });

    const result = await explainSQL(sql);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to explain SQL.' });
  }
};

exports.optimizeQuery = async (req, res) => {
  try {
    const { sql, historyId } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required.' });

    const result = await optimizeSQL(sql);

    if (historyId) {
      await QueryHistory.findByIdAndUpdate(historyId, {
        isOptimized: true,
        optimizedSQL: result.optimizedSQL
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to optimize SQL.' });
  }
};

exports.autoFixQuery = async (req, res) => {
  try {
    const { sql, errorMessage } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required.' });

    const result = await autoFixSQL(sql, errorMessage);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fix SQL.' });
  }
};

exports.detectDangerQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required.' });

    const result = await detectDanger(sql);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze SQL.' });
  }
};

exports.analyzeDifficultyQuery = async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL is required.' });

    const result = await analyzeDifficulty(sql);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze difficulty.' });
  }
};
