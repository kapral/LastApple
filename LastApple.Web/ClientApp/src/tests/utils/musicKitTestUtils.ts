import AsMock from '../AsMock';

/**
 * Get the default mock properties that match setupTests.ts defaults
 */
const getDefaultMockProperties = () => ({
    api: {
        music: jest.fn().mockResolvedValue({
            data: { data: [] }
        })
    },
    storefrontId: 'us',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    authorize: jest.fn().mockResolvedValue(undefined),
    unauthorize: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    clearQueue: jest.fn().mockResolvedValue(undefined),
    setQueue: jest.fn().mockResolvedValue(undefined),
    playLater: jest.fn().mockResolvedValue(undefined),
    skipToNextItem: jest.fn().mockResolvedValue(undefined),
    skipToPreviousItem: jest.fn().mockResolvedValue(undefined),
    changeToMediaAtIndex: jest.fn().mockResolvedValue(undefined),
    seekToTime: jest.fn(),
    isAuthorized: true,
    nowPlayingItem: null,
    player: {
        currentPlaybackTime: 0,
        currentPlaybackDuration: 0,
        playbackState: 0,
        isPlaying: false,
        nowPlayingItem: null,
    },
    queue: {
        items: [],
        append: jest.fn(),
        prepend: jest.fn(),
        remove: jest.fn(),
        item: jest.fn().mockReturnValue(null),
    },
});

/**
 * Utility to override specific parts of the musicKit mock without completely re-mocking
 * @param overrides - Object with properties to override in the musicKit instance
 */
export const overrideMusicKitInstance = (overrides: any) => {
    const mockMusicKit = AsMock(require('../../musicKit').default);

    // Get current defaults
    const defaults = getDefaultMockProperties();

    const originalInstance = mockMusicKit.instance || defaults;

    // Create the extended instance by merging defaults with overrides
    const extendedInstance = {
        ...originalInstance,
        ...overrides,
        // Deep merge for nested objects
        api: {
            ...defaults.api,
            ...overrides.api,
        },
        player: {
            ...defaults.player,
            ...overrides.player,
        },
        queue: {
            ...defaults.queue,
            ...overrides.queue,
        },
    };

    // Update the getInstance mock to return the extended instance
    AsMock(mockMusicKit.getInstance).mockResolvedValue(extendedInstance);

    // Also update the instance property for direct access
    mockMusicKit.instance = extendedInstance;

    return extendedInstance;
};

/**
 * Resets the musicKit mock to its default state
 */
export const resetMusicKitMock = () => {
    const mockMusicKit = AsMock(require('../../musicKit').default);
    const defaults = getDefaultMockProperties();

    AsMock(mockMusicKit.getInstance).mockResolvedValue(defaults);
    mockMusicKit.instance = defaults;
};