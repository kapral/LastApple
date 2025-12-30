import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationState } from '$lib/services/authentication';
import { 
    startupLastfmAuthenticationCheck,
    checkLastfmLogin,
    lastfmAuthService,
    type LastfmAuthState 
} from '$lib/services/lastfmAuthCheck';

describe('startupLastfmAuthenticationCheck', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should set loading state when invoked', async () => {
        const mockSetState = vi.fn();
        const mockAuthState: LastfmAuthState = {
            state: AuthenticationState.Loading,
            setState: mockSetState,
            user: undefined,
            setUser: vi.fn()
        };

        await startupLastfmAuthenticationCheck(mockAuthState);

        expect(mockSetState).toHaveBeenCalledWith(AuthenticationState.Loading);
    });

    it('should call tryGetAuthFromParams', async () => {
        const mockSetState = vi.fn();
        const mockAuthState: LastfmAuthState = {
            state: AuthenticationState.Loading,
            setState: mockSetState,
            user: undefined,
            setUser: vi.fn()
        };
        
        // Spy on the actual method
        const tryGetAuthSpy = vi.spyOn(lastfmAuthService, 'tryGetAuthFromParams');
        tryGetAuthSpy.mockReturnValue(null);

        await startupLastfmAuthenticationCheck(mockAuthState);

        expect(tryGetAuthSpy).toHaveBeenCalled();
        tryGetAuthSpy.mockRestore();
    });

    it('should not call postToken when no token in params', async () => {
        const mockSetState = vi.fn();
        const mockAuthState: LastfmAuthState = {
            state: AuthenticationState.Loading,
            setState: mockSetState
        };
        
        // Spy on the actual methods
        const tryGetAuthSpy = vi.spyOn(lastfmAuthService, 'tryGetAuthFromParams');
        const postTokenSpy = vi.spyOn(lastfmAuthService, 'postToken');
        tryGetAuthSpy.mockReturnValue(null);
        postTokenSpy.mockResolvedValue(undefined);

        await startupLastfmAuthenticationCheck(mockAuthState);

        expect(postTokenSpy).not.toHaveBeenCalled();
        
        tryGetAuthSpy.mockRestore();
        postTokenSpy.mockRestore();
    });

    it('should call postToken when token exists in params', async () => {
        const mockSetState = vi.fn();
        const mockAuthState: LastfmAuthState = {
            state: AuthenticationState.Loading,
            setState: mockSetState
        };
        
        const testToken = 'test-token-123';
        
        // Spy on the actual methods
        const tryGetAuthSpy = vi.spyOn(lastfmAuthService, 'tryGetAuthFromParams');
        const postTokenSpy = vi.spyOn(lastfmAuthService, 'postToken');
        tryGetAuthSpy.mockReturnValue(testToken);
        postTokenSpy.mockResolvedValue(undefined);

        await startupLastfmAuthenticationCheck(mockAuthState);

        expect(postTokenSpy).toHaveBeenCalledWith(testToken);
        
        tryGetAuthSpy.mockRestore();
        postTokenSpy.mockRestore();
    });
});

describe('checkLastfmLogin', () => {
    it('should be defined as an async function', () => {
        expect(checkLastfmLogin).toBeDefined();
        expect(typeof checkLastfmLogin).toBe('function');
    });

    it('should return a promise', () => {
        const mockAuthState: LastfmAuthState = {
            state: AuthenticationState.Loading,
            setState: vi.fn()
        };

        const result = checkLastfmLogin(mockAuthState);
        expect(result).toBeInstanceOf(Promise);
    });
});

describe('lastfmAuthService', () => {
    it('should have tryGetAuthFromParams method', () => {
        expect(lastfmAuthService.tryGetAuthFromParams).toBeDefined();
        expect(typeof lastfmAuthService.tryGetAuthFromParams).toBe('function');
    });

    it('should have postToken method', () => {
        expect(lastfmAuthService.postToken).toBeDefined();
        expect(typeof lastfmAuthService.postToken).toBe('function');
    });
});
