import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Search from '$lib/components/Search.svelte';
import asMock from '../asMock';

interface TestItem {
    id: string;
    name: string;
    label?: string;
}

describe('Search', () => {
    const mockSearch = vi.fn();
    const mockOnChanged = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search artists...',
                onChanged: mockOnChanged
            }
        });
    });

    it('renders with correct placeholder', () => {
        render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Test placeholder',
                onChanged: mockOnChanged
            }
        });

        expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    it('applies correct element index class', () => {
        const { container } = render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search',
                onChanged: mockOnChanged,
                elementIndex: 3
            }
        });

        expect(container.querySelector('.search-control-3')).toBeInTheDocument();
    });

    it('defaults to element index 0 when not provided', () => {
        const { container } = render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search',
                onChanged: mockOnChanged
            }
        });

        expect(container.querySelector('.search-control-0')).toBeInTheDocument();
    });

    it('calls search function with delay when typing', async () => {
        asMock(mockSearch).mockResolvedValue([
            { id: '1', name: 'Test Artist', label: 'Test Artist' }
        ]);

        render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search',
                onChanged: mockOnChanged
            }
        });

        const input = screen.getByPlaceholderText('Search');
        await fireEvent.input(input, { target: { value: 'test query' } });

        // Wait for the delay (500ms) and the search to be called
        await waitFor(() => {
            expect(mockSearch).toHaveBeenCalledWith('test query');
        }, { timeout: 1000 });
    });

    it('handles empty search results', async () => {
        asMock(mockSearch).mockResolvedValue([]);

        render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search',
                onChanged: mockOnChanged
            }
        });

        const input = screen.getByPlaceholderText('Search');
        await fireEvent.input(input, { target: { value: 'no results' } });

        await waitFor(() => {
            expect(mockSearch).toHaveBeenCalledWith('no results');
        }, { timeout: 1000 });
    });

    it('uses custom label accessor when provided', () => {
        render(Search, {
            props: {
                search: mockSearch,
                placeholder: 'Search',
                onChanged: mockOnChanged,
                labelAccessor: 'name'
            }
        });

        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });
});
