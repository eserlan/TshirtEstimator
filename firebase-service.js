import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
let app, db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
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

export { db };
