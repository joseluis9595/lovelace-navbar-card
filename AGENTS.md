# Development Guidelines

This document outlines the development practices and guidelines for contributing to the Lovelace Navbar Card project.

## Project Overview

Lovelace Navbar Card is a custom card for Home Assistant's Lovelace UI, built with TypeScript and Lit. It provides a customizable navigation bar that enhances the Home Assistant user interface.

## Technology Stack

- **Runtime Environment**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime
- **Core Framework**: [Lit](https://lit.dev/) - A simple library for building fast, lightweight web components
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type-safe JavaScript development
- **Testing**:
  - [Vitest](https://vitest.dev/) - Unit testing framework
  - [@testing-library/dom](https://testing-library.com/) - DOM testing utilities
- **Documentation**: [Docusaurus](https://docusaurus.io/) - Documentation website framework
- **Code Quality**:
  - ESLint - Linting with TypeScript support
  - Prettier - Code formatting
  - TypeScript compiler - Static type checking

## Development Workflow

### Branch Strategy

- `main` - Stable branch containing production-ready code
- `develop` - Main development branch where features are integrated
- `feature/*` - Feature branches for new development
- `release/*` - Release preparation branches

### Pull Request Process

1. All Pull Requests must target the `develop` branch
2. PRs are merged into `develop` after review and testing
3. For releases, a new `release/*` branch is created from `develop`
4. After final testing, the release branch is merged into `main`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>
[optional body]
[optional footer(s)]
```

Commit messages should be kept short and concise, adding optional body and footer only when needed.

Types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Breaking changes will be marked with `!` after the type (e.g., `feat!: drop support for IE11`).

### Pre-Commit Checklist

Before committing code, ensure:

1. **Tests Pass**:

   ```bash
   bun run test
   ```

2. **Code is Linted**:

   ```bash
   bun run lint
   ```

3. **Code is Formatted**:

   ```bash
   bun run format
   ```

4. **Build Succeeds**:
   ```bash
   bun run build
   ```

### Testing Requirements

- Add/update tests for any code changes
- Maintain or improve code coverage
- Test both success and error scenarios
- Run the full test suite before submitting PRs

### Documentation Requirements

- Update documentation for any new features or changes
- Include JSDoc comments for public APIs
- Update configuration examples if needed
- Keep the documentation website up-to-date:
  ```bash
  bun run docs:build
  ```

### Code Quality Standards

- Follow TypeScript best practices
- Maintain strict type safety
- Use ESLint and Prettier configurations
- Keep components modular and reusable
- Follow Home Assistant's custom card guidelines

## Build and Development Scripts

- `bun run build` - Build the production bundle
- `bun run test` - Run unit tests
- `bun run test:coverage` - Run tests with coverage report
- `bun run lint` - Lint and auto-fix code
- `bun run format` - Format code with Prettier
- `bun run docs:start` - Start documentation development server
- `bun run docs:build` - Build documentation site

## Getting Help

- Check existing documentation
- Review test files for component usage examples
- Reach out to maintainers through GitHub issues

Remember that this is a Home Assistant custom card, so all changes should maintain compatibility with Home Assistant's architecture and user experience guidelines.

## Expectations for AI Agents

- Do not introduce new dependencies without approval.
- Follow TypeScript strictness and Lit best practices.
- Ensure changes integrate seamlessly with Home Assistant’s Lovelace UI.
- Always update or add tests when modifying features.
- Update documentation (docs/) if behavior changes.
