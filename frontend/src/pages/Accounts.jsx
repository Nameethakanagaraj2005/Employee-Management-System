import React, { useCallback, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'manager' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load user accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.getUsers();
        setUsers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load user accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await authAPI.register(form);
      setForm({ username: '', email: '', password: '', role: 'manager' });
      setMessage('User account created successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create user account');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (account) => {
    setError('');
    setMessage('');
    try {
      await authAPI.setUserActive(account.id, !account.is_active);
      setMessage(`Account ${account.is_active ? 'deactivated' : 'activated'} successfully.`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update account status');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Account Management</h1>
        <p className="text-slate-500 mt-1">Create and manage employee and HR manager access</p>
      </div>

      {(error || message) && (
        <div className={`px-4 py-3 rounded-lg mb-6 ${error ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-700'}`} role={error ? 'alert' : 'status'}>
          {error || message}
        </div>
      )}

      <form onSubmit={createUser} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Create account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-700">Username
            <input className="block w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required maxLength={50} />
          </label>
          <label className="text-sm font-medium text-slate-700">Email
            <input className="block w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={100} />
          </label>
          <label className="text-sm font-medium text-slate-700">Temporary password
            <input className="block w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} autoComplete="new-password" />
          </label>
          <label className="text-sm font-medium text-slate-700">Role
            <select className="block w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="manager">HR Manager</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <button className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60" disabled={saving}>
          {saving ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <section className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {!loading && users.map((account) => (
              <tr key={account.id}>
                <td className="px-6 py-4 font-medium text-slate-800">{account.username}</td>
                <td className="px-6 py-4 text-slate-600">{account.email}</td>
                <td className="px-6 py-4 text-slate-600 capitalize">{account.role}</td>
                <td className="px-6 py-4 text-slate-600">{account.is_active ? 'Active' : 'Inactive'}</td>
                <td className="px-6 py-4">
                  <button type="button" className="text-blue-700 hover:underline" onClick={() => changeStatus(account)}>
                    {account.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading accounts…</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No accounts found</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Accounts;
