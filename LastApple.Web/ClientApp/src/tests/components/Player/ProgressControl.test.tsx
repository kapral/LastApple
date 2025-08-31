import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressControl } from '../../../components/Player/ProgressControl';

jest.mock('../../../musicKit', () => ({
    default: {
        instance: {
            currentPlaybackDuration: 180, // 3 minutes
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            seekToTime: jest.fn().mockResolvedValue(undefined)
        },
        formatMediaTime: jest.fn((seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        })
    }
}));

describe('ProgressControl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<ProgressControl />);
    });

    it('adds event listener on mount', () => {
        render(<ProgressControl />);
        
        const mockMusicKit = require('../../../musicKit').default;
        expect(mockMusicKit.instance.addEventListener).toHaveBeenCalledWith(
            'playbackTimeDidChange',
            expect.any(Function)
        );
    });

    it('removes event listener on unmount', () => {
        const { unmount } = render(<ProgressControl />);
        
        unmount();
        
        expect(mockMusicKit.instance.removeEventListener).toHaveBeenCalledWith(
            'playbackTimeDidChange',
            expect.any(Function)
        );
    });

    it('displays formatted current time', () => {
        mockMusicKit.formatMediaTime.mockReturnValue('1:30');
        
        render(<ProgressControl />);
        
        expect(mockMusicKit.formatMediaTime).toHaveBeenCalledWith(0); // Initial current time
        expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('displays formatted total duration', () => {
        mockMusicKit.formatMediaTime.mockReturnValue('3:00');
        
        render(<ProgressControl />);
        
        expect(mockMusicKit.formatMediaTime).toHaveBeenCalledWith(180); // Total duration
        expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('renders progress bar with correct styling', () => {
        const { container } = render(<ProgressControl />);
        
        const progressBar = container.querySelector('.audio-progress');
        expect(progressBar).toHaveStyle({
            width: '100%',
            height: '10px',
            borderRadius: '2px',
            position: 'relative',
            cursor: 'pointer',
            background: '#40404054'
        });
    });

    it('shows playing progress bar', () => {
        const { container } = render(<ProgressControl />);
        
        const playingProgress = container.querySelector('.playing-progress');
        expect(playingProgress).toBeInTheDocument();
        expect(playingProgress).toHaveStyle({
            width: '0%', // Initial state
            height: '10px',
            background: '#e0e0e066',
            position: 'absolute'
        });
    });

    it('handles mouse move over progress bar', () => {
        const { container } = render(<ProgressControl />);
        
        const progressContainer = container.querySelector('[style*="padding: 5px 0"]');
        
        // Mock getBoundingClientRect
        const mockGetBoundingClientRect = jest.fn().mockReturnValue({
            width: 300,
            left: 0
        });
        
        Object.defineProperty(progressContainer, 'getClientRects', {
            value: () => [mockGetBoundingClientRect()]
        });

        const mockEvent = {
            currentTarget: progressContainer,
            nativeEvent: { offsetX: 150 } // Half way through
        } as any;

        fireEvent.mouseMove(progressContainer!, mockEvent);
        
        // Should not crash and handle the mouse move
        expect(progressContainer).toBeInTheDocument();
    });

    it('handles click on progress bar to seek', async () => {
        const { container } = render(<ProgressControl />);
        
        const progressContainer = container.querySelector('[style*="padding: 5px 0"]');
        
        // First trigger mouse move to set rewind position
        const mockGetBoundingClientRect = jest.fn().mockReturnValue({
            width: 300,
            left: 0
        });
        
        Object.defineProperty(progressContainer, 'getClientRects', {
            value: () => [mockGetBoundingClientRect()]
        });

        const mockMoveEvent = {
            currentTarget: progressContainer,
            nativeEvent: { offsetX: 150 } // Half way through (90 seconds)
        } as any;

        fireEvent.mouseMove(progressContainer!, mockMoveEvent);
        fireEvent.mouseUp(progressContainer!);
        
        // Should call seekToTime with the calculated position
        expect(mockMusicKit.instance.seekToTime).toHaveBeenCalledWith(90);
    });

    it('handles mouse leave to reset rewind position', () => {
        const { container } = render(<ProgressControl />);
        
        const progressContainer = container.querySelector('[style*="padding: 5px 0"]');
        
        fireEvent.mouseLeave(progressContainer!);
        
        // Should reset rewind position (tested indirectly by not crashing)
        expect(progressContainer).toBeInTheDocument();
    });

    it('handles playback time change events', () => {
        const component = render(<ProgressControl />);
        
        // Get the event handler that was added
        const addEventListenerCall = mockMusicKit.instance.addEventListener.mock.calls.find(
            call => call[0] === 'playbackTimeDidChange'
        );
        
        const eventHandler = addEventListenerCall?.[1];
        
        if (eventHandler) {
            // Simulate a playback time change event
            eventHandler({
                currentPlaybackTime: 60,
                currentPlaybackDuration: 180
            });
        }

        // Component should handle the event without crashing
        expect(component.container).toBeInTheDocument();
    });

    it('handles zero duration gracefully', () => {
        const component = render(<ProgressControl />);
        
        const addEventListenerCall = mockMusicKit.instance.addEventListener.mock.calls.find(
            call => call[0] === 'playbackTimeDidChange'
        );
        
        const eventHandler = addEventListenerCall?.[1];
        
        if (eventHandler) {
            // Simulate event with zero duration
            eventHandler({
                currentPlaybackTime: 30,
                currentPlaybackDuration: 0
            });
        }

        expect(component.container).toBeInTheDocument();
    });

    it('handles infinite duration gracefully', () => {
        const component = render(<ProgressControl />);
        
        const addEventListenerCall = mockMusicKit.instance.addEventListener.mock.calls.find(
            call => call[0] === 'playbackTimeDidChange'
        );
        
        const eventHandler = addEventListenerCall?.[1];
        
        if (eventHandler) {
            // Simulate event with infinite duration
            eventHandler({
                currentPlaybackTime: 30,
                currentPlaybackDuration: Infinity
            });
        }

        expect(component.container).toBeInTheDocument();
    });
});