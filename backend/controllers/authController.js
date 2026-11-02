const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const register = async (req, res) => {
  try {
    const { username, email, password, role = 'employee' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const validRoles = ['admin', 'manager', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (username.trim().length > 50 || email.trim().length > 100 || password.length < 8) {
      return res.status(400).json({ message: 'Username or email is too long, or password is shorter than 8 characters' });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username.trim(), email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username.trim(), email.trim(), hashedPassword, role]
    );

    await pool.query(
      'UPDATE employees SET user_id = ? WHERE email = ? AND user_id IS NULL',
      [result.insertId, email.trim()]
    );

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, username: username.trim(), email: email.trim(), role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return res.status(400).json({ message: 'Please enter your username and password' });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE username = ? AND is_active = 1',
      [username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (_req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Unable to load user accounts' });
  }
};

const setUserActive = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const isActive = req.body.is_active;

    if (!Number.isInteger(userId) || ![true, false].includes(isActive)) {
      return res.status(400).json({ message: 'A valid account ID and active status are required' });
    }
    if (userId === req.user.id && !isActive) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User account not found' });
    }
    if (!isActive && users[0].role === 'admin') {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS count FROM users WHERE role = ? AND is_active = 1',
        ['admin']
      );
      if (Number(admins[0].count) <= 1) {
        return res.status(400).json({ message: 'The last active admin account cannot be deactivated' });
      }
    }

    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
    res.json({ message: `User account ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user account error:', error);
    res.status(500).json({ message: 'Unable to update user account' });
  }
};

module.exports = { register, login, getMe, getUsers, setUserActive };
