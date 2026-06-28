const express = require('express');
const router = express.Router();
const { getStats, getUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
