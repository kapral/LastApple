import { AuthenticationState } from '../../authentication';
import { IAppleAuthenticationState, logoutApple, loginApple, checkAppleLogin } from '../../apple/appleAuthentication';

// Mock AppleAuthService
const mockAppleAuthService = {
  isAuthenticated: jest.fn(),
  authenticate: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../../apple/AppleAuthService', () => ({
  default: mockAppleAuthService,
}));

describe('appleAuthentication', () => {
  let mockAuthState: IAppleAuthenticationState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      state: AuthenticationState.Unauthenticated,
      setState: jest.fn(),
    };
  });

  describe('logoutApple', () => {
    it('should set loading state and logout if authenticated', async () => {
      mockAppleAuthService.isAuthenticated.mockResolvedValue(true);
      mockAppleAuthService.logout.mockResolvedValue(undefined);

      await logoutApple(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAppleAuthService.logout).toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
    });

    it('should set unauthenticated state if not authenticated', async () => {
      mockAppleAuthService.isAuthenticated.mockResolvedValue(false);

      await logoutApple(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAppleAuthService.logout).not.toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
    });
  });

  describe('loginApple', () => {
    it('should set authenticated state if already authenticated', async () => {
      mockAppleAuthService.isAuthenticated.mockResolvedValue(true);

      await loginApple(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAppleAuthService.authenticate).not.toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
    });

    it('should authenticate and set authenticated state on success', async () => {
      mockAppleAuthService.isAuthenticated
        .mockResolvedValueOnce(false) // Before authentication
        .mockResolvedValueOnce(true); // After authentication
      mockAppleAuthService.authenticate.mockResolvedValue(undefined);

      await loginApple(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalledTimes(2);
      expect(mockAppleAuthService.authenticate).toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
    });

    it('should set unauthenticated state if authentication fails', async () => {
      mockAppleAuthService.isAuthenticated
        .mockResolvedValueOnce(false) // Before authentication
        .mockResolvedValueOnce(false); // After authentication (failed)
      mockAppleAuthService.authenticate.mockResolvedValue(undefined);

      await loginApple(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalledTimes(2);
      expect(mockAppleAuthService.authenticate).toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
    });
  });

  describe('checkAppleLogin', () => {
    it('should set authenticated state if authenticated', async () => {
      mockAppleAuthService.isAuthenticated.mockResolvedValue(true);

      await checkAppleLogin(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Authenticated);
    });

    it('should set unauthenticated state if not authenticated', async () => {
      mockAppleAuthService.isAuthenticated.mockResolvedValue(false);

      await checkAppleLogin(mockAuthState);

      expect(mockAuthState.setState).toHaveBeenCalledWith(AuthenticationState.Loading);
      expect(mockAppleAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthState.setState).toHaveBeenLastCalledWith(AuthenticationState.Unauthenticated);
    });
  });
});