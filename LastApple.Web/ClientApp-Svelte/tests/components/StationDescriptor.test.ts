import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StationDescriptor from '$lib/components/StationDescriptor.svelte';
import type { IStationDefinition } from '$lib/components/IStationDefinition';
import MockStationComponent from './MockStationComponent.svelte';

const mockDefinition: IStationDefinition = {
    title: 'Test Station',
    description: 'A test station for testing purposes',
    type: MockStationComponent
};

describe('StationDescriptor', () => {
    it('renders without crashing', () => {
        render(StationDescriptor, {
            props: {
                definition: mockDefinition,
                StationComponent: MockStationComponent
            }
        });
    });

    it('displays station title', () => {
        render(StationDescriptor, {
            props: {
                definition: mockDefinition,
                StationComponent: MockStationComponent
            }
        });

        expect(screen.getByText('Test Station')).toBeInTheDocument();
    });

    it('displays station description', () => {
        render(StationDescriptor, {
            props: {
                definition: mockDefinition,
                StationComponent: MockStationComponent
            }
        });

        expect(screen.getByText('A test station for testing purposes')).toBeInTheDocument();
    });

    it('renders the station component', () => {
        render(StationDescriptor, {
            props: {
                definition: mockDefinition,
                StationComponent: MockStationComponent
            }
        });

        expect(screen.getByTestId('mock-station-component')).toBeInTheDocument();
    });
});
