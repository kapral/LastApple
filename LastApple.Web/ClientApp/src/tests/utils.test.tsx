import { assertNonNullable } from '../utils/mics';

describe('assertNonNullable', () => {
  it('does not throw for valid values', () => {
    expect(() => assertNonNullable('test')).not.toThrow();
    expect(() => assertNonNullable(42)).not.toThrow();
    expect(() => assertNonNullable({})).not.toThrow();
    expect(() => assertNonNullable([])).not.toThrow();
    expect(() => assertNonNullable(false)).not.toThrow();
    expect(() => assertNonNullable(0)).not.toThrow();
  });

  it('throws for null value', () => {
    expect(() => assertNonNullable(null)).toThrow('Expected non-nullable value, but got null');
  });

  it('throws for undefined value', () => {
    expect(() => assertNonNullable(undefined)).toThrow('Expected non-nullable value, but got undefined');
  });

  it('works correctly with type assertion', () => {
    const maybeString: string | null = 'test';
    assertNonNullable(maybeString);
    // After assertion, TypeScript should know maybeString is string
    expect(maybeString.length).toBe(4);
  });
});