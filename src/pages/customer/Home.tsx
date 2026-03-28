import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../../App';
import { MenuItem } from '../../types';
import { Plus, Minus, X } from 'lucide-react';

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const { cart, setCart, customerName } = useContext(CartContext);
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        const cats = Array.from(new Set(data.map((item: MenuItem) => item.category))) as string[];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0]);
      });
  }, []);

  const handleAddClick = (item: MenuItem) => {
    if (item.specs && item.specs.length > 0) {
      setSelectedItem(item);
      const initialSpecs: Record<string, string> = {};
      item.specs.forEach(spec => {
        initialSpecs[spec.name] = spec.options[0];
      });
      setSelectedSpecs(initialSpecs);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, specs?: Record<string, string>) => {
    const specKey = specs ? JSON.stringify(specs) : undefined;
    const existing = cart.find((c: any) => c.menuItem.id === item.id && JSON.stringify(c.selectedSpecs) === specKey);
    
    if (existing) {
      setCart(cart.map((c: any) => 
        (c.menuItem.id === item.id && JSON.stringify(c.selectedSpecs) === specKey) 
          ? { ...c, quantity: c.quantity + 1 } 
          : c
      ));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1, selectedSpecs: specs }]);
    }
    setSelectedItem(null);
  };

  const removeFromCart = (item: MenuItem) => {
    const existing = cart.find((c: any) => c.menuItem.id === item.id);
    if (existing) {
      if (existing.quantity === 1) {
        setCart(cart.filter((c: any) => c !== existing));
      } else {
        setCart(cart.map((c: any) => c === existing ? { ...c, quantity: c.quantity - 1 } : c));
      }
    }
  };

  const getQuantity = (itemId: string) => {
    return cart.filter((c: any) => c.menuItem.id === itemId).reduce((sum: number, c: any) => sum + c.quantity, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent relative">
      {/* Header */}
      <div className="bg-orange-500 text-white p-4 pt-8 sticky top-0 z-10 shadow-sm md:hidden">
        <h1 className="text-xl font-bold">半农云咖</h1>
        <p className="text-sm opacity-90 mt-1">{customerName ? `欢迎, ${customerName}` : '请在购物车完善信息'}</p>
      </div>

      {/* Menu Layout */}
      <div className="flex flex-1 overflow-hidden md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:bg-white md:my-6 md:mx-4">
        {/* Sidebar Categories */}
        <div className="w-24 md:w-48 bg-gray-50 overflow-y-auto border-r border-gray-100">
          {categories.map(cat => (
            <div
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`p-4 text-sm md:text-base cursor-pointer transition-colors ${
                activeCategory === cat ? 'bg-white font-bold text-orange-500 border-l-4 border-orange-500' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">{activeCategory}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {menu.filter(item => item.category === activeCategory).map(item => (
              <div key={item.id} className="flex md:flex-col gap-4 p-3 md:p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-white">
                <img src={item.image} alt={item.name} className="w-24 h-24 md:w-full md:h-48 object-cover rounded-lg shadow-sm" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base md:text-lg">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 md:mt-1">{item.enName}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <span className="text-orange-500 font-bold text-lg md:text-xl">¥{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through ml-1">¥{item.originalPrice}</span>
                      )}
                    </div>
                    {/* Add/Remove Buttons */}
                    <div className="flex items-center gap-3">
                      {getQuantity(item.id) > 0 && (!item.specs || item.specs.length === 0) && (
                        <>
                          <button 
                            onClick={() => removeFromCart(item)}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm md:text-base font-medium w-4 text-center">{getQuantity(item.id)}</span>
                        </>
                      )}
                      {getQuantity(item.id) > 0 && item.specs && item.specs.length > 0 && (
                         <span className="text-sm md:text-base font-medium w-4 text-center text-orange-500">{getQuantity(item.id)}</span>
                      )}
                      <button 
                        onClick={() => handleAddClick(item)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 shadow-sm shadow-orange-500/30 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spec Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{selectedItem.enName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
              {selectedItem.specs?.map(spec => (
                <div key={spec.name} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                    {spec.name}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {spec.options.map(option => {
                      const isSelected = selectedSpecs[spec.name] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => setSelectedSpecs({ ...selectedSpecs, [spec.name]: option })}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isSelected 
                              ? 'bg-orange-50 border-2 border-orange-500 text-orange-600 shadow-sm shadow-orange-500/10' 
                              : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-white border-t border-gray-100 shrink-0 pb-safe">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">总计</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-orange-500">¥</span>
                    <span className="text-3xl font-black text-orange-500 tracking-tight">{selectedItem.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">已选规格</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[150px]">
                    {Object.values(selectedSpecs).join(' / ')}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => addToCart(selectedItem, selectedSpecs)}
                className="w-full bg-orange-500 text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                加入购物车
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
