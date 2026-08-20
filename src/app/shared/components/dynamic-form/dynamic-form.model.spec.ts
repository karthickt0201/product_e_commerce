import { DynamicFieldConfig, isFieldVisible } from './dynamic-form.model';

describe('isFieldVisible', () => {
  const baseField: DynamicFieldConfig = {
    key: 'billingAddress',
    label: 'Billing address',
    type: 'text',
  };

  it('is visible when the field has no visibleWhen predicate', () => {
    expect(isFieldVisible(baseField, {})).toBeTrue();
  });

  it('is visible when the referenced field matches the expected value', () => {
    const field: DynamicFieldConfig = {
      ...baseField,
      visibleWhen: { field: 'sameAsDelivery', equals: false },
    };
    expect(isFieldVisible(field, { sameAsDelivery: false })).toBeTrue();
  });

  it('is hidden when the referenced field does not match the expected value', () => {
    const field: DynamicFieldConfig = {
      ...baseField,
      visibleWhen: { field: 'sameAsDelivery', equals: false },
    };
    expect(isFieldVisible(field, { sameAsDelivery: true })).toBeFalse();
  });

  it('is hidden when the referenced field is missing from the form value', () => {
    const field: DynamicFieldConfig = {
      ...baseField,
      visibleWhen: { field: 'sameAsDelivery', equals: false },
    };
    expect(isFieldVisible(field, {})).toBeFalse();
  });
});
