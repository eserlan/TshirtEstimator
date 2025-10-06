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
    function uint16ToProquint(n) {
      const consonants = 'bdfghjklmnprstvz';
      const vowels = 'aiou';
      
      let result = '';
      result += consonants[(n >> 12) & 0x0f];
      result += vowels[(n >> 10) & 0x03];
      result += consonants[(n >> 6) & 0x0f];
      result += vowels[(n >> 4) & 0x03];
      result += consonants[n & 0x0f];
      
      return result;
    }

    it('should generate valid proquint session ID format', () => {
      const generateSessionId = () => {
        const n1 = Math.floor(Math.random() * 65536);
        const n2 = Math.floor(Math.random() * 65536);
        return uint16ToProquint(n1) + '-' + uint16ToProquint(n2);
      };

      const sessionId = generateSessionId();
      
      // Should be proquint format (e.g., "lusab-babad")
      expect(sessionId).toMatch(/^[bdfghjklmnprstvzaiou]{5}-[bdfghjklmnprstvzaiou]{5}$/);
      // Should be exactly 11 characters
      expect(sessionId.length).toBe(11);
    });

    it('should generate unique session IDs', () => {
      const generateSessionId = () => {
        const n1 = Math.floor(Math.random() * 65536);
        const n2 = Math.floor(Math.random() * 65536);
        return uint16ToProquint(n1) + '-' + uint16ToProquint(n2);
      };

      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateSessionId());
      }

      // High uniqueness expected (32-bit space = 4.3 billion possibilities)
      expect(ids.size).toBeGreaterThan(990);
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

describe('Participant Management', () => {
  describe('Adding New Participants', () => {
    it('should add new participant to existing session', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };

      // Add new participant
      const newName = 'Charlie';
      participants[newName] = {
        name: newName,
        estimate: null,
        submitted: false
      };

      expect(Object.keys(participants).length).toBe(3);
      expect(participants['Charlie']).toBeDefined();
      expect(participants['Charlie'].estimate).toBeNull();
      expect(participants['Charlie'].submitted).toBe(false);
    });

    it('should update allSubmitted status when new participant joins', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'L', submitted: true }
      };

      let allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(true);

      // Add new participant
      participants['Charlie'] = {
        name: 'Charlie',
        estimate: null,
        submitted: false
      };

      allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(false);
    });

    it('should not allow duplicate participant names', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true }
      };

      const addParticipant = (name) => {
        if (participants[name]) {
          throw new Error('Participant already exists');
        }
        participants[name] = {
          name: name,
          estimate: null,
          submitted: false
        };
      };

      expect(() => addParticipant('Alice')).toThrow('Participant already exists');
      expect(Object.keys(participants).length).toBe(1);
    });
  });

  describe('Filtering Participants', () => {
    it('should filter participants by submission status', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true },
        'David': { name: 'David', estimate: null, submitted: false }
      };

      const submitted = Object.values(participants).filter(p => p.submitted);
      const pending = Object.values(participants).filter(p => !p.submitted);

      expect(submitted.length).toBe(2);
      expect(pending.length).toBe(2);
      expect(submitted.map(p => p.name)).toEqual(['Alice', 'Charlie']);
      expect(pending.map(p => p.name)).toEqual(['Bob', 'David']);
    });

    it('should filter participants by estimate value', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true }
      };

      const mediumEstimates = Object.values(participants).filter(p => p.estimate === 'M');
      expect(mediumEstimates.length).toBe(2);
      expect(mediumEstimates.map(p => p.name)).toEqual(['Alice', 'Bob']);
    });

    it('should get participants with estimates', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: null, submitted: false },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true }
      };

      const withEstimates = Object.values(participants).filter(p => p.estimate !== null);
      expect(withEstimates.length).toBe(2);
      expect(withEstimates.map(p => p.name)).toEqual(['Alice', 'Charlie']);
    });
  });
});

describe('Error Handling and Validation', () => {
  describe('Input Validation', () => {
    it('should trim whitespace from participant names', () => {
      const input = '  Alice  ,  Bob  ,  Charlie  ';
      const names = input.split(',').map(n => n.trim()).filter(n => n.length > 0);

      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
      expect(names[0]).toBe('Alice');
      expect(names[0]).not.toBe('  Alice  ');
    });

    it('should reject empty participant names', () => {
      const input = 'Alice, , Bob, ,';
      const names = input.split(',').map(n => n.trim()).filter(n => n.length > 0);

      expect(names).toEqual(['Alice', 'Bob']);
      expect(names.length).toBe(2);
    });

    it('should handle only whitespace input', () => {
      const input = '   ,  ,   ';
      const names = input.split(',').map(n => n.trim()).filter(n => n.length > 0);

      expect(names).toEqual([]);
      expect(names.length).toBe(0);
    });

    it('should validate session ID format', () => {
      const validSessionId = 'lusab-babad';
      const invalidSessionId1 = 'INVALID';
      const invalidSessionId2 = 'too-short';
      const invalidSessionId3 = 'toolongformat';

      const isValidFormat = (id) => /^[bdfghjklmnprstvzaiou]{5}-[bdfghjklmnprstvzaiou]{5}$/.test(id);

      expect(isValidFormat(validSessionId)).toBe(true);
      expect(isValidFormat(invalidSessionId1)).toBe(false);
      expect(isValidFormat(invalidSessionId2)).toBe(false);
      expect(isValidFormat(invalidSessionId3)).toBe(false);
    });
  });

  describe('Boundary Cases', () => {
    it('should handle maximum number of participants', () => {
      const participants = {};

      // Add 50 participants
      for (let i = 1; i <= 50; i++) {
        participants[`Participant${i}`] = {
          name: `Participant${i}`,
          estimate: null,
          submitted: false
        };
      }

      expect(Object.keys(participants).length).toBe(50);
    });

    it('should handle participant names with special characters', () => {
      const participants = {
        "O'Brien": { name: "O'Brien", estimate: 'M', submitted: true },
        "José García": { name: "José García", estimate: 'L', submitted: true },
        "Anne-Marie": { name: "Anne-Marie", estimate: 'S', submitted: true }
      };

      expect(participants["O'Brien"]).toBeDefined();
      expect(participants["José García"]).toBeDefined();
      expect(participants["Anne-Marie"]).toBeDefined();
    });

    it('should handle very long participant names', () => {
      const longName = 'A'.repeat(100);
      const participants = {
        [longName]: { name: longName, estimate: 'M', submitted: true }
      };

      expect(participants[longName]).toBeDefined();
      expect(participants[longName].name.length).toBe(100);
    });

    it('should handle single participant session', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true }
      };

      const allSubmitted = Object.values(participants).every(p => p.submitted);
      expect(allSubmitted).toBe(true);
      expect(Object.keys(participants).length).toBe(1);
    });
  });
});

describe('Estimate Statistics', () => {
  describe('Calculate Metrics', () => {
    it('should count estimates by size', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true },
        'David': { name: 'David', estimate: 'M', submitted: true }
      };

      const counts = Object.values(participants).reduce((acc, p) => {
        acc[p.estimate] = (acc[p.estimate] || 0) + 1;
        return acc;
      }, {});

      expect(counts['M']).toBe(3);
      expect(counts['L']).toBe(1);
    });

    it('should find most common estimate', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'S', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'M', submitted: true },
        'David': { name: 'David', estimate: 'L', submitted: true }
      };

      const counts = Object.values(participants).reduce((acc, p) => {
        acc[p.estimate] = (acc[p.estimate] || 0) + 1;
        return acc;
      }, {});

      const mostCommon = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      expect(mostCommon).toBe('M');
    });

    it('should calculate consensus percentage', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'M', submitted: true },
        'David': { name: 'David', estimate: 'L', submitted: true }
      };

      const total = Object.keys(participants).length;
      const mostCommonCount = Object.values(participants).filter(p => p.estimate === 'M').length;
      const consensusPercentage = (mostCommonCount / total) * 100;

      expect(consensusPercentage).toBe(75);
    });

    it('should detect perfect consensus', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'M', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'M', submitted: true }
      };

      const estimates = Object.values(participants).map(p => p.estimate);
      const allSame = estimates.every(e => e === estimates[0]);

      expect(allSame).toBe(true);
    });

    it('should detect no consensus', () => {
      const participants = {
        'Alice': { name: 'Alice', estimate: 'S', submitted: true },
        'Bob': { name: 'Bob', estimate: 'M', submitted: true },
        'Charlie': { name: 'Charlie', estimate: 'L', submitted: true },
        'David': { name: 'David', estimate: 'XL', submitted: true }
      };

      const estimates = Object.values(participants).map(p => p.estimate);
      const allDifferent = new Set(estimates).size === estimates.length;

      expect(allDifferent).toBe(true);
    });
  });

  describe('Size Distribution', () => {
    it('should get size distribution', () => {
      const participants = {
        'P1': { name: 'P1', estimate: 'XS', submitted: true },
        'P2': { name: 'P2', estimate: 'S', submitted: true },
        'P3': { name: 'P3', estimate: 'M', submitted: true },
        'P4': { name: 'P4', estimate: 'M', submitted: true },
        'P5': { name: 'P5', estimate: 'L', submitted: true }
      };

      const distribution = Object.values(participants).reduce((acc, p) => {
        acc[p.estimate] = (acc[p.estimate] || 0) + 1;
        return acc;
      }, {});

      expect(distribution).toEqual({
        'XS': 1,
        'S': 1,
        'M': 2,
        'L': 1
      });
    });

    it('should calculate size range', () => {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const participants = {
        'Alice': { name: 'Alice', estimate: 'S', submitted: true },
        'Bob': { name: 'Bob', estimate: 'XL', submitted: true }
      };

      const estimates = Object.values(participants).map(p => p.estimate);
      const minIndex = Math.min(...estimates.map(e => sizeOrder.indexOf(e)));
      const maxIndex = Math.max(...estimates.map(e => sizeOrder.indexOf(e)));

      expect(sizeOrder[minIndex]).toBe('S');
      expect(sizeOrder[maxIndex]).toBe('XL');
      expect(maxIndex - minIndex).toBe(3); // Range of 3 sizes
    });
  });
});
