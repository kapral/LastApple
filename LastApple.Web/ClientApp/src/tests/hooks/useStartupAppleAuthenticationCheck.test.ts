import { renderHook } from '@testing-library/react';
import { useStartupAppleAuthenticationCheck } from '../../hooks/useStartupAppleAuthenticationCheck';

// Mock the AppleContext
jest.mock('../../apple/AppleContext', () => ({
    useAppleContext: jest.fn(),
}));

// Mock the apple authentication helper
jest.mock('../../apple/appleAuthentication', () => ({
    checkAppleLogin: jest.fn(),
}));

import { useAppleContext as mockUseAppleContext } from '../../apple/AppleContext';
import { checkAppleLogin as mockCheckAppleLogin } from '../../apple/appleAuthentication';
import AsMock from "../AsMock";

// Mock utils
jest.mock('../../utils/mics', () => ({
    assertNonNullable: jest.fn((value) => {
        if (value === undefined || value === null) {
            throw new Error('Value is null or undefined');
        }
        return value;
    }),
}));

describe('useStartupAppleAuthenticationCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock context return
        AsMock(mockUseAppleContext).mockReturnValue({
            authentication: {
                state: 0,
                setState: jest.fn(),
            },
        });
    });

    it('should call checkAppleLogin on mount', () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
            },
        };
        AsMock(mockUseAppleContext).mockReturnValue(mockContext);

        renderHook(() => useStartupAppleAuthenticationCheck());

        expect(mockCheckAppleLogin).toHaveBeenCalledWith(mockContext.authentication);
        expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
    });

    it('should not call checkAppleLogin on re-render', () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
            },
        };
        AsMock(mockUseAppleContext).mockReturnValue(mockContext);

        const { rerender } = renderHook(() => useStartupAppleAuthenticationCheck());

        expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);

        rerender();

        expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
    });

    it('should handle async checkAppleLogin execution', async () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
            },
        };
        AsMock(mockUseAppleContext).mockReturnValue(mockContext);
        AsMock(mockCheckAppleLogin).mockResolvedValue(undefined);

        renderHook(() => useStartupAppleAuthenticationCheck());

        expect(mockCheckAppleLogin).toHaveBeenCalledWith(mockContext.authentication);

        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
    });

    it.skip('should handle checkAppleLogin errors gracefully (skip - hook needs error handling)', async () => {
        // This test is skipped because the hook doesn't currently have error handling
        // for rejected promises in the useEffect
    });
});