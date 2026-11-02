import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { salaryAPI } from '../services/api';

const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 'Not set';
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : 'Not set';
};

const Salaries = () => {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    salaryAPI.getAll()
      .then((response) => setSalaries(response.data.salaries))
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load salary records');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  if (error) {
    return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">{error}</div></div>;
  }

  if (user?.role === 'employee') {
    const salary = salaries[0];
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Salary</h1>
          <p className="text-slate-500 mt-1">Your current salary information</p>
        </div>
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" aria-label="Personal salary">
          <p className="text-sm text-slate-500">Current salary</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{salary ? formatAmount(salary.salary) : 'Not set'}</p>
          <p className="mt-2 text-sm text-slate-500">Amount shown as recorded in your employee profile.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Salary Records</h1>
        <p className="text-slate-500 mt-1">Current compensation recorded for active employees</p>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Salary amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {salaries.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No salary records found</td></tr>
            ) : salaries.map((record) => (
              <tr key={record.employee_id}>
                <td className="px-6 py-4 font-medium text-slate-800">{record.first_name} {record.last_name}</td>
                <td className="px-6 py-4 text-slate-600">{record.employee_id}</td>
                <td className="px-6 py-4 text-slate-600">{record.department || '-'}</td>
                <td className="px-6 py-4 text-slate-600">{record.position || '-'}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{formatAmount(record.salary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Salaries;
