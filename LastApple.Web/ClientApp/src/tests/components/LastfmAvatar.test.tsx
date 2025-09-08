import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { LastfmAvatar } from '../../components/LastfmAvatar';
import { AuthenticationState } from '../../authentication';
import { useLastfmContext } from '../../lastfm/LastfmContext';
import AsMock from '../AsMock';

// Mock the context
const mockLastfmContext = {
    authentication: {
        state: AuthenticationState.Authenticated,
        user: {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar1.jpg', 'http://last.fm/avatar2.jpg']
        },
        setState: jest.fn(),
        setUser: jest.fn(),
    },
    isScrobblingEnabled: true,
    setIsScrobblingEnabled: jest.fn(),
};

jest.mock('../../lastfm/LastfmContext', () => ({
    useLastfmContext: jest.fn(() => mockLastfmContext),
}));

// Mock the lastfm logo image
jest.mock('../../images/lastfm-logo.png', () => 'lastfm-logo.png');

// Mock React Bootstrap components
jest.mock('react-bootstrap', () => ({
    Spinner: ({ animation, style }: any) => (
        <div data-testid="spinner" className="spinner-border" style={style}>
            Loading...
        </div>
    )
}));

describe('LastfmAvatar', () => {
    let history: any;

    beforeEach(() => {
        history = createMemoryHistory();
        jest.clearAllMocks();
        
        // Reset the context mock to the default state
        AsMock(useLastfmContext).mockReturnValue(mockLastfmContext);
    });

    const renderWithRouter = (component: React.ReactElement) => {
        return render(
            <Router history={history}>
                {component}
            </Router>
        );
    };

    it('should render loading spinner when authentication is loading', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Loading;

        renderWithRouter(<LastfmAvatar />);

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should render user avatar and name when authenticated', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Authenticated;
        mockLastfmContext.authentication.user = {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar.jpg']
        };

        const { container } = renderWithRouter(<LastfmAvatar />);

        expect(screen.getByText('testuser')).toBeInTheDocument();
        
        const avatar = container.querySelector('img');
        expect(avatar).toHaveAttribute('src', 'http://last.fm/avatar.jpg');
        expect(avatar).toHaveStyle('border-radius: 20px');
    });

    it('should render lastfm logo and "Log in" text when not authenticated', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Unauthenticated;
        mockLastfmContext.authentication.user = undefined;

        const { container } = renderWithRouter(<LastfmAvatar />);

        expect(screen.getByText('Log in')).toBeInTheDocument();
        
        const avatar = container.querySelector('img');
        expect(avatar).toHaveAttribute('src', 'lastfm-logo.png');
    });

    it('should link to user profile when user is authenticated', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Authenticated;
        mockLastfmContext.authentication.user = {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar.jpg']
        };

        renderWithRouter(<LastfmAvatar />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://www.last.fm/user/testuser');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('title', 'Open lastfm profile');
    });

    it('should navigate to settings when clicked and user is not authenticated', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Unauthenticated;
        mockLastfmContext.authentication.user = undefined;

        const { container } = renderWithRouter(<LastfmAvatar />);

        const link = container.querySelector('a');
        fireEvent.click(link!);

        expect(history.location.pathname).toBe('/settings');
    });

    it('should not navigate when user is authenticated and link is clicked', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Authenticated;
        mockLastfmContext.authentication.user = {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar.jpg']
        };

        renderWithRouter(<LastfmAvatar />);

        const link = screen.getByRole('link');
        fireEvent.click(link);

        // Should not navigate away from current path
        expect(history.location.pathname).toBe('/');
    });

    it('should have correct CSS classes and styling', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Authenticated;
        mockLastfmContext.authentication.user = {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar.jpg']
        };

        renderWithRouter(<LastfmAvatar />);

        const link = screen.getByRole('link');
        expect(link).toHaveClass('lastfm-profile');
        expect(link).toHaveStyle({
            color: '#DDD',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        });
    });

    it('should use first avatar URL when multiple avatars available', () => {
        mockLastfmContext.authentication.state = AuthenticationState.Authenticated;
        mockLastfmContext.authentication.user = {
            name: 'testuser',
            url: 'http://last.fm/user/testuser',
            avatar: ['http://last.fm/avatar1.jpg', 'http://last.fm/avatar2.jpg']
        };

        const { container } = renderWithRouter(<LastfmAvatar />);

        const avatar = container.querySelector('img');
        expect(avatar).toHaveAttribute('src', 'http://last.fm/avatar1.jpg');
    });
});