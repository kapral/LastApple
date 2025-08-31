import React from 'react';
import { render, screen } from '@testing-library/react';
import { LastfmContextProvider, useLastfmContext } from '../../lastfm/LastfmContext';
import { AuthenticationState } from '../../authentication';

// Mock utils
jest.mock('../../utils/mics', () => ({
    assertNonNullable: jest.fn((value) => {
        if (value === undefined || value === null) {
            throw new Error('Value is null or undefined');
        }
        return value;
    }),
}));

// Test component that uses the context
const TestComponent: React.FC = () => {
    const context = useLastfmContext();
    return (
        <div>
            <div data-testid="auth-state">{context.authentication.state}</div>
            <div data-testid="user-name">{context.authentication.user?.name || 'No user'}</div>
            <div data-testid="scrobbling-enabled">{context.isScrobblingEnabled.toString()}</div>
            <button
                onClick={() => context.authentication.setState(AuthenticationState.Authenticated)}
                data-testid="set-authenticated"
            >
                Set Authenticated
            </button>
            <button
                onClick={() => context.authentication.setUser({ name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] })}
                data-testid="set-user"
            >
                Set User
            </button>
            <button
                onClick={() => context.setIsScrobblingEnabled(false)}
                data-testid="disable-scrobbling"
            >
                Disable Scrobbling
            </button>
        </div>
    );
};

describe('LastfmContext', () => {
    describe('LastfmContextProvider', () => {
        it('should provide initial state with defaults', () => {
            render(
                <LastfmContextProvider>
                    <TestComponent />
                </LastfmContextProvider>
            );

            expect(screen.getByTestId('auth-state')).toHaveTextContent('0');
            expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
            expect(screen.getByTestId('scrobbling-enabled')).toHaveTextContent('true');
        });

        it('should allow updating authentication state', () => {
            render(
                <LastfmContextProvider>
                    <TestComponent />
                </LastfmContextProvider>
            );

            const button = screen.getByTestId('set-authenticated');
            button.click();

            expect(screen.getByTestId('auth-state')).toHaveTextContent('1');
        });

        it('should allow updating user data', () => {
            render(
                <LastfmContextProvider>
                    <TestComponent />
                </LastfmContextProvider>
            );

            const button = screen.getByTestId('set-user');
            button.click();

            expect(screen.getByTestId('user-name')).toHaveTextContent('testuser');
        });

        it('should allow updating scrobbling preference', () => {
            render(
                <LastfmContextProvider>
                    <TestComponent />
                </LastfmContextProvider>
            );

            const button = screen.getByTestId('disable-scrobbling');
            button.click();

            expect(screen.getByTestId('scrobbling-enabled')).toHaveTextContent('false');
        });

        it('should provide context value with correct structure', () => {
            let contextValue: any;
            
            const TestContextReader: React.FC = () => {
                contextValue = useLastfmContext();
                return <div>Context reader</div>;
            };

            render(
                <LastfmContextProvider>
                    <TestContextReader />
                </LastfmContextProvider>
            );

            expect(contextValue).toHaveProperty('authentication');
            expect(contextValue).toHaveProperty('isScrobblingEnabled');
            expect(contextValue).toHaveProperty('setIsScrobblingEnabled');
            expect(contextValue.authentication).toHaveProperty('state');
            expect(contextValue.authentication).toHaveProperty('setState');
            expect(contextValue.authentication).toHaveProperty('user');
            expect(contextValue.authentication).toHaveProperty('setUser');
            expect(typeof contextValue.authentication.setState).toBe('function');
            expect(typeof contextValue.authentication.setUser).toBe('function');
            expect(typeof contextValue.setIsScrobblingEnabled).toBe('function');
        });
    });

    describe('useLastfmContext', () => {
        it('should throw error when used outside of provider', () => {
            const TestComponentOutsideProvider: React.FC = () => {
                useLastfmContext();
                return <div>Should not render</div>;
            };

            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestComponentOutsideProvider />);
            }).toThrow('Value is null or undefined');

            consoleSpy.mockRestore();
        });

        it('should return context when used inside provider', () => {
            let contextValue: any;
            
            const TestContextReader: React.FC = () => {
                contextValue = useLastfmContext();
                return <div>Context available</div>;
            };

            render(
                <LastfmContextProvider>
                    <TestContextReader />
                </LastfmContextProvider>
            );

            expect(contextValue).toBeDefined();
            expect(contextValue.authentication.state).toBe(AuthenticationState.Loading);
            expect(contextValue.isScrobblingEnabled).toBe(true);
        });
    });
});