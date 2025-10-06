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

    // Add gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="barGradientAverage" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ffa726;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
        </linearGradient>
    `;
    svg.appendChild(defs);

    // Configuration
    const barHeight = 40;
    const barSpacing = 15;
    const marginLeft = 80;
    const marginRight = 60;
    const marginTop = 30;
    const maxBarWidth = 500;

    // Find max count for scaling
    const maxCount = Math.max(...Object.values(distribution));

    // Draw bars for each size
    SIZE_NAMES.forEach((size, index) => {
        const y = marginTop + index * (barHeight + barSpacing);
        const count = distribution[size];
        const sizeValue = SIZE_VALUES[size];
        
        // Check if this is the average
        const isAverage = Math.round(averageValue) === sizeValue;
        
        // Calculate bar width (with minimum width for visibility)
        const barWidth = maxCount > 0 ? (count / maxCount) * maxBarWidth : 0;
        const displayWidth = count > 0 ? Math.max(barWidth, 30) : 0;

        // Draw size label on the left
        const sizeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        sizeLabel.setAttribute('x', marginLeft - 15);
        sizeLabel.setAttribute('y', y + barHeight / 2 + 5);
        sizeLabel.setAttribute('text-anchor', 'end');
        sizeLabel.setAttribute('fill', 'currentColor');
        sizeLabel.setAttribute('font-size', isAverage ? '20' : '16');
        sizeLabel.setAttribute('font-weight', isAverage ? 'bold' : '600');
        sizeLabel.textContent = size;
        svg.appendChild(sizeLabel);

        // Draw bar background (faded)
        const bgBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgBar.setAttribute('x', marginLeft);
        bgBar.setAttribute('y', y);
        bgBar.setAttribute('width', maxBarWidth);
        bgBar.setAttribute('height', barHeight);
        bgBar.setAttribute('fill', 'rgba(128, 128, 128, 0.1)');
        bgBar.setAttribute('rx', '5');
        svg.appendChild(bgBar);

        // Draw actual bar if there are votes
        if (count > 0) {
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', marginLeft);
            bar.setAttribute('y', y);
            bar.setAttribute('width', displayWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', isAverage ? 'url(#barGradientAverage)' : 'url(#barGradient)');
            bar.setAttribute('rx', '5');
            bar.setAttribute('opacity', '0.9');
            
            // Add animation
            bar.style.animation = 'barGrow 0.6s ease-out';
            bar.style.transformOrigin = 'left center';
            
            svg.appendChild(bar);

            // Draw count label inside or outside bar
            const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const labelX = displayWidth > 50 ? marginLeft + displayWidth - 10 : marginLeft + displayWidth + 10;
            const labelAnchor = displayWidth > 50 ? 'end' : 'start';
            countLabel.setAttribute('x', labelX);
            countLabel.setAttribute('y', y + barHeight / 2 + 6);
            countLabel.setAttribute('text-anchor', labelAnchor);
            countLabel.setAttribute('fill', displayWidth > 50 ? 'white' : 'currentColor');
            countLabel.setAttribute('font-size', '16');
            countLabel.setAttribute('font-weight', 'bold');
            countLabel.textContent = count;
            svg.appendChild(countLabel);
        }

        // Add star indicator for average
        if (isAverage) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            star.setAttribute('x', marginLeft + maxBarWidth + 15);
            star.setAttribute('y', y + barHeight / 2 + 7);
            star.setAttribute('text-anchor', 'start');
            star.setAttribute('fill', '#ffa726');
            star.setAttribute('font-size', '24');
            star.textContent = '⭐';
            svg.appendChild(star);

            const avgLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            avgLabel.setAttribute('x', marginLeft + maxBarWidth + 40);
            avgLabel.setAttribute('y', y + barHeight / 2 + 6);
            avgLabel.setAttribute('text-anchor', 'start');
            avgLabel.setAttribute('fill', '#ffa726');
            avgLabel.setAttribute('font-size', '14');
            avgLabel.setAttribute('font-weight', 'bold');
            avgLabel.textContent = 'Average';
            svg.appendChild(avgLabel);
        }
    });

    // Add legend
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: linear-gradient(to right, #2196f3, #1976d2);"></div>
            <span class="legend-label">Vote Count</span>
        </div>
        <div class="legend-item">
            <span class="legend-icon">⭐</span>
            <span class="legend-label">Average Estimate</span>
        </div>
    `;
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
