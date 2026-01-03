import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StationsList from '$lib/components/StationsList.svelte';

describe('StationsList', () => {
    it('applies station-list class to container', () => {
        const { container } = render(StationsList);

        expect(container.querySelector('.station-list')).toBeInTheDocument();
    });

    it('has grid display styling', () => {
        const { container } = render(StationsList);

        const stationList = container.querySelector('.station-list');
        expect(stationList).toHaveStyle({ display: 'grid' });
    });

    it('renders MyLibrary station descriptor with title', () => {
        render(StationsList);

        expect(screen.getByText('My last.fm Library')).toBeInTheDocument();
    });

    it('renders MyLibrary station descriptor with description', () => {
        render(StationsList);

        expect(screen.getByText('A continuous station based on your last.fm library.')).toBeInTheDocument();
    });

    it('renders Artist station descriptor with title', () => {
        render(StationsList);

        expect(screen.getByText('Artist')).toBeInTheDocument();
    });

    it('renders Artist station descriptor with description', () => {
        render(StationsList);

        expect(screen.getByText('Play all tracks of one artist.')).toBeInTheDocument();
    });

    it('renders Similar Artists station descriptor with title', () => {
        render(StationsList);

        expect(screen.getByText('Similar Artists')).toBeInTheDocument();
    });

    it('renders Similar Artists station descriptor with description', () => {
        render(StationsList);

        expect(screen.getByText('A station containing an artist and similar performers.')).toBeInTheDocument();
    });

    it('renders Tag station descriptor with title', () => {
        render(StationsList);

        expect(screen.getByText('Tag')).toBeInTheDocument();
    });

    it('renders exactly 4 station descriptors', () => {
        const { container } = render(StationsList);

        const descriptors = container.querySelectorAll('.station-descriptor');
        expect(descriptors).toHaveLength(4);
    });

    it('renders create button for each station type', () => {
        render(StationsList);

        // Each station descriptor should have a create/arrow button
        const createButtons = screen.getAllByRole('button', { name: /create/i });
        expect(createButtons.length).toBeGreaterThanOrEqual(4);
    });
});
