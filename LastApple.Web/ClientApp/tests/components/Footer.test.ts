import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from '$lib/components/Footer.svelte';

describe('Footer', () => {
    it('renders App Store badge with correct link', () => {
        render(Footer);
        
        const appStoreLink = screen.getByRole('link', { name: /app store badge/i });
        expect(appStoreLink).toBeInTheDocument();
        expect(appStoreLink).toHaveAttribute('href', 'https://apps.apple.com/app/lastream/id1483386771');
    });

    it('renders App Store badge image', () => {
        render(Footer);
        
        const badge = screen.getByAltText('App Store Badge');
        expect(badge).toBeInTheDocument();
        expect(badge.tagName).toBe('IMG');
    });

    it('renders Twitter link with correct href and target', () => {
        render(Footer);
        
        const twitterLink = screen.getByRole('link', { name: /twitter/i });
        expect(twitterLink).toBeInTheDocument();
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/vitaliykapral');
        expect(twitterLink).toHaveAttribute('target', '_blank');
        expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders Twitter FontAwesome icon', () => {
        render(Footer);
        
        // Should have the Twitter brand icon from FontAwesome
        const icon = screen.getByTestId('twitter-icon');
        expect(icon).toBeInTheDocument();
    });

    it('displays "Reach me on" text', () => {
        render(Footer);
        
        expect(screen.getByText('Reach me on')).toBeInTheDocument();
    });

    it('displays "Twitter" text', () => {
        render(Footer);
        
        expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('has border-top styling', () => {
        const { container } = render(Footer);
        const footerDiv = container.firstChild as HTMLElement;
        
        expect(footerDiv).toHaveStyle({ borderTop: '1px solid #404040' });
    });
});
