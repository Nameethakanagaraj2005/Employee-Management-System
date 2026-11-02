const { pool } = require('../config/db');

const getEmployeeForUser = async (user) => {
  const [linkedEmployees] = await pool.query(
    'SELECT id FROM employees WHERE user_id = ? LIMIT 1',
    [user.id]
  );
  if (linkedEmployees.length > 0) {
    return linkedEmployees[0];
  }

  const [emailMatches] = await pool.query(
    'SELECT id FROM employees WHERE email = ? AND user_id IS NULL LIMIT 1',
    [user.email]
  );
  return emailMatches[0] || null;
};

module.exports = { getEmployeeForUser };
