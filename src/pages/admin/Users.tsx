import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    phone: '',
    role: 'STAFF',
    password: ''
  });

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddClick = () => {
    setNewUser({
      name: '',
      phone: '',
      role: 'STAFF',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newUser.name || !newUser.phone || !newUser.password) {
      alert('请填写完整信息');
      return;
    }

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该用户吗？')) return;
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
        <button onClick={handleAddClick} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm md:text-base">
          <Plus size={18} /> <span className="hidden sm:inline">添加人员</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                <th className="p-4">姓名</th>
                <th className="p-4">手机号 (登录账号)</th>
                <th className="p-4">角色</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="p-4 text-gray-600">{user.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? <Shield size={12} /> : <UserIcon size={12} />}
                      {user.role === 'ADMIN' ? '超级管理员' : '店员'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      disabled={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1}
                      title={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1 ? '不能删除最后一个管理员' : '删除'}
                    >
                      <Trash2 size={18} className={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1 ? 'opacity-50' : ''} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">添加人员</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newUser.name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="例如：张三" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号 (用作登录账号)</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={newUser.phone} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="例如：13800138000" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登录密码</label>
                <input 
                  type="password" 
                  name="password" 
                  value={newUser.password} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="设置初始密码" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色权限</label>
                <select 
                  name="role" 
                  value={newUser.role} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="STAFF">店员 (仅处理订单)</option>
                  <option value="ADMIN">超级管理员 (全部权限)</option>
                </select>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 md:px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 md:px-6 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
