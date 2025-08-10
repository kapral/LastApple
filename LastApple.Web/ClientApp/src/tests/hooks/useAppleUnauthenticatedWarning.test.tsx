import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAppleUnauthenticatedWarning } from '../../hooks/useAppleUnauthenticatedWarning';
import { AuthenticationState } from '../../authentication';

// Mock the dependencies
const mockAppleContext = {
  authentication: {
    state: AuthenticationState.Unauthenticated,
    setState: jest.fn(),
  },
};

jest.mock('../../apple/AppleContext', () => ({
  useAppleContext: jest.fn(() => mockAppleContext),
}));

jest.mock('../../components/AppleUnauthenticatedWarning', () => ({
  AppleUnauthenticatedWarning: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'apple-warning' }, 'Apple Warning');
  },
}));

describe('useAppleUnauthenticatedWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isShown as true when Apple authentication is unauthenticated', () => {
    mockAppleContext.authentication.state = AuthenticationState.Unauthenticated;

    const { result } = renderHook(() => useAppleUnauthenticatedWarning());

    expect(result.current.isShown).toBe(true);
    expect(result.current.Element).toBeDefined();
  });

  it('should return isShown as false when Apple authentication is authenticated', () => {
    mockAppleContext.authentication.state = AuthenticationState.Authenticated;

    const { result } = renderHook(() => useAppleUnauthenticatedWarning());

    expect(result.current.isShown).toBe(false);
    expect(result.current.Element).toBeDefined();
  });

  it('should return isShown as false when Apple authentication is loading', () => {
    mockAppleContext.authentication.state = AuthenticationState.Loading;

    const { result } = renderHook(() => useAppleUnauthenticatedWarning());

    expect(result.current.isShown).toBe(false);
    expect(result.current.Element).toBeDefined();
  });

  it('should return the same Element instance on re-renders', () => {
    mockAppleContext.authentication.state = AuthenticationState.Unauthenticated;

    const { result, rerender } = renderHook(() => useAppleUnauthenticatedWarning());
    
    const firstElement = result.current.Element;
    
    rerender();
    
    const secondElement = result.current.Element;
    
    expect(firstElement).toBe(secondElement);
  });

  it('should update isShown when authentication state changes', () => {
    mockAppleContext.authentication.state = AuthenticationState.Unauthenticated;

    const { result, rerender } = renderHook(() => useAppleUnauthenticatedWarning());

    expect(result.current.isShown).toBe(true);

    mockAppleContext.authentication.state = AuthenticationState.Authenticated;
    rerender();

    expect(result.current.isShown).toBe(false);
  });
});