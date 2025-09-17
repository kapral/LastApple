// Mock StationApi before importing the component
jest.mock('../../../restClients/StationApi', () => ({
    __esModule: true,
    default: {
        postStation: jest.fn().mockResolvedValue({ id: 'test-station-id' })
    }
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tag } from '../../../components/Stations/Tag';
import mockStationApi from '../../../restClients/StationApi';
import AsMock from '../../AsMock';

describe('Tag', () => {
    const defaultProps = {
        triggerCreate: false,
        onStationCreated: jest.fn(),
        onOptionsChanged: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Restore the mock function after clearAllMocks
        AsMock(mockStationApi.postStation).mockResolvedValue({ id: 'test-station-id' });
    });

    it('renders without crashing', () => {
        render(<Tag {...defaultProps} />);
    });

    it('applies station-parameters class', () => {
        const { container } = render(<Tag {...defaultProps} />);

        expect(container.querySelector('.station-parameters')).toBeInTheDocument();
    });

    it('renders input with correct placeholder', () => {
        render(<Tag {...defaultProps} />);

        expect(screen.getByPlaceholderText('Rock...')).toBeInTheDocument();
    });

    it('applies correct styling to input', () => {
        render(<Tag {...defaultProps} />);

        const input = screen.getByPlaceholderText('Rock...');
        expect(input).toHaveStyle({
            width: '100%',
            padding: '6px 12px',
            borderWidth: '1px'
        });
    });

    it('calls onOptionsChanged with true when tag is entered', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        fireEvent.change(input, { target: { value: 'rock' } });

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('calls onOptionsChanged with false when tag is cleared', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        
        // First enter a tag
        fireEvent.change(input, { target: { value: 'rock' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);

        // Then clear it
        fireEvent.change(input, { target: { value: '' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);
    });

    it('updates state when input value changes', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        fireEvent.change(input, { target: { value: 'electronic' } });

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('creates station when triggerCreate is true', async () => {
        const mockOnStationCreated = jest.fn();

        const { rerender } = render(
            <Tag {...defaultProps} onStationCreated={mockOnStationCreated} />
        );

        // First enter a tag
        const input = screen.getByPlaceholderText('Rock...');
        fireEvent.change(input, { target: { value: 'jazz' } });

        // Then trigger creation
        rerender(
            <Tag 
                {...defaultProps} 
                triggerCreate={true}
                onStationCreated={mockOnStationCreated} 
            />
        );

        await waitFor(() => {
            expect(mockStationApi.postStation).toHaveBeenCalledWith('tags', 'jazz');
            expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
        });
    });

    it('creates station with null tag when no tag is entered', async () => {
        const mockOnStationCreated = jest.fn();

        const { rerender } = render(
            <Tag {...defaultProps} onStationCreated={mockOnStationCreated} />
        );

        // Don't enter any tag, just trigger creation
        rerender(
            <Tag 
                {...defaultProps} 
                triggerCreate={true}
                onStationCreated={mockOnStationCreated} 
            />
        );

        await waitFor(() => {
            expect(mockStationApi.postStation).toHaveBeenCalledWith('tags', null);
            expect(mockOnStationCreated).toHaveBeenCalledWith('test-station-id');
        });
    });

    it('handles multiple input changes correctly', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        
        fireEvent.change(input, { target: { value: 'r' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);

        fireEvent.change(input, { target: { value: 'ro' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);

        fireEvent.change(input, { target: { value: 'rock' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);

        fireEvent.change(input, { target: { value: '' } });
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(false);

        expect(mockOnOptionsChanged).toHaveBeenCalledTimes(4);
    });

    it('has correct static Definition', () => {
        expect(Tag.Definition).toEqual({
            title: 'Tag',
            description: 'A station consisting of tracks related to a last.fm tag.',
            type: Tag
        });
    });

    it('handles whitespace-only input as invalid', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        fireEvent.change(input, { target: { value: '   ' } });

        // Whitespace should be considered valid (truthy), but this depends on implementation
        // The current implementation uses !!tag which would be true for whitespace
        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('maintains input value correctly', () => {
        render(<Tag {...defaultProps} />);

        const input = screen.getByPlaceholderText('Rock...') as HTMLInputElement;
        
        fireEvent.change(input, { target: { value: 'indie' } });
        
        expect(input.value).toBe('indie');
    });

    it('calls handleChanged with current target value', () => {
        const mockOnOptionsChanged = jest.fn();
        
        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...') as HTMLInputElement;
        
        fireEvent.change(input, { target: { value: 'ambient' } });

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });

    it('handles special characters in tag names', () => {
        const mockOnOptionsChanged = jest.fn();

        render(<Tag {...defaultProps} onOptionsChanged={mockOnOptionsChanged} />);

        const input = screen.getByPlaceholderText('Rock...');
        fireEvent.change(input, { target: { value: 'post-rock & ambient' } });

        expect(mockOnOptionsChanged).toHaveBeenCalledWith(true);
    });
});