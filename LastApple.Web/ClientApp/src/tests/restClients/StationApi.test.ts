import StationApi, { IStation } from '../../restClients/StationApi';
import environment from '../../Environment';

// Mock environment directly by setting properties
beforeAll(() => {
    Object.defineProperty(environment, 'apiUrl', {
        value: 'http://localhost:5000/',
        writable: true,
    });
});

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

describe('StationApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-session-id');
    });

    describe('getStation', () => {
        it('should fetch station data by ID', async () => {
            const stationId = 'station-123';
            const mockStation: IStation = {
                id: stationId,
                songIds: ['song1', 'song2', 'song3'],
                size: 3,
                isContinuous: true,
                isGroupedByAlbum: false,
                definition: {
                    stationType: 'artist-radio'
                }
            };
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockStation),
            });

            const result = await StationApi.getStation(stationId);

            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/station/station-123');
            expect(result).toEqual(mockStation);
        });
    });

    describe('postStation', () => {
        it('should create new station with type and name', async () => {
            const stationType = 'artist-radio';
            const stationName = 'Radiohead Radio';
            const mockStation: IStation = {
                id: 'new-station-id',
                songIds: [],
                size: 0,
                isContinuous: true,
                isGroupedByAlbum: false,
                definition: {
                    stationType
                }
            };
            
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue(mockStation),
            });

            const result = await StationApi.postStation(stationType, stationName);

            expect(fetch).toHaveBeenCalledWith(
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
            
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await StationApi.topUp(stationId, stationType, count);

            expect(fetch).toHaveBeenCalledWith(
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
            
            (fetch as jest.Mock).mockResolvedValueOnce({});

            await StationApi.deleteSongs(stationId, position, count);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/station/station-123/songs?position=5&count=3',
                {
                    method: 'DELETE'
                }
            );
        });
    });
});