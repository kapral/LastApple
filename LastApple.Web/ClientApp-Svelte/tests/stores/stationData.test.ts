import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Mock stationApi
const mockStationApi = {
    getStation: vi.fn(),
    topUp: vi.fn(),
    deleteSongs: vi.fn()
};

vi.mock('$lib/api/stationApi', () => ({
    default: mockStationApi
}));

// Import after mocking
import { createStationDataStore } from '$lib/stores/stationData';

describe('createStationDataStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should process track events with original logic', async () => {
        const store = createStationDataStore('test-station');
        
        const mockInstance = {
            queue: {
                item: vi.fn().mockReturnValue(null), // No existing item
                items: { length: 0 }
            },
            api: {
                music: vi.fn().mockResolvedValue({ data: { data: [{ id: 'song1', title: 'Song 1' }] } })
            },
            storefrontId: 'us'
        };
        
        const mockGetInstance = vi.fn().mockResolvedValue(mockInstance);
        const mockAppendTracksToQueue = vi.fn().mockResolvedValue(undefined);
        const mockPlay = vi.fn().mockResolvedValue(undefined);
        
        const events = [
            { trackId: 'song1', position: 0 },
            { trackId: 'song2', position: 1 }, // This won't be processed due to return
        ];

        await store.addTracks(
            events,
            mockGetInstance,
            mockAppendTracksToQueue,
            mockPlay
        );

        // Should have called getInstance only for first event (return stops processing)
        expect(mockGetInstance).toHaveBeenCalledTimes(1);
        
        // Should have called queue.item only for first event
        expect(mockInstance.queue.item).toHaveBeenCalledTimes(1);
        expect(mockInstance.queue.item).toHaveBeenCalledWith(0);

        // Should have called appendTracksToQueue for first song
        expect(mockAppendTracksToQueue).toHaveBeenCalledTimes(1);

        // Play should not be called since queue length is 0, but after append it becomes 1
        // Actually in the original test, length is 0 so play isn't called
        expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should call play when queueLength is 1', async () => {
        const store = createStationDataStore('test-station');
        
        const mockInstance = {
            queue: {
                item: vi.fn().mockReturnValue(null), // No existing item
                items: { length: 1 }
            },
            api: {
                music: vi.fn().mockResolvedValue({ data: { data: [{ id: 'song1', title: 'Song 1' }] } })
            },
            storefrontId: 'us'
        };
        
        const mockGetInstance = vi.fn().mockResolvedValue(mockInstance);
        const mockAppendTracksToQueue = vi.fn().mockResolvedValue(undefined);
        const mockPlay = vi.fn().mockResolvedValue(undefined);
        
        const events = [{ trackId: 'song1', position: 0 }];

        await store.addTracks(
            events,
            mockGetInstance,
            mockAppendTracksToQueue,
            mockPlay
        );

        expect(mockAppendTracksToQueue).toHaveBeenCalledTimes(1);
        expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should handle existing items in queue correctly', async () => {
        const store = createStationDataStore('test-station');
        
        const mockExistingItem = { id: 'song1' };
        const mockInstance = {
            queue: {
                item: vi.fn().mockReturnValue(mockExistingItem), // Existing item
                items: { length: 2 }
            },
            api: { music: vi.fn() },
            storefrontId: 'us'
        };
        
        const mockGetInstance = vi.fn().mockResolvedValue(mockInstance);
        const mockAppendTracksToQueue = vi.fn().mockResolvedValue(undefined);
        const mockPlay = vi.fn().mockResolvedValue(undefined);
        
        const events = [{ trackId: 'song1', position: 0 }]; // Same ID as existing

        await store.addTracks(
            events,
            mockGetInstance,
            mockAppendTracksToQueue,
            mockPlay
        );

        // Should have checked for existing item
        expect(mockInstance.queue.item).toHaveBeenCalledWith(0);
        
        // Should not call appendTracksToQueue since item exists with same ID
        expect(mockAppendTracksToQueue).not.toHaveBeenCalled();
        
        // Should not call play
        expect(mockPlay).not.toHaveBeenCalled();
        
        // API should not be called since item already exists
        expect(mockInstance.api.music).not.toHaveBeenCalled();
    });

    it('should stop processing when song not found', async () => {
        const store = createStationDataStore('test-station');
        
        // Mock console.warn to avoid noise in test output
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const mockInstance = {
            queue: {
                item: vi.fn().mockReturnValue(null), // No existing item
                items: { length: 0 }
            },
            api: {
                music: vi.fn().mockResolvedValue({ data: { data: [] } }) // No songs found
            },
            storefrontId: 'us'
        };
        
        const mockGetInstance = vi.fn().mockResolvedValue(mockInstance);
        const mockAppendTracksToQueue = vi.fn().mockResolvedValue(undefined);
        const mockPlay = vi.fn().mockResolvedValue(undefined);
        
        const events = [
            { trackId: 'invalid-song', position: 0 }, // This should fail and stop processing
            { trackId: 'song2', position: 1 }, // This should not be processed due to return
        ];

        await store.addTracks(
            events,
            mockGetInstance,
            mockAppendTracksToQueue,
            mockPlay
        );

        // Should have tried to process first event only (return stops processing)
        expect(mockGetInstance).toHaveBeenCalledTimes(1);
        
        // Should have warned about the first invalid song
        expect(consoleWarnSpy).toHaveBeenCalledWith('Could not find song with id invalid-song');
        
        // Should not have processed any songs due to return
        expect(mockAppendTracksToQueue).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    it('should properly remove tracks and call deleteSongs API', async () => {
        mockStationApi.deleteSongs.mockResolvedValue(undefined);
        mockStationApi.getStation.mockResolvedValue({
            id: 'test-station',
            songIds: [],
            isContinuous: false,
            isGroupedByAlbum: false,
            size: 10,
            definition: { stationType: 'test' }
        });
        
        const store = createStationDataStore('test-station');
        
        // Load the station first
        await store.loadStation();
        
        const mockGetPlaylistPagingOffset = vi.fn().mockReturnValue(5);

        await store.removeTracks(2, 3, mockGetPlaylistPagingOffset);

        expect(mockStationApi.deleteSongs).toHaveBeenCalledWith('test-station', 7, 3); // offset (5) + position (2) = 7
    });
});
