import { renderHook } from '@testing-library/react';
import { useStartupAppleAuthenticationCheck } from '../../hooks/useStartupAppleAuthenticationCheck';

// Mock the dependencies
const mockAppleContext = {
  authentication: {
    state: 0,
    setState: jest.fn(),
  },
};

const mockCheckAppleLogin = jest.fn();

jest.mock('../../apple/AppleContext', () => ({
  useAppleContext: jest.fn(() => mockAppleContext),
}));

jest.mock('../../apple/appleAuthentication', () => ({
  checkAppleLogin: mockCheckAppleLogin,
}));

describe('useStartupAppleAuthenticationCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call checkAppleLogin on mount', () => {
    renderHook(() => useStartupAppleAuthenticationCheck());

    expect(mockCheckAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
    expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
  });

  it('should not call checkAppleLogin on re-render', () => {
    const { rerender } = renderHook(() => useStartupAppleAuthenticationCheck());

    expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);

    rerender();

    expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
  });

  it('should handle async checkAppleLogin execution', async () => {
    mockCheckAppleLogin.mockResolvedValue(undefined);

    renderHook(() => useStartupAppleAuthenticationCheck());

    expect(mockCheckAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
    
    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);
  });

  it('should handle checkAppleLogin errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCheckAppleLogin.mockRejectedValue(new Error('Auth check failed'));

    renderHook(() => useStartupAppleAuthenticationCheck());

    expect(mockCheckAppleLogin).toHaveBeenCalledWith(mockAppleContext.authentication);
    
    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockCheckAppleLogin).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});