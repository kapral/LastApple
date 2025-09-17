import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAppContext } from '../AppContext';
import AsMock from './AsMock';

// Mock modules at the top level
jest.mock('../AppContext', () => ({
    useAppContext: jest.fn(),
}));

jest.mock('../components/LastfmAvatar', () => ({
    LastfmAvatar: () => <div data-testid="lastfm-avatar">LastfmAvatar</div>,
}));

const HeaderWithRouter = () => (
    <BrowserRouter>
        <Header />
    </BrowserRouter>
);

describe('Header Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AsMock(useAppContext).mockReturnValue({
            latestStationId: null,
        });
    });

    it('renders the logo and title', () => {
        render(<HeaderWithRouter />);
        
        expect(screen.getByAltText('logo')).toBeInTheDocument();
        expect(screen.getByText('lastream')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<HeaderWithRouter />);
        
        expect(screen.getByText('New station')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('shows "Now playing" link when latestStationId is available', () => {
        AsMock(useAppContext).mockReturnValue({
            latestStationId: 'test-station-id',
        });

        render(<HeaderWithRouter />);
        
        expect(screen.getByText('Now playing')).toBeInTheDocument();
    });

    it('does not show "Now playing" link when latestStationId is not available', () => {
        AsMock(useAppContext).mockReturnValue({
            latestStationId: null,
        });

        render(<HeaderWithRouter />);
        
        expect(screen.queryByText('Now playing')).not.toBeInTheDocument();
    });

    it('renders LastfmAvatar component', () => {
        render(<HeaderWithRouter />);
        
        expect(screen.getByTestId('lastfm-avatar')).toBeInTheDocument();
    });
});