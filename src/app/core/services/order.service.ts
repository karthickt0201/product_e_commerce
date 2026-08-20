import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CartItem } from '../models/order.model';
import { DeliveryDetails, Order, OrderStatus } from '../models/order.model';

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'Anita Desai',
    customerEmail: 'anita@example.com',
    items: [{ productId: 1, title: 'Essence Mascara Lash Princess', price: 9.99, quantity: 2 }],
    subtotal: 19.98,
    tax: 1.6,
    total: 21.58,
    status: 'Confirmed',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    delivery: { fullName: 'Anita Desai', city: 'Bengaluru' },
  },
  {
    id: 'ORD-1002',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan@example.com',
    items: [{ productId: 5, title: 'Red Lipstick', price: 12.5, quantity: 1 }],
    subtotal: 12.5,
    tax: 1.0,
    total: 13.5,
    status: 'Pending',
    date: new Date(Date.now() - 86400000).toISOString(),
    delivery: { fullName: 'Rohan Mehta', city: 'Mumbai' },
  },
  {
    id: 'ORD-1003',
    customerName: 'Wei Zhang',
    customerEmail: 'wei@example.com',
    items: [{ productId: 9, title: 'Powder Canister', price: 14.0, quantity: 3 }],
    subtotal: 42.0,
    tax: 3.36,
    total: 45.36,
    status: 'Cancelled',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    delivery: { fullName: 'Wei Zhang', city: 'Chennai' },
  },
];

/** Shared, in-memory mock order store. Task 2 (Admin) reads/updates it; Task 3 (Checkout) appends to it. */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly _orders = signal<Order[]>(SEED_ORDERS);
  readonly orders = this._orders.asReadonly();
  readonly orderCount = computed(() => this._orders().length);

  /** Simulates POSTing a new order, with an artificial chance of failure for the optimistic-UI flow. */
  submitOrder(params: {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    delivery: DeliveryDetails;
  }): Observable<Order> {
    const order: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: String(params.delivery['fullName'] ?? 'Guest Customer'),
      customerEmail: String(params.delivery['email'] ?? ''),
      items: params.items.map((i) => ({
        productId: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: params.subtotal,
      tax: params.tax,
      total: params.total,
      status: 'Pending',
      date: new Date().toISOString(),
      delivery: params.delivery,
    };

    // Optimistically add it right away — caller reconciles/rolls back based on the response.
    this._orders.update((list) => [order, ...list]);

    const failed = Math.random() < 0.08; // ~8% simulated failure rate
    if (failed) {
      return new Observable<Order>((sub) => {
        setTimeout(() => {
          this.rollback(order.id);
          sub.error(new Error('Payment could not be confirmed. Please try again.'));
        }, 700);
      });
    }

    return of(order).pipe(delay(700));
  }

  rollback(orderId: string): void {
    this._orders.update((list) => list.filter((o) => o.id !== orderId));
  }

  getById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  updateStatus(id: string, status: OrderStatus): void {
    this._orders.update((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  }
}
