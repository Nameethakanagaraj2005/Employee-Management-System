const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

router.post('/', auth, adminAuth, createEmployee);
router.get('/me', auth, getMyProfile);
router.get('/', auth, managerAuth, getAllEmployees);
router.get('/:id', auth, managerAuth, getEmployeeById);
router.put('/:id', auth, managerAuth, updateEmployee);
router.delete('/:id', auth, adminAuth, deleteEmployee);

module.exports = router;
