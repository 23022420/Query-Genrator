const User = require('../models/User');
const QueryHistory = require('../models/QueryHistory');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQueries = await QueryHistory.countDocuments();
    const activeToday = await QueryHistory.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const dangerousQueries = await QueryHistory.countDocuments({ isDangerous: true });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const queryByType = await QueryHistory.aggregate([
      { $group: { _id: '$queryType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalQueries, activeToday, dangerousQueries, recentUsers, queryByType }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments();
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};
