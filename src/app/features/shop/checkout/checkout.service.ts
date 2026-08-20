import { Injectable, signal } from '@angular/core';
import { DeliveryDetails } from '../../../core/models/order.model';

/**
 * Tiny in-memory progress tracker for the 3-step checkout flow. Deliberately not
 * persisted to storage — if the user reloads mid-checkout they should re-confirm
 * their details rather than silently resuming with stale card info.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly _step1Complete = signal(false);
  private readonly _step2Complete = signal(false);
  private readonly _delivery = signal<DeliveryDetails | null>(null);

  readonly step1Complete = this._step1Complete.asReadonly();
  readonly step2Complete = this._step2Complete.asReadonly();
  readonly delivery = this._delivery.asReadonly();

  completeStep1(): void {
    this._step1Complete.set(true);
  }

  completeStep2(delivery: DeliveryDetails): void {
    this._delivery.set(delivery);
    this._step2Complete.set(true);
  }

  reset(): void {
    this._step1Complete.set(false);
    this._step2Complete.set(false);
    this._delivery.set(null);
  }
}
