export interface MenuItem {
  id: string;
  category: string;
  name: string;
  enName: string;
  originalPrice: number;
  price: number;
  image: string;
  stock: number;
  status: 'ON' | 'OFF';
  specs?: {
    name: string;
    options: string[];
  }[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSpecs?: Record<string, string>;
}

export interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  remark?: string;
  status: 'PENDING_VERIFICATION' | 'PENDING' | 'PREPARING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  paymentScreenshot?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'STAFF';
  name: string;
}
