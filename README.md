# TshirtEstimator

A real-time web application for collaborative T-shirt size estimation. Multiple participants can provide estimates for a task, with results revealed only when everyone has submitted.

## Features

- 🎯 **Real-time Collaboration**: Multiple participants can estimate simultaneously
- 👕 **T-shirt Sizing**: Use standard sizes (XS, S, M, L, XL, XXL) for estimation
- 🔒 **Hidden Results**: Estimates remain hidden until all participants submit
- 🔥 **Firebase Integration**: Real-time data synchronization with Firestore
- 🎨 **Modern UI**: Clean, responsive design using Pico CSS
- 📱 **Mobile-Friendly**: Works seamlessly on all devices

## Getting Started

### Prerequisites

- A modern web browser
- Firebase project (for production use)

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database:
   - Go to "Build" > "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon (</>)
   - Copy the Firebase configuration object
4. Update the `firebaseConfig` object in `firebase-config.js` with your credentials

### Running the Application

**Note**: This application uses ES6 modules and requires a web server to run (cannot be opened directly as `file://`).

1. Serve the application using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```
3. Navigate to `http://localhost:8000` (or the appropriate port)

## How to Use

### Creating a Session

1. Enter a task description (e.g., "Implement user authentication")
2. Enter participant names separated by commas (e.g., "Alice, Bob, Charlie")
3. Click "Create Session"
4. Select your name from the prompt
5. Share the Session ID with other participants

### Joining a Session

1. Get the Session ID from the session creator
2. Enter the Session ID in the "Join Existing Session" form
3. Click "Join Session"
4. Select your name from the list of participants

### Submitting an Estimate

1. Once in the session, click one of the T-shirt size buttons (XS, S, M, L, XL, XXL)
2. Your estimate is immediately saved and marked as submitted
3. Wait for other participants to submit their estimates

### Viewing Results

- Results are automatically displayed when all participants have submitted
- Each participant's estimate is shown in individual cards
- All participants can see everyone's estimates simultaneously

## Technical Stack

- **HTML5**: Structure and semantic markup
- **JavaScript (ES6+ Modules)**: Application logic and Firebase integration
- **CSS3**: Styling with Pico CSS framework
- **Firebase Firestore**: Real-time database for storing and syncing estimates

## Project Structure

The application is organized into modular files for better maintainability:

```
TshirtEstimator/
├── index.html           # Pure structural HTML
├── styles.css           # Custom CSS styles
├── firebase-config.js   # Firebase configuration
├── firebase-service.js  # Firebase operations
├── ui.js               # UI manipulation
├── app.js              # Main application logic
└── ARCHITECTURE.md      # Detailed architecture documentation
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed information about the codebase structure.

## Database Architecture

The application uses a simple document-based structure in Firestore:

```
sessions/{sessionId}
  - taskDescription: string
  - participants: object
    - {participantName}: object
      - name: string
      - estimate: string | null
      - submitted: boolean
  - createdAt: timestamp
  - allSubmitted: boolean
```

## Security Considerations

For production use:
- Set up proper Firestore security rules
- Implement authentication
- Use environment variables for Firebase configuration
- Enable appropriate Firebase security features

## Browser Compatibility

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest
- Opera: ✅ Latest

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Testing

The application includes a comprehensive test suite using Vitest.

### Running Tests

```bash
# Install dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

See [tests/README.md](tests/README.md) for more information about the test suite.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.