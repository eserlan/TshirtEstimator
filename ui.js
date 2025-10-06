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
    legend.classList.add('hidden');

    const distribution = getSizeDistribution(participants);
    const totalParticipants = Object.values(distribution).reduce((a, b) => a + b, 0);

    if (totalParticipants === 0) return;

    // Add gradient definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:#2196f3;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="barGradientAverage" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style="stop-color:#ffa726;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
        </linearGradient>
    `;
    svg.appendChild(defs);

    // Configuration for vertical layout
    const width = 700;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 80, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    svg.appendChild(chartGroup);

    const baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseline.setAttribute('x1', '0');
    baseline.setAttribute('y1', chartHeight);
    baseline.setAttribute('x2', chartWidth);
    baseline.setAttribute('y2', chartHeight);
    baseline.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
    baseline.setAttribute('stroke-width', '2');
    chartGroup.appendChild(baseline);

    const maxCount = Math.max(...Object.values(distribution));
    const sectionWidth = chartWidth / SIZE_NAMES.length;
    const barWidth = Math.min(60, sectionWidth * 0.6);

    SIZE_NAMES.forEach((size, index) => {
        const count = distribution[size];
        const sizeValue = SIZE_VALUES[size];
        const isAverage = Math.round(averageValue) === sizeValue;

        const barHeight = maxCount > 0 ? (count / maxCount) * chartHeight : 0;
        const x = index * sectionWidth + (sectionWidth - barWidth) / 2;
        const y = chartHeight - barHeight;

        const bgBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgBar.setAttribute('x', index * sectionWidth + (sectionWidth - barWidth) / 2);
        bgBar.setAttribute('y', 0);
        bgBar.setAttribute('width', barWidth);
        bgBar.setAttribute('height', chartHeight);
        bgBar.setAttribute('fill', 'rgba(128, 128, 128, 0.1)');
        bgBar.setAttribute('rx', '6');
        chartGroup.appendChild(bgBar);

        if (count > 0) {
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', isAverage ? 'url(#barGradientAverage)' : 'url(#barGradient)');
            bar.setAttribute('rx', '6');
            bar.setAttribute('opacity', '0.95');
            bar.style.animation = 'barGrowVertical 0.6s ease-out';
            bar.style.transformOrigin = 'center bottom';
            chartGroup.appendChild(bar);

            const countLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            countLabel.setAttribute('x', x + barWidth / 2);
            countLabel.setAttribute('y', y - 10);
            countLabel.setAttribute('text-anchor', 'middle');
            countLabel.setAttribute('fill', 'currentColor');
            countLabel.setAttribute('font-size', '16');
            countLabel.setAttribute('font-weight', 'bold');
            countLabel.textContent = count;
            chartGroup.appendChild(countLabel);
        }

        const sizeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        sizeLabel.setAttribute('x', index * sectionWidth + sectionWidth / 2);
        sizeLabel.setAttribute('y', chartHeight + 30);
        sizeLabel.setAttribute('text-anchor', 'middle');
        sizeLabel.setAttribute('fill', 'currentColor');
        sizeLabel.setAttribute('font-size', isAverage ? '20' : '16');
        sizeLabel.setAttribute('font-weight', isAverage ? 'bold' : '600');
        sizeLabel.textContent = size;
        chartGroup.appendChild(sizeLabel);

        if (isAverage) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            star.setAttribute('x', index * sectionWidth + sectionWidth / 2);
            star.setAttribute('y', Math.max(y - 25, 0) + 10);
            star.setAttribute('text-anchor', 'middle');
            star.setAttribute('fill', '#ffa726');
            star.setAttribute('font-size', '28');
            star.textContent = '⭐';
            chartGroup.appendChild(star);
        }
    });

    legend.innerHTML = '';
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
