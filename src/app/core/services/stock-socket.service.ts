import { Injectable, inject } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { StockTick } from '../models/product.model';
import { ProductService } from './product.service';

/**
 * Stands in for a real WebSocket. A single `interval` + `Subject` pair is created once
 * (this service is a singleton), so every consumer — the Admin product table, the shop
 * catalogue, individual product cards — subscribes to the *same* stream rather than
 * spinning up its own timer. That satisfies "the same stream, not a new one" in Task 3.
 */
@Injectable({ providedIn: 'root' })
export class StockSocketService {
  private readonly productService = inject(ProductService);

  private readonly ticks$ = new Subject<StockTick>();
  /** Public observable — components subscribe (with takeUntilDestroyed) to react to ticks. */
  readonly stockTicks$ = this.ticks$.asObservable();

  private started = false;

  /** Idempotent — safe to call from every component that wants live updates. */
  connect(): void {
    if (this.started) return;
    this.started = true;

    interval(2500).subscribe(() => {
      const products = this.productService.products();
      if (!products.length) return;

      // Nudge a random visible product's stock up or down by a small delta.
      const target = products[Math.floor(Math.random() * products.length)];
      const delta = Math.floor(Math.random() * 7) - 3; // -3..+3
      const nextStock = Math.max(0, target.stock + delta);

      this.productService.applyStockTick(target.id, nextStock);
      this.ticks$.next({ productId: target.id, stock: nextStock });
    });
  }
}
