import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthenticationState } from '../../authentication';

// Clear all global mocks for this test file
beforeEach(() => {
    jest.clearAllMocks();
});

// Unmock the AppleContext for this test file
jest.unmock('../../apple/AppleContext');

// Import after unmocking
import { AppleContextProvider, useAppleContext } from '../../apple/AppleContext';

// Mock utils with the original function behavior
jest.mock('../../utils/mics', () => {
    const originalModule = jest.requireActual('../../utils/mics');
    return {
        ...originalModule,
        assertNonNullable: originalModule.assertNonNullable,
    };
});

// Test component that uses the context
const TestComponent: React.FC = () => {
    const context = useAppleContext();
    return (
        <div>
            <div data-testid="auth-state">{context.authentication.state}</div>
            <button
                onClick={() => context.authentication.setState(AuthenticationState.Authenticated)}
                data-testid="set-authenticated">
                Set Authenticated
            </button>
        </div>
    );
};

describe('AppleContext', () => {
    describe('AppleContextProvider', () => {
        it('should provide initial authentication state as Loading', () => {
            render(
                <AppleContextProvider>
                    <TestComponent />
                </AppleContextProvider>
            );

            expect(screen.getByTestId('auth-state')).toHaveTextContent('0');
        });

        it('should allow updating authentication state', async () => {
            render(
                <AppleContextProvider>
                    <TestComponent />
                </AppleContextProvider>
            );

            const button = screen.getByTestId('set-authenticated');

            await act(async () => {
                button.click();
            });

            expect(screen.getByTestId('auth-state')).toHaveTextContent('1');
        });

        it('should provide context value with correct structure', () => {
            let contextValue: any;

            const TestContextReader: React.FC = () => {
                contextValue = useAppleContext();
                return <div>Context reader</div>;
            };

            render(
                <AppleContextProvider>
                    <TestContextReader />
                </AppleContextProvider>
            );

            expect(contextValue).toHaveProperty('authentication');
            expect(contextValue.authentication).toHaveProperty('state');
            expect(contextValue.authentication).toHaveProperty('setState');
            expect(typeof contextValue.authentication.setState).toBe('function');
        });
    });

    describe('useAppleContext', () => {
        it('should throw error when used outside of provider', () => {
            const TestComponentOutsideProvider: React.FC = () => {
                useAppleContext();
                return <div>Should not render</div>;
            };

            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestComponentOutsideProvider />);
            }).toThrow('Expected non-nullable value, but got undefined');

            consoleSpy.mockRestore();
        });

        it('should return context when used inside provider', () => {
            let contextValue: any;

            const TestContextReader: React.FC = () => {
                contextValue = useAppleContext();
                return <div>Context available</div>;
            };

            render(
                <AppleContextProvider>
                    <TestContextReader />
                </AppleContextProvider>
            );

            expect(contextValue).toBeDefined();
            expect(contextValue.authentication.state).toBe(AuthenticationState.Loading);
        });
    });
});