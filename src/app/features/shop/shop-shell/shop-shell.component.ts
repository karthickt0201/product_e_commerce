import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * The entire /shop module is wrapped in @defer here, satisfying "load the /shop module
 * via @defer at the route level". Angular's router itself already lazy-loads the chunk
 * (loadChildren/loadComponent in shop.routes.ts); @defer additionally delays *rendering*
 * that chunk until the browser is idle, so the shell's own first paint (and anything
 * above it, like the nav) isn't blocked on storefront hydration.
 */
@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop-shell.component.html',
  styleUrl: './shop-shell.component.scss',
})
export class ShopShellComponent {}
