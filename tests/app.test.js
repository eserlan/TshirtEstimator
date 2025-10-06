import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the firebase-config module
vi.mock('../firebase-config.js', () => ({
  firebaseConfig: {
    apiKey: 'test-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test',
    storageBucket: 'test.firebasestorage.app',
    messagingSenderId: '123',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id'
  }
}));

// Mock the firebase-service module to avoid HTTPS import errors
vi.mock('../firebase-service.js', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
  subscribeToSession: vi.fn(),
  submitEstimate: vi.fn(),
  addParticipant: vi.fn()
}));

// Mock the ui module to avoid DOM dependencies
vi.mock('../ui.js', () => ({
  elements: {},
  switchToEstimationView: vi.fn(),
  switchToSetupView: vi.fn(),
  updateSessionUI: vi.fn()
}));

import { generateSessionId } from '../app.js';

// Bring in internals for flow testing
import * as appModule from '../app.js';
import {
  __test,
  loadSession,
  handleEstimateSubmission,
  goBackToSetup,
  handleJoinAsNewParticipant,
  handleJoinSession
} from '../app.js';

import {
  createSession,
  getSession,
  subscribeToSession,
  submitEstimate,
  addParticipant
} from '../firebase-service.js';

// Import mocked UI functions for assertions
import { switchToEstimationView, switchToSetupView, updateSessionUI } from '../ui.js';

// Common DOM setup for flows
beforeEach(() => {
  document.body.innerHTML = `
    <div id="setupView"></div>
    <div id="estimationView" class="hidden"></div>
    <form id="createSessionForm"></form>
    <input id="taskDescription" value="Build feature X" />
    <input id="participantNames" value="Alice, Bob" />
    <form id="joinSessionForm"></form>
    <input id="sessionId" value="abcde-fghij" />
    <button id="backButton"></button>
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
    <dialog id="participantModal"></dialog>
    <div id="participantButtonList"></div>
    <button id="joinSessionButton"></button>
    <button class="estimate-btn" data-size="M"></button>
  `;
  // dialog stubs
  const modal = document.getElementById('participantModal');
  if (modal) {
    modal.showModal = vi.fn();
    modal.close = vi.fn();
  }
  // Silence alerts/prompts during tests
  globalThis.alert = vi.fn();
  globalThis.prompt = vi.fn();
});

describe('App Integration Tests', () => {
  describe('generateSessionId', () => {
    it('should generate a valid proquint session ID', () => {
      const sessionId = generateSessionId();

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBe(11);
      expect(sessionId).toMatch(/^[bdfghjklmnprstvzaiou]{5}-[bdfghjklmnprstvzaiou]{5}$/);
    });

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      const id3 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should only contain valid proquint characters', () => {
      const sessionId = generateSessionId();
      const parts = sessionId.split('-');

      expect(parts.length).toBe(2);
      expect(parts[0].length).toBe(5);
      expect(parts[1].length).toBe(5);

      // Check each part only contains valid proquint chars
      parts.forEach(part => {
        expect(part).toMatch(/^[bdfghjklmnprstvzaiou]+$/);
      });
    });

    it('should generate pronounceable session IDs', () => {
      const sessionId = generateSessionId();
      const parts = sessionId.split('-');

      // Check consonant-vowel pattern in proquint
      parts.forEach(part => {
        const consonants = 'bdfghjklmnprstvz';
        const vowels = 'aiou';

        // Proquint pattern: consonant-vowel-consonant-vowel-consonant
        expect(consonants.includes(part[0])).toBe(true);
        expect(vowels.includes(part[1])).toBe(true);
        expect(consonants.includes(part[2])).toBe(true);
        expect(vowels.includes(part[3])).toBe(true);
        expect(consonants.includes(part[4])).toBe(true);
      });
    });
  });

  describe('Session ID Distribution', () => {
    it('should have good distribution of generated IDs', () => {
      const ids = new Set();
      const count = 100;

      for (let i = 0; i < count; i++) {
        ids.add(generateSessionId());
      }

      // All IDs should be unique (100% uniqueness for small sample)
      expect(ids.size).toBe(count);
    });
  });
});

describe('App Flow Tests', () => {
  it('loadSession subscribes and updates UI', () => {
    subscribeToSession.mockImplementation((_id, onNext) => {
      onNext({ exists: () => true, data: () => ({ taskDescription: 'T', participants: {} }) });
      return () => {};
    });

    loadSession('abcde-fghij');

    expect(switchToEstimationView).toHaveBeenCalledWith('abcde-fghij');
    expect(subscribeToSession).toHaveBeenCalled();
    expect(updateSessionUI).toHaveBeenCalled();
  });

  it('handleEstimateSubmission submits when state present', async () => {
    __test._setState({ currentSession: 'sess', currentParticipant: 'Alice' });
    const evt = { target: { getAttribute: (k) => (k === 'data-size' ? 'L' : null) } };

    await handleEstimateSubmission(evt);

    expect(submitEstimate).toHaveBeenCalledWith('sess', 'Alice', 'L');
  });

  it('goBackToSetup unsubscribes and clears state', () => {
    const unsub = vi.fn();
    __test._setState({ currentSession: 'sess', currentParticipant: 'Bob', unsubscribe: unsub });

    goBackToSetup();

    const st = __test._getState();
    expect(unsub).toHaveBeenCalled();
    expect(st.currentSession).toBeNull();
    expect(st.currentParticipant).toBeNull();
    expect(switchToSetupView).toHaveBeenCalled();
  });

  it('handleJoinAsNewParticipant prompts and adds', async () => {
    globalThis.prompt = vi.fn().mockReturnValue('Charlie');
    addParticipant.mockResolvedValue();
    subscribeToSession.mockImplementation((_id, onNext) => { onNext({ exists: () => true, data: () => ({ taskDescription: 'T', participants: {} }) }); return () => {}; });

    await handleJoinAsNewParticipant('abcde-fghij');

    expect(addParticipant).toHaveBeenCalledWith('abcde-fghij', 'Charlie');
    expect(switchToEstimationView).toHaveBeenCalledWith('abcde-fghij');
  });

  it('handleJoinSession: session not found alerts', async () => {
    getSession.mockResolvedValue({ exists: () => false });

    await handleJoinSession({ preventDefault: vi.fn() });

    expect(alert).toHaveBeenCalled();
  });

  it('handleJoinSession: view results path loads session', async () => {
    getSession.mockResolvedValue({
      exists: () => true,
      data: () => ({ participants: { Alice: { name: 'Alice', estimate: 'M', submitted: true } } })
    });
    subscribeToSession.mockImplementation((_id, onNext) => { onNext({ exists: () => true, data: () => ({ taskDescription: 'T', participants: {} }) }); return () => {}; });

    const p = handleJoinSession({ preventDefault: vi.fn() });

    // Allow showParticipantModal to build the modal buttons
    await Promise.resolve();
    const list = document.getElementById('participantButtonList');
    const viewBtn = Array.from(list.querySelectorAll('button')).find(b => b.textContent.includes('View Results'));
    expect(viewBtn).toBeTruthy();
    viewBtn.click();

    await p;

    expect(switchToEstimationView).toHaveBeenCalled();
    expect(subscribeToSession).toHaveBeenCalled();
  });
});
