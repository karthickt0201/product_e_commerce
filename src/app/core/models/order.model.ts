export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface CartItem {
  productId: number;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface OrderLineItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}

export interface DeliveryDetails {
  [key: string]: string | boolean | undefined;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  date: string; // ISO date
  delivery: DeliveryDetails;
}
