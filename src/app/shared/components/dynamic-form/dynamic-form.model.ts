export type DynamicFieldType = 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'card-number';

export interface DynamicFieldValidator {
  type: 'required' | 'minLength' | 'pattern' | 'email';
  value?: string | number;
  message: string;
}

export interface DynamicFieldOption {
  label: string;
  value: string;
}

export interface DynamicFieldVisibleWhen {
  field: string;
  equals: string | boolean;
}

export interface DynamicFieldConfig {
  key: string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  defaultValue?: string | boolean;
  options?: DynamicFieldOption[];
  validators?: DynamicFieldValidator[];
  /** Field is only rendered/required when the referenced field equals this value. */
  visibleWhen?: DynamicFieldVisibleWhen;
}

/**
 * Pure predicate — kept outside the component so it's directly unit-testable and reusable
 * by anything (e.g. the checkout summary) that needs to know if a field is currently visible.
 */
export function isFieldVisible(field: DynamicFieldConfig, formValue: Record<string, unknown>): boolean {
  if (!field.visibleWhen) return true;
  const { field: dependsOn, equals } = field.visibleWhen;
  return formValue[dependsOn] === equals;
}
