import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StationDescriptor } from '../../components/StationDescriptor';
import { IStationDefinition } from '../../components/IStationDefinition';
import { IStationParams } from '../../components/IStationParams';

// Mock FontAwesome
jest.mock('@fortawesome/react-fontawesome', () => ({
    FontAwesomeIcon: ({ icon, style, size }: any) => (
        <div 
            data-testid="fontawesome-icon" 
            data-icon={icon.iconName || 'arrow-circle-right'}
            style={style}
            data-size={size}
        />
    )
}));

// Create a mock station component
const MockStationComponent: React.FC<IStationParams> = ({
    triggerCreate,
    onStationCreated,
    onOptionsChanged
}) => {
    React.useEffect(() => {
        if (triggerCreate) {
            onStationCreated('test-station-id');
        }
    }, [triggerCreate, onStationCreated]);

    React.useEffect(() => {
        onOptionsChanged(true); // Always valid for testing
    }, [onOptionsChanged]);

    return <div data-testid="mock-station-component">Mock Station Component</div>;
};

const mockDefinition: IStationDefinition = {
    title: 'Test Station',
    description: 'A test station for testing purposes',
    type: MockStationComponent
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter>
        {children}
    </MemoryRouter>
);

describe('StationDescriptor', () => {
    it('renders without crashing', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );
    });

    it('displays station title', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Test Station')).toBeInTheDocument();
    });

    it('displays station description', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        expect(screen.getByText('A test station for testing purposes')).toBeInTheDocument();
    });

    it('renders the station component', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('mock-station-component')).toBeInTheDocument();
    });

    it('shows arrow icon with disabled color when options are invalid', () => {
        const InvalidStationComponent: React.FC<IStationParams> = ({ onOptionsChanged }) => {
            React.useEffect(() => {
                onOptionsChanged(false); // Invalid options
            }, [onOptionsChanged]);

            return <div data-testid="invalid-station-component">Invalid Station</div>;
        };

        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={InvalidStationComponent}
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('fontawesome-icon');
        expect(icon).toHaveStyle('color: #333');
    });

    it('shows arrow icon with enabled color when options are valid', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('fontawesome-icon');
        expect(icon).toHaveStyle('color: #8e0000');
    });

    it('does not trigger station creation when options are invalid', () => {
        const InvalidStationComponent: React.FC<IStationParams> = ({ onOptionsChanged }) => {
            React.useEffect(() => {
                onOptionsChanged(false);
            }, [onOptionsChanged]);

            return <div data-testid="invalid-station-component">Invalid Station</div>;
        };

        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={InvalidStationComponent}
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('fontawesome-icon');
        fireEvent.click(icon);

        // Should not trigger create, so no redirect should occur
        expect(screen.getByTestId('invalid-station-component')).toBeInTheDocument();
    });

    it('triggers station creation when arrow is clicked and options are valid', () => {
        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('fontawesome-icon');
        fireEvent.click(icon);

        // After clicking, the component should trigger creation
        // The MockStationComponent will call onStationCreated when triggerCreate becomes true
    });

    it('applies station-descriptor class', () => {
        const { container } = render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        expect(container.querySelector('.station-descriptor')).toBeInTheDocument();
    });

    it('has proper styling for descriptor container', () => {
        const { container } = render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={MockStationComponent}
                />
            </TestWrapper>
        );

        const descriptor = container.querySelector('.station-descriptor');
        expect(descriptor).toHaveStyle({
            margin: '5px',
            padding: '15px',
            background: '#00000099',
            cursor: 'pointer',
            flex: '1'
        });
    });

    it('passes triggerCreate prop to station component when arrow is clicked', () => {
        const TriggerTestComponent: React.FC<IStationParams> = ({ 
            triggerCreate, 
            onOptionsChanged, 
            onStationCreated 
        }) => {
            React.useEffect(() => {
                onOptionsChanged(true);
            }, [onOptionsChanged]);

            React.useEffect(() => {
                if (triggerCreate) {
                    onStationCreated('triggered-station-id');
                }
            }, [triggerCreate, onStationCreated]);

            return (
                <div data-testid="trigger-test-component">
                    {triggerCreate ? 'Creation Triggered' : 'Waiting for Trigger'}
                </div>
            );
        };

        render(
            <TestWrapper>
                <StationDescriptor 
                    definition={mockDefinition} 
                    StationComponent={TriggerTestComponent}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Waiting for Trigger')).toBeInTheDocument();

        const icon = screen.getByTestId('fontawesome-icon');
        fireEvent.click(icon);

        expect(screen.getByText('Creation Triggered')).toBeInTheDocument();
    });
});