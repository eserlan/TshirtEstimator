import { createSession, getSession, subscribeToSession, submitEstimate } from './firebase-service.js';
import { elements, switchToEstimationView, switchToSetupView, updateSessionUI } from './ui.js';

// Global state
let currentSession = null;
let currentParticipant = null;
let unsubscribe = null;

// Generate random session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize the application
function init() {
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Create session form
    elements.createSessionForm.addEventListener('submit', handleCreateSession);
    
    // Join session form
    elements.joinSessionForm.addEventListener('submit', handleJoinSession);
    
    // Back button
    elements.backButton.addEventListener('click', handleBackButton);
    
    // Estimate buttons
    document.querySelectorAll('.estimate-btn').forEach(button => {
        button.addEventListener('click', handleEstimateSubmission);
    });
}

// Handle create session
async function handleCreateSession(e) {
    e.preventDefault();
    
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const participantNames = document.getElementById('participantNames').value
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (participantNames.length === 0) {
        alert('Please enter at least one participant name');
        return;
    }
    
    const sessionId = generateSessionId();
    
    // Create participants object
    const participants = {};
    participantNames.forEach(name => {
        participants[name] = {
            name: name,
            estimate: null,
            submitted: false
        };
    });
    
    try {
        await createSession(sessionId, taskDescription, participants);
        
        // Prompt user to select their name
        const participantName = prompt(`Session created! Select your name:\n${participantNames.join(', ')}`);
        if (participantName && participants[participantName]) {
            currentParticipant = participantName;
            loadSession(sessionId);
        } else {
            alert('Invalid participant name. Please join the session with a valid name.');
            elements.currentSessionId.textContent = sessionId;
        }
    } catch (error) {
        console.error('Error creating session:', error);
        alert('Failed to create session. Please try again.');
    }
}

// Handle join session
async function handleJoinSession(e) {
    e.preventDefault();
    
    const sessionId = document.getElementById('sessionId').value.trim().toUpperCase();
    
    try {
        const sessionDoc = await getSession(sessionId);
        
        if (!sessionDoc.exists()) {
            alert('Session not found. Please check the session ID.');
            return;
        }
        
        const sessionData = sessionDoc.data();
        const participantNames = Object.keys(sessionData.participants);
        
        // Prompt user to select their name
        const participantName = prompt(`Select your name:\n${participantNames.join(', ')}`);
        if (participantName && sessionData.participants[participantName]) {
            currentParticipant = participantName;
            loadSession(sessionId);
        } else {
            alert('Invalid participant name. Please select a valid participant.');
        }
    } catch (error) {
        console.error('Error joining session:', error);
        alert('Failed to join session. Please try again.');
    }
}

// Load session and set up real-time listener
function loadSession(sessionId) {
    currentSession = sessionId;
    
    // Switch views
    switchToEstimationView(sessionId);
    
    // Set up real-time listener
    if (unsubscribe) {
        unsubscribe();
    }
    
    unsubscribe = subscribeToSession(
        sessionId,
        (doc) => {
            if (doc.exists()) {
                updateSessionUI(doc.data(), currentParticipant);
            } else {
                alert('Session no longer exists');
                goBackToSetup();
            }
        },
        (error) => {
            console.error('Error listening to session:', error);
            alert('Error loading session data');
        }
    );
}

// Handle estimate submission
async function handleEstimateSubmission(e) {
    const size = e.target.getAttribute('data-size');
    
    if (!currentSession || !currentParticipant) {
        alert('Error: Session or participant not set');
        return;
    }
    
    try {
        await submitEstimate(currentSession, currentParticipant, size);
    } catch (error) {
        console.error('Error submitting estimate:', error);
        alert('Failed to submit estimate. Please try again.');
    }
}

// Handle back button
function handleBackButton() {
    goBackToSetup();
}

// Go back to setup view
function goBackToSetup() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    
    currentSession = null;
    currentParticipant = null;
    
    switchToSetupView();
}

// Start the application
init();
