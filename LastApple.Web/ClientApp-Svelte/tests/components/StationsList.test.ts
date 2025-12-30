import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StationsList from '$lib/components/StationsList.svelte';

describe('StationsList', () => {
    it('renders without crashing', () => {
        render(StationsList);
    });

    it('applies station-list class to container', () => {
        const { container } = render(StationsList);

        expect(container.querySelector('.station-list')).toBeInTheDocument();
    });

    it('has proper styling for container', () => {
        const { container } = render(StationsList);

        const stationList = container.querySelector('.station-list');
        expect(stationList).toHaveStyle({
            padding: '5px',
            display: 'grid'
        });
    });

    it('renders all station descriptors', () => {
        render(StationsList);

        const descriptors = screen.getAllByTestId('station-descriptor');
        expect(descriptors).toHaveLength(4);
    });

    it('renders MyLibrary station component', () => {
        render(StationsList);

        expect(screen.getByTestId('my-library-component')).toBeInTheDocument();
    });

    it('renders SingleArtist station component', () => {
        render(StationsList);

        expect(screen.getByTestId('single-artist-component')).toBeInTheDocument();
    });

    it('renders SimilarArtists station component', () => {
        render(StationsList);

        expect(screen.getByTestId('similar-artists-component')).toBeInTheDocument();
    });

    it('renders Tag station component', () => {
        render(StationsList);

        expect(screen.getByTestId('tag-component')).toBeInTheDocument();
    });
});
