import { renderHook } from '@testing-library/react';
import { useAppleUnauthenticatedWarning } from '../../hooks/useAppleUnauthenticatedWarning';
import { AuthenticationState } from '../../authentication';

// Get the mock functions from the global setup
import { useAppleContext } from '../../apple/AppleContext';
import AsMock from "../AsMock";

describe('useAppleUnauthenticatedWarning', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return isShown as true when Apple authentication is unauthenticated', () => {
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Unauthenticated,
                setState: jest.fn(),
            },
        });

        const { result } = renderHook(() => useAppleUnauthenticatedWarning());

        expect(result.current.isShown).toBe(true);
        expect(result.current.Element).toBeDefined();
    });

    it('should return isShown as false when Apple authentication is authenticated', () => {
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Authenticated,
                setState: jest.fn(),
            },
        });

        const { result } = renderHook(() => useAppleUnauthenticatedWarning());

        expect(result.current.isShown).toBe(false);
        expect(result.current.Element).toBeDefined();
    });

    it('should return isShown as false when Apple authentication is loading', () => {
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Loading,
                setState: jest.fn(),
            },
        });

        const { result } = renderHook(() => useAppleUnauthenticatedWarning());

        expect(result.current.isShown).toBe(false);
        expect(result.current.Element).toBeDefined();
    });

    it('should return the same Element instance on re-renders', () => {
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Unauthenticated,
                setState: jest.fn(),
            },
        });

        const { result, rerender } = renderHook(() => useAppleUnauthenticatedWarning());

        const firstElement = result.current.Element;

        rerender();

        const secondElement = result.current.Element;

        expect(firstElement).toBe(secondElement);
    });

    it('should update isShown when authentication state changes', () => {
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Unauthenticated,
                setState: jest.fn(),
            },
        });

        const { result, rerender } = renderHook(() => useAppleUnauthenticatedWarning());

        expect(result.current.isShown).toBe(true);

        // Change the mock return value
        AsMock(useAppleContext).mockReturnValue({
            authentication: {
                state: AuthenticationState.Authenticated,
                setState: jest.fn(),
            },
        });

        rerender();

        expect(result.current.isShown).toBe(false);
    });
});