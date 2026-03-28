import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import { Minus, Plus, Trash2, User, Phone } from 'lucide-react';
import { MenuItem } from '../../types';

export default function Cart() {
  const { cart, setCart, customerName, setCustomerName, customerPhone, setCustomerPhone } = useContext(CartContext);
  const [remark, setRemark] = useState('');
  const navigate = useNavigate();

  const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.menuItem.price * item.quantity), 0);

  const updateQuantity = (item: any, delta: number) => {
    const specKey = item.selectedSpecs ? JSON.stringify(item.selectedSpecs) : undefined;
    const existing = cart.find((c: any) => c.menuItem.id === item.menuItem.id && JSON.stringify(c.selectedSpecs) === specKey);
    
    if (existing) {
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        setCart(cart.filter((c: any) => c !== existing));
      } else {
        setCart(cart.map((c: any) => c === existing ? { ...c, quantity: newQuantity } : c));
      }
    }
  };

  const clearCart = () => setCart([]);

  const handleCheckout = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('请填写您的姓名和手机号，以便我们为您送达');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(customerPhone)) {
      alert('请输入正确的11位手机号');
      return;
    }
    
    navigate('/payment', { state: { remark, totalAmount } });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">购物车是空的</h2>
        <p className="text-gray-500 mb-8 text-center">快去添加一杯美味的咖啡吧</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
        >
          去点单
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 md:py-8">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full md:h-auto md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:overflow-hidden">
        <div className="bg-white p-4 pt-8 md:pt-4 shadow-sm md:shadow-none border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold">购物车</h1>
          <button onClick={clearCart} className="text-gray-500 hover:text-red-500 flex items-center text-sm transition-colors">
            <Trash2 size={16} className="mr-1" /> 清空
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6 md:p-6">
          {/* Customer Info Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:border-none md:shadow-none md:p-0">
            <div className="border-b border-gray-100 pb-3 mb-3">
              <h2 className="font-bold text-gray-800">取餐信息 <span className="text-red-500 text-sm font-normal">*必填</span></h2>
              <p className="text-sm text-gray-500 mt-1">请填写您的信息，我们将根据此信息为您送达</p>
            </div>
            
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-transparent focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                <User size={18} className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="您的姓名" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm"
                />
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg p-3 border border-transparent focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                <Phone size={18} className="text-gray-400 mr-3" />
                <input 
                  type="tel" 
                  placeholder="您的手机号" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cart Items Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:border-none md:shadow-none md:p-0">
            <div className="border-b border-gray-100 pb-3 mb-3">
              <h2 className="font-bold text-gray-800">已选商品</h2>
            </div>
            
            <div className="space-y-4">
              {cart.map((item: any, index: number) => (
                <div key={`${item.menuItem.id}-${index}`} className="flex gap-3 md:gap-4">
                  <img src={item.menuItem.image} alt={item.menuItem.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-900 md:text-lg">{item.menuItem.name}</h3>
                        <span className="font-bold md:text-lg">¥{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.selectedSpecs && (
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                          {Object.values(item.selectedSpecs).join(' / ')}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs md:text-sm text-gray-500">¥{item.menuItem.price}/份</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item, -1)}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm md:text-base font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item, 1)}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 md:border-none md:shadow-none md:p-0">
            <h2 className="font-bold text-gray-800 mb-2">备注</h2>
            <textarea 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="口味偏好等要求（选填）"
              className="w-full bg-gray-50 rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-orange-500 outline-none resize-none h-20 transition-all"
            />
          </div>
        </div>

        <div className="bg-white p-4 border-t border-gray-200 pb-safe md:rounded-b-2xl md:bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">合计</span>
            <span className="text-2xl font-bold text-orange-500">¥{totalAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple icon component to avoid importing from lucide-react if not needed at top level
function ShoppingCart(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
