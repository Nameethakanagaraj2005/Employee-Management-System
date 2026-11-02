const express = require('express');
const router = express.Router();
const { getSalaries } = require('../controllers/salaryController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getSalaries);

module.exports = router;
