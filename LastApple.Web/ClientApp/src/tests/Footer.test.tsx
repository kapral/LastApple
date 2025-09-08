import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../components/Footer';

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon }: any) => <span data-testid="fontawesome-icon">{icon.join('-')}</span>,
}));

// Mock the app store badge image
jest.mock('../images/app-store-badge.svg', () => 'mocked-app-store-badge.svg');

describe('Footer Component', () => {
    it('renders without crashing', () => {
        render(<Footer />);
        expect(document.body).toBeInTheDocument();
    });

    it('renders app store badge link', () => {
        render(<Footer />);
        
        const appStoreLink = screen.getByRole('link', { name: /app store badge/i });
        expect(appStoreLink).toBeInTheDocument();
        expect(appStoreLink).toHaveAttribute('href', 'https://apps.apple.com/app/lastream/id1483386771');
    });

    it('renders twitter link', () => {
        render(<Footer />);
        
        const twitterLink = screen.getByRole('link', { name: /reach me on twitter/i });
        expect(twitterLink).toBeInTheDocument();
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/vitaliykapral');
        expect(twitterLink).toHaveAttribute('target', '_blank');
    });

    it('renders FontAwesome icon', () => {
        render(<Footer />);
        
        expect(screen.getByTestId('fontawesome-icon')).toBeInTheDocument();
    });

    it('has correct styles applied', () => {
        const { container } = render(<Footer />);
        const footerDiv = container.firstChild as HTMLElement;
        
        expect(footerDiv).toHaveStyle({
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 20px',
        });
    });
});