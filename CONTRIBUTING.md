# Contributing to SamityWheel 🤝

Thank you for your interest in contributing to **SamityWheel**! We welcome bug fixes, architecture improvements, documentation enhancements, and feature suggestions from developers of all skill levels.

Please review this document to understand our contribution process, code conventions, and development guidelines.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: `v18.18.0` or higher (Node `v20.x` LTS recommended)
- **npm**: `v9.x` or higher
- **Git**

### 2. Fork & Clone
```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/SamityWheel.git
cd SamityWheel
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment & Database
```bash
# Copy example environment file
cp .env.example .env

# Generate Prisma Client & apply SQLite schema
npx prisma db push

# Populate with realistic test data (users, deposits, winners)
npx tsx prisma/seed.ts
```

### 5. Start Local Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌿 Git Branching & Workflow

We follow a feature-branch workflow based on GitHub Flow:

1. **Keep `main` clean**: Never commit directly to `main`.
2. **Branch Naming**:
   - `feat/feature-name` — for new features or capabilities
   - `fix/bug-description` — for bug fixes and patches
   - `docs/doc-updates` — for documentation revisions
   - `perf/optimization` — for performance improvements
   - `refactor/component-name` — for refactoring existing code without changing behavior
3. **Branch from Latest `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

---

## 📝 Commit Message Guidelines

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Commit Types:
- `feat`: A new feature (e.g., `feat(wheel): add audio tick throttle on fast spins`)
- `fix`: A bug fix (e.g., `fix(deposit): resolve dynamic admin phone lookup in cash instructions`)
- `docs`: Documentation only changes (e.g., `docs(readme): update quickstart and seed instructions`)
- `style`: Changes that do not affect code logic (whitespace, formatting)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Build process or tooling changes (e.g., `chore(deps): bump prisma to 6.4.1`)

---

## 💻 Coding Standards & Conventions

### 1. TypeScript Strictness
- Avoid using `any`. Write explicit interfaces or types under `src/types/` or co-located with components.
- Ensure `npx tsc --noEmit` passes with 0 errors before creating a Pull Request.

### 2. React 19 & Next.js 15 Guidelines
- **Server Components by Default**: Place `'use client'` only at the top of components that require hooks, event listeners, or browser APIs.
- **State Management**: Keep UI state scoped cleanly in React context or localized within components.
- **Async Handling**: Handle loading and error states gracefully with clean UI indicators.

### 3. Styling & Accessibility
- Follow mobile-first design tokens with Tailwind CSS.
- Ensure color contrast ratios meet WCAG AA standards.
- Maintain touch target sizes of at least 44x44px for buttons and interactive elements.
- Always include `aria-label` or visible text for icon-only buttons.

### 4. Database & Prisma Integrity
- Never write destructive migrations or schema changes without providing an upgrade path.
- Wrap multi-table operations in interactive Prisma transactions (`db.$transaction`).
- Maintain tenant isolation and authorization checks on all `/api/samity/[id]/*` route handlers.

---

## 🔍 Pull Request Checklist

Before submitting your PR, make sure you have completed the following steps:

- [ ] Code builds without errors: `npm run build`
- [ ] TypeScript type checks pass: `npx tsc --noEmit`
- [ ] ESLint linter passes: `npm run lint`
- [ ] New features or fixes are documented in `README.md` or relevant markdown files.
- [ ] Database schema changes (if any) are accompanied by updated seed scripts or migration notes.
- [ ] Screenshots or screen recordings are attached for UI changes.

---

## 📬 Need Help?

If you have questions or need guidance on an implementation idea, feel free to open a [GitHub Discussion](https://github.com/your-username/SamityWheel/discussions) or create a draft Pull Request with your questions.
