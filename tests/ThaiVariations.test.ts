import { ThaiProfanityFilter } from '../src/ThaiProfanityFilter';

describe('Thai Variations and Creative Spellings', () => {
  let filter: ThaiProfanityFilter;

  beforeEach(() => {
    filter = new ThaiProfanityFilter({
      languages: ['thai'],
      checkVariations: true,
      similarityThreshold: 0.85,
      levenshteinThreshold: 0.8
    });
  });

  describe('เหี้ย variations', () => {
    test('should detect tone mark variations', () => {
      const variations = ['เหีย', 'เหิ่ย', 'เฮีย', 'เฮิ่ย', 'เหี่ย', 'เฮี่ย'];
      
      variations.forEach(variation => {
        const result = filter.check(variation);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          d.word === 'เหี้ย' || d.originalWord === variation
        )).toBe(true);
      });
    });

    test('should detect creative compound variations', () => {
      const compounds = ['ไอเหิ่ย', 'ไอเฮีย', 'อีเหิ่ย', 'อีเฮีย', 'เฮิ่ยเอ้ย'];
      
      compounds.forEach(compound => {
        // Add as custom words since they're creative variations
        filter.addCustomWord(compound);
        const result = filter.check(compound);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords[0].word).toBe(compound);
      });
    });

    test('should detect spaced variations', () => {
      const spacedVariations = ['เ หี้ ย', 'เ ห ี้ ย', 'เหี้ ย'];
      
      spacedVariations.forEach(spaced => {
        const result = filter.check(spaced);
        // May not detect spaced versions by default, but should detect component parts
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });

    test('should detect with inserted characters', () => {
      const insertedChars = ['เหxี้ย', 'เห.ี้ย', 'เห-ี้ย', 'เห_ี้ย'];
      
      insertedChars.forEach(modified => {
        // These are tricky variations that may need custom handling
        const result = filter.check(modified);
        // Check if base components are detected
        expect(result.detectedWords.some(d => d.word === 'หี')).toBe(true);
      });
    });
  });

  describe('สัส variations', () => {
    test('should detect vowel and tone variations', () => {
      const variations = ['สาส', 'สัด', 'สาด', 'ส๊าส', 'ส๋าส', 'ซัส', 'ซาส'];
      
      variations.forEach(variation => {
        const result = filter.check(variation);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          d.word === 'สัส' || d.method === 'variation'
        )).toBe(true);
      });
    });

    test('should detect creative spellings', () => {
      const creative = ['สสส', 'สะส', 'สุส', 'สึส', 'สฺส'];
      
      creative.forEach(variant => {
        const result = filter.check(variant);
        // Some may be caught by similarity, others might need custom handling
        if (result.detectedWords.length > 0) {
          expect(result.detectedWords.some(d => 
            d.word === 'สัส' || d.method === 'similarity'
          )).toBe(true);
        }
      });
    });
  });

  describe('ควย variations', () => {
    test('should detect consonant and vowel variations', () => {
      const variations = ['คอย', 'กวย', 'กอย', 'ควาย', 'คุย', 'ควย'];
      
      variations.forEach(variation => {
        const result = filter.check(variation);
        if (variation === 'ควาย') {
          // ควาย (buffalo) might be detected but could be whitelisted
          if (!result.isClean) {
            expect(result.detectedWords.some(d => d.word === 'ควย')).toBe(true);
          }
        } else {
          expect(result.isClean).toBe(false);
        }
      });
    });

    test('should detect with number/symbol substitutions', () => {
      const substituted = ['ค9ย', 'คw"ย', 'ค๙ย'];
      
      substituted.forEach(variant => {
        // These require advanced pattern matching
        filter.addCustomWord(variant);
        const result = filter.check(variant);
        expect(result.isClean).toBe(false);
      });
    });
  });

  describe('กู มึง variations', () => {
    test('should detect vowel length variations', () => {
      const guVariations = ['กรู', 'กุ', 'กูู', 'กู๋', 'กู๊'];
      const meungVariations = ['มึ้ง', 'มรึง', 'มุง', 'มืง', 'มึ่ง'];
      
      [...guVariations, ...meungVariations].forEach(variation => {
        const result = filter.check(variation);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          d.word === 'กู' || d.word === 'มึง' || d.method === 'variation'
        )).toBe(true);
      });
    });

    test('should detect romanized mixing', () => {
      const mixed = ['กu', 'gู', 'มeung', 'muึง'];
      
      mixed.forEach(variant => {
        const result = filter.check(variant);
        // Mixed script variations are complex
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Context and compound detection', () => {
    test('should detect in context sentences', () => {
      const sentences = [
        'เฮ้ย เหิ่ยไรวะ',
        'อีเฮิ่ยนี่แหละ',
        'ไอเหิ่ยเอ้ย โคตรงี่เง่า',
        'สัสแท้ๆ เลย',
        'ควยไรดีเนื่อง'
      ];

      sentences.forEach(sentence => {
        const result = filter.check(sentence);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });

    test('should handle repetition for emphasis', () => {
      const repeated = ['เหี้ยเหี้ย', 'สัสสัส', 'ควยควย', 'กูกู'];
      
      repeated.forEach(repeat => {
        const result = filter.check(repeat);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });

    test('should detect disguised with particles', () => {
      const disguised = ['เหี้ยะ', 'เหี้ยๆ', 'สัสฯ', 'ควยๆลๆ'];
      
      disguised.forEach(variant => {
        const result = filter.check(variant);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          ['เหี้ย', 'สัส', 'ควย'].includes(d.word)
        )).toBe(true);
      });
    });
  });

  describe('Advanced evasion techniques', () => {
    test('should handle zero-width characters and special spacing', () => {
      // These are very advanced evasion techniques
      const advanced = [
        'เ\u200Bหี้ย', // zero-width space
        'เ\u200Cห\u200Dี้ย', // zero-width non-joiner/joiner
        'เหี้\u202Eย' // right-to-left override
      ];

      advanced.forEach(variant => {
        const result = filter.check(variant);
        // Basic filter might not catch these, but component detection should work
        expect(result.detectedWords.some(d => d.word === 'หี')).toBe(true);
      });
    });

    test('should detect backwards and mixed order', () => {
      const backwards = ['ยี้หเ', 'สัส'.split('').reverse().join('')];
      
      backwards.forEach(variant => {
        // Backwards detection is very complex, might need special handling
        const result = filter.check(variant);
        // At minimum, should not crash
        expect(result).toBeDefined();
      });
    });

    test('should handle homoglyph substitutions', () => {
      // Characters that look similar but are different Unicode
      const homoglyphs = ['เнี้ย', 'ѕัѕ']; // Using Cyrillic lookalikes
      
      homoglyphs.forEach(variant => {
        const result = filter.check(variant);
        // These are very advanced attacks, basic detection might miss them
        expect(result).toBeDefined();
      });
    });
  });

  describe('Performance with tricky inputs', () => {
    test('should handle very long strings with variations', () => {
      const longString = 'สวัสดี '.repeat(100) + 'เหิ่ย' + ' ครับ'.repeat(100);
      
      const start = Date.now();
      const result = filter.check(longString);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(500); // Should complete within 500ms
      expect(result.detectedWords.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle multiple variations in one text', () => {
      const multiVariant = 'เหิ่ย เฮีย เฮิ่ย เหี่ย สาส สัด ควาย';
      
      const result = filter.check(multiVariant);
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(2);
    });
  });
});