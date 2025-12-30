import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from '$lib/components/Footer.svelte';

describe('Footer Component', () => {
    it('renders without crashing', () => {
        render(Footer);
        expect(document.body).toBeInTheDocument();
    });

    it('renders app store badge link', () => {
        render(Footer);
        
        const appStoreLink = screen.getByRole('link', { name: /app store badge/i });
        expect(appStoreLink).toBeInTheDocument();
        expect(appStoreLink).toHaveAttribute('href', 'https://apps.apple.com/app/lastream/id1483386771');
    });

    it('renders twitter link', () => {
        render(Footer);
        
        const twitterLink = screen.getByRole('link', { name: /reach me on twitter/i });
        expect(twitterLink).toBeInTheDocument();
        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/vitaliykapral');
        expect(twitterLink).toHaveAttribute('target', '_blank');
    });

    it('renders FontAwesome icon', () => {
        render(Footer);
        
        expect(screen.getByTestId('fontawesome-icon')).toBeInTheDocument();
    });

    it('has correct styles applied', () => {
        const { container } = render(Footer);
        const footerDiv = container.firstChild as HTMLElement;
        
        expect(footerDiv).toHaveStyle({
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 20px',
        });
    });
});
