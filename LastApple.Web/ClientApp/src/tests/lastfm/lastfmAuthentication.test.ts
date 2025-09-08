// Mock LastfmAuthService first
jest.mock('../../lastfm/LastfmAuthService', () => ({
    getAuthenticatedUser: jest.fn(),
    authenticate: jest.fn(),
    logout: jest.fn(),
}));

import { AuthenticationState } from '../../authentication';
import { ILastfmAuthenticationState, logoutLastfm, loginLastfm, checkLastfmLogin } from '../../lastfm/lastfmAuthentication';
import mockLastfmAuthService from '../../lastfm/LastfmAuthService';
import AsMock from '../AsMock';

describe('lastfmAuthentication', () => {
    let mockAuthState: ILastfmAuthenticationState;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Restore the mock functions after clearAllMocks
        AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(null);
        AsMock(mockLastfmAuthService.authenticate).mockResolvedValue(undefined);
        AsMock(mockLastfmAuthService.logout).mockResolvedValue(undefined);
        
        mockAuthState = {
            state: AuthenticationState.Unauthenticated,
            setState: jest.fn(),
            user: undefined,
            setUser: jest.fn(),
        };
    });

    describe('logoutLastfm', () => {
        it('should set loading state and logout if authenticated user exists', async () => {
            const mockUser = { name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] };
            AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(mockUser);
            AsMock(mockLastfmAuthService.logout).mockResolvedValue(undefined);

            await logoutLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockLastfmAuthService.logout).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });

        it('should set unauthenticated state if no authenticated user exists', async () => {
            AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(null);

            await logoutLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockLastfmAuthService.logout).not.toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });
    });

    describe('loginLastfm', () => {
        it('should set authenticated state if user already exists', async () => {
            const mockUser = { name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] };
            AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(mockUser);

            await loginLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockLastfmAuthService.authenticate).not.toHaveBeenCalled();
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should authenticate and set authenticated state on success', async () => {
            const mockUser = { name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] };
            AsMock(mockLastfmAuthService.getAuthenticatedUser)
                .mockResolvedValueOnce(null) // Before authentication
                .mockResolvedValueOnce(mockUser); // After authentication
            AsMock(mockLastfmAuthService.authenticate).mockResolvedValue(undefined);

            await loginLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalledTimes(2);
            expect(mockLastfmAuthService.authenticate).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(mockUser);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should set unauthenticated state if authentication fails', async () => {
            AsMock(mockLastfmAuthService.getAuthenticatedUser)
                .mockResolvedValueOnce(null) // Before authentication
                .mockResolvedValueOnce(null); // After authentication (failed)
            AsMock(mockLastfmAuthService.authenticate).mockResolvedValue(undefined);

            await loginLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalledTimes(2);
            expect(mockLastfmAuthService.authenticate).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });
    });

    describe('checkLastfmLogin', () => {
        it('should set authenticated state and user if user exists', async () => {
            const mockUser = { name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] };
            AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(mockUser);

            await checkLastfmLogin(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(mockUser);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should set unauthenticated state if no user exists', async () => {
            AsMock(mockLastfmAuthService.getAuthenticatedUser).mockResolvedValue(null);

            await checkLastfmLogin(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });
    });
});