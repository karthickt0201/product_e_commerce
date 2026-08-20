import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

/**
 * OnPush here is justified because every piece of UI state that can change — form
 * validity, `loading`, `errorMessage` — is either a signal or driven through the
 * reactive form's own change detection hooks. Nothing mutates outside Angular's
 * normal event/signal channels, so OnPush avoids the cost of checking this
 * component on every unrelated app-wide change-detection pass.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    const { email, password } = this.form.getRawValue();

    this.auth
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.loading.set(false);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const fallback = user.role === 'admin' ? '/admin' : '/shop';
          this.router.navigateByUrl(returnUrl ?? fallback);
        },
        error: (err: Error) => {
          this.loading.set(false);
          this.errorMessage.set(err.message ?? 'Something went wrong. Please try again.');
        },
      });
  }

  fillDemo(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.form.setValue({ email: 'priya.admin@platformcommons.dev', password: 'Admin@123' });
    } else {
      this.form.setValue({ email: 'meera.user@platformcommons.dev', password: 'User@123' });
    }
  }
}
