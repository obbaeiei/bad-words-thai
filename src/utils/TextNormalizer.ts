export class TextNormalizer {
  private static readonly THAI_VOWELS = [
    'ะ', 'ั', 'า', 'ำ', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 
    'เ', 'แ', 'โ', 'ใ', 'ไ', '็', '์', 'ๆ'
  ];

  private static readonly THAI_TONE_MARKS = ['่', '้', '๊', '๋'];
  
  private static readonly THAI_SPECIAL_CHARS = ['์', '็', 'ๆ', 'ฯ'];

  private static readonly LEETSPEAK_MAP: { [key: string]: string[] } = {
    'a': ['4', '@', 'ค', 'เอ'],
    'b': ['8', '|3', 'บี'],
    'c': ['(', '<', '{', 'ซี'],
    'd': ['|)', '|]', 'ดี'],
    'e': ['3', '€', 'อี'],
    'f': ['|=', 'เอฟ'],
    'g': ['6', '9', 'จี'],
    'h': ['#', '|-|', 'เอช'],
    'i': ['1', '!', '|', 'ไอ'],
    'j': ['_|', 'เจ'],
    'k': ['|<', '|{', 'เค'],
    'l': ['|_', '1', 'แอล'],
    'm': ['|v|', '^^', 'เอ็ม'],
    'n': ['|\\|', '^', 'เอ็น'],
    'o': ['0', '()', 'โอ'],
    'p': ['|*', '|>', 'พี'],
    'q': ['9', 'คิว'],
    'r': ['|2', '|?', 'อาร์'],
    's': ['5', '$', 'เอส'],
    't': ['7', '+', 'ที'],
    'u': ['|_|', 'ยู'],
    'v': ['\\/', 'วี'],
    'w': ['\\/\\/', 'vv', 'ดับเบิลยู'],
    'x': ['><', 'เอ็กซ์'],
    'y': ['`/', 'วาย'],
    'z': ['2', 'แซด']
  };

  static removeToneMarks(text: string): string {
    let result = text;
    for (const mark of this.THAI_TONE_MARKS) {
      result = result.replace(new RegExp(mark, 'g'), '');
    }
    return result;
  }

  static removeVowels(text: string): string {
    let result = text;
    for (const vowel of this.THAI_VOWELS) {
      result = result.replace(new RegExp(vowel, 'g'), '');
    }
    return result;
  }

  static removeSpecialChars(text: string): string {
    let result = text;
    for (const char of this.THAI_SPECIAL_CHARS) {
      result = result.replace(new RegExp(char, 'g'), '');
    }
    return result;
  }

  static normalizeThaiText(text: string): string {
    let normalized = text;
    normalized = this.removeToneMarks(normalized);
    normalized = normalized.replace(/\s+/g, '');
    normalized = normalized.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, '');
    return normalized.toLowerCase();
  }

  static normalizeRepeatingChars(text: string): string {
    // Replace sequences of 3 or more identical characters with just 1
    const regex = new RegExp(`(.)\\1{2,}`, 'g');
    return text.replace(regex, (match, char) => char);
  }

  static decodeLeetspeak(text: string): string[] {
    const variations: string[] = [text.toLowerCase()];
    // eslint-disable-next-line prefer-const
    let workingTexts = [text.toLowerCase()];

    for (const [letter, substitutes] of Object.entries(this.LEETSPEAK_MAP)) {
      const newWorkingTexts: string[] = [];
      
      for (const workingText of workingTexts) {
        for (const substitute of substitutes) {
          if (workingText.includes(substitute)) {
            const decoded = workingText.replace(new RegExp(substitute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), letter);
            if (!variations.includes(decoded)) {
              variations.push(decoded);
              newWorkingTexts.push(decoded);
            }
          }
        }
      }
      
      if (newWorkingTexts.length > 0) {
        workingTexts.push(...newWorkingTexts);
      }
    }

    return [...new Set(variations)];
  }

  static extractWords(text: string): string[] {
    const thaiWords = text.match(/[\u0E00-\u0E7F]+/g) || [];
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const mixedWords = text.match(/[\u0E00-\u0E7Fa-zA-Z]+/g) || [];
    
    return [...new Set([...thaiWords, ...englishWords, ...mixedWords])];
  }

  static generateVariations(word: string): string[] {
    const variations: string[] = [word];
    
    variations.push(word.toLowerCase());
    variations.push(word.toUpperCase());
    
    variations.push(this.removeToneMarks(word));
    
    variations.push(this.normalizeThaiText(word));
    
    variations.push(this.normalizeRepeatingChars(word));
    
    variations.push(...this.decodeLeetspeak(word));
    
    const withSpaces = word.split('').join(' ');
    variations.push(withSpaces);
    
    const withDots = word.split('').join('.');
    variations.push(withDots);
    
    return [...new Set(variations)];
  }
}