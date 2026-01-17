# AI Agent Testing Guide

This document provides guidance on testing the AI Agent implementation.

## Test Structure

```
src/
├── domain/
│   └── services/
│       └── __tests__/
│           ├── EditIntentDetector.test.ts
│           ├── AgentOrchestrator.integration.test.ts
│           └── ...
├── data/
│   └── repositories/
│       └── __tests__/
│           ├── TransactionDraftRepository.test.ts
│           └── ...
└── test/
    └── setup.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Categories

### Unit Tests

**EditIntentDetector**:
- ✅ Amount detection with various patterns
- ✅ Pool detection with keywords
- ✅ Category detection
- ✅ Date detection (yesterday, today, etc.)
- ✅ Purpose, type, and notes detection
- ✅ Case insensitivity
- ✅ Unclear intent handling

**TargetedFieldExtractor**:
- Field-specific extraction
- Hint resolution
- Confidence calculation

### Integration Tests

**AgentOrchestrator**:
- ✅ Confirmation flow (confirm, cancel)
- ✅ Edit loop with field detection
- ✅ Cancel keyword detection
- State transitions
- Error handling

### Repository Tests

**TransactionDraftRepository**:
- ✅ Data conversion (Firestore ↔ Entity)
- ✅ Status transitions
- ✅ Query methods
- ✅ CRUD operations

## Mocking Strategy

### Gemini API

The Gemini API is mocked in tests to avoid actual API calls:

```typescript
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => ({
        getGenerativeModel: vi.fn(() => ({
            generateContent: vi.fn(() => Promise.resolve({
                response: {
                    text: () => JSON.stringify({ /* mock response */ })
                }
            }))
        }))
    }))
}));
```

### Firestore

Firestore is mocked using Vitest:

```typescript
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    // ... other Firestore functions
}));
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows covered

## Known Limitations

1. **Gemini API**: Tests use mocked responses, not actual API calls
2. **Firestore**: Tests use mocked Firestore, not actual database
3. **Async Operations**: Some tests may require additional async handling

## Next Steps

1. Add more edge case tests
2. Add E2E tests with real Firestore emulator
3. Add performance tests
4. Add accessibility tests for UI components

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```
