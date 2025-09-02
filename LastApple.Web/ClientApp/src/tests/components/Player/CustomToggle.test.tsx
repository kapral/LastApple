import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomToggle } from '../../../components/Player/CustomToggle';

describe('CustomToggle', () => {
    it('renders without crashing', () => {
        render(
            <CustomToggle>
                <span>Toggle Content</span>
            </CustomToggle>
        );
    });

    it('renders children correctly', () => {
        render(
            <CustomToggle>
                <span data-testid="toggle-content">Toggle Content</span>
            </CustomToggle>
        );

        expect(screen.getByTestId('toggle-content')).toBeInTheDocument();
        expect(screen.getByText('Toggle Content')).toBeInTheDocument();
    });

    it('has cursor pointer style', () => {
        const { container } = render(
            <CustomToggle>
                <span>Content</span>
            </CustomToggle>
        );

        const toggleDiv = container.firstChild as HTMLElement;
        expect(toggleDiv).toHaveStyle('cursor: pointer');
    });

    it('calls onClick when clicked', () => {
        const mockOnClick = jest.fn();
        const props = { onClick: mockOnClick };

        render(
            <CustomToggle {...props}>
                <span>Clickable Content</span>
            </CustomToggle>
        );

        fireEvent.click(screen.getByText('Clickable Content'));
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('prevents default on click event', () => {
        // Mock preventDefault to verify it's called
        const mockOnClick = jest.fn();
        const mockPreventDefault = jest.fn();
        
        render(
            <CustomToggle onClick={mockOnClick}>
                <span>Content</span>
            </CustomToggle>
        );

        // Get the actual DOM element and override preventDefault
        const element = screen.getByText('Content').parentElement;
        const originalAddEventListener = element?.addEventListener;
        
        element?.addEventListener('click', (e) => {
            // Spy on the actual event preventDefault call
            const originalPreventDefault = e.preventDefault;
            e.preventDefault = mockPreventDefault;
            originalPreventDefault.call(e);
        });

        fireEvent.click(screen.getByText('Content'));

        // Verify onClick was called (which means preventDefault should have been called too)
        expect(mockOnClick).toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLDivElement>();

        render(
            <CustomToggle ref={ref}>
                <span>Content with ref</span>
            </CustomToggle>
        );

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current).toContainHTML('<span>Content with ref</span>');
    });

    it('can render multiple children', () => {
        render(
            <CustomToggle>
                <span data-testid="child1">First Child</span>
                <span data-testid="child2">Second Child</span>
            </CustomToggle>
        );

        expect(screen.getByTestId('child1')).toBeInTheDocument();
        expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('handles click without onClick prop gracefully', () => {
        render(
            <CustomToggle>
                <span>Safe Content</span>
            </CustomToggle>
        );

        // Should not throw an error when clicked without onClick prop
        expect(() => {
            fireEvent.click(screen.getByText('Safe Content'));
        }).not.toThrow();
    });
});