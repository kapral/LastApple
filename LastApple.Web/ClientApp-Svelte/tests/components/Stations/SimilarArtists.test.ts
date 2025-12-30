import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SimilarArtists from '$lib/components/Stations/SimilarArtists.svelte';

describe('SimilarArtists', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(SimilarArtists, { props: defaultProps });
    });

    it('applies station-parameters class', () => {
        const { container } = render(SimilarArtists, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with correct placeholder', () => {
        render(SimilarArtists, { props: defaultProps });

        expect(screen.getByPlaceholderText('Placebo...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged on mount', () => {
        render(SimilarArtists, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalled();
    });
});
