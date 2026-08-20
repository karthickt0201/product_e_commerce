import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { StockSocketService } from '../../../core/services/stock-socket.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from './product-card/product-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [NgFor, NgIf, ProductCardComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly stockSocket = inject(StockSocketService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  readonly selectedCategories = signal<Set<string>>(new Set());
  readonly maxPrice = signal(1000);
  readonly inStockOnly = signal(false);
  readonly page = signal(1);
  readonly pageSize = 12;

  categories: string[] = [];

  ngOnInit(): void {
    this.readFiltersFromUrl();
    this.fetchProducts();
    this.stockSocket.connect();
    this.observeWebVitals();

    // Live stock ticks flow through ProductService signal already; no separate subscription needed
    // for the grid itself, but we still connect so cards reflect updates reactively.
    this.stockSocket.stockTicks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  /** Logs LCP and CLS for this route to the console, per the Task 3 performance requirements. */
  private observeWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) console.log('[web-vitals] LCP:', Math.round(last.startTime), 'ms');
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('[web-vitals] CLS (cumulative):', clsValue.toFixed(4));
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      this.destroyRef.onDestroy(() => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
      });
    } catch {
      // Older browsers without these entry types — fail silently, this is diagnostic only.
    }
  }

  private fetchProducts(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.productService.loadAll().subscribe({
      next: () => {
        this.categories = this.productService.categories();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  retry(): void {
    this.fetchProducts();
  }

  private readFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const cats = params.get('categories');
    if (cats) this.selectedCategories.set(new Set(cats.split(',')));
    const max = params.get('maxPrice');
    if (max) this.maxPrice.set(Number(max));
    this.inStockOnly.set(params.get('inStock') === '1');
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categories: this.selectedCategories().size ? Array.from(this.selectedCategories()).join(',') : null,
        maxPrice: this.maxPrice() !== 1000 ? this.maxPrice() : null,
        inStock: this.inStockOnly() ? '1' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  toggleCategory(cat: string): void {
    this.selectedCategories.update((set) => {
      const next = new Set(set);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
    this.page.set(1);
    this.syncUrl();
  }

  onMaxPriceChange(value: string): void {
    this.maxPrice.set(Number(value));
    this.page.set(1);
    this.syncUrl();
  }

  toggleInStock(): void {
    this.inStockOnly.update((v) => !v);
    this.page.set(1);
    this.syncUrl();
  }

  readonly result = computed(() =>
    this.productService.query({
      categories: this.selectedCategories().size ? Array.from(this.selectedCategories()) : undefined,
      maxPrice: this.maxPrice(),
      inStockOnly: this.inStockOnly(),
      page: this.page(),
      pageSize: this.pageSize,
    })
  );

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.result().total / this.pageSize)));

  addToCart(product: Product): void {
    this.cart.add(product, 1);
    this.toast.success(`${product.title} added to cart.`);
  }
}
