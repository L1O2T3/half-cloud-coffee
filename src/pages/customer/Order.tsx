import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order as OrderType } from '../../types';
import { ArrowLeft, Clock, Coffee, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Check if we just navigated here from a successful payment
    if (location.state?.paymentSuccess) {
      setShowSuccessToast(true);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      
      // Hide toast after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">加载中...</div>;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <button onClick={() => navigate('/')} className="text-orange-500 font-bold">返回首页</button>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return { text: '等待审核付款', color: 'text-yellow-500', icon: <Clock size={48} className="text-yellow-500 mb-4 animate-pulse" /> };
      case 'PENDING':
        return { text: '已接单', color: 'text-blue-500', icon: <Clock size={48} className="text-blue-500 mb-4" /> };
      case 'PREPARING':
        return { text: '制作中', color: 'text-orange-500', icon: <Coffee size={48} className="text-orange-500 mb-4 animate-pulse" /> };
      case 'COMPLETED':
        return { text: '已完成', color: 'text-green-500', icon: <CheckCircle2 size={48} className="text-green-500 mb-4" /> };
      case 'REJECTED':
        return { text: '付款被驳回', color: 'text-red-500', icon: <AlertCircle size={48} className="text-red-500 mb-4" /> };
      default:
        return { text: '未知状态', color: 'text-gray-500', icon: null };
    }
  };

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
            <CheckCircle2 size={20} />
            <span>支付成功，您的订单已提交</span>
          </div>
        </div>
      )}

      <div className="bg-white p-4 pt-8 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="mr-4 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">订单详情</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
          {statusDisplay.icon}
          <h2 className={`text-2xl font-bold ${statusDisplay.color}`}>{statusDisplay.text}</h2>
          <p className="text-gray-500 mt-2 text-sm text-center">
            {order.status === 'PENDING_VERIFICATION' && '商家正在审核您的付款截图，请稍候'}
            {order.status === 'PENDING' && '商家已确认付款并接单'}
            {order.status === 'PREPARING' && '咖啡师正在为您精心制作'}
            {order.status === 'COMPLETED' && '请慢用，期待您的再次光临'}
            {order.status === 'REJECTED' && '您的付款截图审核未通过，请联系商家'}
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h3 className="font-bold text-gray-800">订单信息</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">订单编号</span>
              <span className="font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">下单时间</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">联系人</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">联系电话</span>
              <span className="font-bold">{order.customerPhone}</span>
            </div>
            {order.remark && (
              <div className="flex justify-between">
                <span className="text-gray-500">备注</span>
                <span className="text-right max-w-[60%]">{order.remark}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="border-b border-gray-100 pb-3 mb-3">
            <h3 className="font-bold text-gray-800">商品明细</h3>
          </div>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.menuItem.image} alt={item.menuItem.name} className="w-10 h-10 object-cover rounded" />
                  <div>
                    <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                    {item.selectedSpecs && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Object.values(item.selectedSpecs).join(' / ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium">¥{(item.menuItem.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <span className="text-gray-600 font-medium">实付金额</span>
            <span className="text-xl font-bold text-orange-500">¥{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
