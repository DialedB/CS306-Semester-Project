export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
}
