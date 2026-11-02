const { pool } = require('../config/db');
const { getEmployeeForUser } = require('../utils/employee');

const requestLeave = async (req, res) => {
  try {
    let { employee_id, leave_type, start_date, end_date, reason } = req.body;

    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }
      employee_id = employee.id;
    }

    if (!employee_id || !leave_type || !start_date || !end_date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const validTypes = ['sick', 'vacation', 'personal', 'other'];
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    const [result] = await pool.query(
      'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      [employee_id, leave_type, start_date, end_date, reason || null]
    );

    const [leave] = await pool.query('SELECT * FROM leaves WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Leave request submitted successfully', leave: leave[0] });
  } catch (error) {
    console.error('Request leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    let query = 'SELECT l.*, e.first_name, e.last_name, e.employee_id as emp_id FROM leaves l JOIN employees e ON l.employee_id = e.id WHERE 1=1';
    const params = [];

    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }
      query += ' AND l.employee_id = ?';
      params.push(employee.id);
    } else if (employee_id) {
      query += ' AND l.employee_id = ?';
      params.push(employee_id);
    }

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';

    const [leaves] = await pool.query(query, params);
    res.json({ leaves });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.id;

    const [existing] = await pool.query('SELECT * FROM leaves WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Leave request already processed' });
    }

    await pool.query(
      'UPDATE leaves SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      ['approved', approved_by, id]
    );

    const [leave] = await pool.query('SELECT * FROM leaves WHERE id = ?', [id]);

    res.json({ message: 'Leave approved successfully', leave: leave[0] });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const approved_by = req.user.id;

    const [existing] = await pool.query('SELECT * FROM leaves WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Leave request already processed' });
    }

    await pool.query(
      'UPDATE leaves SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      ['rejected', approved_by, id]
    );

    const [leave] = await pool.query('SELECT * FROM leaves WHERE id = ?', [id]);

    res.json({ message: 'Leave rejected successfully', leave: leave[0] });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  requestLeave,
  getLeaves,
  approveLeave,
  rejectLeave
};
