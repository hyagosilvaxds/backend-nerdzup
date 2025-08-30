# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build the project for production
- `npm run start:prod` - Run production build

### Code Quality Commands
- `npm run lint` - Run ESLint with automatic fixes
- `npm run format` - Format code using Prettier

### Testing Commands
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests with debugging

## Architecture

This is a NestJS TypeScript backend application using a standard modular architecture:

- **Entry Point**: `src/main.ts` - Bootstrap application on port 3000 (or PORT env var)
- **Module System**: Standard NestJS module pattern with `AppModule` as root module
- **Controller-Service Pattern**: Controllers handle HTTP requests, services contain business logic
- **Decorator-based**: Uses NestJS decorators for dependency injection, routing, and metadata

### Key Configuration
- **TypeScript**: ES2023 target with experimental decorators enabled
- **Module Resolution**: Node.js Next with package.json exports support
- **Testing**: Jest with ts-jest transformer, coverage reports in `/coverage`
- **Code Style**: Prettier with single quotes and trailing commas, ESLint with TypeScript rules
- **Build Output**: Compiled to `/dist` directory

### Project Structure
```
src/
├── main.ts           # Application entry point
├── app.module.ts     # Root module
├── app.controller.ts # Root controller
└── app.service.ts    # Root service
```

The application follows NestJS conventions where new features should be organized into feature modules with their own controllers, services, and potentially guards, pipes, or interceptors as needed.