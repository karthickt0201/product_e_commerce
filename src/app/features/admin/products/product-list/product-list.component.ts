import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { StockSocketService } from '../../../../core/services/stock-socket.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product } from '../../../../core/models/product.model';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { ProductFormComponent } from '../product-form/product-form.component';

type SortKey = 'title' | 'category' | 'price' | 'stock';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, SkeletonComponent, ProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly stockSocket = inject(StockSocketService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categoryControl = new FormControl('', { nonNullable: true });

  readonly search = signal('');
  readonly category = signal('');
  readonly sortKey = signal<SortKey>('title');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly editingProduct = signal<Product | null>(null);
  readonly showForm = signal(false);
  readonly recentlyUpdated = signal<Set<number>>(new Set());

  categories: string[] = [];

  ngOnInit(): void {
    this.productService.loadAll().subscribe(() => {
      this.categories = this.productService.categories();
      this.loading.set(false);
      this.stockSocket.connect();
    });

    // debounced + switchMap search (no full re-render per keystroke)
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search.set(value);
        this.page.set(1);
      });

    this.categoryControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.category.set(value);
      this.page.set(1);
    });

    this.stockSocket.stockTicks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((tick) => {
      this.recentlyUpdated.update((set) => new Set(set).add(tick.productId));
      setTimeout(() => {
        this.recentlyUpdated.update((set) => {
          const next = new Set(set);
          next.delete(tick.productId);
          return next;
        });
      }, 1200);
    });
  }

  get result() {
    return this.productService.query({
      search: this.search(),
      categories: this.category() ? [this.category()] : undefined,
      sortBy: this.sortKey(),
      sortDir: this.sortDir(),
      page: this.page(),
      pageSize: this.pageSize,
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.result.total / this.pageSize));
  }

  setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  openAdd(): void {
    this.editingProduct.set(null);
    this.showForm.set(true);
  }

  openEdit(product: Product): void {
    this.editingProduct.set(product);
    this.showForm.set(true);
  }

  onSaved(product: Product): void {
    this.productService.upsertLocal(product);
    this.toast.success(this.editingProduct() ? 'Product updated.' : 'Product added.');
    this.showForm.set(false);
  }

  deleteProduct(product: Product): void {
    // Optimistic UI: remove immediately, "POST" the delete, roll back on failure.
    this.productService.removeLocal(product.id);
    this.toast.show(`Deleting "${product.title}"…`, 'info', 1200);

    const simulatedDelay = 500;
    const willFail = Math.random() < 0.12;

    setTimeout(() => {
      if (willFail) {
        this.productService.upsertLocal(product);
        this.toast.error(`Couldn't delete "${product.title}". Restored.`);
      } else {
        this.toast.success(`"${product.title}" deleted.`);
      }
    }, simulatedDelay);
  }

  isJustUpdated(id: number): boolean {
    return this.recentlyUpdated().has(id);
  }
}
