import { ThaiProfanityFilter } from '../src/ThaiProfanityFilter';

describe('ThaiProfanityFilter', () => {
  let filter: ThaiProfanityFilter;

  beforeEach(() => {
    filter = new ThaiProfanityFilter();
  });

  describe('Basic functionality', () => {
    test('should detect exact Thai profanity', () => {
      const result = filter.check('เหี้ย');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(0);
      expect(result.detectedWords.some(d => d.word === 'เหี้ย' && d.method === 'exact')).toBe(true);
    });

    test('should detect exact English profanity', () => {
      const result = filter.check('This is fucking awful');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.some(d => d.word === 'fucking' && d.method === 'exact')).toBe(true);
    });

    test('should return clean for non-profane text', () => {
      const filter = new ThaiProfanityFilter({ 
        detectKaraoke: false, 
        checkVariations: false 
      });
      const result = filter.check('สวัสดีครับ Hello world nice day');
      expect(result.isClean).toBe(true);
      expect(result.detectedWords).toHaveLength(0);
    });
  });

  describe('Thai language specific features', () => {
    test('should detect Thai profanity with tone mark variations', () => {
      const result = filter.check('เหี่ย');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.some(d => d.word === 'เหี้ย' || d.originalWord === 'เหี่ย')).toBe(true);
    });

    test('should detect Thai profanity variations', () => {
      const result = filter.check('สาส');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.some(d => d.word === 'สัส')).toBe(true);
    });
  });

  describe('Karaoke detection', () => {
    test('should detect karaoke transliterations of Thai profanity', () => {
      const result = filter.check('You are such a hia');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(0);
      expect(result.detectedWords.some(d => d.language === 'karaoke' || d.language === 'thai')).toBe(true);
    });

    test('should detect multiple karaoke variations', () => {
      const result = filter.check('kuay sus mueng');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(0);
    });
  });

  describe('Fuzzy matching', () => {
    test('should detect leetspeak variations', () => {
      const filter = new ThaiProfanityFilter({ checkLeetspeak: true });
      const result = filter.check('fvck this sh1t');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(0);
    });

    test('should detect similar words with Levenshtein distance', () => {
      const result = filter.check('fucks');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.some(d => d.method === 'levenshtein' || d.method === 'similarity')).toBe(true);
    });

    test('should detect repeating characters', () => {
      const filter = new ThaiProfanityFilter({ checkRepeatingChars: true });
      const result = filter.check('fuckkk');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.some(d => d.method === 'repeating' || d.method === 'similarity')).toBe(true);
    });
  });

  describe('Configuration options', () => {
    test('should respect language filtering', () => {
      const englishOnly = new ThaiProfanityFilter({ 
        languages: ['english'],
        detectKaraoke: false,
        checkVariations: false
      });
      const result = englishOnly.check('เหี้ย fuck');
      expect(result.detectedWords.length).toBeGreaterThan(0);
      expect(result.detectedWords.every(d => d.language === 'english')).toBe(true);
    });

    test('should respect similarity thresholds', () => {
      const strictFilter = new ThaiProfanityFilter({ 
        levenshteinThreshold: 0.95,
        similarityThreshold: 0.95
      });
      const result = strictFilter.check('fack');
      expect(result.isClean).toBe(true);
    });

    test('should use custom replacement character', () => {
      const filter = new ThaiProfanityFilter({ replaceChar: '#' });
      const result = filter.check('fuck');
      expect(result.cleanedText).toContain('####');
    });
  });

  describe('Whitelist functionality', () => {
    test('should ignore whitelisted words', () => {
      const filter = new ThaiProfanityFilter({ 
        whitelistWords: ['damn', 'hell'],
        detectKaraoke: false,
        checkVariations: false
      });
      const result = filter.check('damn this hell');
      expect(result.isClean).toBe(true);
    });
  });

  describe('Severity calculation', () => {
    test('should calculate severity correctly', () => {
      const severityFilter = new ThaiProfanityFilter({
        detectKaraoke: false,
        checkVariations: false
      });
      
      const severe = severityFilter.check('เหี้ย fuck');
      expect(severe.severity).toBe('severe');

      const moderate = severityFilter.check('shit');
      expect(moderate.severity).toBe('moderate');

      const mild = severityFilter.check('damn');
      expect(mild.severity).toBe('mild');
    });
  });

  describe('Dynamic word management', () => {
    test('should add and remove custom words', () => {
      filter.addCustomWord('testbad');
      let result = filter.check('testbad word');
      expect(result.isClean).toBe(false);

      filter.removeCustomWord('testbad');
      result = filter.check('testbad word');
      expect(result.isClean).toBe(true);
    });

    test('should manage whitelist dynamically', () => {
      const dynamicFilter = new ThaiProfanityFilter({
        detectKaraoke: false,
        checkVariations: false
      });
      
      dynamicFilter.addWhitelistWord('fuck');
      let result = dynamicFilter.check('fuck this');
      expect(result.isClean).toBe(true);

      dynamicFilter.removeWhitelistWord('fuck');
      result = dynamicFilter.check('fuck this');
      expect(result.isClean).toBe(false);
    });
  });

  describe('Mixed language detection', () => {
    test('should detect profanity in mixed Thai-English text', () => {
      const result = filter.check('Hello เหี้ย world fuck สัส');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThanOrEqual(3);
      
      const languages = result.detectedWords.map(d => d.language);
      expect(languages).toContain('thai');
      expect(languages).toContain('english');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty strings', () => {
      const result = filter.check('');
      expect(result.isClean).toBe(true);
      expect(result.detectedWords).toHaveLength(0);
    });

    test('should handle strings with only whitespace', () => {
      const result = filter.check('   \n\t  ');
      expect(result.isClean).toBe(true);
    });

    test('should handle very long strings', () => {
      const longText = 'clean word '.repeat(1000) + 'fuck';
      const result = filter.check(longText);
      expect(result.isClean).toBe(false);
      expect(result.detectedWords).toHaveLength(1);
    });

    test('should handle special characters and emojis', () => {
      const result = filter.check('😀 fuck 🎉 เหี้ย 💩');
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(0);
    });
  });

  describe('Performance considerations', () => {
    test('should handle multiple occurrences efficiently', () => {
      const text = 'fuck shit damn hell bitch ass fuck shit';
      const start = Date.now();
      const result = filter.check(text);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(200); // Relaxed timing constraint
      expect(result.detectedWords.length).toBeGreaterThan(0);
    });
  });
});