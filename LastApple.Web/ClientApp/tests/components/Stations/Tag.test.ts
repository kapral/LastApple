import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

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

    it('renders input with placeholder "Rock..."', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        expect(screen.getByPlaceholderText('Rock...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged(false) initially (no tag entered)', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('calls onOptionsChanged(true) when tag is entered', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('Rock...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        await waitFor(() => {
            expect(defaultProps.onOptionsChanged).toHaveBeenCalledWith(true);
        });
    });

    it('calls onOptionsChanged(false) when tag is cleared', async () => {
        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        render(Tag, { props: defaultProps });

        const input = screen.getByPlaceholderText('Rock...');
        await fireEvent.input(input, { target: { value: 'indie' } });
        await fireEvent.input(input, { target: { value: '' } });

        await waitFor(() => {
            expect(defaultProps.onOptionsChanged).toHaveBeenLastCalledWith(false);
        });
    });

    it('creates station with "tags" type when triggered with tag entered', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);
        mockPostStation.mockResolvedValue({ id: 'tag-station-id' });

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // First enter a tag
        const input = screen.getByPlaceholderText('Rock...');
        await fireEvent.input(input, { target: { value: 'indie' } });

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(mockPostStation).toHaveBeenCalledWith('tags', 'indie');
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

        // First enter a tag
        const input = screen.getByPlaceholderText('Rock...');
        await fireEvent.input(input, { target: { value: 'rock' } });

        // Then trigger create
        await rerender({ ...defaultProps, triggerCreate: true });

        await waitFor(() => {
            expect(defaultProps.onStationCreated).toHaveBeenCalledWith('tag-123');
        });
    });

    it('does not create station when triggered without tag entered', async () => {
        const stationApi = await import('$lib/api/stationApi');
        const mockPostStation = vi.mocked(stationApi.default.postStation);

        const { default: Tag } = await import('$lib/components/Stations/Tag.svelte');
        const { rerender } = render(Tag, { 
            props: { ...defaultProps, triggerCreate: false } 
        });

        // Trigger create without entering a tag
        await rerender({ ...defaultProps, triggerCreate: true });

        // Wait a bit and verify postStation was not called
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockPostStation).not.toHaveBeenCalled();
    });

    it('exposes Definition with correct title', async () => {
        const { Definition } = await import('$lib/components/Stations/Tag.svelte');
        expect(Definition.title).toBe('Tag');
    });
});
