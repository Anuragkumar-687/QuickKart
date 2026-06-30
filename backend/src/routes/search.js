'use strict';

const express = require('express');
const ctrl = require('../controllers/searchController');
const { validate } = require('../middleware/validate');
const { searchQuerySchema, suggestQuerySchema } = require('../validators/searchValidators');

const router = express.Router();

router.get('/', validate({ query: searchQuerySchema }), ctrl.search);
router.get('/suggestions', validate({ query: suggestQuerySchema }), ctrl.suggestions);

module.exports = router;
