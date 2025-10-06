// DOM element references - using getters for lazy initialization
export const elements = {
    get setupView() { return document.getElementById('setupView'); },
    get estimationView() { return document.getElementById('estimationView'); },
    get createSessionForm() { return document.getElementById('createSessionForm'); },
    get joinSessionForm() { return document.getElementById('joinSessionForm'); },
    get backButton() { return document.getElementById('backButton'); },
    get taskTitle() { return document.getElementById('taskTitle'); },
    get currentSessionId() { return document.getElementById('currentSessionId'); },
    get currentParticipantName() { return document.getElementById('currentParticipantName'); },
    get participantsList() { return document.getElementById('participantsList'); },
    get resultsSection() { return document.getElementById('resultsSection'); },
    get resultsGrid() { return document.getElementById('resultsGrid'); },
    get waitingSection() { return document.getElementById('waitingSection'); },
    get yourEstimationSection() { return document.getElementById('yourEstimationSection'); },
    get yourEstimateDisplay() { return document.getElementById('yourEstimateDisplay'); },
    get yourEstimate() { return document.getElementById('yourEstimate'); },
    get welcomeBanner() { return document.getElementById('welcomeBanner'); },
    get welcomeParticipantName() { return document.getElementById('welcomeParticipantName'); }
};

// UI update functions
export function switchToEstimationView(sessionId) {
    elements.currentSessionId.textContent = sessionId;
    elements.setupView.classList.add('hidden');
    elements.estimationView.classList.remove('hidden');
}

export function switchToSetupView() {
    elements.setupView.classList.remove('hidden');
    elements.estimationView.classList.add('hidden');
    
    // Reset forms (with fallback for test environments)
    if (elements.createSessionForm && typeof elements.createSessionForm.reset === 'function') {
        elements.createSessionForm.reset();
    }
    if (elements.joinSessionForm && typeof elements.joinSessionForm.reset === 'function') {
        elements.joinSessionForm.reset();
    }
}

export function updateSessionUI(sessionData, currentParticipant) {
    elements.taskTitle.textContent = `Task: ${sessionData.taskDescription}`;
    elements.currentParticipantName.textContent = currentParticipant || 'Viewing Results';

    // Update participants list
    updateParticipantsList(sessionData.participants);
    
    // Check if current participant has submitted
    const currentParticipantData = sessionData.participants[currentParticipant];
    updateEstimationSection(currentParticipantData);
    
    // Check if all submitted
    const allSubmitted = Object.values(sessionData.participants).every(p => p.submitted);
    
    if (allSubmitted) {
        showResults(sessionData.participants);
    } else if (currentParticipantData && currentParticipantData.submitted) {
        showWaitingMessage();
    } else {
        hideResultsAndWaiting();
    }

    // Show or hide welcome banner for named participants
    if (currentParticipant && currentParticipantData && !currentParticipantData.submitted) {
        if (elements.welcomeParticipantName) {
            elements.welcomeParticipantName.textContent = currentParticipant;
        }
        if (elements.welcomeBanner) {
            elements.welcomeBanner.classList.remove('hidden');
        }
    } else {
        if (elements.welcomeBanner) {
            elements.welcomeBanner.classList.add('hidden');
        }
    }
}

function updateParticipantsList(participants) {
    elements.participantsList.innerHTML = '';
    
    Object.values(participants).forEach(participant => {
        const item = document.createElement('div');
        item.className = `participant-item ${participant.submitted ? 'submitted' : ''}`;
        
        const name = document.createElement('span');
        name.textContent = participant.name;
        
        const status = document.createElement('span');
        status.className = `status-badge ${participant.submitted ? 'status-submitted' : 'status-pending'}`;
        status.textContent = participant.submitted ? '✓ Submitted' : '⏳ Pending';
        
        item.appendChild(name);
        item.appendChild(status);
        elements.participantsList.appendChild(item);
    });
}

function updateEstimationSection(currentParticipantData) {
    const estimationButtons = elements.yourEstimationSection.querySelector('.estimation-buttons');
    
    if (!currentParticipantData) {
        // Hide estimation section if no participant selected
        elements.yourEstimationSection.style.display = 'none';
    } else if (currentParticipantData.submitted) {
        elements.yourEstimationSection.style.display = 'block';
        estimationButtons.style.display = 'none';
        elements.yourEstimateDisplay.classList.remove('hidden');
        elements.yourEstimate.textContent = currentParticipantData.estimate;
    } else {
        elements.yourEstimationSection.style.display = 'block';
        estimationButtons.style.display = 'grid';
        elements.yourEstimateDisplay.classList.add('hidden');
    }
}

function showResults(participants) {
    elements.resultsSection.classList.remove('hidden');
    elements.waitingSection.classList.add('hidden');
    
    // Display results
    elements.resultsGrid.innerHTML = '';
    Object.values(participants).forEach(participant => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const name = document.createElement('div');
        name.textContent = participant.name;
        
        const estimate = document.createElement('div');
        estimate.className = 'result-estimate';
        estimate.textContent = participant.estimate;
        
        card.appendChild(name);
        card.appendChild(estimate);
        elements.resultsGrid.appendChild(card);
    });
}

function showWaitingMessage() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.remove('hidden');
}

function hideResultsAndWaiting() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.add('hidden');
}
