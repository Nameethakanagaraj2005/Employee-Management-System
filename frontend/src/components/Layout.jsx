import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 bg-slate-100 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
