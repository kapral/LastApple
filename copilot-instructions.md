# Setup Instructions for LastApple

> **Note**: For comprehensive AI agent and development instructions, see [`.github/agents.md`](.github/agents.md)

## Development Setup

### GitHub Packages Authentication

This project depends on a private NuGet package `Inflatable.Lastfm` hosted on GitHub Packages. To build the solution locally or in CI/CD, you need to authenticate with GitHub Packages using a Personal Access Token.

#### For Local Development

1. Create a Personal Access Token (PAT) with `read:packages` permission
2. Configure NuGet authentication:

```bash
dotnet nuget remove source github
dotnet nuget add source --username [your-github-username] --password [your-PAT] --store-password-in-clear-text --name github "https://nuget.pkg.github.com/kapral/index.json"
```

#### For GitHub Actions

The repository is configured with `GH_TOKEN` secret for CI/CD authentication. The workflow automatically configures authentication:

```yaml
- name: Add GH packages
  run: |
    dotnet nuget remove source github
    dotnet nuget add source --username kapral --password ${{ secrets.GH_TOKEN }} --store-password-in-clear-text --name github "https://nuget.pkg.github.com/kapral/index.json"
```

#### For AI Agent Development

When working with AI agents in this repository, refer to the comprehensive instructions in [`.github/agents.md`](.github/agents.md) which includes agent-specific guidelines, security considerations, and development workflows. The `GH_TOKEN` secret should be available as an environment variable for automated builds.

## Building and Testing

After configuring authentication:

```bash
# Build the solution
dotnet build --configuration Release

# Run all tests
dotnet test

# Build the web client
cd LastApple.Web/ClientApp
npm ci
npm run build
```

## Project Structure

- **AppleMusicApi** - Apple Music integration library
- **LastApple** - Core domain logic and business rules
- **LastApple.Persistence** - Data persistence with MongoDB
- **LastApple.Web** - ASP.NET Core web application with React frontend
- **Test Projects** - Comprehensive unit tests for all components