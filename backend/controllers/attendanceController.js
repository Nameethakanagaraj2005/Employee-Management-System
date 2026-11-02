const { pool } = require('../config/db');
const { getEmployeeForUser } = require('../utils/employee');

const checkIn = async (req, res) => {
  try {
    let { employee_id, date, notes } = req.body;
    const check_in = new Date().toTimeString().slice(0, 5);

    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }
      employee_id = employee.id;
    }

    if (!employee_id || !date) {
      return res.status(400).json({ message: 'Please provide employee_id and date' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    const [result] = await pool.query(
      'INSERT INTO attendance (employee_id, date, check_in, status, notes) VALUES (?, ?, ?, ?, ?)',
      [employee_id, date, check_in, 'present', notes || null]
    );

    const [attendance] = await pool.query('SELECT * FROM attendance WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Check-in successful', attendance: attendance[0] });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkOut = async (req, res) => {
  try {
    let { employee_id, date } = req.body;
    const check_out = new Date().toTimeString().slice(0, 5);

    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }
      employee_id = employee.id;
    }

    if (!employee_id || !date) {
      return res.status(400).json({ message: 'Please provide employee_id and date' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'No check-in record found for this date' });
    }

    if (existing[0].check_out) {
      return res.status(400).json({ message: 'Already checked out for this date' });
    }

    await pool.query(
      'UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?',
      [check_out, employee_id, date]
    );

    const [attendance] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    res.json({ message: 'Check-out successful', attendance: attendance[0] });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;
    let query = 'SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_id FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE 1=1';
    const params = [];

    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }
      query += ' AND a.employee_id = ?';
      params.push(employee.id);
    } else if (employee_id) {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }

    if (start_date) {
      query += ' AND a.date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND a.date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY a.date DESC';

    const [attendance] = await pool.query(query, params);
    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, status, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await pool.query(
      'UPDATE attendance SET check_in = ?, check_out = ?, status = ?, notes = ? WHERE id = ?',
      [check_in, check_out, status, notes, id]
    );

    const [attendance] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);

    res.json({ message: 'Attendance updated successfully', attendance: attendance[0] });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
  updateAttendance
};
