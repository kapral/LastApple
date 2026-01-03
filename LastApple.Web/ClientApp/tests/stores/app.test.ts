import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { latestStationId } from '$lib/stores/app';

describe('app store', () => {
    beforeEach(() => {
        // Reset to initial state
        latestStationId.set(null);
    });

    describe('latestStationId', () => {
        it('has initial value of null', () => {
            latestStationId.set(null); // Reset
            expect(get(latestStationId)).toBeNull();
        });

        it('can be set to a station ID', () => {
            latestStationId.set('station-123');

            expect(get(latestStationId)).toBe('station-123');
        });

        it('can be updated to a new station ID', () => {
            latestStationId.set('station-123');
            latestStationId.set('station-456');

            expect(get(latestStationId)).toBe('station-456');
        });

        it('can be reset to null', () => {
            latestStationId.set('station-123');
            latestStationId.set(null);

            expect(get(latestStationId)).toBeNull();
        });

        it('notifies subscribers when value changes', () => {
            const values: (string | null)[] = [];

            const unsubscribe = latestStationId.subscribe(value => {
                values.push(value);
            });

            latestStationId.set('station-1');
            latestStationId.set('station-2');
            latestStationId.set(null);

            unsubscribe();

            // First value is initial (null), then the updates
            expect(values).toEqual([null, 'station-1', 'station-2', null]);
        });
    });
});
