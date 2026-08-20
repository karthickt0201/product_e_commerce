import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  // Resolved by productResolver — guaranteed non-null once this component activates
  // (the resolver redirects to /404 when the product doesn't exist).
  readonly product = signal<Product>(this.route.snapshot.data['product']);
  readonly quantity = signal(1);

  readonly relatedProducts = computed<Product[]>(() =>
    this.productService
      .products()
      .filter((p) => p.category === this.product().category && p.id !== this.product().id)
      .slice(0, 4)
  );

  increment(): void {
    this.quantity.update((q) => Math.min(q + 1, this.product().stock));
  }

  decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    this.cart.add(this.product(), this.quantity());
    this.toast.success(`${this.quantity()} × ${this.product().title} added to cart.`);
  }
}
