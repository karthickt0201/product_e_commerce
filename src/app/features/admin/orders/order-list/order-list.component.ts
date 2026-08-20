import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrderDetailPanelComponent } from '../order-detail-panel/order-detail-panel.component';

type StatusFilter = 'All' | OrderStatus;

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, OrderDetailPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly statusFilter = signal<StatusFilter>('All');
  readonly fromDate = signal<string>('');
  readonly toDate = signal<string>('');
  readonly selectedOrderId = signal<string | null>(null);
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly filtered = computed(() => {
    let items = this.orderService.orders();

    if (this.statusFilter() !== 'All') {
      items = items.filter((o) => o.status === this.statusFilter());
    }
    if (this.fromDate()) {
      items = items.filter((o) => o.date >= this.fromDate());
    }
    if (this.toDate()) {
      items = items.filter((o) => o.date <= this.toDate() + 'T23:59:59');
    }
    return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  readonly pageItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly selectedOrder = computed<Order | null>(() => {
    const id = this.selectedOrderId();
    return id ? this.orderService.getById(id) ?? null : null;
  });

  onStatusUpdated(status: OrderStatus): void {
    const id = this.selectedOrderId();
    if (!id) return;
    this.orderService.updateStatus(id, status);
    this.toast.success(`${id} marked ${status}.`);
  }
}
