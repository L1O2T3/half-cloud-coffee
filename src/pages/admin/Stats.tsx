import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Order } from '../../types';
import * as XLSX from 'xlsx';

export default function Stats() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, completedOrders: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/orders').then(res => res.json())
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      // Sort orders by newest first
      setOrders(ordersData.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch stats data:', err);
      setLoading(false);
    });
  }, []);

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

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = orders.map(order => {
      // Format items string
      const itemsStr = order.items.map(item => {
        const specs = item.selectedSpecs ? `(${Object.values(item.selectedSpecs).join('/')})` : '';
        return `${item.menuItem.name}${specs} x${item.quantity}`;
      }).join('; ');

      return {
        '订单号': order.id,
        '下单时间': new Date(order.createdAt).toLocaleString(),
        '客户姓名': order.customerName || '未提供',
        '联系电话': order.customerPhone || '未提供',
        '商品明细': itemsStr,
        '订单金额': `¥${order.totalAmount.toFixed(2)}`,
        '订单状态': getStatusText(order.status),
        '备注': order.remark || '无'
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "订单明细");

    // Adjust column widths
    const colWidths = [
      { wch: 15 }, // 订单号
      { wch: 20 }, // 下单时间
      { wch: 15 }, // 客户姓名
      { wch: 15 }, // 联系电话
      { wch: 40 }, // 商品明细
      { wch: 10 }, // 订单金额
      { wch: 10 }, // 订单状态
      { wch: 20 }  // 备注
    ];
    ws['!cols'] = colWidths;

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `半农云咖_订单数据_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        <button 
          onClick={exportToExcel}
          disabled={orders.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={18} className="mr-2" />
          <span className="hidden sm:inline">导出Excel</span>
          <span className="sm:hidden">导出</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex items-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-4 shrink-0">
            <TrendingUp size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">总营业额 (¥)</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex items-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 shrink-0">
            <ShoppingBag size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">总订单数</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex items-center sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4 shrink-0">
            <CheckCircle size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">已完成订单</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Detailed Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">客户订单明细</h2>
          <span className="text-sm text-gray-500">共 {orders.length} 单</span>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">订单号/时间</th>
                  <th className="p-4 font-medium">客户信息</th>
                  <th className="p-4 font-medium">商品明细</th>
                  <th className="p-4 font-medium text-right">金额</th>
                  <th className="p-4 font-medium text-center">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      暂无订单数据
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm text-gray-900">{order.id}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{order.customerName || '未提供'}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.customerPhone || '未提供'}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-700 line-clamp-1">
                              <span className="font-medium">{item.menuItem.name}</span>
                              {item.selectedSpecs && (
                                <span className="text-gray-500 text-xs ml-1">
                                  ({Object.values(item.selectedSpecs).join('/')})
                                </span>
                              )}
                              <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-orange-500">¥{order.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          order.status === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
