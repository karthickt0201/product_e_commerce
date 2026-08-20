import { LowerCasePipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldConfig, isFieldVisible } from './dynamic-form.model';
import { CardNumberInputComponent } from '../card-number-input/card-number-input.component';

/**
 * Renders a form purely from a JSON field-config + an externally-owned FormGroup.
 * It has zero knowledge of which step/module is using it — the parent (Admin product
 * form, or Checkout Step 2/3) owns validation wiring and submission. This is what lets
 * the exact same component be reused across Task 2 and Task 3 with no duplication.
 */
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, LowerCasePipe, ReactiveFormsModule, CardNumberInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  @Input({ required: true }) fields: DynamicFieldConfig[] = [];
  @Input({ required: true }) formGroup!: FormGroup;

  /** Recomputed on every value change so visibleWhen fields toggle live. */
  private readonly formValueTick = signal(0);

  isVisible(field: DynamicFieldConfig): boolean {
    this.formValueTick(); // establish signal dependency so OnPush re-renders on change
    return isFieldVisible(field, this.formGroup.getRawValue());
  }

  onAnyValueChange(): void {
    this.formValueTick.update((v) => v + 1);
  }

  errorFor(field: DynamicFieldConfig): string | null {
    const control = this.formGroup.get(field.key);
    if (!control || !control.touched || control.valid) return null;
    const errorKey = Object.keys(control.errors ?? {})[0];
    const match = field.validators?.find((v) => v.type === errorKey || (errorKey === 'luhn' && v.type === 'pattern'));
    if (errorKey === 'luhn') return 'Enter a valid card number.';
    return match?.message ?? 'This field is invalid.';
  }
}
