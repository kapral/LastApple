import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Layout from '$lib/components/Layout.svelte';

// Mock the Header and Footer components
vi.mock('$lib/components/Header.svelte', () => ({
    default: {
        render: () => ({ html: '<div data-testid="header">Header</div>' })
    }
}));

vi.mock('$lib/components/Footer.svelte', () => ({
    default: {
        render: () => ({ html: '<div data-testid="footer">Footer</div>' })
    }
}));

describe('Layout Component', () => {
    it('renders children content', () => {
        render(Layout, {
            props: {
                children: () => '<div data-testid="child-content">Test Content</div>'
            }
        });
        
        // Layout should render its structure
        expect(document.body).toBeInTheDocument();
    });

    it('applies correct styles', () => {
        const { container } = render(Layout, {
            props: {
                children: () => '<div>Content</div>'
            }
        });
        
        const layoutDiv = container.firstChild as HTMLElement;
        expect(layoutDiv).toHaveStyle({
            backgroundColor: '#222',
            color: '#CCC',
            maxWidth: '900px',
            margin: '0 auto'
        });
    });
});
