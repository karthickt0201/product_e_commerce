# Platform Commons — Angular Frontend Engineering Assignment

An Angular 17+ standalone application implementing role-based auth, an Admin panel, and a
customer storefront over the [DummyJSON](https://dummyjson.com/docs/products) product API.

## Quick start

```bash
npm install
npm start          # ng serve, http://localhost:4200
npm run build       # production build to dist/
npm test            # unit tests (Karma + Jasmine — requires Chrome/Chromium installed)
```

### Demo accounts

Defined in `src/assets/users.json` with SHA-256 hashed passwords (no plaintext in the store).

| Role  | Email                              | Password   |
|-------|-------------------------------------|------------|
| Admin | priya.admin@platformcommons.dev     | Admin@123  |
| Admin | daniel.admin@platformcommons.dev    | Admin@456  |
| User  | meera.user@platformcommons.dev      | User@123   |
| User  | sam.user@platformcommons.dev        | User@456   |

The login screen also has one-click "Admin" / "Shopper" demo-fill buttons.

## Project structure

```
src/app/
  core/                  # App-wide singletons — nothing here is UI
    guards/              # authGuard, adminGuard, checkoutStepGuard
    models/              # TS interfaces (User, Product, Order, Cart)
    services/            # AuthService, ProductService, OrderService, CartService,
                          # StockSocketService, ToastService — all signal-based
    utils/                # sha256 + base64url helpers for the mock JWT
  shared/                # Reusable, feature-agnostic building blocks
    components/
      dynamic-form/       # JSON-config-driven form renderer (Task 2 + Task 3 reuse it)
      card-number-input/  # Custom ControlValueAccessor with live Luhn validation
      skeleton/           # Shimmer loading placeholder
      toast/              # Toast notification tray
    pipes/                # orderTotals — pure pipe for subtotal/tax/total
    validators/           # luhnValidator (+ pure isValidLuhn for unit testing)
  layout/                 # NavBar, NotFound — app chrome, not a "feature"
  features/
    auth/login/           # Task 1
    admin/                # Task 2 — products, orders, analytics (each lazy-loaded)
    shop/                 # Task 3 — catalogue, product detail, cart, 3-step checkout
styles/
  _variables.scss         # design tokens (color, spacing, radius, shadow, type scale)
  _mixins.scss            # card, flex-center, focus-ring, truncate, etc.
  _animations.scss        # shared keyframes (rise-in, shimmer, pulse-dot, ...)
  _buttons.scss           # .btn / .btn--primary / .btn--ghost / .btn--danger
  _admin-table.scss       # shared table/toolbar styles for the 3 Admin screens
  _checkout.scss          # shared layout for the 3 checkout steps
```

Every component owns its own `.scss` file (`styleUrl`) — there is no inline `style=` anywhere
in the codebase, and no component-level `styles: [...]` arrays. Shared visual patterns
(tables, buttons, checkout layout) live in `src/styles/*.scss` partials and are pulled in via
`@forward`/`@use`, not copy-pasted.

## Architecture decisions

- **Signals over subscriptions.** `AuthService`, `CartService`, `ProductService`, and
  `OrderService` all expose readonly signals (`currentUser`, `items`, `products`, `orders`,
  etc.). Components read signals directly in templates — nothing subscribes to raw
  observables just to re-assign a component field.
- **Standalone everywhere, `inject()` everywhere.** No `NgModule` in the app; every
  service/guard/component uses the `inject()` function. `admin.guard.ts` and `auth.guard.ts`
  are plain `CanActivateFn`s, not classes.
- **One product catalogue, two views.** `ProductService` fetches once from
  `dummyjson.com/products` and caches the result as a signal. Both the Admin product table
  and the Shop catalogue call `.query({...})` with different filter/sort/paginate options
  over the *same* cached array — no duplicate network calls, and a stock update from the
  simulated WebSocket (`StockSocketService`) is instantly visible in both places because
  they're reading the same signal.
- **One WebSocket, one order store.** `StockSocketService` is a singleton `interval` +
  `Subject` pair, matching the "same stream, not a new one" requirement between Task 2 and
  Task 3. `OrderService` is the single mock order store read by the Admin Orders view and
  written to by Checkout Step 3.
- **The dynamic form renderer takes a config + a FormGroup, nothing else.**
  `DynamicFormComponent` has zero awareness of "checkout" or "admin" — the parent always
  owns the FormGroup and its validators. It's used by Checkout Step 2 (JSON config loaded
  from `assets/checkout-form.json`) and Checkout Step 3 (a small inline config array for
  the card + billing-address toggle, exercising the same `visibleWhen` mechanism). The
  Admin product form intentionally uses a hand-built reactive form instead — its fields are
  fixed and don't benefit from JSON-driven config, so reusing the dynamic renderer there
  would have been complexity without payoff (see the "Evaluation Philosophy" note in the
  assignment brief about not over-engineering).
- **`@defer` at the shop shell.** Angular's router already code-splits `/admin` and `/shop`
  into separate chunks via `loadChildren`. `@defer` is a template-level directive, so
  `ShopShellComponent` wraps its `<router-outlet>` in `@defer (on idle)` with a placeholder —
  this is documented in a comment in `shop-shell.component.ts` rather than left unexplained.

## Known limitations / not implemented

- **Micro-Frontend bonus (+30) — not attempted.** Given the 2–3 day scope of the core three
  tasks, Module/Native Federation was left out. If it were tackled, the natural split would
  be: a thin shell exposing `AuthService`/`CartService`/`ProductService` as shared
  singletons, with `admin` and `shop` as independently-built/served remotes loaded from a
  `federation.manifest.json` at runtime (sketched further in `MFE.md`).
- **Lighthouse screenshot / `/docs/lighthouse.png`** — this environment has no headless
  Chrome available to run Lighthouse or Karma tests, so the screenshot and a live `ng test`
  run couldn't be produced here. `PERFORMANCE.md` explains the performance decisions with
  the reasoning that would normally be backed by that screenshot; running `npm test` and a
  Lighthouse audit locally (Chrome DevTools → Lighthouse, on `/shop`) is the remaining step.
- **`/assets/checkout-form.json`-only dynamic config** covers delivery details; payment
  fields (card number + billing toggle) are defined as a small inline `DynamicFieldConfig[]`
  in `checkout-step3.component.ts` rather than a second JSON asset — functionally identical,
  just not file-backed, since there was nothing gained by adding a second fetch for 3 fields.
- **`bcrypt`-style hashing** uses the browser's native `SubtleCrypto` SHA-256 rather than a
  bcrypt library (the brief allows "a simple SHA-256 or bcrypt-like mock"), to avoid pulling
  in a crypto dependency for a mock store.

## Round 2 readiness

Every service, guard, and component above is small and single-purpose specifically so it can
be explained, extended, or rewritten live without archaeology. A few natural "extend this
live" entry points: add a wishlist signal to `CartService`, add a `visibleWhen`-driven coupon
field to checkout Step 1, or swap `StockSocketService`'s `interval` for a real `WebSocket`
connection without touching any consuming component (`connect()` is the only integration
point).
