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
6. **No self-explanatory comments**: Avoid obvious comments like `// Props to make component flexible` or `// Generate palette rules`
7. **Meaningful comments only**: Add comments only when explaining complex business logic, algorithms, or non-obvious implementation details
8. **Code should be self-documenting**: Write clear, readable code that doesn't require explanatory comments for basic functionality
9. **Custom error classes**: Place all custom errors in `src/errors/` folder
10. **Error message standards**: Custom errors should have built-in messages and only accept relevant parameters (e.g., hex value, not full message)
11. **Prefer Quasar CSS utilities**: Always prefer Quasar CSS utility classes (e.g., `q-pa-md`, `q-mt-lg`, `text-center`, `row`, `col`) over defining custom style rules in components
12. **Nested component styles**: When custom component styles are necessary, write them using nested CSS syntax within the component's `<style>` block
13. **Translation syntax validation**: After changing any translation files, always run a Vite syntax check (for example `npm run build`) to ensure parsing does not fail

## Configuration Files

- **`src/config/colors.yml`**: Color configuration for placeholder tiles
- **`src/utils/colors.js`**: Color conversion utilities (hexToRgb)
- **`src/utils/quasar-utils.js`**: Quasar CSS variable access utilities

## Component Architecture

- **DecorativePlaceholderTile**: Base component for placeholder tiles with dynamic color generation
- **LoadingSkeletonTile**: Extends DecorativePlaceholderTile for loading states
- **Composition over inheritance**: Use props and slots for component flexibility

## Error Organization

- **`src/errors/`**: Dedicated folder for all custom error classes
- **Error naming**: Use descriptive names ending with 'Error' (e.g., `InvalidHexColorError`)
- **Error parameters**: Accept only relevant data, build messages internally
- **Direct imports**: Import directly from error files unless multiple errors exist

## GitHub CLI Usage

- **Check for `gh` availability**: If asked to create a pull request, first check if the `gh` command is available locally
- **Use `gh` for PR creation**: When `gh` is available, use it to create pull requests (e.g., `gh pr create`)
- **Fallback to manual instructions**: If `gh` is not available, provide manual instructions for creating a PR
