import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Pure function so it can be unit tested (and reused by the CVA) without a FormControl. */
export function isValidLuhn(rawValue: string): boolean {
  const digits = rawValue.replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export const luhnValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value ?? '') as string;
  if (!value) return null; // let `required` own the empty case
  return isValidLuhn(value) ? null : { luhn: true };
};
