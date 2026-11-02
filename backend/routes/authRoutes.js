const express = require('express');
const router = express.Router();
const { register, login, getMe, getUsers, setUserActive } = require('../controllers/authController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/register', auth, adminAuth, register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/users', auth, adminAuth, getUsers);
router.patch('/users/:id/status', auth, adminAuth, setUserActive);

module.exports = router;
