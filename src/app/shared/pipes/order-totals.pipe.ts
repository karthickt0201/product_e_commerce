import { Pipe, PipeTransform } from '@angular/core';

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

const TAX_RATE = 0.08; // configurable rate

/** Pure pipe — Angular only re-runs it when `subtotal` itself changes, which is exactly what we want here. */
@Pipe({
  name: 'orderTotals',
  standalone: true,
  pure: true,
})
export class OrderTotalsPipe implements PipeTransform {
  transform(subtotal: number, taxRate: number = TAX_RATE): OrderTotals {
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }
}
