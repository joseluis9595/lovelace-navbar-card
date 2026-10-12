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
  - Biome - Linting & formatting with TypeScript support
  - TypeScript compiler - Static type checking

## Development Workflow

### Branch Strategy

- `main` - Stable branch containing production-ready code
- `develop` - Main development branch where features are integrated; changes merged here are considered release-ready
- `feature/*` - Feature branches for new development
- `release/*` - Release branches created from `develop` when preparing a release

### Pull Request Process

1. All Pull Requests must target the `develop` branch
2. PRs are merged into `develop` after review and testing
3. Assume all changes merged into `develop` are ready to be included in the next release
4. For releases, create a `release/<version>` branch from `develop` (e.g. `release/1.6.0`, matching `package.json`) and open a PR into `main`
5. When that PR is merged, CI creates a draft GitHub release and merges `main` back into `develop`

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

1. **Code is formatted and linted with Biome** (required — CI runs `lint:check` without auto-fix):

   ```bash
   bun run lint
   ```

   This runs `biome check --write`, which applies formatting, import organization, and other safe fixes. Commit the resulting changes before pushing.

2. **Tests Pass**:

   ```bash
   bun run test
   ```

3. **Build Succeeds**:

   ```bash
   bun run build
   ```

4. **Docs build** (if you changed documentation):

   ```bash
   cd docs && bun run docs:build
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
  cd docs && bun run docs:build
  ```

### Code Quality Standards

- Follow TypeScript best practices
- Maintain strict type safety
- Use the Biome configuration for linting/formatting
- Keep components modular and reusable
- Follow Home Assistant's custom card guidelines

## Build and Development Scripts

- `bun run build` - Build the production bundle
- `bun run test` - Run unit tests
- `bun run test:watch` - Run unit tests in watch mode
- `bun run test:coverage` - Run tests with coverage report
- `bun run lint` - Run Biome check with auto-fix (use before committing)
- `bun run lint:check` - Run Biome check without auto-fix (same as CI)
- `bun run format` - Format `src/**/*.ts` with Biome

Documentation scripts live in the `docs/` package:

- `cd docs && bun run docs:start` - Start documentation development server
- `cd docs && bun run docs:build` - Build documentation site

## Continuous Integration

GitHub Actions workflows in `.github/workflows/`:

- **`ci.yml`** — Runs on PRs to `develop`/`main` and on pushes to `develop`. For PRs to `main`, validates the source branch is `release/<version>` matching `package.json` before running lint, tests, build, and docs.
- **`release.yml`** — On merge of a release PR into `main`, runs CI, creates a draft release, and merges `main` into `develop`.
- **`deploy-docs.yaml`** — Deploys the docs site to GitHub Pages on pushes to `main`.
- **`hacs-action.yml`** — Validates HACS compatibility.
- **`stale.yml`** — Manages stale issues.

Shared CI steps are defined in `.github/actions/`.

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
- Update documentation (`docs/`) if behavior changes.
- Run `bun run lint` before committing so Biome formatting and lint fixes are applied; CI will fail if `lint:check` does not pass.
