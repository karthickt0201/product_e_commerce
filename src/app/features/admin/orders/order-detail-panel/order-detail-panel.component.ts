import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail-panel',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-detail-panel.component.html',
  styleUrl: './order-detail-panel.component.scss',
  animations: [
    trigger('scrim', [transition(':enter', [style({ opacity: 0 }), animate('160ms', style({ opacity: 1 }))])]),
    trigger('slidePanel', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('260ms cubic-bezier(.16,1,.3,1)', style({ transform: 'translateX(0)' }))]),
    ]),
  ],
})
export class OrderDetailPanelComponent {
  @Input({ required: true }) order!: Order;
  @Output() closed = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<OrderStatus>();

  readonly statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Cancelled'];

  onStatusSelect(value: string): void {
    this.statusChanged.emit(value as OrderStatus);
  }
}
