import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Tag from '$lib/components/Stations/Tag.svelte';

// Mock lastfm API
const mockSearchTag = vi.fn();
vi.mock('$lib/api/lastfmApi', () => ({
    default: {
        searchTag: mockSearchTag
    }
}));

// Mock station API
const mockPostStation = vi.fn();
vi.mock('$lib/api/stationApi', () => ({
    default: {
        postStation: mockPostStation
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
        mockSearchTag.mockResolvedValue([]);
    });

    it('applies station-parameters class', () => {
        const { container } = render(Tag, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with placeholder "indie..."', () => {
        render(Tag, { props: defaultProps });

        expect(screen.getByPlaceholderText('indie...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no tag selected)', () => {
        render(Tag, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('searches Last.fm tags when user types', async () => {
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('indie...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(mockSearchTag).toHaveBeenCalledWith('indie');
        }, { timeout: 1000 });
    });

    it('displays tag names from Last.fm search results', async () => {
        mockSearchTag.mockResolvedValue([
            { name: 'indie' },
            { name: 'indie rock' }
        ]);

        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('indie...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(screen.getByText('indie')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('calls onOptionsChanged(true) when tag is selected', async () => {
        mockSearchTag.mockResolvedValue([{ name: 'indie' }]);

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
        mockPostStation.mockResolvedValue({ id: 'tag-station-id' });

        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('tag', expect.any(String));
        });
    });

    it('calls onStationCreated with station ID after creation', async () => {
        mockPostStation.mockResolvedValue({ id: 'tag-123' });

        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('tag-123');
        });
    });

    it('exposes Definition with correct title', () => {
        expect(Tag).toHaveProperty('Definition');
        expect(Tag.Definition.title).toBe('Tag');
    });
});
