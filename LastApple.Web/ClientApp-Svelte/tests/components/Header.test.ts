import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from '$lib/components/Header.svelte';

// Mock the stores
vi.mock('$lib/stores/app', () => ({
    appStore: {
        subscribe: vi.fn((callback) => {
            callback({ latestStationId: null });
            return () => {};
        })
    }
}));

vi.mock('$lib/components/LastfmAvatar.svelte', () => ({
    default: {
        render: () => ({ html: '<div data-testid="lastfm-avatar">LastfmAvatar</div>' })
    }
}));

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the logo and title', () => {
        render(Header);
        
        expect(screen.getByAltText('logo')).toBeInTheDocument();
        expect(screen.getByText('lastream')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(Header);
        
        expect(screen.getByText('New station')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders LastfmAvatar component', () => {
        render(Header);
        
        expect(screen.getByTestId('lastfm-avatar')).toBeInTheDocument();
    });
});
