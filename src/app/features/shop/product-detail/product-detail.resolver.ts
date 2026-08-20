import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

/**
 * Preloads the product via the shared ProductService before the route activates,
 * so the detail page itself never shows a loading skeleton — navigation simply
 * doesn't complete until the data is ready.
 */
export const productResolver: ResolveFn<Product | null> = (route) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return productService.loadAll().pipe(
    switchMap(() => productService.getById(id)),
    map((product) => product ?? null),
    catchError(() => of(null)),
    switchMap((product) => {
      if (!product) {
        router.navigate(['/404']);
      }
      return of(product);
    })
  );
};
