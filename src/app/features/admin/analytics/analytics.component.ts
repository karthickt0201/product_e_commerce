import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);

  readonly orders = this.orderService.orders;
  readonly products = this.productService.products;

  readonly totalRevenue = computed(() =>
    this.orders()
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0)
  );

  readonly pendingCount = computed(() => this.orders().filter((o) => o.status === 'Pending').length);
  readonly confirmedCount = computed(() => this.orders().filter((o) => o.status === 'Confirmed').length);
  readonly cancelledCount = computed(() => this.orders().filter((o) => o.status === 'Cancelled').length);

  readonly lowStockProducts = computed(() =>
    [...this.products()]
      .filter((p) => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
  );

  readonly topCategories = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this.products()) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });

  readonly maxCategoryCount = computed(() => Math.max(1, ...this.topCategories().map(([, count]) => count)));
}
