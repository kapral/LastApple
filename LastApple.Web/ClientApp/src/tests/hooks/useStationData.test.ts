import { renderHook, act } from '@testing-library/react';
import { useStationData } from '../../hooks/useStationData';
import stationApi from '../../restClients/StationApi';

// Mock the station API
jest.mock('../../restClients/StationApi', () => ({
    __esModule: true,
    default: {
        getStation: jest.fn(),
        topUp: jest.fn(),
        deleteSongs: jest.fn()
    }
}));

describe('useStationData', () => {
    const mockStationApi = stationApi as jest.Mocked<typeof stationApi>;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process multiple track events correctly', async () => {
        const { result } = renderHook(() => useStationData('test-station'));
        
        // Mock dependencies
        const mockFetchSongs = jest.fn()
            .mockResolvedValueOnce([{ id: 'song1', title: 'Song 1' }])
            .mockResolvedValueOnce([{ id: 'song2', title: 'Song 2' }])
            .mockResolvedValueOnce([]); // This one should be skipped with continue
        
        const mockAppendTracksToQueue = jest.fn().mockResolvedValue(undefined);
        const mockPlay = jest.fn().mockResolvedValue(undefined);
        
        const events = [
            { trackId: 'song1', position: 0 },
            { trackId: 'song2', position: 1 },
            { trackId: 'invalid-song', position: 2 }, // This should be skipped
        ];

        await act(async () => {
            await result.current.addTracks(
                events,
                mockFetchSongs,
                mockAppendTracksToQueue,
                mockPlay,
                5 // queueLength > 1, so play shouldn't be called
            );
        });

        // Should have called fetchSongs for all events
        expect(mockFetchSongs).toHaveBeenCalledTimes(3);
        expect(mockFetchSongs).toHaveBeenNthCalledWith(1, ['song1']);
        expect(mockFetchSongs).toHaveBeenNthCalledWith(2, ['song2']);
        expect(mockFetchSongs).toHaveBeenNthCalledWith(3, ['invalid-song']);

        // Should have called appendTracksToQueue only for valid songs (not the invalid one)
        expect(mockAppendTracksToQueue).toHaveBeenCalledTimes(2);
        expect(mockAppendTracksToQueue).toHaveBeenNthCalledWith(1, [{ id: 'song1', title: 'Song 1' }], result.current.setTracks);
        expect(mockAppendTracksToQueue).toHaveBeenNthCalledWith(2, [{ id: 'song2', title: 'Song 2' }], result.current.setTracks);

        // Play should not be called since queueLength > 1
        expect(mockPlay).not.toHaveBeenCalled();
    });

    it('should call play when queueLength is 1', async () => {
        const { result } = renderHook(() => useStationData('test-station'));
        
        const mockFetchSongs = jest.fn().mockResolvedValue([{ id: 'song1', title: 'Song 1' }]);
        const mockAppendTracksToQueue = jest.fn().mockResolvedValue(undefined);
        const mockPlay = jest.fn().mockResolvedValue(undefined);
        
        const events = [{ trackId: 'song1', position: 0 }];

        await act(async () => {
            await result.current.addTracks(
                events,
                mockFetchSongs,
                mockAppendTracksToQueue,
                mockPlay,
                1 // queueLength = 1, so play should be called
            );
        });

        expect(mockAppendTracksToQueue).toHaveBeenCalledTimes(1);
        expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should continue processing events even when one fails', async () => {
        const { result } = renderHook(() => useStationData('test-station'));
        
        // Mock console.warn to avoid noise in test output
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        const mockFetchSongs = jest.fn()
            .mockResolvedValueOnce([]) // First event fails
            .mockResolvedValueOnce([{ id: 'song2', title: 'Song 2' }]); // Second event succeeds
        
        const mockAppendTracksToQueue = jest.fn().mockResolvedValue(undefined);
        const mockPlay = jest.fn().mockResolvedValue(undefined);
        
        const events = [
            { trackId: 'invalid-song', position: 0 }, // This should fail and be skipped
            { trackId: 'song2', position: 1 }, // This should succeed
        ];

        await act(async () => {
            await result.current.addTracks(
                events,
                mockFetchSongs,
                mockAppendTracksToQueue,
                mockPlay,
                5
            );
        });

        // Should have tried to fetch both songs
        expect(mockFetchSongs).toHaveBeenCalledTimes(2);
        
        // Should have warned about the first invalid song
        expect(consoleWarnSpy).toHaveBeenCalledWith('Could not find song with id invalid-song');
        
        // Should have successfully processed the second song
        expect(mockAppendTracksToQueue).toHaveBeenCalledTimes(1);
        expect(mockAppendTracksToQueue).toHaveBeenCalledWith([{ id: 'song2', title: 'Song 2' }], result.current.setTracks);

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
        
        const { result } = renderHook(() => useStationData('test-station'));
        
        // Load the station first
        await act(async () => {
            await result.current.loadStation();
        });
        
        const mockGetPlaylistPagingOffset = jest.fn().mockReturnValue(5);

        await act(async () => {
            await result.current.removeTracks(2, 3, mockGetPlaylistPagingOffset);
        });

        expect(mockStationApi.deleteSongs).toHaveBeenCalledWith('test-station', 7, 3); // offset (5) + position (2) = 7
    });
});