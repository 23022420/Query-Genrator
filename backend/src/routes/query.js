const express = require('express');
const router = express.Router();
const { generateQuery, explainQuery, optimizeQuery, autoFixQuery, detectDangerQuery, analyzeDifficultyQuery } = require('../controllers/queryController');
const { protect } = require('../middleware/auth');
const { sanitizeInput, validateQuery } = require('../middleware/validate');

router.use(protect);
router.post('/generate', sanitizeInput, validateQuery, generateQuery);
router.post('/explain', sanitizeInput, explainQuery);
router.post('/optimize', sanitizeInput, optimizeQuery);
router.post('/autofix', sanitizeInput, autoFixQuery);
router.post('/danger', sanitizeInput, detectDangerQuery);
router.post('/difficulty', sanitizeInput, analyzeDifficultyQuery);

module.exports = router;
