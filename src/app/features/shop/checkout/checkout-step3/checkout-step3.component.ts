import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { luhnValidator } from '../../../../shared/validators/luhn.validator';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { DynamicFieldConfig } from '../../../../shared/components/dynamic-form/dynamic-form.model';
import { CheckoutStepsComponent } from '../checkout-steps/checkout-steps.component';
import { CheckoutService } from '../checkout.service';
import { OrderTotalsPipe } from '../../../../shared/pipes/order-totals.pipe';

@Component({
  selector: 'app-checkout-step3',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, DynamicFormComponent, CheckoutStepsComponent, OrderTotalsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-step3.component.html',
  styleUrl: './checkout-step3.component.scss',
})
export class CheckoutStep3Component implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly checkout = inject(CheckoutService);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  // Payment + billing fields rendered through the SAME dynamic-form renderer used in
  // Step 2 and the Admin product form — it accepts config + FormGroup with no idea
  // which step it's running in.
  readonly fields: DynamicFieldConfig[] = [
    { key: 'cardNumber', label: 'Card number', type: 'card-number', validators: [{ type: 'required', message: 'Card number is required.' }] },
    {
      key: 'sameAsDelivery',
      label: 'Billing address same as delivery',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      key: 'billingAddress',
      label: 'Billing address',
      type: 'text',
      placeholder: '221B Baker Street',
      visibleWhen: { field: 'sameAsDelivery', equals: false },
      validators: [{ type: 'required', message: 'Billing address is required.' }],
    },
  ];

  form = this.fb.group({
    cardNumber: ['', [Validators.required, luhnValidator]],
    sameAsDelivery: [true],
    billingAddress: [''],
  });

  ngOnInit(): void {
    if (this.cart.isEmpty()) {
      this.router.navigate(['/shop']);
    }
  }

  placeOrder(): void {
    if (this.form.invalid || !this.checkout.delivery()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const totals = { subtotal: this.cart.subtotal(), tax: this.cart.subtotal() * 0.08, total: this.cart.subtotal() * 1.08 };

    this.orderService
      .submitOrder({
        items: this.cart.items(),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        delivery: this.checkout.delivery()!,
      })
      .subscribe({
        next: (order) => {
          this.submitting.set(false);
          this.cart.clear();
          this.checkout.reset();
          this.toast.success('Order confirmed!');
          this.router.navigate(['/shop/order-confirmation', order.id]);
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.toast.error(err.message);
        },
      });
  }
}
