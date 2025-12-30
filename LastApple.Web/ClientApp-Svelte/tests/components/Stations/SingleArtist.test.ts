import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SingleArtist from '$lib/components/Stations/SingleArtist.svelte';

describe('SingleArtist', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(SingleArtist, { props: defaultProps });
    });

    it('applies station-parameters class', () => {
        const { container } = render(SingleArtist, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with correct placeholder', () => {
        render(SingleArtist, { props: defaultProps });

        expect(screen.getByPlaceholderText('Radiohead...')).toBeInTheDocument();
    });

    it('renders Search component with label accessor', () => {
        render(SingleArtist, { props: defaultProps });

        expect(screen.getByText('Has label accessor')).toBeInTheDocument();
    });

    it('calls onOptionsChanged on mount', () => {
        render(SingleArtist, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalled();
    });
});
