import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import {
  Users,
  UserCheck,
  CalendarClock,
  TrendingUp,
  Building,
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getDashboard();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (stats?.personal) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, {stats.employee?.first_name}
          </h1>
          <p className="text-slate-500 mt-1">Your personal employee dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Position</p>
            <p className="text-xl font-bold text-slate-800 mt-2">{stats.employee?.position || 'Not set'}</p>
            <p className="text-sm text-slate-500 mt-1">{stats.employee?.department || 'No department assigned'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Attendance Records</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.attendance?.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Pending Leave Requests</p>
            <p className="text-3xl font-bold text-amber-700 mt-2">{stats.leaves?.pending || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Approved Leave Requests</p>
            <p className="text-3xl font-bold text-green-700 mt-2">{stats.leaves?.approved || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats?.employees?.total || 0}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Present Today"
          value={stats?.attendance?.todayPresent || 0}
          icon={UserCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.leaves?.pending || 0}
          icon={CalendarClock}
          color="bg-amber-600"
        />
        <StatCard
          title="Departments"
          value={stats?.employees?.departments || 0}
          icon={Building}
          color="bg-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building size={20} className="text-blue-600" />
            Employees by Department
          </h2>
          {stats?.employees?.byDepartment?.length > 0 ? (
            <div className="space-y-3">
              {stats.employees.byDepartment.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">{dept.department || 'Unassigned'}</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No department data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Weekly Attendance Summary
          </h2>
          {stats?.attendance?.weekly ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-600 text-sm font-medium">Present</p>
                <p className="text-2xl font-bold text-green-700">{stats.attendance.weekly.present}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 text-sm font-medium">Absent</p>
                <p className="text-2xl font-bold text-red-700">{stats.attendance.weekly.absent}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-600 text-sm font-medium">Late</p>
                <p className="text-2xl font-bold text-amber-700">{stats.attendance.weekly.late}</p>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-slate-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-700">{stats.attendance.weekly.total}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No attendance data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarClock size={20} className="text-amber-600" />
            Monthly Leave Summary
          </h2>
          {stats?.leaves?.monthly ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-700">{stats.leaves.monthly.approved}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.leaves.monthly.rejected}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-amber-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-700">{stats.leaves.monthly.pending}</p>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-slate-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-700">{stats.leaves.monthly.total}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No leave data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
