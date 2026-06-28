const express = require('express');
const router = express.Router();
const { getHistory, getHistoryById, toggleFavorite, deleteHistory, clearHistory, getStats } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getHistory);
router.get('/stats', getStats);
router.get('/:id', getHistoryById);
router.put('/:id/favorite', toggleFavorite);
router.delete('/clear/all', clearHistory);
router.delete('/:id', deleteHistory);

module.exports = router;
