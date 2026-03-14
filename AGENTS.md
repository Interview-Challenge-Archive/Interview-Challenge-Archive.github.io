# AI Agents

This document provides guidance for AI agents assisting with development in this repository.

## Project Overview

- **Framework**: Quasar (Vue.js)
- **Build Tool**: Vite
- **Testing**: Vitest
- **Language**: JavaScript

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Code Style

- Follow existing project conventions
- Use ESLint configuration (`eslint.config.js`)
- Respect `.editorconfig` settings
- Keep components modular and reusable

## Architecture Notes

- Source code located in `src/`
- Public assets in `public/`
- Tests in `test/`
- Quasar configuration in `quasar.config.js`

## Agent Guidelines

1. **Read before writing**: Always examine existing code before making changes
2. **Test changes**: Run build and tests after modifications
3. **Preserve conventions**: Match existing naming, structure, and patterns
4. **Minimal changes**: Make targeted edits rather than large refactors
5. **Verify paths**: Use absolute paths when reading/writing files
