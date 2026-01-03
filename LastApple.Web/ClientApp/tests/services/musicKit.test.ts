import { describe, it, expect, vi, beforeEach } from 'vitest';

// The musicKit service is mocked globally in setup.ts
// These tests verify the mock interface and formatMediaTime functionality

describe('musicKit service', () => {
    let musicKit: typeof import('$lib/services/musicKit').default;

    beforeEach(async () => {
        vi.clearAllMocks();
        musicKit = (await import('$lib/services/musicKit')).default;
    });

    describe('getInstance', () => {
        it('returns a promise that resolves to a MusicKit instance', async () => {
            const instance = await musicKit.getInstance();

            expect(instance).toBeDefined();
            expect(instance).toHaveProperty('isAuthorized');
            expect(instance).toHaveProperty('authorize');
            expect(instance).toHaveProperty('unauthorize');
        });

        it('instance has required methods', async () => {
            const instance = await musicKit.getInstance();

            expect(typeof instance.authorize).toBe('function');
            expect(typeof instance.unauthorize).toBe('function');
        });

        it('returns the same instance on subsequent calls', async () => {
            const instance1 = await musicKit.getInstance();
            const instance2 = await musicKit.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('handles concurrent getInstance calls', async () => {
            const [instance1, instance2, instance3] = await Promise.all([
                musicKit.getInstance(),
                musicKit.getInstance(),
                musicKit.getInstance()
            ]);

            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe('formatMediaTime', () => {
        it('formats 0 seconds as 0:00', () => {
            const result = musicKit.formatMediaTime(0);

            expect(result).toBe('0:00');
        });

        it('formats 60 seconds as 1:00', () => {
            const result = musicKit.formatMediaTime(60);

            expect(result).toBe('1:00');
        });

        it('formats 90 seconds as 1:30', () => {
            const result = musicKit.formatMediaTime(90);

            expect(result).toBe('1:30');
        });

        it('formats 125 seconds as 2:05', () => {
            const result = musicKit.formatMediaTime(125);

            expect(result).toBe('2:05');
        });

        it('formats large values correctly', () => {
            const result = musicKit.formatMediaTime(3661);

            expect(result).toBe('61:01');
        });

        it('handles decimal seconds by flooring', () => {
            const result = musicKit.formatMediaTime(90.9);

            expect(result).toBe('1:30');
        });
    });

    describe('instance property', () => {
        it('has instance property available', () => {
            expect(musicKit).toHaveProperty('instance');
        });
    });
});
