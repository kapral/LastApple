import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Tag from '$lib/components/Stations/Tag.svelte';

describe('Tag', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: vi.fn(),
        onOptionsChanged: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(Tag, { props: defaultProps });
    });

    it('applies station-parameters class', () => {
        const { container } = render(Tag, { props: defaultProps });

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders Search component with correct placeholder', () => {
        render(Tag, { props: defaultProps });

        expect(screen.getByPlaceholderText('indie...')).toBeInTheDocument();
    });

    it('calls onOptionsChanged on mount', () => {
        render(Tag, { props: defaultProps });

        expect(defaultProps.onOptionsChanged).toHaveBeenCalled();
    });
});
