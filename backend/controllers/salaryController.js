const { pool } = require('../config/db');
const { getEmployeeForUser } = require('../utils/employee');

const getSalaries = async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }

      const [salaries] = await pool.query(
        `SELECT employee_id, first_name, last_name, department, position, salary
         FROM employees WHERE id = ?`,
        [employee.id]
      );
      return res.json({ salaries });
    }

    const [salaries] = await pool.query(
      `SELECT employee_id, first_name, last_name, department, position, salary
       FROM employees WHERE status != 'inactive' ORDER BY last_name, first_name`
    );
    return res.json({ salaries });
  } catch (error) {
    console.error('Get salary records error:', error);
    return res.status(500).json({ message: 'Unable to load salary records' });
  }
};

module.exports = { getSalaries };
