# LastApple Music Station Generator - AI Agent Instructions

LastApple is a .NET 8.0 web application with React TypeScript frontend that creates personalized music stations by integrating Apple Music API and Last.fm API. The application generates playlists based on artist similarity, user listening history, and music tags.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## AI Agent Guidelines

### Code Generation Best Practices
- **Minimal Changes**: Always make the smallest possible changes to achieve the goal. Prefer surgical modifications over wholesale rewrites.
- **Preserve Existing Logic**: Never delete or modify working code unless absolutely necessary for the specific task.
- **Maintain Code Style**: Follow existing patterns, naming conventions, and architectural decisions in the codebase.
- **Incremental Development**: Make changes in small, testable increments rather than large, complex modifications.
- **Documentation Alignment**: Ensure any code changes are reflected in relevant documentation and comments.

### Testing Strategy for AI Agents
- **Mandatory Test Execution**: Always ensure both .NET and JavaScript tests pass before making any commit. Use `dotnet test` and `npm test` in ClientApp.
- **Test Preservation**: Never delete tests in order to fix them. Instead, update tests appropriately or fix the underlying code causing test failures.
- **No AAA Comments**: Avoid using `// arrange`, `// act`, `// assert` comments in test code. Keep tests clean and self-documenting.
- **Test-First Approach**: When possible, create tests that validate the expected behavior before implementing changes.
- **Existing Test Compatibility**: Ensure new changes don't break existing tests unless the test needs to be updated for the new functionality.
- **Mock Dependencies**: Use existing mocking patterns for external dependencies (Apple Music API, Last.fm API, MongoDB).
- **Integration Testing**: Verify end-to-end workflows when making changes to station generation or API integration logic.
- **Frontend Testing**: Always run `npm run build` after React component changes to catch TypeScript compilation errors.

### Security Considerations
- **API Key Protection**: Never commit API keys, secrets, or credentials in code. Use configuration files and environment variables.
- **Input Validation**: Always validate user inputs, especially for music search queries and playlist parameters.
- **Authentication Flow**: Preserve existing OAuth flows for Apple Music and Last.fm without exposing sensitive tokens.
- **Dependency Security**: Be cautious when suggesting dependency updates; verify compatibility with existing GitHub Packages authentication.

### Communication and Collaboration
- **Clear Commit Messages**: Use descriptive commit messages that explain the "why" not just the "what".
- **Progress Reporting**: Use incremental commits to show progress and allow for easy rollback if needed.
- **Error Context**: When reporting build or test failures, include sufficient context to understand the root cause.
- **Documentation Updates**: Update relevant documentation when making architectural or behavioral changes.

## Working Effectively

### Prerequisites and Environment Setup
- Install .NET 8.0 SDK from Microsoft's official site
- Install Node.js v18.x or higher: `node --version` should return v18+
- Ensure npm is available: `npm --version`

### Build Process (CRITICAL TIMING INFORMATION)
**AUTHENTICATION REQUIREMENT**: This repository requires GitHub Packages authentication for the private `Inflatable.Lastfm` package (version 1.3.0-auth).

#### With GitHub Packages Access:
- Configure NuGet source with authentication: `dotnet nuget add source --username [username] --password ${{ secrets.GH_TOKEN }} --store-password-in-clear-text --name github "https://nuget.pkg.github.com/kapral/index.json"`
- Restore packages: `dotnet restore` -- takes 2-3 minutes for private packages. NEVER CANCEL. Set timeout to 5+ minutes.
- Build solution: `dotnet build --configuration Release` -- takes 10-15 seconds per project. NEVER CANCEL.
- Run .NET tests: `dotnet test` -- runs unit tests with mocks, takes 10-15 seconds. Set timeout to 5+ minutes.

#### Without GitHub Packages Access:
- .NET restore and build will FAIL due to missing `Inflatable.Lastfm` v1.3.0-auth package
- Only AppleMusicApi project can be built independently: `dotnet build AppleMusicApi/AppleMusicApi.csproj --configuration Release` -- takes 8-10 seconds
- Document this limitation in any build issues encountered

### Frontend Development
- Install packages: `cd LastApple.Web/ClientApp && npm ci` -- takes 3-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Development server: `npm start` -- starts on port 3000, takes 30-60 seconds to compile
- Production build: `npm run build` -- takes 10-15 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
- Frontend tests: `npm run test -- --coverage --watchAll=false` -- minimal test coverage, only basic render test exists

### Application Runtime Requirements
**CRITICAL**: Full application requires these secrets configured in appsettings.json:
- Apple Music API credentials (PrivateKey, KeyId, TeamId)
- Last.fm API credentials (ApiKey, Secret) 
- MongoDB connection string

**Without full configuration**:
- Frontend builds and starts successfully but API calls will fail
- Individual components can be developed and tested
- Use mock data for development when APIs are unavailable

## Validation and Testing

### Build Validation Steps
1. ALWAYS verify .NET 8.0 is available: `dotnet --version`
2. ALWAYS verify Node.js 18+: `node --version`
3. ALWAYS build individual projects first to isolate dependency issues
4. ALWAYS run frontend build to ensure React compilation works

### Manual Testing Scenarios
**Frontend Testing** (without backend):
- Navigate to http://localhost:3000 after `npm start`
- Verify React application loads (will show authentication warnings)
- Check browser console for expected Apple Music/Last.fm authentication errors
- Test responsive design and basic navigation

**Backend Testing** (requires full API configuration):
- Start web application: `dotnet run --project LastApple.Web`
- Test API endpoints: /api/station, /api/apple-auth, /api/lastfm-auth
- Verify SignalR hub connections for real-time playlist updates
- Test complete music station generation workflow

### Known Limitations
- React tests are minimal (only basic render test) and need comprehensive test coverage
- Build requires private GitHub packages for Last.fm integration
- Full functionality requires Apple Developer account and Last.fm API credentials
- MongoDB required for session persistence

## Project Structure and Navigation

### Key Projects
- **LastApple.Web**: Main ASP.NET Core web application with React frontend in `ClientApp/`
- **LastApple**: Core business logic for station generation and music services
- **AppleMusicApi**: Apple Music API integration and authentication
- **LastApple.Persistence**: MongoDB data persistence layer
- **LastApple.Tests**: NUnit test suite for business logic

### Important Files and Locations
- **Frontend entry**: `LastApple.Web/ClientApp/src/App.tsx`
- **API controllers**: `LastApple.Web/Controllers/`
- **React components**: `LastApple.Web/ClientApp/src/components/`
- **Station generation**: `LastApple/PlaylistGeneration/`
- **Configuration**: `LastApple.Web/appsettings.json` (uses token replacement)
- **Dependencies**: `LastApple.Web/ClientApp/package.json`, `*.csproj` files

### Frequently Modified Areas
- After changing station generation logic in `LastApple/PlaylistGeneration/`, ALWAYS test with `LastApple.Tests/StationGeneration/` tests
- After modifying Apple Music integration in `AppleMusicApi/`, verify authentication flow in frontend
- After updating React components, ALWAYS run `npm run build` to check for TypeScript compilation errors
- Before committing, ALWAYS run available linting: check if `.eslintrc.json` rules pass

## AI Agent Development Workflows

### Code Analysis and Modification
1. **Understand Before Changing**: Always read and understand existing code patterns before making modifications
2. **Identify Dependencies**: Map out how changes in one area might affect other components
3. **Plan Incrementally**: Break large changes into smaller, testable steps
4. **Validate Continuously**: Test after each meaningful change rather than accumulating multiple changes

### Error Handling and Debugging
- **Build Errors**: Start with individual project builds to isolate dependency issues
- **Test Failures**: Focus only on tests related to your changes; don't fix unrelated failing tests
- **Runtime Errors**: Use existing logging and error handling patterns in the application
- **API Integration Issues**: Remember that external API calls may fail without proper credentials

### Performance Considerations
- **Build Performance**: Leverage incremental builds; avoid unnecessary clean rebuilds
- **Frontend Performance**: Use React development server for quick iteration, production build for final validation
- **Test Performance**: Run targeted tests when possible rather than the full test suite

## CI/CD Pipeline
The repository uses GitHub Actions with these workflows:
- **build-pullrequests.yml**: Runs on PRs to main branch
- **build-branch.yml**: Runs on all other branch pushes  
- **release-master.yml**: Deploys to Azure when pushing to main

**Pipeline Requirements**:
- Requires `GH_TOKEN` secret for GitHub Packages access
- Requires Apple Music API secrets for production deployment
- Requires Azure publish profile for deployment

## Common Commands Reference

### Development Workflow
```bash
# Full setup (with GitHub packages access)
dotnet restore
cd LastApple.Web/ClientApp && npm ci
cd ../.. && dotnet build --configuration Release
cd LastApple.Web/ClientApp && npm run build

# Frontend only development
cd LastApple.Web/ClientApp
npm ci
npm start  # Development server
npm run build  # Production build

# Individual project testing
dotnet build AppleMusicApi/AppleMusicApi.csproj  # Always works
dotnet test LastApple.Tests/  # Requires full dependencies
```

### AI Agent Specific Commands
```bash
# Quick validation workflow for agents
dotnet --version && node --version  # Verify prerequisites
dotnet build AppleMusicApi/AppleMusicApi.csproj --configuration Release  # Test individual build
cd LastApple.Web/ClientApp && npm ci && npm run build  # Test frontend build

# Targeted testing for specific changes
dotnet test LastApple.Tests/ --filter "TestCategory=StationGeneration"  # Example targeted test
```

### Troubleshooting
- **NuGet restore fails**: Check GitHub Packages authentication or remove github source temporarily
- **Frontend build fails**: Verify Node.js version and run `npm ci` to clean install
- **Tests fail with MusicKit errors**: React tests are minimal, only basic render test exists currently
- **API errors in browser**: Expected without proper Apple Music/Last.fm configuration
- **Agent timeout issues**: Commands may take longer than expected; use appropriate timeout values

## Time Expectations (NEVER CANCEL)
- **npm ci**: 3-5 minutes, set timeout to 10+ minutes
- **npm run build**: 10-15 seconds, set timeout to 5+ minutes  
- **dotnet restore**: 2-3 minutes with GitHub packages, set timeout to 5+ minutes
- **dotnet build**: 10-15 seconds per project, set timeout to 5+ minutes
- **dotnet test**: 10-15 seconds for unit tests, set timeout to 5+ minutes

ALWAYS wait for builds and tests to complete. Build cancellation leads to incomplete state and requires clean rebuilds.

## Agent Troubleshooting and Recovery

### Common Issues and Solutions
- **Dependency Resolution**: If builds fail due to missing packages, try building individual projects first
- **Configuration Errors**: Use mock data and test configurations when full API credentials aren't available
- **Test Environment**: Remember that some tests require external dependencies; focus on unit tests with mocks
- **Version Conflicts**: Stick to existing dependency versions unless specifically updating them

### Recovery Strategies
- **Incremental Rollback**: Use git to selectively revert problematic changes while preserving good changes
- **Isolation Testing**: Test components in isolation to identify the exact source of issues
- **Baseline Validation**: Always establish a working baseline before making changes
- **Documentation Sync**: Keep documentation in sync with code changes to avoid confusion