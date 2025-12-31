import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

// Mock lastfm API - use inline factory to avoid hoisting issues
vi.mock('$lib/api/lastfmApi', () => ({
    default: {
        searchTag: vi.fn().mockResolvedValue([])
    }
}));

// Mock station API
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: vi.fn().mockResolvedValue({ id: 'mock-station-id' })
    }
}));

describe('Tag', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        defaultProps.onStationCreated = vi.fn();
        defaultProps.onOptionsChanged = vi.fn();
    });

    it('applies station-parameters class', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        const { container } = render(Tag, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "indie..."', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        expect(screen.getByPlaceholderText('indie...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no tag selected)', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Last.fm tags when user types', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchTag = vi.mocked(lastfmApi.default.searchTag);

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('indie...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(mockSearchTag).toHaveBeenCalledWith('indie');
        }, { timeout: 1000 });
    });

    it('displays tag names from Last.fm search results', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchTag = vi.mocked(lastfmApi.default.searchTag);
        mockSearchTag.mockResolvedValue([
            { name: 'indie' },
            { name: 'indie rock' }
        ]);

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('indie...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(screen.getByText('indie')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('calls onOptionsChanged(true) when tag is selected', async () => {
        const lastfmApi = await import('$lib/api/lastfmApi');
        const mockSearchTag = vi.mocked(lastfmApi.default.searchTag);
        mockSearchTag.mockResolvedValue([{ name: 'indie' }]);

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('indie...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(screen.getByText('indie')).toBeInTheDocument();
        }, { timeout: 1000 });

        await fireEvent.click(screen.getByText('indie'));

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station with "tag" type when triggered', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'tag-station-id' });

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('tag', expect.any(String));
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'tag-123' });

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('tag-123');
        });
    });

    it('exposes Definition with correct title', async () => {
        const { Definition } = await import('$lib/components/Stations/Tag.svelte');
        expect(Definition.title).toBe('Tag');
    });
});
