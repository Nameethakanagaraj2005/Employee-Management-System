const { pool } = require('../config/db');
const { getEmployeeForUser } = require('../utils/employee');

const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user);
      if (!employee) {
        return res.status(404).json({ message: 'No employee profile is linked to this account' });
      }

      const [profile] = await pool.query(
        'SELECT first_name, last_name, department, position FROM employees WHERE id = ?',
        [employee.id]
      );
      const [attendance] = await pool.query(
        `SELECT COUNT(*) AS total,
          COUNT(CASE WHEN date = CURDATE() AND status = 'present' THEN 1 END) AS todayPresent
         FROM attendance WHERE employee_id = ?`,
        [employee.id]
      );
      const [leaves] = await pool.query(
        `SELECT COUNT(*) AS total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected
         FROM leaves WHERE employee_id = ?`,
        [employee.id]
      );

      return res.json({
        personal: true,
        employee: profile[0],
        attendance: attendance[0],
        leaves: leaves[0]
      });
    }

    const [employeeCount] = await pool.query('SELECT COUNT(*) as count FROM employees WHERE status = ?', ['active']);
    const [departmentStats] = await pool.query('SELECT department, COUNT(*) as count FROM employees WHERE status = ? GROUP BY department', ['active']);
    const [departmentCount] = await pool.query(
      `SELECT COUNT(DISTINCT department) AS count FROM employees
       WHERE status = 'active' AND department IS NOT NULL AND department != ''`
    );
    const [todayAttendance] = await pool.query('SELECT COUNT(*) as present FROM attendance WHERE date = CURDATE() AND status = ?', ['present']);
    const [pendingLeaves] = await pool.query('SELECT COUNT(*) as count FROM leaves WHERE status = ?', ['pending']);

    const [attendanceStats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(*) as total
      FROM attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    const [leaveStats] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(*) as total
      FROM leaves
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    res.json({
      employees: {
        total: employeeCount[0].count,
        departments: departmentCount[0].count,
        byDepartment: departmentStats
      },
      attendance: {
        todayPresent: todayAttendance[0].present,
        weekly: attendanceStats[0]
      },
      leaves: {
        pending: pendingLeaves[0].count,
        monthly: leaveStats[0]
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats };
