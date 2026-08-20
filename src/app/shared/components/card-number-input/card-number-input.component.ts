import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isValidLuhn } from '../../validators/luhn.validator';

/**
 * Custom ControlValueAccessor for a card-number field with real-time Luhn validation.
 * Formats input into 4-digit groups as the user types and exposes a live validity signal
 * for instant visual feedback, while still integrating transparently into any reactive
 * FormGroup via formControlName (see dynamic-form.component.html).
 */
@Component({
  selector: 'app-card-number-input',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-number-input.component.html',
  styleUrl: './card-number-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CardNumberInputComponent),
      multi: true,
    },
  ],
})
export class CardNumberInputComponent implements ControlValueAccessor {
  @Input() id = 'card-number';

  readonly displayValue = signal('');
  readonly isValid = signal<boolean | null>(null);
  readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.displayValue.set(this.formatGroups(value ?? ''));
    this.updateValidity(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(raw: string): void {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 19);
    const grouped = this.formatGroups(digitsOnly);
    this.displayValue.set(grouped);
    this.updateValidity(digitsOnly);
    this.onChange(digitsOnly);
  }

  onBlur(): void {
    this.onTouched();
  }

  private updateValidity(digits: string): void {
    this.isValid.set(digits.length === 0 ? null : isValidLuhn(digits));
  }

  private formatGroups(digits: string): string {
    return digits
      .replace(/\D/g, '')
      .slice(0, 19)
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }
}
