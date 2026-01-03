import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

describe('CustomToggle', () => {
    it('renders without crashing', async () => {
        const { default: CustomToggle } = await import('$lib/components/Player/CustomToggle.svelte');
        render(CustomToggle);
    });

    it('renders component structure correctly', async () => {
        const { default: CustomToggle } = await import('$lib/components/Player/CustomToggle.svelte');
        const { container } = render(CustomToggle);

        // CustomToggle should have the toggle class
        expect(container.querySelector('.custom-toggle')).toBeInTheDocument();
    });

    it('has cursor pointer style', async () => {
        const { default: CustomToggle } = await import('$lib/components/Player/CustomToggle.svelte');
        const { container } = render(CustomToggle);

        const toggleDiv = container.firstChild as HTMLElement;
        expect(toggleDiv).toHaveStyle('cursor: pointer');
    });

    it('calls onClick when clicked', async () => {
        const mockOnClick = vi.fn();
        const { default: CustomToggle } = await import('$lib/components/Player/CustomToggle.svelte');
        const { container } = render(CustomToggle, {
            props: {
                onclick: mockOnClick
            }
        });

        await fireEvent.click(container.firstChild as HTMLElement);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('prevents default on click event', async () => {
        const mockOnClick = vi.fn();
        const { default: CustomToggle } = await import('$lib/components/Player/CustomToggle.svelte');
        const { container } = render(CustomToggle, {
            props: {
                onclick: mockOnClick
            }
        });

        const element = container.firstChild as HTMLElement;
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

        element.dispatchEvent(clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
