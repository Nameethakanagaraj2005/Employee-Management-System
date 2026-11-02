const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Demo accounts may only be seeded outside production');
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database');
    const [columns] = await connection.query('SHOW COLUMNS FROM users LIKE ?', ['is_active']);
    if (columns.length === 0) {
      await connection.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE');
      console.log('Added users.is_active account status column');
    }

    const demoUsers = [
      { username: 'admin', email: 'admin@ems.com', password: 'admin123', role: 'admin' },
      { username: 'manager', email: 'manager@ems.com', password: 'manager123', role: 'manager' },
      { username: 'employee', email: 'employee@ems.com', password: 'employee123', role: 'employee' }
    ];

    for (const demoUser of demoUsers) {
      const [existingUsers] = await connection.query(
        'SELECT id, username, email, role FROM users WHERE username = ? OR email = ? FOR UPDATE',
        [demoUser.username, demoUser.email]
      );

      let userId;
      if (existingUsers.length > 0) {
        const existingUser = existingUsers.find((user) => user.username === demoUser.username);
        if (existingUsers.length !== 1 || !existingUser || existingUser.role !== demoUser.role) {
          throw new Error(`Conflicting username or email for development account: ${demoUser.username}`);
        }
        userId = existingUser.id;
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);
        await connection.query(
          'UPDATE users SET email = ?, password = ?, is_active = 1 WHERE id = ?',
          [demoUser.email, hashedPassword, userId]
        );
        console.log(`Development demo account verified: ${demoUser.username}`);
      } else {
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);
        const [result] = await connection.query(
          'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
          [demoUser.username, demoUser.email, hashedPassword, demoUser.role]
        );
        userId = result.insertId;
        console.log(`Development demo account created: ${demoUser.username}`);
      }

      if (demoUser.role === 'employee') {
        const [employeeProfiles] = await connection.query(
          'SELECT id FROM employees WHERE user_id = ? OR email = ? LIMIT 1',
          [userId, demoUser.email]
        );
        if (employeeProfiles.length === 0) {
          await connection.query(
            `INSERT INTO employees
              (user_id, employee_id, first_name, last_name, email, department, position, hire_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [userId, `DEMO-${userId}`, 'Demo', 'Employee', demoUser.email, 'Operations', 'Employee']
          );
        } else {
          await connection.query(
            'UPDATE employees SET user_id = ? WHERE id = ? AND user_id IS NULL',
            [userId, employeeProfiles[0].id]
          );
        }
      }
    }

    await connection.end();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
