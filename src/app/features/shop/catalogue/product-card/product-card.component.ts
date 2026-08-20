import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';

/**
 * OnPush is used because the card only ever changes in response to a new `product`
 * @Input reference (immutable updates from ProductService.applyStockTick, which
 * replaces the object rather than mutating it) — there's no internal mutable state
 * Angular would otherwise miss, so OnPush avoids re-checking every card on every
 * unrelated change-detection cycle across a grid that can hold dozens of cards.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
}
