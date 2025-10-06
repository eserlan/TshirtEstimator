# Test Suite Documentation

This directory contains the test suite for the TshirtEstimator application using Vitest.

## Test Files

### `utils.test.js`
Tests for utility functions and business logic:
- Session ID generation
- Participant name parsing
- Participants object creation
- Submission status checking
- T-shirt size validation

### `dom.test.js`
Tests for DOM manipulation and UI behavior:
- View switching between setup and estimation views
- Session ID and task title display
- Participants list rendering
- Results display logic
- Form element handling
- CSS class manipulation

### `data-structures.test.js`
Tests for data structure validation and transformations:
- Session data structure validation
- Participant state management
- T-shirt size validation
- Session ID generation and uniqueness
- Data transformations (arrays to objects, etc.)
- Edge cases handling

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Strategy

The test suite focuses on:

1. **Business Logic**: Testing the core logic and algorithms without depending on external services
2. **DOM Manipulation**: Testing UI behavior in a simulated browser environment using happy-dom
3. **Data Structures**: Validating data models and transformations used throughout the application

### Why This Approach?

The application uses Firebase with CDN imports (https:// URLs), which makes it challenging to mock in a Node.js test environment. Instead of trying to mock the entire Firebase SDK, the tests focus on:

- **Testable logic**: Pure functions and algorithms that don't depend on Firebase
- **DOM behavior**: UI interactions and rendering logic
- **Data structures**: Ensuring data is correctly shaped and transformed

This approach provides good test coverage while avoiding the complexity of mocking Firebase's real-time database.

## Test Coverage

The current test suite covers:
- ✅ Session ID generation and uniqueness
- ✅ Participant data parsing and creation
- ✅ Submission status tracking
- ✅ UI view switching
- ✅ Participant list rendering
- ✅ Results display logic
- ✅ Form handling
- ✅ Data structure validation
- ✅ Edge cases and error handling

## Adding New Tests

When adding new features, consider:

1. **Extract testable logic**: If possible, extract business logic into pure functions that can be easily tested
2. **Test UI behavior**: Use happy-dom to test DOM manipulation without a real browser
3. **Validate data structures**: Ensure new data structures are well-formed and validated

Example test structure:

```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Configuration

Tests are configured in `vitest.config.js`:
- Environment: `happy-dom` (lightweight DOM simulation)
- Globals: Enabled (no need to import describe, it, expect in every file)
- Coverage: Configured to exclude test files and config files

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test
  
- name: Generate coverage
  run: npm run test:coverage
```
