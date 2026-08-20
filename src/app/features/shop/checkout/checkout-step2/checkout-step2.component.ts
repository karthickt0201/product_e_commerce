import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicFieldConfig } from '../../../../shared/components/dynamic-form/dynamic-form.model';
import { DynamicFormComponent } from '../../../../shared/components/dynamic-form/dynamic-form.component';
import { CheckoutStepsComponent } from '../checkout-steps/checkout-steps.component';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-checkout-step2',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, DynamicFormComponent, CheckoutStepsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-step2.component.html',
  styleUrl: './checkout-step2.component.scss',
})
export class CheckoutStep2Component implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly checkout = inject(CheckoutService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fields = signal<DynamicFieldConfig[]>([]);
  readonly loading = signal(true);
  form: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.http
      .get<DynamicFieldConfig[]>('assets/checkout-form.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fields) => {
        this.fields.set(fields);
        this.form = this.buildFormGroup(fields);
        this.loading.set(false);
      });
  }

  private buildFormGroup(fields: DynamicFieldConfig[]): FormGroup {
    const group: Record<string, any> = {};
    for (const field of fields) {
      const validators = (field.validators ?? []).map((v) => {
        switch (v.type) {
          case 'required':
            return Validators.required;
          case 'minLength':
            return Validators.minLength(Number(v.value));
          case 'pattern':
            return Validators.pattern(String(v.value));
          case 'email':
            return Validators.email;
          default:
            return Validators.nullValidator;
        }
      });
      group[field.key] = [field.defaultValue ?? '', validators];
    }
    return this.fb.group(group);
  }

  continue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.checkout.completeStep2(this.form.getRawValue());
    this.router.navigate(['/shop/checkout/step/3']);
  }
}
