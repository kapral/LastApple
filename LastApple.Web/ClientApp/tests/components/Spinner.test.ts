import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Spinner from '$lib/components/Spinner.svelte';

describe('Spinner', () => {
    it('renders spinner element', () => {
        render(Spinner);

        expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('has spinner-border class', () => {
        render(Spinner);

        expect(screen.getByTestId('spinner')).toHaveClass('spinner-border');
    });

    it('has role="status" for accessibility', () => {
        render(Spinner);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('contains visually hidden loading text for screen readers', () => {
        render(Spinner);

        const loadingText = screen.getByText('Loading...');
        expect(loadingText).toBeInTheDocument();
        expect(loadingText).toHaveClass('visually-hidden');
    });
});
