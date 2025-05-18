# Contributing to lovelace-navbar-card

Thank you for your interest in contributing! We use the **GitFlow** workflow, with `main` for releases and `develop` for ready-to-ship work. This document explains how to file issues, set up your environment, follow our code standards, and submit pull requests.

---

## 1. Filing Issues

If you’ve found a bug or would like to request a feature, please use the **Issues** tab on GitHub. Provide as much detail as you can:

* **Bug reports**: Steps to reproduce, expected vs. actual behavior, version number.
* **Feature requests**: What you want to achieve and why it’s useful.

Be sure to search existing issues before opening a new one.

---

## 2. Getting Started

1. **Fork** this repository and **clone** your fork:

   ```bash
   git clone https://github.com/<your-username>/lovelace-navbar-card.git
   cd lovelace-navbar-card
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Build navbar-card**:

   ```bash
   bun run build
   ```

---

## 3. Branching Model (GitFlow)

We follow the **GitFlow** workflow, which helps organize development and releases:

* **`main`**

  * Contains only **released** code.
  * All merges to `main` trigger the build & release workflow.

* **`develop`**

  * Integration branch for features and fixes.
  * Contributors open pull requests **from their forks** into `develop`.

* **Support branches** (optional, for maintainers):

  * `release/*` – Prepare a new production release (branch off `develop`).
  * `hotfix/*`  – Quick patches to `main` (branch off `main`).

---

## 4. Pull Request Process

1. **Create a branch** in your fork, named according to the type of work:

   * `feature/<short-description>`
   * `fix/<short-description>`
   * `docs/<short-description>`

2. **Keep your branch up to date**:

   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

3. **Open a Pull Request** against `joseluis9595:develop`. In your PR description include:

   * **What** you’ve changed and **why**.
   * How to **test** your change locally.
   * Link to any related issues.

4. **Automated checks** (CI) will run lint, build, and tests on your PR.

5. **Review**: At least one approving review is required before merging.

6. **Squash & merge**: We maintain a linear history—please use squash merges or rebase commits.

---

## 5. Code Style & Linting

* We use **ESLint** + **Prettier**; configuration files are included in the repo.

* To lint & format your changes:

  ```bash
  bun lint
  bun format
  ```

* CI will block merges if linting or formatting issues are detected.

---

## 6. Commit Message Conventions

We follow **Conventional Commits** to generate a clear changelog and automate versioning:

```
<type>[optional scope]: <short description>

[optional body]

[optional footer]
```

* **Types**:

  * `feat`: a new feature
  * `fix`: a bug fix
  * `chore`: build process or tooling changes
  * `docs`: documentation only changes
  * `refactor`: code change that neither fixes a bug nor adds a feature

* **Breaking changes**: add `!` after the type (e.g., `feat!: drop support for IE11`).

---

## 7. Testing

* Write new tests under `__tests__`.

* Run tests locally with:

  ```bash
  bun test
  ```

* Ensure all tests pass before opening your PR.

---

## 8. Versioning & Releases

We use **Semantic Versioning (SemVer) 2.0.0)**:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backwards-compatible manner
3. **PATCH** version when you make backwards-compatible bug fixes

To release a new version:

1. **Update** the `version` field in `package.json`.
2. Create a **`release/*`** branch if needed for final testing.
3. Merge `develop` → `main` (CI will tag & publish the release).

> CI automatically builds, tags, and publishes to npm on merges to `main`.

---

## 9. Getting Help

* **Home Assistant Community**:
  [navbar-card discussion](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/)

---

Thanks for helping make **lovelace-navbar-card** better! If you have any questions, feel free to open an issue or reach out on the Home Assistant community forum.
