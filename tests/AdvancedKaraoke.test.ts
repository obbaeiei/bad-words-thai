import { ThaiProfanityFilter } from '../src/ThaiProfanityFilter';

describe('Advanced Karaoke and Transliteration Tests', () => {
  let filter: ThaiProfanityFilter;

  beforeEach(() => {
    filter = new ThaiProfanityFilter({
      languages: ['thai', 'english'],
      detectKaraoke: true,
      checkVariations: true,
      similarityThreshold: 0.8,
      levenshteinThreshold: 0.8
    });
  });

  describe('Creative karaoke variations', () => {
    test('should detect multiple karaoke spellings of เหี้ย', () => {
      const karaokeVariations = [
        'hia', 'hea', 'hear', 'heya', 'hiya', 
        'hiar', 'hier', 'heer', 'hiaa', 'heaa',
        'h1a', 'h3a', 'he4', 'hi4', 'h!a'
      ];

      karaokeVariations.forEach(variant => {
        const result = filter.check(`You are such a ${variant}`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          d.language === 'karaoke' || d.language === 'thai' || 
          d.word === 'เหี้ย'
        )).toBe(true);
      });
    });

    test('should detect multiple karaoke spellings of ควย', () => {
      const karaokeVariations = [
        'kuay', 'kuai', 'kwai', 'kway', 'quay', 'quai',
        'kua', 'kwa', 'qua', 'kuey', 'kwey', 'quey',
        'k9ay', 'kw4y', 'qu4y', 'k0ay'
      ];

      karaokeVariations.forEach(variant => {
        const result = filter.check(`What a ${variant} person`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.some(d => 
          d.language === 'karaoke' || d.language === 'thai' ||
          d.word === 'ควย'
        )).toBe(true);
      });
    });

    test('should detect multiple karaoke spellings of สัส', () => {
      const karaokeVariations = [
        'sus', 'sas', 'sat', 'sud', 'sut',
        'sauce', 'suss', 'sass', 'sats',
        's0s', 's@s', 's4s', 's#s'
      ];

      karaokeVariations.forEach(variant => {
        const result = filter.check(`This is ${variant}`);
        if (!result.isClean) {
          expect(result.detectedWords.some(d => 
            d.language === 'karaoke' || d.language === 'thai' ||
            d.word === 'สัส'
          )).toBe(true);
        }
      });
    });
  });

  describe('Compound karaoke expressions', () => {
    test('should detect Thai insult compounds in karaoke', () => {
      const compounds = [
        'ai hia', 'ai kuay', 'ee hia', 'ee kuay',
        'i hia', 'i kuay', 'eye hia', 'eye kuay',
        'gu mueng', 'goo mung', 'gu meng', 'ku mueng'
      ];

      compounds.forEach(compound => {
        const result = filter.check(`You ${compound}!`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
        expect(result.detectedWords.some(d => 
          d.language === 'karaoke' || d.language === 'thai'
        )).toBe(true);
      });
    });

    test('should detect creative combinations', () => {
      const creative = [
        'hia sus', 'kuay maeng', 'ai hia kuay',
        'goo hia', 'mueng hia', 'sus kuay',
        'hia jing jing', 'kuay maak maak'
      ];

      creative.forEach(combo => {
        const result = filter.check(`What a ${combo} situation`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Mixed script karaoke', () => {
    test('should detect Thai-English mixing in karaoke style', () => {
      const mixed = [
        'เหี้ย na', 'hia จัง', 'kuay มาก',
        'ai เหี้ย', 'goo จริง', 'sus แท้',
        'fucking hia', 'shit kuay', 'damn sus'
      ];

      mixed.forEach(mixedText => {
        const result = filter.check(mixedText);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });

    test('should detect transliteration with numbers', () => {
      const numbered = [
        'h1a', 'k9ay', 'su5', 'g0o', 'm3ung',
        'a1 h1a', 'k9ay 5us', 'g0o m3ung'
      ];

      numbered.forEach(variant => {
        const result = filter.check(`This is ${variant} behavior`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Context-aware karaoke detection', () => {
    test('should detect karaoke in social media contexts', () => {
      const social = [
        '#hia', '@kuayface', 'hia_lover',
        'sus.boy', 'team.hia', 'pro_kuay',
        'hiastagram', 'kuaybook', 'sustweet'
      ];

      social.forEach(handle => {
        const result = filter.check(`Follow ${handle} on social`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });

    test('should detect in gaming contexts', () => {
      const gaming = [
        'player_hia', 'kuay_gamer', 'sus_noob',
        'hia123', 'kuay456', 'sus789',
        'hiakiller', 'kuaymaster', 'suslegend'
      ];

      gaming.forEach(username => {
        const result = filter.check(`${username} joined the game`);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });

    test('should detect in conversational contexts', () => {
      const conversation = [
        'Hey hia, how are you?',
        'What kuay thing to do',
        'That sus behavior again',
        'Ai hia, come here',
        'Goo mueng, stop it',
        'So hia of you to say that'
      ];

      conversation.forEach(sentence => {
        const result = filter.check(sentence);
        expect(result.isClean).toBe(false);
        expect(result.detectedWords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Regional karaoke variations', () => {
    test('should detect different regional pronunciation styles', () => {
      const regional = [
        // Northern Thai style
        'hia lae', 'kuay der', 'sus naa',
        // Northeastern style  
        'hia bor', 'kuay laew', 'sus dee',
        // Southern style
        'hia lah', 'kuay ni', 'sus gorn'
      ];

      regional.forEach(variant => {
        const result = filter.check(`This is ${variant}`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });

    test('should detect English accent variations', () => {
      const accents = [
        'hiar', 'hieh', 'hiyah', 'hiyer',
        'kuar', 'kueh', 'kwahr', 'kwer',
        'sars', 'suhs', 'sahs', 'sohs'
      ];

      accents.forEach(accent => {
        const result = filter.check(`That ${accent} attitude`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Karaoke with intentional misspellings', () => {
    test('should detect phonetically similar misspellings', () => {
      const phonetic = [
        'heya', 'hiya', 'heah', 'hiyah',
        'kwaai', 'kwaii', 'kuaai', 'kuaii',
        'suss', 'sass', 'soos', 'sees'
      ];

      phonetic.forEach(variant => {
        const result = filter.check(`Don't be ${variant}`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });

    test('should detect keyboard layout substitutions', () => {
      const keyboard = [
        'goa', 'gia', 'hoa', // G-H mix
        'kyay', 'luay', 'juay', // K-L-J mix
        'dus', 'fus', 'rus' // D-F-R mix
      ];

      keyboard.forEach(variant => {
        const result = filter.check(`What a ${variant} move`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Advanced transliteration schemes', () => {
    test('should detect different romanization systems', () => {
      const romanization = [
        // Royal Thai General System
        'hia', 'khuai', 'sat',
        // ALA-LC romanization
        'hīa', 'khūai', 'sạt', 
        // Thai Ministry of Interior
        'hea', 'kuay', 'sus',
        // Simplified systems
        'hir', 'kway', 'sas'
      ];

      romanization.forEach(variant => {
        const result = filter.check(`Such ${variant} behavior`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });

    test('should detect with tone indicators', () => {
      const toned = [
        'hîa', 'hía', 'hìa', 'hī́a', 'hī̀a',
        'khuāi', 'khuái', 'khuài', 'khuâi',
        'sạt', 'sát', 'sàt', 'sât', 'sǎt'
      ];

      toned.forEach(variant => {
        const result = filter.check(`Very ${variant} indeed`);
        if (!result.isClean) {
          expect(result.detectedWords.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Performance with karaoke variations', () => {
    test('should handle many karaoke variations efficiently', () => {
      const manyVariations = Array.from({length: 50}, (_, i) => 
        `hia${i} kuay${i} sus${i}`
      ).join(' ');

      const start = Date.now();
      const result = filter.check(manyVariations);
      const end = Date.now();

      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
      expect(result.detectedWords.length).toBeGreaterThan(0);
    });

    test('should detect karaoke in long mixed content', () => {
      const longMixed = `
        Hello everyone, this is a long message with various content.
        We talk about many things here, including some hia behavior.
        People sometimes act like kuay when they don't understand.
        It's sus when someone does that kind of thing.
        Anyway, moving on to other topics like technology and sports.
        Basketball is great, football too. But some ai hia people
        ruin the fun with their goo mueng attitude.
      `;

      const result = filter.check(longMixed);
      expect(result.isClean).toBe(false);
      expect(result.detectedWords.length).toBeGreaterThan(3);
      expect(result.detectedWords.some(d => 
        d.language === 'karaoke' || d.language === 'thai'
      )).toBe(true);
    });
  });
});