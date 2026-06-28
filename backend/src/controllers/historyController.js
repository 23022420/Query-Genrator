const QueryHistory = require('../models/QueryHistory');

exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, queryType, search, favorites } = req.query;
    const filter = { user: req.user._id };

    if (queryType && queryType !== 'ALL') filter.queryType = queryType;
    if (favorites === 'true') filter.isFavorite = true;
    if (search) {
      filter.$or = [
        { prompt: { $regex: search, $options: 'i' } },
        { generatedSQL: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await QueryHistory.countDocuments(filter);
    const history = await QueryHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: history,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

exports.getHistoryById = async (req, res) => {
  try {
    const item = await QueryHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ error: 'History item not found.' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history item.' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const item = await QueryHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ error: 'History item not found.' });

    item.isFavorite = !item.isFavorite;
    await item.save();
    res.json({ success: true, isFavorite: item.isFavorite });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update favorite.' });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    await QueryHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'History item deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete history item.' });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await QueryHistory.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'History cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const total = await QueryHistory.countDocuments({ user: userId });
    const byType = await QueryHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$queryType', count: { $sum: 1 } } }
    ]);
    const byDifficulty = await QueryHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    const dangerous = await QueryHistory.countDocuments({ user: userId, isDangerous: true });
    const recentWeek = await QueryHistory.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: { total, byType, byDifficulty, dangerous, recentWeek }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};
