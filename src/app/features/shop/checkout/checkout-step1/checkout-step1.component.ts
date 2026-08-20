import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { CheckoutService } from '../checkout.service';
import { OrderTotalsPipe } from '../../../../shared/pipes/order-totals.pipe';
import { CheckoutStepsComponent } from '../checkout-steps/checkout-steps.component';

@Component({
  selector: 'app-checkout-step1',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, OrderTotalsPipe, CheckoutStepsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-step1.component.html',
  styleUrl: './checkout-step1.component.scss',
})
export class CheckoutStep1Component implements OnInit {
  private readonly router = inject(Router);
  readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);

  ngOnInit(): void {
    if (this.cart.isEmpty()) {
      this.router.navigate(['/shop']);
    }
  }

  continue(): void {
    this.checkout.completeStep1();
    this.router.navigate(['/shop/checkout/step/2']);
  }
}
