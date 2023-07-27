export function assertNonNullable<T>(value: T): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`Expected non-nullable value, but got ${value}`);
    }
}
