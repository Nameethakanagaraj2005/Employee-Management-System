const { pool } = require('../config/db');
const { getEmployeeForUser } = require('../utils/employee');

const getMyProfile = async (req, res) => {
  try {
    const employee = await getEmployeeForUser(req.user);
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile is linked to this account' });
    }

    const [profiles] = await pool.query(
      `SELECT id, user_id, employee_id, first_name, last_name, email, phone,
        department, position, salary, hire_date, status, created_at, updated_at
       FROM employees WHERE id = ?`,
      [employee.id]
    );
    res.json({ employee: profiles[0] });
  } catch (error) {
    console.error('Get own employee profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, status } = req.body;

    if (!employee_id || !first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Please provide required fields' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE employee_id = ? OR email = ?',
      [employee_id, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Employee ID or email already exists' });
    }

    const connection = await pool.getConnection();
    let result;
    try {
      await connection.beginTransaction();
      const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
      const [insertResult] = await connection.query(
        `INSERT INTO employees (user_id, employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [users[0]?.id || null, employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, status || 'active']
      );
      result = insertResult;
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const [newEmployee] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee[0] });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [employees] = await pool.query(query, params);
    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [employees] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee: employees[0] });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const adminFields = ['first_name', 'last_name', 'email', 'phone', 'department', 'position', 'salary', 'hire_date', 'status'];
    const managerFields = ['first_name', 'last_name', 'email', 'phone', 'department', 'position'];
    const allowedFields = req.user.role === 'admin' ? adminFields : managerFields;
    const fields = allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));

    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No permitted employee fields were provided' });
    }
    await pool.query(
      `UPDATE employees SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE id = ?`,
      [...fields.map((field) => req.body[field]), id]
    );

    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    res.json({ message: 'Employee updated successfully', employee: updated[0] });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await pool.query('UPDATE employees SET status = ? WHERE id = ?', ['inactive', id]);

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getMyProfile,
  updateEmployee,
  deleteEmployee
};
