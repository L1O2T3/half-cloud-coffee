import React, { useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from './App';
import Home from './pages/customer/Home';
import Cart from './pages/customer/Cart';
import Payment from './pages/customer/Payment';
import Order from './pages/customer/Order';
import Profile from './pages/customer/Profile';
import Login from './pages/customer/Login';
import { Home as HomeIcon, ShoppingCart, User, Coffee } from 'lucide-react';

export default function CustomerApp() {
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* Desktop Top Navigation */}
      <div className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 h-16 px-8 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 text-orange-500 font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
          <Coffee size={28} />
          <span>半农云咖</span>
        </div>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/')} 
            className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === '/' ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
          >
            <HomeIcon size={20} />
            点单
          </button>
          <button 
            onClick={() => navigate('/cart')} 
            className={`flex items-center gap-2 font-medium transition-colors relative ${location.pathname === '/cart' ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
          >
            <div className="relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </div>
            购物车
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === '/profile' ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
          >
            <User size={20} />
            我的
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-5xl mx-auto w-full h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order/:id" element={<Order />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {location.pathname !== '/login' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 pb-safe z-50">
          <button 
            onClick={() => navigate('/')} 
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <HomeIcon size={24} />
            <span className="text-[10px] mt-1">点单</span>
          </button>
          <button 
            onClick={() => navigate('/cart')} 
            className={`flex flex-col items-center justify-center w-full h-full relative ${location.pathname === '/cart' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">购物车</span>
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/profile' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <User size={24} />
            <span className="text-[10px] mt-1">我的</span>
          </button>
        </div>
      )}
    </div>
  );
}
