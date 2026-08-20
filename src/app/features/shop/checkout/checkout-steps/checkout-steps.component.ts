import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  imports: [NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-steps.component.html',
  styleUrl: './checkout-steps.component.scss',
})
export class CheckoutStepsComponent {
  @Input({ required: true }) current!: 1 | 2 | 3;
  readonly labels = ['Cart Review', 'Delivery Details', 'Payment'];
}
