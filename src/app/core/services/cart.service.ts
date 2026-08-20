import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/order.model';
import { Product } from '../models/product.model';

const CART_KEY = 'pc.cart.items';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.readFromStorage());

  readonly items = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  add(product: Product, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock);
        return items.map((i) => (i.productId === product.id ? { ...i, quantity: nextQty } : i));
      }
      return [
        ...items,
        {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          quantity: Math.min(quantity, product.stock),
          maxStock: product.stock,
        },
      ];
    });
    this.persist();
  }

  setQuantity(productId: number, quantity: number): void {
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i))
    );
    this.persist();
  }

  remove(productId: number): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
  }

  private readFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
