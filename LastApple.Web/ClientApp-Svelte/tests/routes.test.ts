import { describe, it, expect } from 'vitest';
import { homeRoute, settingsRoute, stationRoute } from '$lib/routes';

describe('Routes', () => {
    it('exports correct route paths', () => {
        expect(homeRoute).toBe('/');
        expect(settingsRoute).toBe('/settings');
        expect(stationRoute).toBe('/station/:stationId');
    });
});
