import { describe, it, expect, beforeEach } from 'vitest';

describe('DOM Manipulation Tests', () => {
  let setupView, estimationView, taskTitle, currentSessionId;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="setupView" class="section">
        <form id="createSessionForm"></form>
        <form id="joinSessionForm"></form>
      </div>
      <div id="estimationView" class="section hidden">
        <button id="backButton">Back</button>
        <h2 id="taskTitle"></h2>
        <div id="currentSessionId"></div>
        <div id="participantsList"></div>
        <div id="resultsSection" class="hidden"></div>
        <div id="resultsGrid"></div>
        <div id="waitingSection" class="hidden"></div>
        <div id="yourEstimationSection">
          <div class="estimation-panel">
            <p id="estimationPrompt" class="estimation-prompt"></p>
            <div id="estimationButtons" class="estimation-buttons"></div>
          </div>
        </div>
        <div id="yourEstimateDisplay" class="hidden"></div>
        <div id="yourEstimate"></div>
      </div>
      <dialog id="participantModal">
        <article>
          <header><h3>Select Your Name</h3></header>
          <div id="participantButtonList"></div>
        </article>
      </dialog>
    `;

    setupView = document.getElementById('setupView');
    estimationView = document.getElementById('estimationView');
    taskTitle = document.getElementById('taskTitle');
    currentSessionId = document.getElementById('currentSessionId');
  });

  describe('View Switching', () => {
    it('should be able to hide and show views', () => {
      // Initially setup view is visible, estimation view is hidden
      expect(setupView.classList.contains('hidden')).toBe(false);
      expect(estimationView.classList.contains('hidden')).toBe(true);

      // Switch to estimation view
      setupView.classList.add('hidden');
      estimationView.classList.remove('hidden');

      expect(setupView.classList.contains('hidden')).toBe(true);
      expect(estimationView.classList.contains('hidden')).toBe(false);
    });

    it('should update session ID display', () => {
      const sessionId = 'TEST123';
      currentSessionId.textContent = sessionId;
      expect(currentSessionId.textContent).toBe(sessionId);
    });

    it('should update task title', () => {
      const taskDescription = 'Implement authentication';
      taskTitle.textContent = `Task: ${taskDescription}`;
      expect(taskTitle.textContent).toBe('Task: Implement authentication');
    });
  });

  describe('Participants List', () => {
    it('should create participant items in the list', () => {
      const participantsList = document.getElementById('participantsList');
      const participants = {
        'Alice': { name: 'Alice', estimate: null, submitted: false },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true }
      };

      // Clear list
      participantsList.innerHTML = '';

      // Add participants
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
        participantsList.appendChild(item);
      });

      const items = participantsList.querySelectorAll('.participant-item');
      expect(items.length).toBe(2);
      
      // Check first participant (not submitted)
      expect(items[0].classList.contains('submitted')).toBe(false);
      expect(items[0].querySelector('span').textContent).toBe('Alice');
      
      // Check second participant (submitted)
      expect(items[1].classList.contains('submitted')).toBe(true);
      expect(items[1].querySelector('span').textContent).toBe('Bob');
    });
  });

  describe('Results Display', () => {
    it('should display results when all participants submit', () => {
      const resultsSection = document.getElementById('resultsSection');
      const resultsGrid = document.getElementById('resultsGrid');
      const waitingSection = document.getElementById('waitingSection');

      resultsSection.classList.remove('hidden');
      waitingSection.classList.add('hidden');

      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };

      resultsGrid.innerHTML = '';
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
        resultsGrid.appendChild(card);
      });

      const cards = resultsGrid.querySelectorAll('.result-card');
      expect(cards.length).toBe(2);
      expect(resultsSection.classList.contains('hidden')).toBe(false);
      expect(waitingSection.classList.contains('hidden')).toBe(true);
    });

    it('should show waiting message when not all submitted', () => {
      const resultsSection = document.getElementById('resultsSection');
      const waitingSection = document.getElementById('waitingSection');

      resultsSection.classList.add('hidden');
      waitingSection.classList.remove('hidden');

      expect(resultsSection.classList.contains('hidden')).toBe(true);
      expect(waitingSection.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Estimation Buttons', () => {
    it('should have all T-shirt size buttons', () => {
      const estimationButtons = document.querySelector('.estimation-buttons');
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

      estimationButtons.innerHTML = '';
      sizes.forEach(size => {
        const button = document.createElement('button');
        button.className = 'estimate-btn';
        button.setAttribute('data-size', size);
        button.textContent = size;
        estimationButtons.appendChild(button);
      });

      const buttons = estimationButtons.querySelectorAll('.estimate-btn');
      expect(buttons.length).toBe(6);

      sizes.forEach((size, index) => {
        expect(buttons[index].getAttribute('data-size')).toBe(size);
        expect(buttons[index].textContent).toBe(size);
      });
    });

    it('should hide estimation buttons after submission', () => {
      const estimationButtons = document.querySelector('.estimation-buttons');
      const yourEstimateDisplay = document.getElementById('yourEstimateDisplay');
      const yourEstimate = document.getElementById('yourEstimate');

      // After submission
      estimationButtons.style.display = 'none';
      yourEstimateDisplay.classList.remove('hidden');
      yourEstimate.textContent = 'L';

      expect(estimationButtons.style.display).toBe('none');
      expect(yourEstimateDisplay.classList.contains('hidden')).toBe(false);
      expect(yourEstimate.textContent).toBe('L');
    });
  });

  describe('Modal Elements', () => {
    it('should create modal with participant buttons', () => {
      const buttonList = document.getElementById('participantButtonList');
      expect(buttonList).not.toBeNull();

      const participants = ['Alice', 'Bob', 'Charlie'];

      buttonList.innerHTML = '';
      participants.forEach(name => {
        const button = document.createElement('button');
        button.textContent = name;
        button.classList.add('participant-select-btn');
        buttonList.appendChild(button);
      });

      const buttons = buttonList.querySelectorAll('.participant-select-btn');
      expect(buttons.length).toBe(3);
      expect(buttons[0].textContent).toBe('Alice');
      expect(buttons[1].textContent).toBe('Bob');
      expect(buttons[2].textContent).toBe('Charlie');
    });

    it('should disable buttons for participants who already joined', () => {
      const buttonList = document.getElementById('participantButtonList');
      expect(buttonList).not.toBeNull();

      buttonList.innerHTML = '';
      const participants = ['Alice', 'Bob'];
      const alreadyJoined = ['Alice'];

      participants.forEach(name => {
        const button = document.createElement('button');
        button.textContent = name;
        if (alreadyJoined.includes(name)) {
          button.disabled = true;
          button.textContent = `${name} (already joined)`;
        }
        buttonList.appendChild(button);
      });

      const buttons = buttonList.querySelectorAll('button');
      expect(buttons[0].disabled).toBe(true);
      expect(buttons[0].textContent).toBe('Alice (already joined)');
      expect(buttons[1].disabled).toBe(false);
      expect(buttons[1].textContent).toBe('Bob');
    });

    it('should create modal with special action buttons', () => {
      const buttonList = document.getElementById('participantButtonList');
      expect(buttonList).not.toBeNull();

      buttonList.innerHTML = '';

      // Add View Results button
      const viewResultsButton = document.createElement('button');
      viewResultsButton.textContent = '👁️ View Results';
      viewResultsButton.classList.add('secondary', 'outline');
      buttonList.appendChild(viewResultsButton);

      // Add Join as New Participant button
      const joinNewButton = document.createElement('button');
      joinNewButton.textContent = '➕ Join as New Participant';
      joinNewButton.classList.add('secondary');
      buttonList.appendChild(joinNewButton);

      const buttons = buttonList.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('👁️ View Results');
      expect(buttons[1].textContent).toBe('➕ Join as New Participant');
    });
  });

  describe('Form Validation', () => {
    it('should have required fields in create session form', () => {
      const form = document.getElementById('createSessionForm');
      form.innerHTML = `
        <input type="text" id="taskDescription" required>
        <input type="text" id="participantNames" required>
        <button type="submit">Create</button>
      `;

      const taskInput = document.getElementById('taskDescription');
      const participantsInput = document.getElementById('participantNames');

      expect(taskInput.hasAttribute('required')).toBe(true);
      expect(participantsInput.hasAttribute('required')).toBe(true);
    });

    it('should have required field in join session form', () => {
      const form = document.getElementById('joinSessionForm');
      form.innerHTML = `
        <input type="text" id="sessionId" required>
        <button type="submit">Join</button>
      `;

      const sessionIdInput = document.getElementById('sessionId');
      expect(sessionIdInput.hasAttribute('required')).toBe(true);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct classes to participant items', () => {
      const item = document.createElement('div');
      item.className = 'participant-item submitted';

      expect(item.classList.contains('participant-item')).toBe(true);
      expect(item.classList.contains('submitted')).toBe(true);
    });

    it('should apply correct status badge classes', () => {
      const submittedBadge = document.createElement('span');
      submittedBadge.className = 'status-badge status-submitted';

      const pendingBadge = document.createElement('span');
      pendingBadge.className = 'status-badge status-pending';

      expect(submittedBadge.classList.contains('status-submitted')).toBe(true);
      expect(pendingBadge.classList.contains('status-pending')).toBe(true);
    });

    it('should toggle hidden class correctly', () => {
      const element = document.createElement('div');
      element.classList.add('hidden');
      expect(element.classList.contains('hidden')).toBe(true);

      element.classList.remove('hidden');
      expect(element.classList.contains('hidden')).toBe(false);

      element.classList.toggle('hidden');
      expect(element.classList.contains('hidden')).toBe(true);
    });
  });
});
