# React Tests

This directory contains unit tests for the React frontend components and utilities.

## Test Structure

- `App.test.tsx` - Main application component and routing tests
- `Layout.test.tsx` - Layout component with Header/Footer integration
- `Header.test.tsx` - Navigation, logo, and conditional links
- `Footer.test.tsx` - Footer component with App Store badge and social links
- `Home.test.tsx` - Home page component with warning display logic
- `utils.test.tsx` - Utility functions like `assertNonNullable`
- `routes.test.tsx` - Route constants validation

## Running Tests

### Development
```bash
# Run tests in watch mode (for development)
npm test

# Run tests once with coverage
npm run test -- --coverage --watchAll=false

# Run tests with verbose output
npm run test -- --coverage --watchAll=false --verbose
```

### CI/CD
Tests are automatically run on:
- Pull requests to `main` branch 
- Pushes to any branch (except `main`)

## Test Setup

### Mocks and Configuration
- `setupTests.ts` - Global test setup and mocks for:
  - MusicKit APIs
  - SignalR hub connections
  - Environment variables
  - FontAwesome icons

### Key Mocking Patterns
1. **External Dependencies**: MusicKit, SignalR are mocked globally
2. **React Components**: Complex child components are mocked in individual tests
3. **Custom Hooks**: Mocked per test to control behavior
4. **Context Providers**: Mocked to avoid complex setup requirements

## Adding New Tests

### Component Tests
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../components/YourComponent';

// Mock dependencies if needed
jest.mock('../hooks/useYourHook', () => ({
  useYourHook: jest.fn(() => ({ data: 'mocked' })),
}));

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Utility Tests
```typescript
import { yourUtilFunction } from '../utils/yourUtil';

describe('yourUtilFunction', () => {
  it('handles input correctly', () => {
    expect(yourUtilFunction('input')).toBe('expected output');
  });
});
```

## Test Coverage

Current coverage focuses on:
- Component rendering without crashes
- Basic UI element presence
- Conditional rendering logic
- Utility function behavior
- Route configuration

Future improvements can include:
- User interaction testing with `@testing-library/user-event`
- Form submission and validation
- API integration tests with MSW (Mock Service Worker)
- Accessibility testing
- Snapshot testing for stable components

## Dependencies

- `@testing-library/react` - Component testing utilities
- `@testing-library/jest-dom` - Additional Jest DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jest` - Test runner (provided by react-scripts)