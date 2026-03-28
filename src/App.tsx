import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerApp from './CustomerApp';
import AdminApp from './AdminApp';

export const CartContext = createContext<any>(null);

export default function App() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user info from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        setCustomerName(userInfo.name || '');
        setCustomerPhone(userInfo.phone || '');
      } catch (error) {
        console.error('Failed to parse user info:', error);
      }
    }
  }, []);

  // Preload server to prevent sleep
  useEffect(() => {
    const preloadServer = async () => {
      try {
        await fetch('/api/health');
      } catch (error) {
        console.log('Server wake-up request sent');
      } finally {
        setLoading(false);
      }
    };

    preloadServer();
  }, []);

  // Custom setter that saves to localStorage
  const setCustomerInfo = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    localStorage.setItem('userInfo', JSON.stringify({ name, phone }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">正在连接服务器，请稍候...</p>
          <p className="mt-2 text-sm text-gray-500">首次访问可能需要30-50秒</p>
        </div>
      </div>
    );
  }

  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart, 
      customerName, 
      setCustomerName, 
      customerPhone, 
      setCustomerPhone, 
      setCustomerInfo,
      adminUser, 
      setAdminUser 
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<CustomerApp />} />
        </Routes>
      </BrowserRouter>
    </CartContext.Provider>
  );
}
