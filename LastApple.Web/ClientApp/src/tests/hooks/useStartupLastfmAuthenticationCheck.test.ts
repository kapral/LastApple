// Mock the dependencies first
const mockLastfmAuthService = {
    tryGetAuthFromParams: jest.fn(),
    postToken: jest.fn(),
};

const mockLastfmContext = {
    authentication: {
        state: 0, // AuthenticationState.Loading
        setState: jest.fn(),
        user: undefined,
        setUser: jest.fn(),
    },
};

const mockCheckLastfmLogin = jest.fn();

jest.mock('../../lastfm/LastfmAuthService', () => ({
    default: {
        tryGetAuthFromParams: jest.fn(),
        postToken: jest.fn(),
    },
}));

jest.mock('../../lastfm/LastfmContext', () => ({
    useLastfmContext: jest.fn(() => ({
        authentication: {
            state: 0, // AuthenticationState.Loading
            setState: jest.fn(),
            user: undefined,
            setUser: jest.fn(),
        },
    })),
}));

jest.mock('../../lastfm/lastfmAuthentication', () => ({
    checkLastfmLogin: jest.fn(),
}));

import { renderHook } from '@testing-library/react';
import { useStartupLastfmAuthenticationCheck } from '../../hooks/useStartupLastfmAuthenticationCheck';
import { AuthenticationState } from '../../authentication';

describe('useStartupLastfmAuthenticationCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should set loading state and check login when no token in params', async () => {
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        mockCheckLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        expect(mockLastfmAuthService.postToken).not.toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockCheckLastfmLogin).toHaveBeenCalledWith(mockLastfmContext.authentication);
    });

    it('should post token and check login when token exists in params', async () => {
        const testToken = 'test-token-123';
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(testToken);
        mockLastfmAuthService.postToken.mockResolvedValue(undefined);
        mockCheckLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockLastfmAuthService.postToken).toHaveBeenCalledWith(testToken);
        expect(mockCheckLastfmLogin).toHaveBeenCalledWith(mockLastfmContext.authentication);
    });

    it('should not run effect on re-render', async () => {
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        mockCheckLastfmLogin.mockResolvedValue(undefined);

        const { rerender } = renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);

        rerender();

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);
    });

    it('should handle postToken errors gracefully', async () => {
        const testToken = 'test-token-123';
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(testToken);
        mockLastfmAuthService.postToken.mockRejectedValue(new Error('Token post failed'));
        mockCheckLastfmLogin.mockResolvedValue(undefined);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockLastfmAuthService.postToken).toHaveBeenCalledWith(testToken);
        expect(mockCheckLastfmLogin).toHaveBeenCalledWith(mockLastfmContext.authentication);

        consoleSpy.mockRestore();
    });

    it('should handle checkLastfmLogin errors gracefully', async () => {
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        mockCheckLastfmLogin.mockRejectedValue(new Error('Login check failed'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockLastfmContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockCheckLastfmLogin).toHaveBeenCalledWith(mockLastfmContext.authentication);

        consoleSpy.mockRestore();
    });
});