import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from '../components/Layout';
import { BrowserRouter } from 'react-router-dom';

// Mock the Header and Footer components to avoid AppContext issues
jest.mock('../components/Header', () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

jest.mock('../components/Footer', () => ({
    Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('Layout Component', () => {
    it('renders children content', () => {
        render(
            <BrowserRouter>
                <Layout>
                    <div data-testid="child-content">Test Content</div>
                </Layout>
            </BrowserRouter>
        );
        
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('applies correct styles', () => {
        const { container } = render(
            <BrowserRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </BrowserRouter>
        );
        
        const layoutDiv = container.firstChild as HTMLElement;
        expect(layoutDiv).toHaveStyle({
            backgroundColor: '#222',
            color: '#CCC',
            maxWidth: '900px',
            margin: '0 auto'
        });
    });
});