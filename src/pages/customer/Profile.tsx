import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order as OrderType } from '../../types';
import { CartContext } from '../../App';
import { ChevronRight, Coffee, Package, User } from 'lucide-react';

export default function Profile() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const navigate = useNavigate();
  const { customerName, customerPhone } = useContext(CartContext);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (customerPhone) {
          // Only show orders for the bound phone number
          setOrders(data.filter((o: OrderType) => o.customerPhone === customerPhone));
        } else {
          // Visitors without bound phone number see no orders
          setOrders([]);
        }
      });
  }, [customerPhone]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION': return '待审核';
      case 'PENDING': return '已接单';
      case 'PREPARING': return '制作中';
      case 'COMPLETED': return '已完成';
      case 'REJECTED': return '已驳回';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION': return 'text-yellow-500 bg-yellow-50';
      case 'PENDING': return 'text-blue-500 bg-blue-50';
      case 'PREPARING': return 'text-orange-500 bg-orange-50';
      case 'COMPLETED': return 'text-green-500 bg-green-50';
      case 'REJECTED': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Profile */}
      <div className="bg-orange-500 text-white p-6 pt-12 pb-8 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-500 overflow-hidden shadow-md">
          {customerName ? <span className="text-2xl font-bold">{customerName.charAt(0).toUpperCase()}</span> : <User size={32} />}
        </div>
        <div>
          <h1 className="text-xl font-bold">{customerName || '微信用户'}</h1>
          {customerPhone ? (
            <p className="text-sm opacity-90 mt-1">{customerPhone}</p>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="text-sm opacity-90 mt-1 underline hover:text-white transition-colors"
            >
              点击绑定手机号
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-around items-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-800">{orders.length}</span>
            <span className="text-xs text-gray-500 mt-1">累计订单</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-800">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </span>
            <span className="text-xs text-gray-500 mt-1">已完成</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-800">
              {orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'REJECTED').length}
            </span>
            <span className="text-xs text-gray-500 mt-1">进行中</span>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center">
              <Package size={18} className="mr-2 text-orange-500" />
              我的订单
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Coffee size={32} className="mb-2 text-gray-300" />
                <p>暂无订单记录</p>
              </div>
            ) : (
              orders.map(order => (
                <div 
                  key={order.id} 
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">
                        {order.items.length > 0 ? order.items[0].menuItem.name : '咖啡订单'}
                        {order.items.length > 1 ? ` 等${order.items.length}件` : ''}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      <span className="font-medium text-gray-700">¥{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 ml-3" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
