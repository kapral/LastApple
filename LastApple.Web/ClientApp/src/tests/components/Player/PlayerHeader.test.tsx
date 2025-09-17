import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerHeader, PlayerHeaderProps } from '../../../components/Player/PlayerHeader';

// Mock ReactSwitch
jest.mock('react-switch', () => {
    return function MockReactSwitch({ checked, onChange, disabled }: any) {
        return (
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                data-testid="scrobble-switch"
            />
        );
    };
});

const createMockTrack = (overrides: Partial<MusicKit.MediaItem> = {}): MusicKit.MediaItem => ({
    id: 'test-track-id',
    type: 'songs',
    href: '/test-href',
    attributes: {
        name: 'Test Song',
        artistName: 'Test Artist',
        albumName: 'Test Album',
        ...overrides.attributes
    },
    ...overrides
} as MusicKit.MediaItem);

describe('PlayerHeader', () => {
    const defaultProps: PlayerHeaderProps = {
        currentTrack: createMockTrack(),
        isScrobblingEnabled: false,
        onScrobblingSwitch: jest.fn(),
        lastfmAuthenticated: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<PlayerHeader {...defaultProps} />);
    });

    it('displays the current track name', () => {
        const track = createMockTrack({
            attributes: { name: 'My Favorite Song', artistName: 'Artist', albumName: 'Album' }
        });

        render(<PlayerHeader {...defaultProps} currentTrack={track} />);

        expect(screen.getByText('My Favorite Song')).toBeInTheDocument();
    });

    it('displays artist and album information', () => {
        const track = createMockTrack({
            attributes: { 
                name: 'Song Name',
                artistName: 'The Beatles', 
                albumName: 'Abbey Road' 
            }
        });

        render(<PlayerHeader {...defaultProps} currentTrack={track} />);

        expect(screen.getByText('The Beatles - Abbey Road')).toBeInTheDocument();
    });

    it('shows Scrobble label', () => {
        render(<PlayerHeader {...defaultProps} />);

        expect(screen.getByText('Scrobble')).toBeInTheDocument();
    });

    it('shows scrobble switch as unchecked when scrobbling is disabled', () => {
        render(<PlayerHeader {...defaultProps} isScrobblingEnabled={false} />);

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        expect(scrobbleSwitch).not.toBeChecked();
    });

    it('shows scrobble switch as checked when scrobbling is enabled', () => {
        render(<PlayerHeader {...defaultProps} isScrobblingEnabled={true} />);

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        expect(scrobbleSwitch).toBeChecked();
    });

    it('enables scrobble switch when lastfm is authenticated', () => {
        render(<PlayerHeader {...defaultProps} lastfmAuthenticated={true} />);

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        expect(scrobbleSwitch).not.toBeDisabled();
    });

    it('disables scrobble switch when lastfm is not authenticated', () => {
        render(<PlayerHeader {...defaultProps} lastfmAuthenticated={false} />);

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        expect(scrobbleSwitch).toBeDisabled();
    });

    it('calls onScrobblingSwitch when switch is toggled', () => {
        const mockOnScrobblingSwitch = jest.fn();

        render(
            <PlayerHeader 
                {...defaultProps} 
                onScrobblingSwitch={mockOnScrobblingSwitch}
                isScrobblingEnabled={false}
            />
        );

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        fireEvent.click(scrobbleSwitch);

        expect(mockOnScrobblingSwitch).toHaveBeenCalledWith(true);
    });

    it('calls onScrobblingSwitch with false when switching off', () => {
        const mockOnScrobblingSwitch = jest.fn();

        render(
            <PlayerHeader 
                {...defaultProps} 
                onScrobblingSwitch={mockOnScrobblingSwitch}
                isScrobblingEnabled={true}
            />
        );

        const scrobbleSwitch = screen.getByTestId('scrobble-switch');
        fireEvent.click(scrobbleSwitch);

        expect(mockOnScrobblingSwitch).toHaveBeenCalledWith(false);
    });

    it('applies correct styling to header container', () => {
        const { container } = render(<PlayerHeader {...defaultProps} />);

        const headerDiv = container.firstChild as HTMLElement;
        expect(headerDiv).toHaveStyle({
            padding: '5px 20px',
            background: '#00000099',
            position: 'absolute',
            left: '0',
            top: '0',
            right: '0'
        });
    });

    it('handles tracks with missing attributes gracefully', () => {
        const trackWithMissingAttributes = createMockTrack({
            attributes: { 
                name: 'Song Only',
                artistName: '',
                albumName: ''
            }
        });

        render(<PlayerHeader {...defaultProps} currentTrack={trackWithMissingAttributes} />);

        expect(screen.getByText('Song Only')).toBeInTheDocument();
        // The component renders empty artist and album names separated by ' - '
        const artistAlbumElement = screen.getByText((_, element) => {
            return element?.textContent === ' - ';
        });
        expect(artistAlbumElement).toBeInTheDocument();
    });
});