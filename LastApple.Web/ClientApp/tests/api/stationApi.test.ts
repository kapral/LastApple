import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment
vi.mock('$lib/config/environment', () => ({
    default: {
        apiUrl: 'http://localhost:5000/'
    }
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
vi.stubGlobal('localStorage', mockLocalStorage);

describe('StationApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-session-id');
    });

    describe('getStation', () => {
        it('should fetch station data by ID', async () => {
            const stationId = 'station-123';
            const mockStation = {
                id: stationId,
                songIds: ['song1', 'song2', 'song3'],
                size: 3,
                isContinuous: true,
                isGroupedByAlbum: false,
                definition: {
                    stationType: 'artist-radio'
                }
            };

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockStation)
            });

            const { default: StationApi } = await import('$lib/api/stationApi');
            const result = await StationApi.getStation(stationId);

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/station/station-123');
            expect(result).toEqual(mockStation);
        });
    });

    describe('postStation', () => {
        it('should create new station with type and name', async () => {
            const stationType = 'artist-radio';
            const stationName = 'Radiohead Radio';
            const mockStation = {
                id: 'new-station-id',
                songIds: [],
                size: 0,
                isContinuous: true,
                isGroupedByAlbum: false,
                definition: {
                    stationType
                }
            };

            mockFetch.mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue(mockStation)
            });

            const { default: StationApi } = await import('$lib/api/stationApi');
            const result = await StationApi.postStation(stationType, stationName);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/station/artist-radio/Radiohead Radio',
                {
                    method: 'POST',
                    headers: { 'X-SessionId': 'test-session-id' }
                }
            );
            expect(result).toEqual(mockStation);
        });
    });

    describe('topUp', () => {
        it('should top up station with additional songs', async () => {
            const stationId = 'station-123';
            const stationType = 'artist-radio';
            const count = 10;

            mockFetch.mockResolvedValueOnce({});

            const { default: StationApi } = await import('$lib/api/stationApi');
            await StationApi.topUp(stationId, stationType, count);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/station/artist-radio/station-123/topup/10',
                {
                    method: 'POST'
                }
            );
        });
    });

    describe('deleteSongs', () => {
        it('should delete songs from station at specified position', async () => {
            const stationId = 'station-123';
            const position = 5;
            const count = 3;

            mockFetch.mockResolvedValueOnce({});

            const { default: StationApi } = await import('$lib/api/stationApi');
            await StationApi.deleteSongs(stationId, position, count);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/station/station-123/songs?position=5&count=3',
                {
                    method: 'DELETE'
                }
            );
        });
    });
});
