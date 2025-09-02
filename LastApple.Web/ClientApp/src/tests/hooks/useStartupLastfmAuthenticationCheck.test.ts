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

// Get the mocked service after the import
const LastfmAuthService = require('../../lastfm/LastfmAuthService').default;
const { checkLastfmLogin } = require('../../lastfm/lastfmAuthentication');
const { useLastfmContext } = require('../../lastfm/LastfmContext');

describe('useStartupLastfmAuthenticationCheck', () => {
    let mockContext: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Create a fresh mock context for each test
        mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
                user: undefined,
                setUser: jest.fn(),
            },
        };
        
        // Restore mocks after clearAllMocks
        LastfmAuthService.tryGetAuthFromParams = jest.fn();
        LastfmAuthService.postToken = jest.fn();
        checkLastfmLogin.mockClear();
        useLastfmContext.mockReturnValue(mockContext);
    });

    it('should set loading state and check login when no token in params', async () => {
        LastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        checkLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(LastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        expect(LastfmAuthService.postToken).not.toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);
    });

    it('should post token and check login when token exists in params', async () => {
        const testToken = 'test-token-123';
        LastfmAuthService.tryGetAuthFromParams.mockReturnValue(testToken);
        LastfmAuthService.postToken.mockResolvedValue(undefined);
        checkLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(LastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(LastfmAuthService.postToken).toHaveBeenCalledWith(testToken);
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);
    });

    it('should not run effect on re-render', async () => {
        LastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        checkLastfmLogin.mockResolvedValue(undefined);

        const { rerender } = renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(LastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);

        rerender();

        expect(mockContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(LastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);
    });

    it('should handle postToken errors gracefully', async () => {
        const testToken = 'test-token-123';
        LastfmAuthService.tryGetAuthFromParams.mockReturnValue(testToken);
        LastfmAuthService.postToken.mockRejectedValue(new Error('Token post failed'));
        checkLastfmLogin.mockResolvedValue(undefined);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(LastfmAuthService.postToken).toHaveBeenCalledWith(testToken);
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);

        consoleSpy.mockRestore();
    });

    it('should handle checkLastfmLogin errors gracefully', async () => {
        LastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        checkLastfmLogin.mockRejectedValue(new Error('Login check failed'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);

        consoleSpy.mockRestore();
    });
});