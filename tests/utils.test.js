import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('generateSessionId', () => {
    // Test the logic directly
    const generateSessionId = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    it('should generate a session ID', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('should generate session IDs with correct length', () => {
      const sessionId = generateSessionId();
      expect(sessionId.length).toBeGreaterThanOrEqual(1);
      expect(sessionId.length).toBeLessThanOrEqual(6);
    });

    it('should generate uppercase session IDs', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toBe(sessionId.toUpperCase());
    });

    it('should generate different session IDs on successive calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSessionId());
      }
      // Should have high uniqueness
      expect(ids.size).toBeGreaterThan(50);
    });

    it('should only contain alphanumeric characters', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('parseParticipantNames', () => {
    // Test the logic for parsing participant names
    const parseParticipantNames = (input) => {
      return input
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    };

    it('should parse single participant name', () => {
      const names = parseParticipantNames('Alice');
      expect(names).toEqual(['Alice']);
    });

    it('should parse multiple participant names', () => {
      const names = parseParticipantNames('Alice, Bob, Charlie');
      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should handle names with extra spaces', () => {
      const names = parseParticipantNames('  Alice  ,  Bob  ,  Charlie  ');
      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should filter out empty names', () => {
      const names = parseParticipantNames('Alice, , Bob, ,Charlie');
      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should handle empty input', () => {
      const names = parseParticipantNames('');
      expect(names).toEqual([]);
    });
  });

  describe('createParticipantsObject', () => {
    // Test the logic for creating participants object
    const createParticipantsObject = (names) => {
      const participants = {};
      names.forEach(name => {
        participants[name] = {
          name: name,
          estimate: null,
          submitted: false
        };
      });
      return participants;
    };

    it('should create participants object from names array', () => {
      const names = ['Alice', 'Bob'];
      const participants = createParticipantsObject(names);
      
      expect(participants).toHaveProperty('Alice');
      expect(participants).toHaveProperty('Bob');
      expect(participants.Alice).toEqual({
        name: 'Alice',
        estimate: null,
        submitted: false
      });
    });

    it('should handle empty array', () => {
      const participants = createParticipantsObject([]);
      expect(participants).toEqual({});
    });

    it('should handle single participant', () => {
      const participants = createParticipantsObject(['Alice']);
      expect(Object.keys(participants)).toHaveLength(1);
      expect(participants.Alice.submitted).toBe(false);
    });
  });

  describe('checkAllSubmitted', () => {
    // Test the logic for checking if all participants submitted
    const checkAllSubmitted = (participants) => {
      return Object.values(participants).every(p => p.submitted);
    };

    it('should return true when all participants submitted', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };
      expect(checkAllSubmitted(participants)).toBe(true);
    });

    it('should return false when some participants have not submitted', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false }
      };
      expect(checkAllSubmitted(participants)).toBe(false);
    });

    it('should return false when no participants have submitted', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: null, submitted: false },
        'Bob': { name: 'Bob', estimate: null, submitted: false }
      };
      expect(checkAllSubmitted(participants)).toBe(false);
    });

    it('should return true for empty participants object', () => {
      const participants = {};
      expect(checkAllSubmitted(participants)).toBe(true);
    });
  });

  describe('T-shirt size validation', () => {
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    const isValidSize = (size) => {
      return validSizes.includes(size);
    };

    it('should validate correct T-shirt sizes', () => {
      validSizes.forEach(size => {
        expect(isValidSize(size)).toBe(true);
      });
    });

    it('should reject invalid sizes', () => {
      expect(isValidSize('XXXL')).toBe(false);
      expect(isValidSize('Medium')).toBe(false);
      expect(isValidSize('x')).toBe(false);
      expect(isValidSize('')).toBe(false);
    });
  });
});
