import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import { User, Phone, ArrowRight, Coffee, X } from 'lucide-react';

export default function Login() {
  const { setCustomerName, setCustomerPhone } = useContext(CartContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Prevent mobile bottom navigation from showing on login page
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleLogin = () => {
    if (!name.trim()) {
      alert('请输入您的姓名');
      return;
    }
    
    if (!phone.trim()) {
      alert('请输入您的手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    setLoading(true);
    
    // 保存用户信息到Context
    setCustomerName(name.trim());
    setCustomerPhone(phone.trim());

    // 保存到localStorage
    localStorage.setItem('userInfo', JSON.stringify({
      name: name.trim(),
      phone: phone.trim()
    }));

    setTimeout(() => {
      setLoading(false);
      navigate('/profile');
    }, 500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4 z-[100]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
        <div className="relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Coffee size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">用户绑定</h1>
            <p className="text-gray-500">请绑定您的手机号，以便查询历史订单</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-transparent focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <User size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              placeholder="请输入您的姓名" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm"
              disabled={loading}
            />
          </div>

          <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-transparent focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <Phone size={18} className="text-gray-400 mr-3" />
            <input 
              type="tel" 
              placeholder="请输入您的手机号" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm"
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading || !name.trim() || !phone.trim()}
            className={`w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                绑定中...
              </>
            ) : (
              <>
                完成绑定
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>绑定后，您可以随时查询历史订单</p>
        </div>
      </div>
    </div>
  );
}