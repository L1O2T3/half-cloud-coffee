import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import qrCodeImg from '../../assets/公共qrcode.jpg';

export default function Payment() {
  const { cart, setCart, customerName, customerPhone } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { remark, totalAmount } = location.state || { remark: '', totalAmount: 0 };

  useEffect(() => {
    if (cart.length === 0 && status === 'idle') {
      navigate('/');
    }
  }, [cart, navigate, status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async () => {
    if (!screenshot) {
      alert('请上传付款截图');
      return;
    }

    if (status === 'processing') {
      return; // Prevent duplicate submissions
    }

    setStatus('processing');
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: cart,
          totalAmount,
          remark,
          paymentScreenshot: screenshot
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart([]); // Clear cart after successful order
        // Navigate directly to the order status page with a success flag
        navigate(`/order/${data.id}`, { state: { paymentSuccess: true }, replace: true });
      } else {
        setStatus('idle');
        alert('下单失败，请重试');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('idle');
      alert('网络错误，请重试');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 pt-8 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">收银台</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center py-8">
        <div className="text-center mb-6">
          <p className="text-gray-500 mb-2">支付金额</p>
          <p className="text-5xl font-bold text-gray-900">
            <span className="text-2xl mr-1">¥</span>
            {totalAmount.toFixed(2)}
          </p>
        </div>

        {/* QR Code Payment Area */}
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm mb-6 flex flex-col items-center border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">请识别二维码支付</h2>
          
          <div className="w-56 h-56 bg-white rounded-xl flex flex-col items-center justify-center mb-6 border border-gray-200 p-2 shadow-inner">
            <img 
              src={qrCodeImg} 
              alt="支付二维码" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center space-y-2 w-full">
            <p className="text-sm text-gray-500">收款方</p>
            <p className="font-bold text-gray-900 text-lg">宁波半农云耕农业有限公司</p>
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">支持微信 / 支付宝 / 云闪付</span>
            </div>
          </div>
        </div>

        {/* Screenshot Upload Area */}
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <ImageIcon size={18} className="mr-2 text-orange-500" />
            上传付款截图 <span className="text-red-500 ml-1">*</span>
          </h3>
          
          {screenshot ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[9/16] max-h-64 flex items-center justify-center">
              <img src={screenshot} alt="付款截图" className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => setScreenshot(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <Upload size={32} className="mb-3" />
              <p className="text-sm font-medium">点击上传付款截图</p>
              <p className="text-xs mt-1 opacity-70">支持 jpg, png 格式</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <button 
          onClick={handlePayment}
          disabled={status === 'processing' || !screenshot}
          className={`w-full max-w-sm py-3.5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-colors ${
            !screenshot 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
              : 'bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600'
          }`}
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              提交审核中...
            </>
          ) : (
            '我已完成支付并上传截图'
          )}
        </button>
      </div>
    </div>
  );
}
