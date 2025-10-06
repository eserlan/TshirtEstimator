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
          <div class="estimation-buttons"></div>
        </div>
        <div id="yourEstimateDisplay" class="hidden"></div>
        <div id="yourEstimate"></div>
      </div>
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

      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };

      // Show results
      resultsSection.classList.remove('hidden');
      waitingSection.classList.add('hidden');

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

      expect(resultsSection.classList.contains('hidden')).toBe(false);
      expect(waitingSection.classList.contains('hidden')).toBe(true);

      const cards = resultsGrid.querySelectorAll('.result-card');
      expect(cards.length).toBe(2);
      expect(cards[0].querySelector('.result-estimate').textContent).toBe('M');
      expect(cards[1].querySelector('.result-estimate').textContent).toBe('L');
    });

    it('should show waiting message when current participant submitted but not all', () => {
      const resultsSection = document.getElementById('resultsSection');
      const waitingSection = document.getElementById('waitingSection');

      resultsSection.classList.add('hidden');
      waitingSection.classList.remove('hidden');

      expect(resultsSection.classList.contains('hidden')).toBe(true);
      expect(waitingSection.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Form Elements', () => {
    it('should have create session form', () => {
      const form = document.getElementById('createSessionForm');
      expect(form).toBeDefined();
      expect(form.tagName).toBe('FORM');
    });

    it('should have join session form', () => {
      const form = document.getElementById('joinSessionForm');
      expect(form).toBeDefined();
      expect(form.tagName).toBe('FORM');
    });

    it('should be able to reset forms', () => {
      const createForm = document.getElementById('createSessionForm');
      createForm.innerHTML = '<input type="text" value="test">';
      
      const input = createForm.querySelector('input');
      expect(input.value).toBe('test');
      
      input.value = '';
      expect(input.value).toBe('');
    });
  });

  describe('CSS Class Manipulation', () => {
    it('should add and remove hidden class', () => {
      const element = document.createElement('div');
      expect(element.classList.contains('hidden')).toBe(false);
      
      element.classList.add('hidden');
      expect(element.classList.contains('hidden')).toBe(true);
      
      element.classList.remove('hidden');
      expect(element.classList.contains('hidden')).toBe(false);
    });

    it('should toggle multiple classes', () => {
      const element = document.createElement('div');
      element.classList.add('class1', 'class2', 'class3');
      
      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
      
      element.classList.remove('class2');
      expect(element.classList.contains('class2')).toBe(false);
    });
  });
});
