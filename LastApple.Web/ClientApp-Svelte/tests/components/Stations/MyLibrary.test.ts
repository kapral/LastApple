import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MyLibrary from '$lib/components/Stations/MyLibrary.svelte';

describe('MyLibrary', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(MyLibrary, { props: defaultProps });
    });

    it('applies station-parameters class', () => {
        const { container } = render(MyLibrary, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('calls onOptionsChanged with true on mount (always valid)', () => {
        render(MyLibrary, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('displays description text', () => {
        render(MyLibrary, { props: defaultProps });

        expect(screen.getByText(/Last.fm library/i)).toBeInTheDocument();
    });
});
