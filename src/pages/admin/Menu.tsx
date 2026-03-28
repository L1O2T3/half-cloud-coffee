import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../../types';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function Menu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMenu = () => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleEdit = (item: MenuItem) => {
    setEditForm(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditForm({
      category: '新分类',
      name: '',
      enName: '',
      originalPrice: 0,
      price: 0,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200&h=200',
      stock: 100,
      status: 'OFF',
      specs: [
        { name: '温度', options: ['冷', '热'] },
        { name: '杯型', options: ['大杯', '中杯'] },
        { name: '甜度', options: ['正常糖', '少糖'] }
      ]
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const isNew = !editForm.id;
      const url = isNew ? '/api/menu' : `/api/menu/${editForm.id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Clean up specs before saving
      const cleanedSpecs = editForm.specs
        ?.map(s => ({
          name: s.name.trim(),
          options: s.options.map(o => o.trim()).filter(Boolean)
        }))
        .filter(s => s.name && s.options.length > 0);

      const payload = { ...editForm, specs: cleanedSpecs };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      fetchMenu();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleAddSpec = () => {
    setEditForm(prev => ({
      ...prev,
      specs: [...(prev.specs || []), { name: '', options: [] }]
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      specs: prev.specs?.filter((_, i) => i !== index)
    }));
  };

  const handleSpecNameChange = (index: number, value: string) => {
    setEditForm(prev => {
      const newSpecs = [...(prev.specs || [])];
      newSpecs[index] = { ...newSpecs[index], name: value };
      return { ...prev, specs: newSpecs };
    });
  };

  const handleSpecOptionsChange = (index: number, value: string) => {
    setEditForm(prev => {
      const newSpecs = [...(prev.specs || [])];
      const normalizedValue = value.replace(/，/g, ',');
      newSpecs[index] = { ...newSpecs[index], options: normalizedValue.split(',') };
      return { ...prev, specs: newSpecs };
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该商品吗？')) return;
    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      fetchMenu();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };



  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">菜单管理</h1>
        <button onClick={handleAddClick} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm md:text-base">
          <Plus size={18} /> <span className="hidden sm:inline">添加商品</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                <th className="p-4">商品</th>
                <th className="p-4">分类</th>
                <th className="p-4">售价 (¥)</th>
                <th className="p-4">原价 (¥)</th>
                <th className="p-4">库存</th>
                <th className="p-4">状态</th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {menu.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.enName}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4 font-medium text-orange-600">{item.price.toFixed(2)}</td>
                  <td className="p-4 text-gray-500 line-through">{item.originalPrice.toFixed(2)}</td>
                  <td className="p-4 text-gray-600">{item.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {item.status === 'ON' ? '上架中' : '已下架'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editForm.id ? '编辑商品' : '添加商品'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">商品图片</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-colors cursor-pointer h-40 relative overflow-hidden"
                    >
                      {editForm.image && editForm.image.startsWith('data:') ? (
                        <img src={editForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : editForm.image ? (
                        <img src={editForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={24} className="mb-2" />
                          <span className="text-sm">点击上传图片</span>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                    <input type="text" name="name" value={editForm.name || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="例如：生椰拿铁" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">英文名称</label>
                    <input type="text" name="enName" value={editForm.enName || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="例如：Coconut Latte" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <input type="text" name="category" value={editForm.category || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="例如：拿铁系列" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">售价 (¥)</label>
                      <input type="number" name="price" value={editForm.price || 0} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">原价 (¥)</label>
                      <input type="number" name="originalPrice" value={editForm.originalPrice || 0} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
                      <input type="number" name="stock" value={editForm.stock || 0} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                      <select name="status" value={editForm.status || 'ON'} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="ON">上架</option>
                        <option value="OFF">下架</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">商品规格配置</label>
                      <button 
                        type="button" 
                        onClick={handleAddSpec} 
                        className="text-orange-500 text-sm flex items-center hover:text-orange-600 transition-colors"
                      >
                        <Plus size={16} className="mr-1" /> 添加规格
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {editForm.specs?.map((spec, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSpec(index)} 
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="mb-3 pr-8">
                            <input 
                              type="text" 
                              value={spec.name} 
                              onChange={(e) => handleSpecNameChange(index, e.target.value)} 
                              placeholder="规格名 (如: 温度)" 
                              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div>
                            <input 
                              type="text" 
                              value={spec.options.join(',')} 
                              onChange={(e) => handleSpecOptionsChange(index, e.target.value)} 
                              placeholder="选项 (用逗号分隔, 如: 冷,热)" 
                              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                      {(!editForm.specs || editForm.specs.length === 0) && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                          <p className="text-sm text-gray-500">暂无规格，点击右上角添加</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 md:px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 md:px-6 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
                保存商品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
