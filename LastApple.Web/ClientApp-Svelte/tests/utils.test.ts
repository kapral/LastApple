import { describe, it, expect } from 'vitest';
import { assertNonNullable } from '$lib/utils/misc';

describe('assertNonNullable', () => {
    it('should not throw for non-null values', () => {
        expect(() => assertNonNullable('test')).not.toThrow();
        expect(() => assertNonNullable(0)).not.toThrow();
        expect(() => assertNonNullable(false)).not.toThrow();
        expect(() => assertNonNullable({})).not.toThrow();
    });

    it('should throw for null', () => {
        expect(() => assertNonNullable(null)).toThrow('Expected non-nullable value, but got null');
    });

    it('should throw for undefined', () => {
        expect(() => assertNonNullable(undefined)).toThrow('Expected non-nullable value, but got undefined');
    });
});
