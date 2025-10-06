# Architecture Documentation

## Project Structure

The T-shirt Estimator application has been refactored into a modular structure for better maintainability and scalability.

### File Organization

```
TshirtEstimator/
├── index.html           # Pure structural HTML
├── styles.css           # All custom CSS styles
├── firebase-config.js   # Firebase configuration
├── firebase-service.js  # Firebase operations
├── ui.js               # UI manipulation functions
└── app.js              # Main application logic
```

## Module Descriptions

### index.html
- **Purpose**: Pure structural HTML markup
- **Size**: ~107 lines
- **Responsibility**: Document structure and semantic markup
- **Key Features**:
  - Utilizes Pico CSS framework for base styling
  - Links to external CSS and JavaScript modules
  - Clean, semantic HTML5 structure

### styles.css
- **Purpose**: Custom CSS styles
- **Size**: ~134 lines
- **Responsibility**: Application-specific styling
- **Key Features**:
  - CSS variables for theming
  - Grid layouts for responsive design
  - Status indicators and messaging styles
  - Utility classes (`.hidden`, `.section`, etc.)

### firebase-config.js
- **Purpose**: Firebase configuration
- **Size**: ~10 lines
- **Responsibility**: Store Firebase project settings
- **Exports**: `firebaseConfig` object
- **Note**: Update this file with your own Firebase credentials

### firebase-service.js
- **Purpose**: Firebase initialization and database operations
- **Size**: ~60 lines
- **Responsibility**: All Firebase-related functionality
- **Key Functions**:
  - `createSession()` - Create a new estimation session
  - `getSession()` - Retrieve session data
  - `subscribeToSession()` - Real-time session updates
  - `submitEstimate()` - Submit participant estimates
- **Exports**: Firebase service functions and `db` instance

### ui.js
- **Purpose**: DOM manipulation and UI updates
- **Size**: ~125 lines
- **Responsibility**: All user interface updates
- **Key Features**:
  - `elements` object - Cached DOM element references
  - `switchToEstimationView()` - View navigation
  - `updateSessionUI()` - Update UI with session data
  - `updateParticipantsList()` - Display participant status
  - `showResults()` - Display estimation results
- **Exports**: UI manipulation functions and element references

### app.js
- **Purpose**: Main application logic and event handling
- **Size**: ~200 lines
- **Responsibility**: Application flow and business logic
- **Key Features**:
  - Event listener setup
  - Session creation and joining logic
  - State management (currentSession, currentParticipant)
  - Real-time subscription management
  - Proquint session ID generation (pronounceable, memorable IDs)
- **Key Functions**:
  - `uint16ToProquint()` - Converts 16-bit numbers to pronounceable 5-character strings
  - `generateSessionId()` - Generates proquint-encoded session IDs (e.g., "lusab-babad")
- **Entry Point**: Initializes the application on load

## Module Dependencies

```
app.js
├── firebase-service.js
│   └── firebase-config.js
└── ui.js

index.html
├── styles.css
└── app.js (module)
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each file has a single, well-defined responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Reusability**: Modules can be imported and used independently
4. **Testability**: Individual modules can be tested in isolation
5. **Scalability**: Adding new features is straightforward
6. **Readability**: Code is organized logically and easier to navigate

## Development Guidelines

### Adding New Features

1. **UI Changes**: Update `styles.css` and/or HTML structure
2. **New Firebase Operations**: Add functions to `firebase-service.js`
3. **New UI Components**: Add functions to `ui.js`
4. **New Business Logic**: Add to `app.js`

### Best Practices

- Keep the HTML structural and semantic
- Use Pico CSS utility classes where possible
- Place custom styles in `styles.css`
- Keep Firebase operations in `firebase-service.js`
- Keep DOM manipulation in `ui.js`
- Keep business logic in `app.js`

## Browser Compatibility

The application uses ES6 modules, which are supported in:
- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest (10.1+)
- Opera: ✅ Latest

**Note**: Requires a web server for local development due to CORS restrictions on ES6 modules.
