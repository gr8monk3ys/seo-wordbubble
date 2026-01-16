# TODO - Production Readiness

## CI/CD

- [x] GitHub Actions workflow for CI (build, lint, type-check)
- [x] GitHub Actions workflow for running tests
- [x] Dependabot configuration for dependency updates

## Testing

- [x] Set up Vitest for unit testing
- [x] Add tests for API route (`/api/analyze`)
- [x] Add tests for utility functions and hooks (`useRateLimit`)
- [x] Add component tests for key components (`TopicInput`, `KeywordList`)

## Security & Configuration

- [x] Add security headers (CSP, X-Frame-Options, etc.)
- [x] Environment variable validation on startup
- [x] Add health check endpoint (`/api/health`)

## Infrastructure

- [x] Dockerfile for containerized deployment
- [x] Docker Compose for local development
- [x] Add `.nvmrc` for Node version pinning

## Code Quality

- [x] Add Prettier configuration
- [x] Add pre-commit hooks with Husky + lint-staged
