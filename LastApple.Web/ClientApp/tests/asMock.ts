import { type Mock } from 'vitest';

export default function asMock<T>(source: T): Mock {
    return source as unknown as Mock;
}
