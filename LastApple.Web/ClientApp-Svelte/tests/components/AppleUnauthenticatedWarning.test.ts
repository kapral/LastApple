import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

describe('AppleUnauthenticatedWarning', () => {
    it('renders warning message about Apple Music connection', async () => {
        const { default: AppleUnauthenticatedWarning } = await import('$lib/components/AppleUnauthenticatedWarning.svelte');
        render(AppleUnauthenticatedWarning);

        expect(screen.getByText(/You have no Apple Music account connected/i)).toBeInTheDocument();
        expect(screen.getByText(/listen only to 30 second previews/i)).toBeInTheDocument();
        expect(screen.getByText(/Log in to Apple Music/i)).toBeInTheDocument();
        expect(screen.getByText(/enjoy full songs/i)).toBeInTheDocument();
    });

    it('has warning alert styling', async () => {
        const { default: AppleUnauthenticatedWarning } = await import('$lib/components/AppleUnauthenticatedWarning.svelte');
        const { container } = render(AppleUnauthenticatedWarning);

        const alertDiv = container.querySelector('.alert.alert-warning');
        expect(alertDiv).toBeInTheDocument();
    });

    it('contains a link to Settings page', async () => {
        const { default: AppleUnauthenticatedWarning } = await import('$lib/components/AppleUnauthenticatedWarning.svelte');
        render(AppleUnauthenticatedWarning);

        const settingsLink = screen.getByRole('link', { name: /settings/i });
        expect(settingsLink).toBeInTheDocument();
        expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('renders complete warning text with link', async () => {
        const { default: AppleUnauthenticatedWarning } = await import('$lib/components/AppleUnauthenticatedWarning.svelte');
        const { container } = render(AppleUnauthenticatedWarning);

        const warningDiv = container.querySelector('.alert');
        expect(warningDiv).toHaveTextContent(
            /You have no Apple Music account connected.*30 second previews.*Log in to Apple Music.*Settings.*enjoy full songs/i
        );
    });
});
