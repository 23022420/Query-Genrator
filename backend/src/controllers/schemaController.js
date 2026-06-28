const DBSchema = require('../models/DBSchema');
const { parseSchemaFromText } = require('../utils/groqService');

exports.getSchemas = async (req, res) => {
  try {
    const schemas = await DBSchema.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: schemas });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schemas.' });
  }
};

exports.createSchema = async (req, res) => {
  try {
    const { name, rawSchema } = req.body;
    if (!name || !rawSchema) return res.status(400).json({ error: 'Name and schema are required.' });

    const parsed = await parseSchemaFromText(rawSchema);
    const schema = await DBSchema.create({
      user: req.user._id,
      name,
      rawSchema,
      tables: parsed.tables || []
    });

    res.status(201).json({ success: true, data: schema });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schema.' });
  }
};

exports.deleteSchema = async (req, res) => {
  try {
    await DBSchema.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Schema deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schema.' });
  }
};
