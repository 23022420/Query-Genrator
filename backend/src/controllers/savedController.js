const SavedQuery = require('../models/SavedQuery');

exports.getSaved = async (req, res) => {
  try {
    const { search, favorites } = req.query;
    const filter = { user: req.user._id };
    if (favorites === 'true') filter.isFavorite = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { sql: { $regex: search, $options: 'i' } }
    ];

    const saved = await SavedQuery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved queries.' });
  }
};

exports.saveQuery = async (req, res) => {
  try {
    const { title, description, sql, prompt, tags } = req.body;
    if (!title || !sql) return res.status(400).json({ error: 'Title and SQL are required.' });

    const saved = await SavedQuery.create({
      user: req.user._id, title, description, sql, prompt, tags: tags || []
    });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save query.' });
  }
};

exports.updateSaved = async (req, res) => {
  try {
    const { title, description, sql, tags } = req.body;
    const saved = await SavedQuery.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, sql, tags },
      { new: true, runValidators: true }
    );
    if (!saved) return res.status(404).json({ error: 'Saved query not found.' });
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update saved query.' });
  }
};

exports.deleteSaved = async (req, res) => {
  try {
    await SavedQuery.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Saved query deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete saved query.' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const item = await SavedQuery.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ error: 'Saved query not found.' });
    item.isFavorite = !item.isFavorite;
    await item.save();
    res.json({ success: true, isFavorite: item.isFavorite });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
};
