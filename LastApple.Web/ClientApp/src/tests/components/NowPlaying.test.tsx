import React from 'react';
import { render, screen } from '@testing-library/react';
import { NowPlaying } from '../../components/NowPlaying';
import { AppContextProvider } from '../../AppContext';
import { AppleContextProvider } from '../../apple/AppleContext';
import { LastfmContextProvider } from '../../lastfm/LastfmContext';

// Mock the StationPlayer component
jest.mock('../../components/Player/StationPlayer', () => ({
    StationPlayer: ({ stationId }: { stationId: string }) => (
        <div data-testid="station-player">Station Player for {stationId}</div>
    )
}));

// Mock the useAppleUnauthenticatedWarning hook
jest.mock('../../hooks/useAppleUnauthenticatedWarning', () => ({
    useAppleUnauthenticatedWarning: () => ({
        isShown: false,
        Element: null
    })
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppleContextProvider>
        <LastfmContextProvider>
            <AppContextProvider>
                {children}
            </AppContextProvider>
        </LastfmContextProvider>
    </AppleContextProvider>
);

describe('NowPlaying', () => {
    it('renders without crashing', () => {
        render(
            <TestWrapper>
                <NowPlaying showPlayer={true} stationId="test-station" />
            </TestWrapper>
        );
    });

    it('shows player when showPlayer is true', () => {
        render(
            <TestWrapper>
                <NowPlaying showPlayer={true} stationId="test-station" />
            </TestWrapper>
        );

        const container = screen.getByTestId('station-player').parentElement;
        expect(container).toHaveStyle('display: block');
    });

    it('hides player when showPlayer is false', () => {
        render(
            <TestWrapper>
                <NowPlaying showPlayer={false} stationId="test-station" />
            </TestWrapper>
        );

        const container = screen.getByTestId('station-player').parentElement;
        expect(container).toHaveStyle('display: none');
    });

    it('renders StationPlayer with correct stationId', () => {
        render(
            <TestWrapper>
                <NowPlaying showPlayer={true} stationId="my-station-123" />
            </TestWrapper>
        );

        expect(screen.getByTestId('station-player')).toHaveTextContent('Station Player for my-station-123');
    });

    it('renders with apple unauthenticated warning when shown', () => {
        // Mock the hook to show warning
        const mockUseAppleUnauthenticatedWarning = jest.requireMock('../../hooks/useAppleUnauthenticatedWarning');
        mockUseAppleUnauthenticatedWarning.useAppleUnauthenticatedWarning = () => ({
            isShown: true,
            Element: <div data-testid="apple-warning">Apple authentication required</div>
        });

        render(
            <TestWrapper>
                <NowPlaying showPlayer={true} stationId="test-station" />
            </TestWrapper>
        );

        expect(screen.getByTestId('apple-warning')).toBeInTheDocument();
    });
});