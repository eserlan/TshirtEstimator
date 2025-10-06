import { createSession, getSession, subscribeToSession, submitEstimate, addParticipant } from './firebase-service.js';
import { elements, switchToEstimationView, switchToSetupView, updateSessionUI } from './ui.js';

// Global state
let currentSession = null;
let currentParticipant = null;
let unsubscribe = null;

// Show participant selection modal
function showParticipantModal(participants, sessionId, alreadySelectedParticipants = []) {
    // Resolve modal elements lazily to support test environments
    const participantModal = document.getElementById('participantModal');
    const participantButtonList = document.getElementById('participantButtonList');

    return new Promise((resolve) => {
        // Clear previous buttons
        participantButtonList.innerHTML = '';

        // Create button for each participant
        participants.forEach(participantName => {
            const button = document.createElement('button');
            button.textContent = participantName;
            button.classList.add('participant-select-btn');

            // Disable if already selected
            if (alreadySelectedParticipants.includes(participantName)) {
                button.disabled = true;
                button.textContent = `${participantName} (already joined)`;
            }

            button.addEventListener('click', () => {
                participantModal.close();
                resolve(participantName);
            });

            participantButtonList.appendChild(button);
        });

        // Add "View Results" button that's always enabled
        const viewResultsButton = document.createElement('button');
        viewResultsButton.textContent = '👁️ View Results';
        viewResultsButton.classList.add('secondary', 'outline');
        viewResultsButton.addEventListener('click', () => {
            participantModal.close();
            resolve('__VIEW_RESULTS__');
        });
        participantButtonList.appendChild(viewResultsButton);

        // Add "Join as New Participant" button
        const joinNewButton = document.createElement('button');
        joinNewButton.textContent = '➕ Join as New Participant';
        joinNewButton.classList.add('secondary');
        joinNewButton.addEventListener('click', () => {
            participantModal.close();
            resolve('__JOIN_NEW__');
        });
        participantButtonList.appendChild(joinNewButton);

        // Show the modal
        participantModal.showModal();

        // Handle modal close without selection
        participantModal.addEventListener('close', () => {
            if (!participantModal.returnValue) {
                resolve(null);
            }
        }, { once: true });
    });
}

// Proquint encoding for session IDs
// Converts random bytes to pronounceable identifiers
function uint16ToProquint(n) {
    const consonants = 'bdfghjklmnprstvz';
    const vowels = 'aiou';
    
    let result = '';
    result += consonants[(n >> 12) & 0x0f];
    result += vowels[(n >> 10) & 0x03];
    result += consonants[(n >> 6) & 0x0f];
    result += vowels[(n >> 4) & 0x03];
    result += consonants[n & 0x0f];
    
    return result;
}

// Generate random session ID using proquint encoding
export function generateSessionId() {
    // Generate two 16-bit random numbers
    const n1 = Math.floor(Math.random() * 65536);
    const n2 = Math.floor(Math.random() * 65536);
    
    // Convert to proquint format: lusab-babad
    return uint16ToProquint(n1) + '-' + uint16ToProquint(n2);
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

    // Join session button on results page
    const joinSessionButton = document.getElementById('joinSessionButton');
    if (joinSessionButton) {
        joinSessionButton.addEventListener('click', handleJoinFromResults);
    }
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
        const participantName = await showParticipantModal(participantNames, sessionId);
        if (participantName === '__VIEW_RESULTS__') {
            // View-only mode - load session without participant
            currentParticipant = null;
            loadSession(sessionId);
        } else if (participantName === '__JOIN_NEW__') {
            // Join as new participant
            await handleJoinAsNewParticipant(sessionId);
        } else if (participantName && participants[participantName]) {
            currentParticipant = participantName;
            loadSession(sessionId);
        } else if (participantName) {
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
    
    const sessionId = document.getElementById('sessionId').value.trim().toLowerCase();
    
    try {
        const sessionDoc = await getSession(sessionId);
        
        if (!sessionDoc.exists()) {
            alert('Session not found. Please check the session ID.');
            return;
        }
        
        const sessionData = sessionDoc.data();
        const participantNames = Object.keys(sessionData.participants);
        
        // Find participants who have already submitted estimates
        const participantsWithEstimates = participantNames.filter(
            name => sessionData.participants[name].estimate !== null
        );

        // Prompt user to select their name
        const participantName = await showParticipantModal(participantNames, sessionId, participantsWithEstimates);
        if (participantName === '__VIEW_RESULTS__') {
            // View-only mode - load session without participant
            currentParticipant = null;
            loadSession(sessionId);
        } else if (participantName === '__JOIN_NEW__') {
            // Join as new participant
            await handleJoinAsNewParticipant(sessionId);
        } else if (participantName && sessionData.participants[participantName]) {
            currentParticipant = participantName;
            loadSession(sessionId);
        } else if (participantName) {
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

// Start the application (only in browser, not during tests)
// Avoid running during Vitest by checking common env markers
const isVitest = (typeof process !== 'undefined' && (process.env?.VITEST || process.env?.NODE_ENV === 'test'))
  || (typeof globalThis !== 'undefined' && (globalThis.__VITEST__ || globalThis.vitest));
if (!isVitest && typeof window !== 'undefined' && typeof document !== 'undefined') {
    init();
}

// Handle joining as new participant
async function handleJoinAsNewParticipant(sessionId) {
    const newName = prompt('Enter a name to join as a new participant:');
    if (newName) {
        try {
            await addParticipant(sessionId, newName);
            currentParticipant = newName;
            loadSession(sessionId);
        } catch (error) {
            console.error('Error adding participant:', error);
            alert('Failed to join as new participant. Please try again.');
        }
    }
}

// Handle join from results page
async function handleJoinFromResults() {
    if (!currentSession) {
        alert('No active session');
        return;
    }

    try {
        const sessionDoc = await getSession(currentSession);

        if (!sessionDoc.exists()) {
            alert('Session not found.');
            return;
        }

        const sessionData = sessionDoc.data();
        const participantNames = Object.keys(sessionData.participants);

        // Find participants who have already submitted estimates
        const participantsWithEstimates = participantNames.filter(
            name => sessionData.participants[name].estimate !== null
        );

        // Show modal to select or join as new
        const participantName = await showParticipantModal(participantNames, currentSession, participantsWithEstimates);

        if (participantName === '__VIEW_RESULTS__') {
            // Already viewing results, do nothing
            return;
        } else if (participantName === '__JOIN_NEW__') {
            // Join as new participant
            await handleJoinAsNewParticipant(currentSession);
        } else if (participantName && sessionData.participants[participantName]) {
            currentParticipant = participantName;
            loadSession(currentSession);
        }
    } catch (error) {
        console.error('Error joining from results:', error);
        alert('Failed to join session. Please try again.');
    }
}

// Test helpers: expose selected internals for unit tests without changing runtime behavior
export const __test = {
    _getState: () => ({ currentSession, currentParticipant, unsubscribe }),
    _setState: (s = {}) => {
        if ('currentSession' in s) currentSession = s.currentSession;
        if ('currentParticipant' in s) currentParticipant = s.currentParticipant;
        if ('unsubscribe' in s) unsubscribe = s.unsubscribe;
    }
};

// Export internal functions to enable direct testing
export {
    showParticipantModal,
    // proquint helper intentionally kept private; generateSessionId uses it
    // lifecycle and handlers
    // (exported for tests only; no change to production imports)
    // eslint-disable-next-line
    init,
    setupEventListeners,
    handleCreateSession,
    handleJoinSession,
    loadSession,
    handleEstimateSubmission,
    handleBackButton,
    goBackToSetup,
    handleJoinAsNewParticipant,
    handleJoinFromResults
};
