const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/salaries', require('./routes/salaryRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Employee Management System API' });
});

module.exports = app;
