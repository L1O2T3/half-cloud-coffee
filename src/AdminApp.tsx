import React, { useContext, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Orders from './pages/admin/Orders';
import Menu from './pages/admin/Menu';
import Stats from './pages/admin/Stats';
import Users from './pages/admin/Users';
import AdminLogin from './pages/admin/Login';
import { ClipboardList, Coffee, BarChart3, LogOut, Users as UsersIcon, Menu as MenuIcon, X } from 'lucide-react';
import { CartContext } from './App';

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, setAdminUser } = useContext(CartContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!adminUser && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  if (location.pathname === '/admin/login') {
    return (
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
      </Routes>
    );
  }

  const navItems = [
    { path: '/admin', label: '订单管理', icon: <ClipboardList size={20} /> },
    { path: '/admin/menu', label: '菜单管理', icon: <Coffee size={20} /> },
    { path: '/admin/stats', label: '数据统计', icon: <BarChart3 size={20} /> },
    ...(adminUser?.role === 'ADMIN' ? [{ path: '/admin/users', label: '人员管理', icon: <UsersIcon size={20} /> }] : []),
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-orange-600 font-bold text-lg">
          <Coffee size={24} />
          <span>半农云咖后台</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
          <MenuIcon size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">半农云咖</h1>
            <p className="text-sm text-gray-500 mt-1">商家管理后台</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-gray-900 truncate text-left">{adminUser?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 truncate text-left">{adminUser?.role === 'ADMIN' ? '超级管理员' : '店员'}</div>
            </div>
          </div>
          <button 
            onClick={() => {
              setAdminUser(null);
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            退出管理
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/stats" element={<Stats />} />
          {adminUser?.role === 'ADMIN' && <Route path="/users" element={<Users />} />}
        </Routes>
      </div>
    </div>
  );
}
