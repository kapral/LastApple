// Need to unmock contexts to use real Provider in this test
jest.unmock('../../../lastfm/LastfmContext');

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MyLibrary } from '../../../components/Stations/MyLibrary';
import { AuthenticationState } from '../../../authentication';
import { LastfmContext } from '../../../lastfm/LastfmContext';
import mockStationApi from '../../../restClients/StationApi';
import AsMock from '../../AsMock';

// Mock StationApi with proper Jest factory
jest.mock('../../../restClients/StationApi', () => {
    const mockStationApi = {
        postStation: jest.fn().mockResolvedValue({ id: 'test-station-id' }),
        getStation: jest.fn(),
        topUp: jest.fn(),
        deleteSongs: jest.fn()
    };

    return {
        default: mockStationApi,
        __esModule: true
    };
});

const createMockAuthService = (state: AuthenticationState) => ({
    state,
    user: state === AuthenticationState.Authenticated ? { id: 'test-user', name: 'Test User', url: '', avatar: [] } : null,
    setState: jest.fn(),
    setUser: jest.fn()
});

const TestWrapper: React.FC<{
    children: React.ReactNode;
    authState?: AuthenticationState;
}> = ({ children, authState = AuthenticationState.Unauthenticated }) => (
    <LastfmContext.Provider value={{
        authentication: createMockAuthService(authState),
        isScrobblingEnabled: true,
        setIsScrobblingEnabled: jest.fn()
    }}>
        {children}
    </LastfmContext.Provider>
);

describe('MyLibrary', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: jest.fn(),
        onOptionsChanged: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Restore StationApi mock after clearAllMocks
        AsMock(mockStationApi.postStation).mockResolvedValue({ id: 'test-station-id' });
    });

    it('renders without crashing', () => {
        render(
            <TestWrapper>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );
    });

    it('applies station-parameters class', () => {
        const { container } = render(
            <TestWrapper>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('shows warning when user is unauthenticated', () => {
        render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Log in to last.fm to listen to your library.')).toBeInTheDocument();
    });

    it('hides warning when user is authenticated', () => {
        render(
            <TestWrapper authState={AuthenticationState.Authenticated}>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.queryByText('Log in to last.fm to listen to your library.')).not.toBeVisible();
    });

    it('calls onOptionsChanged with false when unauthenticated on mount', () => {
        const mockOnOptionsChanged = jest.fn();

        render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <MyLibrary {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />
            </TestWrapper>
        );

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('calls onOptionsChanged with true when authenticated on mount', () => {
        const mockOnOptionsChanged = jest.fn();

        render(
            <TestWrapper authState={AuthenticationState.Authenticated}>
                <MyLibrary {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />
            </TestWrapper>
        );

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station when triggerCreate is true and authenticated', async () => {
        const mockOnStationCreated = jest.fn();

        const { rerender } = render(
            <TestWrapper authState={AuthenticationState.Authenticated}>
                <MyLibrary {...defaultProps} onStationCreated={mockOnStationCreated} />
            </TestWrapper>
        );

        // Trigger station creation
        rerender(
            <TestWrapper authState={AuthenticationState.Authenticated}>
                <MyLibrary
                    {...defaultProps}
                    triggerCreate={true}
                    onStationCreated={mockOnStationCreated}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockStationApi.postStation).toHaveBeenCalledWith('lastfmlibrary', 'my');
            expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
        });
    });

    it('has warning text with correct styling', () => {
        render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        const warningText = screen.getByText('Log in to last.fm to listen to your library.');
        expect(warningText).toHaveStyle({
            margin: '10px 10px 10px 0',
            color: '#ffc123'
        });
    });

    it('has correct container styling', () => {
        const { container } = render(
            <TestWrapper>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        const mainContainer = container.querySelector('[style*="display: flex"]');
        expect(mainContainer).toHaveStyle({
            display: 'flex',
            flex: '1'
        });
    });

    it('has spacer element with correct styling', () => {
        const { container } = render(
            <TestWrapper>
                <MyLibrary {...defaultProps} />
            </TestWrapper>
        );

        const spacer = container.querySelector('[style*="height: 54px"]');
        expect(spacer).toHaveStyle({
            flex: '1',
            height: '54px'
        });
    });

    it('has correct static Definition', () => {
        expect(MyLibrary.Definition).toEqual({
            title: 'My last.fm Library',
            description: 'A continuous station based on your last.fm library.',
            type: MyLibrary
        });
    });

    it('updates options when authentication state changes', async () => {
        const mockOnOptionsChanged = jest.fn();

        const { rerender } = render(
            <TestWrapper authState={AuthenticationState.Unauthenticated}>
                <MyLibrary {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />
            </TestWrapper>
        );

        // Change to authenticated
        rerender(
            <TestWrapper authState={AuthenticationState.Authenticated}>
                <MyLibrary {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
        });
    });
});