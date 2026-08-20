import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  animations: [
    trigger('backdropAnim', [
      transition(':enter', [style({ opacity: 0 }), animate('160ms', style({ opacity: 1 }))]),
    ]),
    trigger('sheetAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px) scale(0.98)' }),
        animate('220ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class ProductFormComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Output() saved = new EventEmitter<Product>();
  @Output() closed = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  form = this.buildForm();

  ngOnChanges(): void {
    this.form = this.buildForm();
  }

  private buildForm() {
    const p = this.product;
    return this.fb.nonNullable.group({
      title: [p?.title ?? '', [Validators.required, Validators.minLength(2)]],
      category: [p?.category ?? '', Validators.required],
      price: [p?.price ?? 0, [Validators.required, Validators.min(0.01)]],
      stock: [p?.stock ?? 0, [Validators.required, Validators.min(0)]],
      thumbnail: [p?.thumbnail ?? 'https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/thumbnail.png'],
      description: [p?.description ?? '', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const result: Product = {
      id: this.product?.id ?? Math.floor(Math.random() * 90000) + 10000,
      title: raw.title,
      category: raw.category,
      price: raw.price,
      stock: raw.stock,
      rating: this.product?.rating ?? 4.5,
      thumbnail: raw.thumbnail,
      images: this.product?.images ?? [raw.thumbnail],
      description: raw.description,
    };
    this.saved.emit(result);
  }
}
