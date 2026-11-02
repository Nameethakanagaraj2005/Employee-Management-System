const express = require('express');
const router = express.Router();
const { requestLeave, getLeaves, approveLeave, rejectLeave } = require('../controllers/leaveController');
const { auth, managerAuth } = require('../middleware/auth');

router.post('/', auth, requestLeave);
router.get('/', auth, getLeaves);
router.put('/:id/approve', auth, managerAuth, approveLeave);
router.put('/:id/reject', auth, managerAuth, rejectLeave);

module.exports = router;
