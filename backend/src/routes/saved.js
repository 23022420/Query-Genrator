const express = require('express');
const router = express.Router();
const { getSaved, saveQuery, updateSaved, deleteSaved, toggleFavorite } = require('../controllers/savedController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSaved);
router.post('/', saveQuery);
router.put('/:id', updateSaved);
router.put('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteSaved);

module.exports = router;
