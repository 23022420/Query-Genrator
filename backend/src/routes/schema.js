const express = require('express');
const router = express.Router();
const { getSchemas, createSchema, deleteSchema } = require('../controllers/schemaController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSchemas);
router.post('/', createSchema);
router.delete('/:id', deleteSchema);

module.exports = router;
