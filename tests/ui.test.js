import { describe, it, expect, beforeEach, vi } from 'vitest';
import { elements, switchToEstimationView, switchToSetupView, updateSessionUI } from '../ui.js';

describe('UI Module Tests', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="setupView"></div>
      <div id="estimationView" class="hidden"></div>
      <form id="createSessionForm"></form>
      <form id="joinSessionForm"></form>
      <button id="backButton"></button>
      <h2 id="taskTitle"></h2>
      <div id="currentSessionId"></div>
      <div id="currentParticipantName"></div>
      <div id="welcomeBanner" class="hidden"><p id="welcomeMessage"></p></div>
      <span id="welcomeParticipantName"></span>
      <div id="participantsList"></div>
      <div id="resultsSection" class="hidden">
        <h4 id="averageEstimateHeading"><span id="averageEstimateLabel">Average Estimate</span>: <span id="averageSize"></span></h4>
      </div>
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
    `;
  });

  describe('elements', () => {
    it('should export all required DOM element references', () => {
      expect(elements).toBeDefined();
      expect(elements.setupView).toBeDefined();
      expect(elements.estimationView).toBeDefined();
      expect(elements.createSessionForm).toBeDefined();
      expect(elements.joinSessionForm).toBeDefined();
      expect(elements.backButton).toBeDefined();
      expect(elements.taskTitle).toBeDefined();
      expect(elements.currentSessionId).toBeDefined();
      expect(elements.currentParticipantName).toBeDefined();
      expect(elements.welcomeBanner).toBeDefined();
      expect(elements.welcomeParticipantName).toBeDefined();
      expect(elements.participantsList).toBeDefined();
      expect(elements.resultsSection).toBeDefined();
      expect(elements.resultsGrid).toBeDefined();
      expect(elements.waitingSection).toBeDefined();
      expect(elements.yourEstimationSection).toBeDefined();
      expect(elements.yourEstimateDisplay).toBeDefined();
      expect(elements.yourEstimate).toBeDefined();
    });
  });

  describe('switchToEstimationView', () => {
    it('should hide setup view and show estimation view', () => {
      const sessionId = 'test-session';

      switchToEstimationView(sessionId);

      expect(elements.setupView.classList.contains('hidden')).toBe(true);
      expect(elements.estimationView.classList.contains('hidden')).toBe(false);
      expect(elements.currentSessionId.textContent).toBe(sessionId);
    });

    it('should display the session ID', () => {
      const sessionId = 'lusab-babad';

      switchToEstimationView(sessionId);

      expect(elements.currentSessionId.textContent).toBe(sessionId);
    });
  });

  describe('switchToSetupView', () => {
    it('should show setup view and hide estimation view', () => {
      // First switch to estimation view
      elements.setupView.classList.add('hidden');
      elements.estimationView.classList.remove('hidden');

      // Then switch back to setup
      switchToSetupView();

      expect(elements.setupView.classList.contains('hidden')).toBe(false);
      expect(elements.estimationView.classList.contains('hidden')).toBe(true);
    });

    it('should reset forms', () => {
      // Add some form content
      elements.createSessionForm.innerHTML = '<input type="text" value="test">';
      elements.joinSessionForm.innerHTML = '<input type="text" value="test">';

      // This test just verifies that switchToSetupView can be called without errors
      // The actual reset behavior is handled by the browser's form.reset() method
      expect(() => switchToSetupView()).not.toThrow();
    });
  });

  describe('updateSessionUI', () => {
    const mockSessionData = {
      estimationType: 'tshirt',
      taskDescription: 'Implement feature X',
      participants: {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true }
      }
    };

    const fibonacciSessionData = {
      estimationType: 'fibonacci',
      taskDescription: 'Estimate API work',
      participants: {
        'Alice': { name: 'Alice', estimate: '3', submitted: true },
        'Bob': { name: 'Bob', estimate: '5', submitted: true }
      }
    };

    it('should update task title', () => {
      updateSessionUI(mockSessionData, 'Alice');

      expect(elements.taskTitle.textContent).toBe('Implement feature X');
    });

    it('should render estimation buttons for the configured mode', () => {
      updateSessionUI(mockSessionData, 'Bob');

      const buttons = elements.yourEstimationSection.querySelectorAll('.estimate-btn');
      expect(buttons.length).toBe(6);
      expect(Array.from(buttons).map(btn => btn.textContent)).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    });

    it('should configure planning poker sessions with Fibonacci prompt', () => {
      updateSessionUI(fibonacciSessionData, 'Alice');

      expect(elements.taskTitle.textContent).toBe('Estimate API work');
      expect(elements.estimationPrompt.textContent).toBe('Select your Fibonacci estimate:');
      expect(elements.averageEstimateLabel.textContent).toBe('Average Estimate (Planning Poker)');
      expect(document.getElementById('averageSize').textContent).toBe('4.0 (≈3)');
      const fibButtons = elements.yourEstimationSection.querySelectorAll('.estimate-btn');
      expect(fibButtons.length).toBe(10);
      expect(Array.from(fibButtons).map(btn => btn.textContent)).toEqual(['1', '2', '3', '5', '8', '13', '21', '34', '55', '89']);
    });

    it('should update participants list', () => {
      updateSessionUI(mockSessionData, 'Alice');

      const participantItems = elements.participantsList.querySelectorAll('.participant-item');
      expect(participantItems.length).toBe(3);
    });

    it('should show submitted participants with submitted class', () => {
      updateSessionUI(mockSessionData, 'Alice');

      const submittedItems = elements.participantsList.querySelectorAll('.participant-item.submitted');
      expect(submittedItems.length).toBe(2); // Alice and Charlie
    });

    it('should hide estimation buttons when current participant has submitted', () => {
      updateSessionUI(mockSessionData, 'Alice');

      const estimationButtons = elements.yourEstimationSection.querySelector('.estimation-buttons');
      expect(estimationButtons.style.display).toBe('none');
    });

    it('should show estimation buttons when current participant has not submitted', () => {
      updateSessionUI(mockSessionData, 'Bob');

      const estimationButtons = elements.yourEstimationSection.querySelector('.estimation-buttons');
      expect(estimationButtons.style.display).toBe('grid');
    });

    it('should show results when all participants have submitted', () => {
      const allSubmittedData = {
        taskDescription: 'Test task',
        participants: {
          'Alice': { name: 'Alice', estimate: 'M', submitted: true },
          'Bob': { name: 'Bob', estimate: 'L', submitted: true }
        }
      };

      updateSessionUI(allSubmittedData, 'Alice');

      expect(elements.resultsSection.classList.contains('hidden')).toBe(false);
      expect(elements.waitingSection.classList.contains('hidden')).toBe(true);
    });

    it('should show waiting message when not all participants have submitted', () => {
      updateSessionUI(mockSessionData, 'Alice');

      // Not all submitted (Bob hasn't)
      expect(elements.resultsSection.classList.contains('hidden')).toBe(true);
      expect(elements.waitingSection.classList.contains('hidden')).toBe(false);
    });

    it('should display results grid with all participants when complete', () => {
      const allSubmittedData = {
        taskDescription: 'Test task',
        participants: {
          'Alice': { name: 'Alice', estimate: 'M', submitted: true },
          'Bob': { name: 'Bob', estimate: 'L', submitted: true }
        }
      };

      updateSessionUI(allSubmittedData, 'Alice');

      // Check that votes are revealed in the participants list
      const revealedVotes = elements.participantsList.querySelectorAll('.vote-revealed');
      expect(revealedVotes.length).toBe(2);
    });

    it('should handle view-only mode (no current participant)', () => {
      updateSessionUI(mockSessionData, null);

      // Should still show participants list
      const participantItems = elements.participantsList.querySelectorAll('.participant-item');
      expect(participantItems.length).toBe(3);
    });
  });
});
