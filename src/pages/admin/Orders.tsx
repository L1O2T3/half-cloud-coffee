import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { CheckCircle, Clock, Coffee, AlertCircle, Image as ImageIcon, Check, X } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    if (updatingOrders.has(id)) return; // Prevent duplicate updates
    
    setUpdatingOrders(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        // Update the order status directly instead of fetching all orders
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === id ? { ...order, status } : order
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock size={12} /> 待审核付款</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1"><Clock size={12} /> 待制作</span>;
      case 'PREPARING':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1"><Coffee size={12} /> 制作中</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle size={12} /> 已完成</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle size={12} /> 已驳回</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1"><AlertCircle size={12} /> 未知</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <div className="bg-white px-3 py-2 md:px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">待审核: {orders.filter(o => o.status === 'PENDING_VERIFICATION').length}</span>
          </div>
          <div className="bg-white px-3 py-2 md:px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">待制作: {orders.filter(o => o.status === 'PENDING').length}</span>
          </div>
          <div className="bg-white px-3 py-2 md:px-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">制作中: {orders.filter(o => o.status === 'PREPARING').length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 text-gray-500">
            暂无订单
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2 md:gap-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-lg text-gray-900">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="md:text-right bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">联系人</p>
                    <p className="font-bold text-lg text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800">{item.menuItem.name}</span>
                          {item.selectedSpecs && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded whitespace-nowrap">
                              {Object.values(item.selectedSpecs).join('/')}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">x{item.quantity}</span>
                        </div>
                        <span className="text-gray-600 whitespace-nowrap ml-2">¥{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-medium text-gray-700">总计</span>
                    <span className="font-bold text-lg text-orange-600">¥{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  {order.remark && (
                    <div className="flex-1 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>备注: {order.remark}</span>
                    </div>
                  )}
                  
                  {order.paymentScreenshot && (
                    <div 
                      onClick={() => setSelectedImage(order.paymentScreenshot!)}
                      className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      <ImageIcon size={16} />
                      <span>查看付款截图</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-48 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                {order.status === 'PENDING_VERIFICATION' && (
                  <>
                    <button 
                      onClick={() => updateStatus(order.id, 'PENDING')}
                      disabled={updatingOrders.has(order.id)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        updatingOrders.has(order.id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {updatingOrders.has(order.id) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          处理中...
                        </>
                      ) : (
                        <>
                          <Check size={18} /> 通过审核
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('确定要驳回该订单的付款吗？')) {
                          updateStatus(order.id, 'REJECTED');
                        }
                      }}
                      disabled={updatingOrders.has(order.id)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        updatingOrders.has(order.id)
                          ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      {updatingOrders.has(order.id) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          处理中...
                        </>
                      ) : (
                        <>
                          <X size={18} /> 驳回付款
                        </>
                      )}
                    </button>
                  </>
                )}
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'PREPARING')}
                    disabled={updatingOrders.has(order.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      updatingOrders.has(order.id)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {updatingOrders.has(order.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        处理中...
                      </>
                    ) : (
                      '开始制作'
                    )}
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'COMPLETED')}
                    disabled={updatingOrders.has(order.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      updatingOrders.has(order.id)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {updatingOrders.has(order.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        处理中...
                      </>
                    ) : (
                      '制作完成'
                    )}
                  </button>
                )}
                {(order.status === 'COMPLETED' || order.status === 'REJECTED') && (
                  <div className="text-center text-gray-400 font-medium py-3">
                    订单已结束
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <img 
              src={selectedImage} 
              alt="付款截图" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
