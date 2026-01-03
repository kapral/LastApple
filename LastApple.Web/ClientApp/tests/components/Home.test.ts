import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Home from '$lib/components/Home.svelte';
import { AuthenticationState } from '$lib/services/authentication';

// Mock the stores
const mockAppleAuthStore = {
    subscribe: vi.fn()
};

vi.mock('$lib/stores/appleAuth', () => ({
    appleAuthStore: {
        subscribe: vi.fn((callback) => {
            callback({ state: AuthenticationState.Authenticated });
            return () => {};
        })
    }
}));

vi.mock('$lib/components/StationsList.svelte', () => ({
    default: {
        render: () => ({ html: '<div data-testid="stations-list">StationsList</div>' })
    }
}));

describe('Home Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders StationsList component', () => {
        render(Home);
        
        expect(screen.getByTestId('stations-list')).toBeInTheDocument();
    });

    it('does not show warning when authenticated', () => {
        render(Home);
        
        expect(screen.getByTestId('stations-list')).toBeInTheDocument();
        expect(screen.queryByTestId('apple-warning')).not.toBeInTheDocument();
    });
});
