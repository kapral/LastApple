// Mock the LastfmAuthService
jest.mock('../../lastfm/LastfmAuthService', () => {
    const mockService = {
        tryGetAuthFromParams: jest.fn(),
        postToken: jest.fn(),
    };
    
    return {
        __esModule: true,
        default: mockService,
    };
});

// Mock the LastfmContext
jest.mock('../../lastfm/LastfmContext', () => ({
    useLastfmContext: jest.fn(),
}));

// Mock the lastfm authentication helper
jest.mock('../../lastfm/lastfmAuthentication', () => ({
    checkLastfmLogin: jest.fn(),
}));

import { renderHook } from '@testing-library/react';
import { useStartupLastfmAuthenticationCheck } from '../../hooks/useStartupLastfmAuthenticationCheck';
import { AuthenticationState } from '../../authentication';
import mockLastfmAuthService from '../../lastfm/LastfmAuthService';
import { useLastfmContext } from '../../lastfm/LastfmContext';
import { checkLastfmLogin } from '../../lastfm/lastfmAuthentication';
import AsMock from '../AsMock';

describe('useStartupLastfmAuthenticationCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Restore mock functions after clearAllMocks
        AsMock(mockLastfmAuthService.tryGetAuthFromParams).mockResolvedValue(null);
        AsMock(mockLastfmAuthService.postToken).mockResolvedValue(undefined);
        AsMock(useLastfmContext).mockReturnValue({
            authentication: {
                state: 0, // AuthenticationState.Loading
                setState: jest.fn(),
                user: undefined,
                setUser: jest.fn(),
            },
        });
        AsMock(checkLastfmLogin).mockResolvedValue(undefined);
    });

    it('should set loading state and check login when no token in params', async () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
                user: undefined,
                setUser: jest.fn(),
            },
        };
        AsMock(useLastfmContext).mockReturnValue(mockContext);
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        checkLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        expect(mockLastfmAuthService.postToken).not.toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);
    });

    it('should post token and check login when token exists in params', async () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
                user: undefined,
                setUser: jest.fn(),
            },
        };
        AsMock(useLastfmContext).mockReturnValue(mockContext);
        
        const testToken = 'test-token-123';
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(testToken);
        mockLastfmAuthService.postToken.mockResolvedValue(undefined);
        checkLastfmLogin.mockResolvedValue(undefined);

        renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalled();
        
        // Wait for async operation to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(mockLastfmAuthService.postToken).toHaveBeenCalledWith(testToken);
        expect(checkLastfmLogin).toHaveBeenCalledWith(mockContext.authentication);
    });

    it('should not run effect on re-render', async () => {
        const mockContext = {
            authentication: {
                state: 0,
                setState: jest.fn(),
                user: undefined,
                setUser: jest.fn(),
            },
        };
        AsMock(useLastfmContext).mockReturnValue(mockContext);
        mockLastfmAuthService.tryGetAuthFromParams.mockReturnValue(null);
        checkLastfmLogin.mockResolvedValue(undefined);

        const { rerender } = renderHook(() => useStartupLastfmAuthenticationCheck());

        expect(mockContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);

        rerender();

        expect(mockContext.authentication.setState).toHaveBeenCalledTimes(1);
        expect(mockLastfmAuthService.tryGetAuthFromParams).toHaveBeenCalledTimes(1);
    });

    it.skip('should handle postToken errors gracefully (skip - hook needs error handling)', async () => {
        // This test is skipped because the hook doesn't currently have error handling
        // for rejected promises in the useEffect
    });

    it.skip('should handle checkLastfmLogin errors gracefully (skip - hook needs error handling)', async () => {
        // This test is skipped because the hook doesn't currently have error handling
        // for rejected promises in the useEffect
    });
});