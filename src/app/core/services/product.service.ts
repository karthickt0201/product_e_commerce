import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { PagedResult, Product, ProductQuery } from '../models/product.model';

interface DummyJsonProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  description: string;
}

interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
}

/**
 * Single source of truth for the product catalogue, shared by the Admin panel (Task 2)
 * and the Storefront (Task 3). Products are fetched once from dummyjson.com and cached
 * as an in-memory signal; all filtering/sorting/pagination happens client-side so the
 * Admin table and the Shop grid can apply completely different views over the same data
 * without duplicate network calls.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly _products = signal<Product[]>([]);
  readonly products = this._products.asReadonly();

  private inflight$?: Observable<Product[]>;

  /** Loads (and caches) the full catalogue. Safe to call from multiple components. */
  loadAll(): Observable<Product[]> {
    if (this._products().length) {
      return new Observable<Product[]>((sub) => {
        sub.next(this._products());
        sub.complete();
      });
    }

    if (!this.inflight$) {
      this.inflight$ = this.http.get<DummyJsonResponse>('https://dummyjson.com/products?limit=100').pipe(
        map((res) => res.products.map(this.toProduct)),
        tap((products) => this._products.set(products)),
        shareReplay(1)
      );
    }
    return this.inflight$;
  }

  getById(id: number): Observable<Product | undefined> {
    const cached = this._products().find((p) => p.id === id);
    if (cached) {
      return new Observable((sub) => {
        sub.next(cached);
        sub.complete();
      });
    }
    return this.http.get<DummyJsonProduct>(`https://dummyjson.com/products/${id}`).pipe(map(this.toProduct));
  }

  /** Applies search/category/price/stock filters + sort + pagination client-side. */
  query(query: ProductQuery): PagedResult<Product> {
    let items = [...this._products()];

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();
      items = items.filter(
        (p) => p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      );
    }

    if (query.categories?.length) {
      items = items.filter((p) => query.categories!.includes(p.category));
    }

    if (query.minPrice != null) {
      items = items.filter((p) => p.price >= query.minPrice!);
    }
    if (query.maxPrice != null) {
      items = items.filter((p) => p.price <= query.maxPrice!);
    }

    if (query.inStockOnly) {
      items = items.filter((p) => p.stock > 0);
    }

    if (query.sortBy) {
      const dir = query.sortDir === 'desc' ? -1 : 1;
      const key = query.sortBy;
      items = items.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    const total = items.length;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return { items: pageItems, total, page, pageSize };
  }

  categories(): string[] {
    return Array.from(new Set(this._products().map((p) => p.category))).sort();
  }

  /** Applies a live stock tick to the cached signal so every subscriber sees the update. */
  applyStockTick(productId: number, stock: number): void {
    this._products.update((list) => list.map((p) => (p.id === productId ? { ...p, stock } : p)));
  }

  upsertLocal(product: Product): void {
    this._products.update((list) => {
      const exists = list.some((p) => p.id === product.id);
      return exists ? list.map((p) => (p.id === product.id ? product : p)) : [product, ...list];
    });
  }

  removeLocal(id: number): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
  }

  private toProduct = (raw: DummyJsonProduct): Product => ({
    id: raw.id,
    title: raw.title,
    category: raw.category,
    price: raw.price,
    stock: raw.stock,
    rating: raw.rating,
    brand: raw.brand,
    thumbnail: raw.thumbnail,
    images: raw.images ?? [raw.thumbnail],
    description: raw.description,
  });
}
