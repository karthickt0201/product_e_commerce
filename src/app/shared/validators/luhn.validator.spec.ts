import { FormControl } from '@angular/forms';
import { isValidLuhn, luhnValidator } from './luhn.validator';

describe('isValidLuhn', () => {
  it('accepts a known-valid test card number', () => {
    expect(isValidLuhn('4539 1488 0343 6467')).toBeTrue();
  });

  it('rejects a number that fails the Luhn checksum', () => {
    expect(isValidLuhn('4539 1488 0343 6468')).toBeFalse();
  });

  it('rejects numbers that are too short', () => {
    expect(isValidLuhn('1234')).toBeFalse();
  });

  it('rejects numbers that are too long', () => {
    expect(isValidLuhn('1'.repeat(20))).toBeFalse();
  });

  it('strips non-digit characters before checking', () => {
    expect(isValidLuhn('4539-1488-0343-6467')).toBeTrue();
  });
});

describe('luhnValidator', () => {
  it('returns null for an empty value (defers to required)', () => {
    const control = new FormControl('');
    expect(luhnValidator(control)).toBeNull();
  });

  it('returns null for a valid card number', () => {
    const control = new FormControl('4539148803436467');
    expect(luhnValidator(control)).toBeNull();
  });

  it('returns a luhn error for an invalid card number', () => {
    const control = new FormControl('1234567890123456');
    expect(luhnValidator(control)).toEqual({ luhn: true });
  });
});
