// DOM element references - using getters for lazy initialization
export const elements = {
    get mainTitle() { return document.getElementById('mainTitle'); },
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
    get welcomeParticipantName() { return document.getElementById('welcomeParticipantName'); },
    get estimationPrompt() { return document.getElementById('estimationPrompt'); },
    get estimationButtons() { return document.getElementById('estimationButtons'); },
    get averageEstimateLabel() { return document.getElementById('averageEstimateLabel'); },
    get welcomeMessage() { return document.getElementById('welcomeMessage'); }
};

const ESTIMATION_MODES = {
    tshirt: {
        id: 'tshirt',
        label: 'T-shirt Sizes',
        shortLabel: 'T-shirt',
        title: '👕 T-shirt Estimator',
        prompt: 'Select your T-shirt size estimate:',
        welcomeMessage: 'Ready to estimate? Select your T-shirt size below.',
        options: [
            { value: 'XS', label: 'XS', numeric: 1 },
            { value: 'S', label: 'S', numeric: 2 },
            { value: 'M', label: 'M', numeric: 3 },
            { value: 'L', label: 'L', numeric: 4 },
            { value: 'XL', label: 'XL', numeric: 5 },
            { value: 'XXL', label: 'XXL', numeric: 6 }
        ]
    },
    fibonacci: {
        id: 'fibonacci',
        label: 'Planning Poker (Fibonacci)',
        shortLabel: 'Planning Poker',
        title: '🎯 Story Point Estimator',
        prompt: 'Select your Fibonacci estimate:',
        welcomeMessage: 'Ready to estimate? Choose your Fibonacci number below.',
        options: [
            { value: '1', label: '1', numeric: 1 },
            { value: '2', label: '2', numeric: 2 },
            { value: '3', label: '3', numeric: 3 },
            { value: '5', label: '5', numeric: 5 },
            { value: '8', label: '8', numeric: 8 },
            { value: '13', label: '13', numeric: 13 },
            { value: '21', label: '21', numeric: 21 },
            { value: '34', label: '34', numeric: 34 },
            { value: '55', label: '55', numeric: 55 },
            { value: '89', label: '89', numeric: 89 }
        ]
    }
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
    
    // Reset title to default
    if (elements.mainTitle) {
        elements.mainTitle.textContent = '👕 T-shirt Estimator';
    }
    
    // Reset forms (with fallback for test environments)
    if (elements.createSessionForm && typeof elements.createSessionForm.reset === 'function') {
        elements.createSessionForm.reset();
    }
    if (elements.joinSessionForm && typeof elements.joinSessionForm.reset === 'function') {
        elements.joinSessionForm.reset();
    }
}

export function updateSessionUI(sessionData, currentParticipant) {
    const config = getEstimationConfig(sessionData);

    configureEstimationExperience(config);

    elements.taskTitle.textContent = sessionData.taskDescription;
    elements.currentParticipantName.textContent = currentParticipant || 'Viewing Results';

    // Update participants list
    updateParticipantsList(sessionData.participants);

    // Check if current participant has submitted
    const currentParticipantData = currentParticipant ? sessionData.participants[currentParticipant] : undefined;
    updateEstimationSection(currentParticipantData);

    // Check if all submitted
    const allSubmitted = Object.values(sessionData.participants).every(p => p.submitted);

    if (allSubmitted) {
        showResults(sessionData, config);
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
    } else if (elements.welcomeBanner) {
        elements.welcomeBanner.classList.add('hidden');
    }
}

function getEstimationConfig(sessionData) {
    const type = sessionData?.estimationType;
    return ESTIMATION_MODES[type] || ESTIMATION_MODES.tshirt;
}

function configureEstimationExperience(config) {
    if (elements.mainTitle) {
        elements.mainTitle.textContent = config.title;
    }
    if (elements.estimationPrompt) {
        elements.estimationPrompt.textContent = config.prompt;
    }
    if (elements.welcomeMessage) {
        elements.welcomeMessage.textContent = config.welcomeMessage;
    }
    renderEstimationButtons(config);
}

function renderEstimationButtons(config) {
    const container = elements.estimationButtons;
    if (!container) {
        return;
    }

    const shouldSkipRender = container.dataset.mode === config.id
        && container.childElementCount === config.options.length;

    if (shouldSkipRender) {
        return;
    }

    container.innerHTML = '';
    container.dataset.mode = config.id;

    config.options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('estimate-btn');
        button.setAttribute('data-size', option.value);
        button.textContent = option.label;
        container.appendChild(button);
    });
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
    const estimationSection = elements.yourEstimationSection;
    if (!estimationSection) {
        return;
    }

    const estimationPanel = estimationSection.querySelector('.estimation-panel');
    const estimationButtons = elements.estimationButtons;

    if (!currentParticipantData) {
        estimationSection.style.display = 'none';
        if (estimationPanel) {
            estimationPanel.style.display = '';
        }
        if (estimationButtons) {
            estimationButtons.style.display = 'grid';
        }
        elements.yourEstimateDisplay.classList.add('hidden');
        return;
    }

    estimationSection.style.display = 'block';

    if (currentParticipantData.submitted) {
        if (estimationPanel) {
            estimationPanel.style.display = 'none';
        }
        if (estimationButtons) {
            estimationButtons.style.display = 'none';
        }
        elements.yourEstimateDisplay.classList.remove('hidden');
        if (elements.yourEstimate) {
            elements.yourEstimate.textContent = currentParticipantData.estimate;
        }
    } else {
        if (estimationPanel) {
            estimationPanel.style.display = '';
        }
        if (estimationButtons) {
            estimationButtons.style.display = 'grid';
        }
        elements.yourEstimateDisplay.classList.add('hidden');
    }
}

function calculateAverage(participants, config) {
    const numericEstimates = Object.values(participants)
        .filter(participant => participant.submitted && participant.estimate !== null && participant.estimate !== undefined)
        .map(participant => getNumericValue(config, participant.estimate))
        .filter(value => typeof value === 'number' && !Number.isNaN(value));

    if (numericEstimates.length === 0) {
        return null;
    }

    const total = numericEstimates.reduce((sum, value) => sum + value, 0);
    return total / numericEstimates.length;
}

function getNumericValue(config, value) {
    const option = config.options.find(opt => opt.value === value);
    return typeof option?.numeric === 'number' ? option.numeric : null;
}

function getNearestOption(config, averageValue) {
    if (averageValue === null) {
        return null;
    }

    let nearestOption = null;
    let smallestDifference = Infinity;

    config.options.forEach(option => {
        if (typeof option.numeric !== 'number') {
            return;
        }

        const difference = Math.abs(option.numeric - averageValue);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            nearestOption = option;
        }
    });

    return nearestOption;
}

function formatAverageDisplay(config, averageValue, nearestOption) {
    if (averageValue === null) {
        return 'N/A';
    }

    const numericText = Number.isFinite(averageValue) ? averageValue.toFixed(config.id === 'fibonacci' ? 1 : 2) : `${averageValue}`;

    if (config.id === 'tshirt') {
        return nearestOption ? `${nearestOption.label} (${numericText})` : numericText;
    }

    if (config.id === 'fibonacci') {
        const approx = nearestOption ? ` (≈${nearestOption.label})` : '';
        return `${numericText}${approx}`;
    }

    return nearestOption ? `${numericText} (${nearestOption.label})` : numericText;
}

function createEstimationVisualization(participants, config, averageValue, nearestOption) {
    const svg = document.getElementById('sizesVisualization');
    const legend = document.getElementById('sizeLegend');

    if (!svg || !legend) {
        return;
    }

    svg.innerHTML = '';
    legend.innerHTML = '';
    legend.classList.add('hidden');

    const distribution = config.options.reduce((acc, option) => {
        acc[option.value] = 0;
        return acc;
    }, {});

    Object.values(participants)
        .filter(participant => participant.submitted && distribution.hasOwnProperty(participant.estimate))
        .forEach(participant => {
            distribution[participant.estimate]++;
        });

    const totalParticipants = Object.values(distribution).reduce((sum, value) => sum + value, 0);

    if (totalParticipants === 0) {
        return;
    }

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
    const sectionWidth = chartWidth / config.options.length;
    const barWidth = Math.min(60, sectionWidth * 0.6);
    const highlightValue = nearestOption?.value ?? null;

    config.options.forEach((option, index) => {
        const count = distribution[option.value];
        const isAverage = highlightValue === option.value;

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

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', index * sectionWidth + sectionWidth / 2);
        label.setAttribute('y', chartHeight + 30);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'currentColor');
        label.setAttribute('font-size', isAverage ? '20' : '16');
        label.setAttribute('font-weight', isAverage ? 'bold' : '600');
        label.textContent = option.label;
        chartGroup.appendChild(label);

        if (isAverage && averageValue !== null) {
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
}

function showResults(sessionData, config) {
    elements.resultsSection.classList.remove('hidden');
    elements.waitingSection.classList.add('hidden');

    if (elements.averageEstimateLabel) {
        const labelSuffix = config.shortLabel || config.label;
        elements.averageEstimateLabel.textContent = `Average Estimate (${labelSuffix})`;
    }

    const averageValue = calculateAverage(sessionData.participants, config);
    const nearestOption = getNearestOption(config, averageValue);

    const averageSizeElement = document.getElementById('averageSize');
    if (averageSizeElement) {
        averageSizeElement.textContent = formatAverageDisplay(config, averageValue, nearestOption);
    }

    createEstimationVisualization(sessionData.participants, config, averageValue, nearestOption);
}

function showWaitingMessage() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.remove('hidden');
}

function hideResultsAndWaiting() {
    elements.resultsSection.classList.add('hidden');
    elements.waitingSection.classList.add('hidden');
}
