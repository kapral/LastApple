import { AuthenticationState } from '../../authentication';
import { ILastfmAuthenticationState, logoutLastfm, loginLastfm, checkLastfmLogin } from '../../lastfm/lastfmAuthentication';

// Mock LastfmAuthService
const mockLastfmAuthService = {
    getAuthenticatedUser: jest.fn(),
    authenticate: jest.fn(),
    logout: jest.fn(),
};

jest.mock('../../lastfm/LastfmAuthService', () => ({
    default: mockLastfmAuthService,
}));

describe('lastfmAuthentication', () => {
    let mockAuthState: ILastfmAuthenticationState;

    beforeEach(() => {
        jest.clearAllMocks();
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
            mockLastfmAuthService.getAuthenticatedUser.mockResolvedValue(mockUser);
            mockLastfmAuthService.logout.mockResolvedValue(undefined);

            await logoutLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockLastfmAuthService.logout).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });

        it('should set unauthenticated state if no authenticated user exists', async () => {
            mockLastfmAuthService.getAuthenticatedUser.mockResolvedValue(null);

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
            mockLastfmAuthService.getAuthenticatedUser.mockResolvedValue(mockUser);

            await loginLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockLastfmAuthService.authenticate).not.toHaveBeenCalled();
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should authenticate and set authenticated state on success', async () => {
            const mockUser = { name: 'testuser', url: 'http://last.fm/user/testuser', avatar: [] };
            mockLastfmAuthService.getAuthenticatedUser
                .mockResolvedValueOnce(null) // Before authentication
                .mockResolvedValueOnce(mockUser); // After authentication
            mockLastfmAuthService.authenticate.mockResolvedValue(undefined);

            await loginLastfm(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalledTimes(2);
            expect(mockLastfmAuthService.authenticate).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(mockUser);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should set unauthenticated state if authentication fails', async () => {
            mockLastfmAuthService.getAuthenticatedUser
                .mockResolvedValueOnce(null) // Before authentication
                .mockResolvedValueOnce(null); // After authentication (failed)
            mockLastfmAuthService.authenticate.mockResolvedValue(undefined);

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
            mockLastfmAuthService.getAuthenticatedUser.mockResolvedValue(mockUser);

            await checkLastfmLogin(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(mockUser);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
        });

        it('should set unauthenticated state if no user exists', async () => {
            mockLastfmAuthService.getAuthenticatedUser.mockResolvedValue(null);

            await checkLastfmLogin(mockAuthState);

            expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
            expect(mockLastfmAuthService.getAuthenticatedUser).toHaveBeenCalled();
            expect(mockAuthState.setUser).toHaveBeenCalledWith(undefined);
            expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
        });
    });
});