import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


// 加载环境变量
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URL!, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    global.isMongoDBConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Connection string:', process.env.MONGODB_URL);
    console.log('Falling back to in-memory storage');
    global.isMongoDBConnected = false;
  });

// 定义数据模型
const menuItemSchema = new mongoose.Schema({
  id: String,
  category: String,
  name: String,
  enName: String,
  originalPrice: Number,
  price: Number,
  image: String,
  stock: Number,
  status: String,
  specs: Array
});

const orderSchema = new mongoose.Schema({
  id: String,
  customerName: String,
  customerPhone: String,
  items: Array,
  totalAmount: Number,
  remark: String,
  paymentScreenshot: String,
  status: { type: String, default: 'PENDING_VERIFICATION' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  id: String,
  phone: String,
  password: String,
  role: String,
  name: String
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// 内存存储作为后备方案
let memoryMenu: any[] = [];
let memoryOrders: any[] = [];
let memoryUsers: any[] = [];

// JWT认证中间件


// 初始化默认数据
async function initializeData() {
  try {
    const defaultMenu = [
      { id: 'm1', category: '经典咖啡', name: '美式咖啡', enName: 'Americano', originalPrice: 19.8, price: 9.9, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰', '热'] }, { name: '杯型', options: ['中杯', '大杯'] }, { name: '甜度', options: ['正常糖', '少糖', '无糖'] }] },
      { id: 'm2', category: '经典咖啡', name: '拿铁咖啡', enName: 'Caffè Latte', originalPrice: 19.8, price: 9.9, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰', '热'] }, { name: '杯型', options: ['中杯', '大杯'] }, { name: '甜度', options: ['正常糖', '少糖', '无糖'] }] },
      { id: 'm3', category: '经典咖啡', name: '澳白', enName: 'Flat White', originalPrice: 28, price: 14, image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['热'] }, { name: '杯型', options: ['中杯'] }] },
      { id: 'm4', category: '经典咖啡', name: '燕麦拿铁', enName: 'Oat Milk Latte', originalPrice: 28, price: 14, image: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰', '热'] }, { name: '杯型', options: ['中杯', '大杯'] }, { name: '甜度', options: ['正常糖', '少糖', '无糖'] }] },
      { id: 'm5', category: '特调果咖', name: '真橙美式', enName: 'Orange Americano', originalPrice: 36, price: 18, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20americano%20coffee%20with%20fresh%20orange%20slices%20in%20a%20glass%20cup%20on%20wooden%20table&image_size=square', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰'] }, { name: '杯型', options: ['大杯'] }] },
      { id: 'm6', category: '特调果咖', name: '夏日果果', enName: 'Summer fruits', originalPrice: 40, price: 20, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰'] }, { name: '杯型', options: ['大杯'] }] },
      { id: 'm7', category: '风味拿铁', name: '榛果拿铁', enName: 'Hazelnut Latte', originalPrice: 34, price: 17, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰', '热'] }, { name: '杯型', options: ['中杯', '大杯'] }, { name: '甜度', options: ['正常糖', '少糖', '无糖'] }] },
      { id: 'm8', category: '风味拿铁', name: '香草拿铁', enName: 'Vanilla latte', originalPrice: 34, price: 17, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=200&h=200', stock: 100, status: 'ON', specs: [{ name: '温度', options: ['冰', '热'] }, { name: '杯型', options: ['中杯', '大杯'] }, { name: '甜度', options: ['正常糖', '少糖', '无糖'] }] }
    ];

    const defaultUsers = [
      { id: 'u1', phone: '123', password: 'WILL123', role: 'ADMIN', name: '超级管理员' },
      { id: 'u2', phone: '13800138000', password: 'password', role: 'STAFF', name: '店员小李' }
    ];

    if (global.isMongoDBConnected) {
      const menuCount = await MenuItem.countDocuments();
      if (menuCount === 0) {
        await MenuItem.insertMany(defaultMenu);
        console.log('Menu data initialized in MongoDB');
      }

      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.insertMany(defaultUsers);
        console.log('User data initialized in MongoDB');
      }
    } else {
      // 使用内存存储
      if (memoryMenu.length === 0) {
        memoryMenu = defaultMenu;
        console.log('Menu data initialized in memory');
      }
      if (memoryUsers.length === 0) {
        memoryUsers = defaultUsers;
        console.log('User data initialized in memory');
      }
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

initializeData();

// API Routes

// --- Users ---
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  
  let user;
  if (global.isMongoDBConnected) {
    user = await User.findOne({ phone, password });
  } else {
    user = memoryUsers.find(u => u.phone === phone && u.password === password);
  }
  
  if (user) {
    res.json({ id: user.id, phone: user.phone, role: user.role, name: user.name });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/users', async (req, res) => {
  if (global.isMongoDBConnected) {
    const users = await User.find();
    res.json(users.map(u => ({ id: u.id, phone: u.phone, role: u.role, name: u.name })));
  } else {
    res.json(memoryUsers.map(u => ({ id: u.id, phone: u.phone, role: u.role, name: u.name })));
  }
});

app.post('/api/users', async (req, res) => {
  const newUser = { ...req.body, id: `u${Date.now()}` };
  
  if (global.isMongoDBConnected) {
    const user = new User(newUser);
    await user.save();
    res.status(201).json({ id: user.id, phone: user.phone, role: user.role, name: user.name });
  } else {
    memoryUsers.push(newUser);
    res.status(201).json(newUser);
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const id = req.params.id;
  
  if (global.isMongoDBConnected) {
    const result = await User.findOneAndDelete({ id });
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    const index = memoryUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      memoryUsers.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

// --- Menu ---
app.get('/api/menu', async (req, res) => {
  if (global.isMongoDBConnected) {
    const menu = await MenuItem.find();
    res.json(menu);
  } else {
    res.json(memoryMenu);
  }
});

app.post('/api/menu', async (req, res) => {
  const newItem = { ...req.body, id: `m${Date.now()}` };
  
  if (global.isMongoDBConnected) {
    const menuItem = new MenuItem(newItem);
    await menuItem.save();
    res.json(menuItem);
  } else {
    memoryMenu.push(newItem);
    res.json(newItem);
  }
});

app.put('/api/menu/:id', async (req, res) => {
  const id = req.params.id;
  
  if (global.isMongoDBConnected) {
    const menuItem = await MenuItem.findOneAndUpdate(
      { id },
      req.body,
      { new: true }
    );
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    const index = memoryMenu.findIndex(item => item.id === id);
    if (index !== -1) {
      memoryMenu[index] = { ...memoryMenu[index], ...req.body };
      res.json(memoryMenu[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  const id = req.params.id;
  
  if (global.isMongoDBConnected) {
    const result = await MenuItem.findOneAndDelete({ id });
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    const index = memoryMenu.findIndex(item => item.id === id);
    if (index !== -1) {
      memoryMenu.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

// --- Orders ---
app.get('/api/orders', async (req, res) => {
  if (global.isMongoDBConnected) {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } else {
    res.json(memoryOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const id = req.params.id;
  
  if (global.isMongoDBConnected) {
    const order = await Order.findOne({ id });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    const order = memoryOrders.find(o => o.id === id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, items, totalAmount, remark, paymentScreenshot } = req.body;
  const newOrder = {
    id: `ORD${Date.now().toString().slice(-6)}`,
    customerName,
    customerPhone,
    items,
    totalAmount,
    remark,
    paymentScreenshot,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString()
  };
  
  if (global.isMongoDBConnected) {
    const order = new Order(newOrder);
    await order.save();
    res.status(201).json(order);
  } else {
    memoryOrders.push(newOrder);
    res.status(201).json(newOrder);
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const id = req.params.id;
  
  if (global.isMongoDBConnected) {
    const order = await Order.findOneAndUpdate(
      { id },
      { status: req.body.status },
      { new: true }
    );
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    const index = memoryOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      memoryOrders[index].status = req.body.status;
      res.json(memoryOrders[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: global.isMongoDBConnected ? 'connected' : 'memory'
  });
});

// --- Stats ---
app.get('/api/stats', async (req, res) => {
  if (global.isMongoDBConnected) {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'COMPLETED' });
    const completedOrdersData = await Order.find({ status: 'COMPLETED' });
    const totalRevenue = completedOrdersData.reduce((sum, o) => sum + o.totalAmount, 0);
    res.json({ totalRevenue, totalOrders, completedOrders });
  } else {
    const totalOrders = memoryOrders.length;
    const completedOrders = memoryOrders.filter(o => o.status === 'COMPLETED').length;
    const totalRevenue = memoryOrders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    res.json({ totalRevenue, totalOrders, completedOrders });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    
    // 定时任务：每25分钟发送请求保持服务器活跃
    if (process.env.NODE_ENV === 'production') {
      setInterval(async () => {
        try {
          const response = await fetch('https://ban-nong-yun-ka.onrender.com/api/health');
          if (response.ok) {
            console.log(`定时唤醒成功 - ${new Date().toISOString()}`);
          } else {
            console.log(`定时唤醒失败 - ${new Date().toISOString()}`);
          }
        } catch (error) {
          console.log(`定时唤醒请求失败: ${error} - ${new Date().toISOString()}`);
        }
      }, 25 * 60 * 1000); // 25分钟
      
      console.log('定时唤醒任务已启动');
    }
  });
}

start();