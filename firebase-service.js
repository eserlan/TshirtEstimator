import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
let app, db, analytics;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Failed to initialize Firebase. Please check your configuration.');
}

// Database operations
export async function createSession(sessionId, taskDescription, participants) {
    await setDoc(doc(db, 'sessions', sessionId), {
        taskDescription: taskDescription,
        participants: participants,
        createdAt: serverTimestamp(),
        allSubmitted: false
    });
}

export async function getSession(sessionId) {
    const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
    return sessionDoc;
}

export function subscribeToSession(sessionId, callback, errorCallback) {
    return onSnapshot(doc(db, 'sessions', sessionId), callback, errorCallback);
}

export async function submitEstimate(sessionId, currentParticipant, size) {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const participants = sessionData.participants;
        
        // Update participant's estimate
        participants[currentParticipant].estimate = size;
        participants[currentParticipant].submitted = true;
        
        // Check if all submitted
        const allSubmitted = Object.values(participants).every(p => p.submitted);
        
        await updateDoc(sessionRef, {
            participants: participants,
            allSubmitted: allSubmitted
        });
    }
}

export async function addParticipant(sessionId, participantName) {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const participants = sessionData.participants;

        // Check if participant already exists
        if (participants[participantName]) {
            throw new Error('Participant already exists');
        }

        // Add new participant
        participants[participantName] = {
            name: participantName,
            estimate: null,
            submitted: false
        };

        // Update allSubmitted status
        const allSubmitted = Object.values(participants).every(p => p.submitted);

        await updateDoc(sessionRef, {
            participants: participants,
            allSubmitted: allSubmitted
        });
    }
}
