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

// T-shirt size utilities
const SIZE_VALUES = {
    'XS': 1,
    'S': 2,
    'M': 3,
    'L': 4,
    'XL': 5,
    'XXL': 6
};

const SIZE_NAMES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function calculateAverageSize(participants) {
    const estimates = Object.values(participants)
        .filter(p => p.estimate && p.submitted)
        .map(p => SIZE_VALUES[p.estimate]);

    if (estimates.length === 0) return null;

    const sum = estimates.reduce((acc, val) => acc + val, 0);
    return sum / estimates.length;
}

function getAverageSizeName(averageValue) {
    if (averageValue === null) return 'N/A';

    // Round to nearest size
    const roundedIndex = Math.round(averageValue) - 1;
    const clampedIndex = Math.max(0, Math.min(SIZE_NAMES.length - 1, roundedIndex));

    return SIZE_NAMES[clampedIndex];
}

function getSizeDistribution(participants) {
    const distribution = {
        'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0
    };

    Object.values(participants)
        .filter(p => p.estimate && p.submitted)
        .forEach(p => {
            if (distribution.hasOwnProperty(p.estimate)) {
                distribution[p.estimate]++;
            }
        });

    return distribution;
}

function createSizeVisualization(participants, averageValue) {
    const svg = document.getElementById('sizesVisualization');
    const legend = document.getElementById('sizeLegend');

    if (!svg || !legend) return;

    // Clear previous content
    svg.innerHTML = '';
    legend.innerHTML = '';

    const distribution = getSizeDistribution(participants);
    const totalParticipants = Object.values(distribution).reduce((a, b) => a + b, 0);

    if (totalParticipants === 0) return;

    // Add gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="tshirtGradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tshirtGradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#66bb6a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4caf50;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tshirtGradientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffa726;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#c29b0c;stop-opacity:1" />
        </linearGradient>
    `;
    svg.appendChild(defs);

    const startX = 30;
    const spacing = 125;
    const baseY = 140;

    // Draw t-shirts for each size
    SIZE_NAMES.forEach((size, index) => {
        const x = startX + index * spacing;
        const count = distribution[size];
        const sizeValue = SIZE_VALUES[size];

        // Determine if this is the average or close to it
        const isAverage = Math.abs(sizeValue - averageValue) < 0.5;
        const isExactAverage = Math.round(averageValue) === sizeValue;

        // Calculate t-shirt scale based on size
        const baseScale = 0.3 + (index * 0.1); // XS smallest, XXL largest
        const scale = isExactAverage ? baseScale * 1.15 : baseScale;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${x}, ${baseY - (isExactAverage ? 15 : 0)})`);

        // Choose color based on state
        let fillColor = 'url(#tshirtGradientBlue)';
        let strokeColor = '#1565c0';
        let opacity = count > 0 ? '1' : '0.3';

        if (isExactAverage) {
            fillColor = 'url(#tshirtGradientOrange)';
            strokeColor = '#c29b0c';
            opacity = '1';
        } else if (isAverage) {
            fillColor = 'url(#tshirtGradientGreen)';
            strokeColor = '#388e3c';
        }

        // Draw t-shirt using the favicon design
        const tshirtScale = scale;
        group.innerHTML = `
            <g transform="scale(${tshirtScale})">
                <!-- Left Sleeve -->
                <path d="M 15 20 L 5 30 L 8 50 L 20 48 L 25 25 Z"
                      fill="${fillColor}"
                      stroke="${strokeColor}"
                      stroke-width="2"
                      opacity="${opacity}"/>
                
                <!-- Right Sleeve -->
                <path d="M 85 20 L 95 30 L 92 50 L 80 48 L 75 25 Z"
                      fill="${fillColor}"
                      stroke="${strokeColor}"
                      stroke-width="2"
                      opacity="${opacity}"/>
                
                <!-- Main T-shirt body -->
                <path d="M 25 25 L 25 95 L 75 95 L 75 25 L 70 25 L 65 32 Q 60 38 50 38 Q 40 38 35 32 L 30 25 Z"
                      fill="${fillColor}"
                      stroke="${strokeColor}"
                      stroke-width="2.5"
                      opacity="${opacity}"/>
                
                <!-- V-neck collar detail -->
                <path d="M 35 25 L 40 32 L 50 35 L 60 32 L 65 25"
                      fill="none"
                      stroke="${strokeColor}"
                      stroke-width="2"
                      opacity="${opacity}"/>
            </g>
        `;

        svg.appendChild(group);

        // Size label
        const sizeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        sizeText.setAttribute('x', x + 30);
        sizeText.setAttribute('y', baseY + 45);
        sizeText.setAttribute('text-anchor', 'middle');
        sizeText.setAttribute('fill', 'currentColor');
        sizeText.setAttribute('font-weight', isExactAverage ? 'bold' : 'normal');
        sizeText.setAttribute('font-size', isExactAverage ? '18' : '16');
        sizeText.textContent = size;
        svg.appendChild(sizeText);

        // Vote count badge
        if (count > 0) {
            const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            badge.setAttribute('cx', x + 55);
            badge.setAttribute('cy', baseY - 30);
            badge.setAttribute('r', '12');
            badge.setAttribute('fill', '#ff5722');
            badge.setAttribute('stroke', '#fff');
            badge.setAttribute('stroke-width', '2');
            svg.appendChild(badge);

            const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            countText.setAttribute('x', x + 55);
            countText.setAttribute('y', baseY - 26);
            countText.setAttribute('text-anchor', 'middle');
            countText.setAttribute('fill', 'white');
            countText.setAttribute('font-size', '12');
            countText.setAttribute('font-weight', 'bold');
            countText.textContent = count;
            svg.appendChild(countText);
        }

        // Average indicator arrow
        if (isExactAverage) {
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            arrow.setAttribute('x', x + 30);
            arrow.setAttribute('y', baseY - 45);
            arrow.setAttribute('text-anchor', 'middle');
            arrow.setAttribute('fill', '#c29b0c');
            arrow.setAttribute('font-size', '24');
            arrow.textContent = '⭐';
            svg.appendChild(arrow);
        }
    });


}

function showResults(participants) {
    elements.resultsSection.classList.remove('hidden');
    elements.waitingSection.classList.add('hidden');

    // Calculate and display average size
    const averageValue = calculateAverageSize(participants);
    const averageSizeName = getAverageSizeName(averageValue);

    const averageSizeElement = document.getElementById('averageSize');
    if (averageSizeElement) {
        averageSizeElement.textContent = averageSizeName;
        if (averageValue !== null) {
            averageSizeElement.textContent += ` (${averageValue.toFixed(2)})`;
        }
    }

    // Create visualization
    if (averageValue !== null) {
        createSizeVisualization(participants, averageValue);
    }
}

function updateParticipantsList(participants) {
    elements.participantsList.innerHTML = '';

    // Check if all participants have submitted
    const allSubmitted = Object.values(participants).every(p => p.submitted);

    Object.values(participants).forEach(participant => {
        const item = document.createElement('div');
        item.className = `participant-item ${participant.submitted ? 'submitted' : ''}`;

        const name = document.createElement('span');
        name.textContent = participant.name;

        const status = document.createElement('span');
        status.className = `status-badge ${participant.submitted ? 'status-submitted' : 'status-pending'}`;

        if (participant.submitted) {
            if (allSubmitted) {
                // All votes are in - reveal the actual vote
                status.classList.add('vote-revealed');
                status.textContent = participant.estimate;
            } else {
                // Still waiting - show submitted but obscure the vote
                status.classList.add('vote-hidden');
                status.textContent = '✓ Voted';
            }
        } else {
            status.textContent = '⏳ Pending';
        }

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

function showWaitingMessage() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.remove('hidden');
}

function hideResultsAndWaiting() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.add('hidden');
}
