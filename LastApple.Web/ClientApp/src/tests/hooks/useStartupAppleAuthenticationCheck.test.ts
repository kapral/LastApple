import { renderHook } from '@testing-library/react';
import { useStartupAppleAuthenticationCheck } from '../../hooks/useStartupAppleAuthenticationCheck';

// Mock the dependencies
const mockAppleContext = {
    authentication: {
        state: 0,
        setState: jest.fn(),
    },
};

// Mock utils first
jest.mock('../../utils/mics', () => ({
    assertNonNullable: jest.fn((value) => {
        if (value === undefined || value === null) {
            throw new Error('Value is null or undefined');
        }
        return value;
    }),
}));

jest.mock('../../apple/AppleContext', () => ({
    useAppleContext: jest.fn(() => mockAppleContext),
}));

jest.mock('../../apple/appleAuthentication', () => ({
    checkAppleLogin: jest.fn(),
}));

const { checkAppleLogin } = require('../../apple/appleAuthentication');

describe('useStartupAppleAuthenticationCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call checkAppleLogin on mount', () => {
        renderHook(() => useStartupAppleAuthenticationCheck());

        expect(checkAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
        expect(checkAppleLogin).toHaveBeenCalledTimes(1);
    });

    it('should not call checkAppleLogin on re-render', () => {
        const { rerender } = renderHook(() => useStartupAppleAuthenticationCheck());

        expect(checkAppleLogin).toHaveBeenCalledTimes(1);

        rerender();

        expect(checkAppleLogin).toHaveBeenCalledTimes(1);
    });

    it('should handle async checkAppleLogin execution', async () => {
        checkAppleLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupAppleAuthenticationCheck());

        expect(checkAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(checkAppleLogin).toHaveBeenCalledTimes(1);
    });

    it('should handle checkAppleLogin errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        checkAppleLogin.mockRejectedValue(new Error('Auth check failed'));

        renderHook(() => useStartupAppleAuthenticationCheck());

        expect(checkAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(checkAppleLogin).toHaveBeenCalledTimes(1);

        consoleSpy.mockRestore();
    });
});