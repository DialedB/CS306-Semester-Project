export interface MenuItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  orderCount?: number;
}
