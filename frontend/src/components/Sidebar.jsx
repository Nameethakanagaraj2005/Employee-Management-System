import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  LogOut,
  Wallet,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: user?.role === 'employee' ? 'My Profile' : 'Employees' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/leaves', icon: Calendar, label: 'Leave Management' },
    { path: '/salaries', icon: Wallet, label: user?.role === 'employee' ? 'My Salary' : 'Salary Records' },
  ];
  if (user?.role === 'admin') {
    menuItems.push({ path: '/accounts', icon: UserCog, label: 'Accounts' });
  }

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen text-white fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">EMS</h1>
        <p className="text-slate-400 text-sm mt-1">Employee Management</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="mb-4 px-4">
          <p className="text-sm text-slate-400">Logged in as</p>
          <p className="font-semibold text-white">{user?.username}</p>
          <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
