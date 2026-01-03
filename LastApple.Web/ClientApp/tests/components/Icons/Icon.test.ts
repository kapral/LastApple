import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon from '$lib/components/Icons/Icon.svelte';

describe('Icon', () => {
    const iconNames = ['play', 'pause', 'step-backward', 'step-forward', 'ellipsis-h', 'plus-square', 'folder-plus', 'trash-alt', 'arrow-right-in-circle'] as const;

    describe('renders all icon types', () => {
        iconNames.forEach(name => {
            it(`renders ${name} icon`, () => {
                const { container } = render(Icon, { props: { name } });

                const svg = container.querySelector('svg');
                expect(svg).toBeInTheDocument();
                expect(svg).toHaveClass(`icon-${name}`);
            });
        });
    });

    it('uses default size of 16', () => {
        const { container } = render(Icon, { props: { name: 'play' } });

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '16');
        expect(svg).toHaveAttribute('height', '16');
    });

    it('accepts custom size prop', () => {
        const { container } = render(Icon, { props: { name: 'pause', size: 24 } });

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
    });

    it('has viewBox attribute set to 0 0 24 24', () => {
        const { container } = render(Icon, { props: { name: 'play' } });

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has fill set to currentColor for styling flexibility', () => {
        const { container } = render(Icon, { props: { name: 'play' } });

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('contains a path element with d attribute', () => {
        const { container } = render(Icon, { props: { name: 'play' } });

        const path = container.querySelector('svg path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('d');
        expect(path?.getAttribute('d')).toBeTruthy();
    });

    it('has icon class on svg element', () => {
        const { container } = render(Icon, { props: { name: 'step-forward' } });

        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('icon');
    });
});
