import { describe, it, expect } from 'vitest';

describe('Data Structure Tests', () => {
  describe('Session Data Structure', () => {
    it('should have correct session data structure', () => {
      const sessionData = {
        taskDescription: 'Implement user authentication',
        participants: {
          'Alice': { name: 'Alice', estimate: null, submitted: false },
          'Bob': { name: 'Bob', estimate: null, submitted: false }
        },
        createdAt: new Date(),
        allSubmitted: false
      };

      expect(sessionData).toHaveProperty('taskDescription');
      expect(sessionData).toHaveProperty('participants');
      expect(sessionData).toHaveProperty('allSubmitted');
      expect(typeof sessionData.taskDescription).toBe('string');
      expect(typeof sessionData.participants).toBe('object');
      expect(typeof sessionData.allSubmitted).toBe('boolean');
    });

    it('should validate participant structure', () => {
      const participant = {
        name: 'Alice',
        estimate: null,
        submitted: false
      };

      expect(participant).toHaveProperty('name');
      expect(participant).toHaveProperty('estimate');
      expect(participant).toHaveProperty('submitted');
      expect(typeof participant.name).toBe('string');
      expect(typeof participant.submitted).toBe('boolean');
    });

    it('should handle participant with estimate', () => {
      const participant = {
        name: 'Alice',
        estimate: 'M',
        submitted: true
      };

      expect(participant.estimate).toBe('M');
      expect(participant.submitted).toBe(true);
    });
  });

  describe('Participant State Management', () => {
    it('should update participant estimate', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: null, submitted: false }
      };

      // Submit estimate
      participants['Alice'].estimate = 'L';
      participants['Alice'].submitted = true;

      expect(participants['Alice'].estimate).toBe('L');
      expect(participants['Alice'].submitted).toBe(true);
    });

    it('should track all participants submission status', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true }
      };

      const allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(false);

      // Bob submits
      participants['Bob'].estimate = 'S';
      participants['Bob'].submitted = true;

      const allSubmittedNow = Object.values(participants).every(p => p.submitted);
      expect(allSubmittedNow).toBe(true);
    });

    it('should count submitted and pending participants', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true }
      };

      const submitted = Object.values(participants).filter(p => p.submitted);
      const pending = Object.values(participants).filter(p => !p.submitted);

      expect(submitted.length).toBe(2);
      expect(pending.length).toBe(1);
    });
  });

  describe('T-shirt Size Validation', () => {
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    it('should accept all valid T-shirt sizes', () => {
      validSizes.forEach(size => {
        const participant = {
          name: 'Test',
          estimate: size,
          submitted: true
        };
        expect(validSizes).toContain(participant.estimate);
      });
    });

    it('should maintain size case sensitivity', () => {
      expect(validSizes).toContain('XS');
      expect(validSizes).not.toContain('xs');
      expect(validSizes).toContain('XXL');
      expect(validSizes).not.toContain('xxl');
    });
  });

  describe('Session ID Generation', () => {
    it('should generate valid session ID format', () => {
      const generateSessionId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      const sessionId = generateSessionId();
      
      // Should be uppercase alphanumeric
      expect(sessionId).toMatch(/^[A-Z0-9]+$/);
      // Should be reasonable length
      expect(sessionId.length).toBeGreaterThan(0);
      expect(sessionId.length).toBeLessThanOrEqual(6);
    });

    it('should generate unique session IDs', () => {
      const generateSessionId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateSessionId());
      }

      // High uniqueness expected
      expect(ids.size).toBeGreaterThan(900);
    });
  });

  describe('Data Transformations', () => {
    it('should convert participant names array to participants object', () => {
      const names = ['Alice', 'Bob', 'Charlie'];
      const participants = {};

      names.forEach(name => {
        participants[name] = {
          name: name,
          estimate: null,
          submitted: false
        };
      });

      expect(Object.keys(participants)).toHaveLength(3);
      expect(participants['Alice']).toBeDefined();
      expect(participants['Bob']).toBeDefined();
      expect(participants['Charlie']).toBeDefined();
    });

    it('should extract participant names from participants object', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };

      const names = Object.keys(participants);
      expect(names).toEqual(['Alice', 'Bob']);
    });

    it('should get all estimates', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'M', submitted: true }
      };

      const estimates = Object.values(participants).map(p => p.estimate);
      expect(estimates).toEqual(['M', 'L', 'M']);
    });

    it('should group estimates by size', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'M', submitted: true },
        'David': { name: 'David', estimate: 'S', submitted: true }
      };

      const estimateGroups = Object.values(participants).reduce((acc, p) => {
        if (!acc[p.estimate]) {
          acc[p.estimate] = 0;
        }
        acc[p.estimate]++;
        return acc;
      }, {});

      expect(estimateGroups).toEqual({
        'M': 2,
        'L': 1,
        'S': 1
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty participants object', () => {
      const participants = {};
      const allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(true); // vacuously true
    });

    it('should handle single participant', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true }
      };

      const allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(true);
    });

    it('should handle participant name with special characters', () => {
      const participants = {
        "Alice O'Brien": { name: "Alice O'Brien", estimate: 'M', submitted: true }
      };

      expect(participants["Alice O'Brien"]).toBeDefined();
      expect(participants["Alice O'Brien"].name).toBe("Alice O'Brien");
    });

    it('should handle null estimates for unsubmitted participants', () => {
      const participant = {
        name: 'Alice',
        estimate: null,
        submitted: false
      };

      expect(participant.estimate).toBeNull();
      expect(participant.submitted).toBe(false);
    });
  });
});
