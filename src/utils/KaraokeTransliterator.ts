export class KaraokeTransliterator {
  private static readonly THAI_CONSONANTS: { [key: string]: string[] } = {
    'ก': ['k', 'g', 'kor', 'ko'],
    'ข': ['kh', 'k', 'kho', 'khor'],
    'ค': ['kh', 'k', 'kho', 'khor'],
    'ฆ': ['kh', 'k', 'kho', 'khor'],
    'ง': ['ng', 'n', 'ngo', 'ngoh'],
    'จ': ['j', 'ch', 'jo', 'chor'],
    'ฉ': ['ch', 'c', 'cho', 'chor'],
    'ช': ['ch', 'c', 'cho', 'chor'],
    'ซ': ['s', 'z', 'so', 'sor'],
    'ฌ': ['ch', 'c', 'cho', 'chor'],
    'ญ': ['y', 'n', 'yo', 'yor'],
    'ฎ': ['d', 't', 'do', 'dor'],
    'ฏ': ['t', 'd', 'to', 'tor'],
    'ฐ': ['th', 't', 'tho', 'thor'],
    'ฑ': ['th', 't', 'tho', 'thor'],
    'ฒ': ['th', 't', 'tho', 'thor'],
    'ณ': ['n', 'na', 'no', 'nor'],
    'ด': ['d', 't', 'do', 'dor'],
    'ต': ['t', 'd', 'to', 'tor'],
    'ถ': ['th', 't', 'tho', 'thor'],
    'ท': ['th', 't', 'tho', 'thor'],
    'ธ': ['th', 't', 'tho', 'thor'],
    'น': ['n', 'na', 'no', 'nor'],
    'บ': ['b', 'p', 'bo', 'bor'],
    'ป': ['p', 'b', 'po', 'por'],
    'ผ': ['ph', 'p', 'pho', 'phor'],
    'ฝ': ['f', 'p', 'fo', 'for'],
    'พ': ['ph', 'p', 'pho', 'phor'],
    'ฟ': ['f', 'p', 'fo', 'for'],
    'ภ': ['ph', 'p', 'pho', 'phor'],
    'ม': ['m', 'ma', 'mo', 'mor'],
    'ย': ['y', 'yo', 'yor'],
    'ร': ['r', 'ra', 'ro', 'ror'],
    'ล': ['l', 'la', 'lo', 'lor'],
    'ว': ['w', 'v', 'wo', 'vor'],
    'ศ': ['s', 'so', 'sor'],
    'ษ': ['s', 'so', 'sor'],
    'ส': ['s', 'so', 'sor'],
    'ห': ['h', 'ha', 'ho', 'hor'],
    'ฬ': ['l', 'la', 'lo', 'lor'],
    'อ': ['', 'o', 'or', 'aw'],
    'ฮ': ['h', 'ha', 'ho', 'hor']
  };

  private static readonly THAI_VOWELS: { [key: string]: string[] } = {
    'ะ': ['a', 'ah', 'ar'],
    'ั': ['a', 'u', 'ar'],
    'า': ['a', 'aa', 'ah', 'ar'],
    'ำ': ['am', 'um'],
    'ิ': ['i', 'ee', 'ih'],
    'ี': ['ee', 'i', 'ii'],
    'ึ': ['ue', 'u', 'eu'],
    'ื': ['ue', 'eu', 'u'],
    'ุ': ['u', 'oo', 'uh'],
    'ู': ['oo', 'u', 'uu'],
    'เ': ['e', 'ay', 'eh'],
    'แ': ['ae', 'a', 'aeh'],
    'โ': ['o', 'oh', 'or'],
    'ใ': ['ai', 'i', 'ay'],
    'ไ': ['ai', 'i', 'ay'],
    'ๅ': ['', 'r', 'ah'],
    '็': ['', 'e', 'eh'],
    '์': ['', '', ''],
    'ๆ': ['', '', '']
  };

  private static readonly COMMON_WORDS: { [key: string]: string[] } = {
    'ไอ้': ['ai', 'i', 'eye', 'aai', 'ay'],
    'อี': ['ee', 'e', 'ii', 'i'],
    'กู': ['gu', 'goo', 'ku', 'koo'],
    'มึง': ['mueng', 'mung', 'meung', 'muang'],
    'เหี้ย': ['hia', 'hea', 'hear', 'heya'],
    'เชี้ย': ['chia', 'chea', 'cheay', 'chiya', 'chay'],
    'เชี่ย': ['chia', 'chea', 'cheay', 'chiya', 'chay'],
    'ควย': ['kuay', 'kuai', 'kwai', 'kway', 'kuy'],
    'สัส': ['sus', 'sas', 'sat', 'sud'],
    'แม่ง': ['maeng', 'mang', 'meang', 'meng'],
    'เย็ด': ['yed', 'yet', 'yedd', 'yaed'],
    'หี': ['hee', 'he', 'hi', 'hii'],
    'แตด': ['taed', 'tad', 'tat', 'ted']
  };

  static thaiToKaraoke(text: string): string[] {
    const variants: string[] = [];
    
    if (this.COMMON_WORDS[text]) {
      variants.push(...this.COMMON_WORDS[text]);
    }
    
    const charVariants = this.generateCharacterVariants(text);
    variants.push(...charVariants);
    
    return [...new Set(variants)];
  }

  private static generateCharacterVariants(text: string): string[] {
    const results: string[] = [];
    const chars = text.split('');
    
    const possibleTransliterations = chars.map(char => {
      if (this.THAI_CONSONANTS[char]) {
        return this.THAI_CONSONANTS[char];
      } else if (this.THAI_VOWELS[char]) {
        return this.THAI_VOWELS[char];
      }
      return [char];
    });
    
    const combinations = this.cartesianProduct(possibleTransliterations);
    
    for (const combo of combinations.slice(0, 20)) {
      results.push(combo.join(''));
    }
    
    return results;
  }

  private static cartesianProduct(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(x => [x]);
    
    const [first, ...rest] = arrays;
    const restProduct = this.cartesianProduct(rest);
    
    const result: string[][] = [];
    for (const item of first) {
      for (const restItem of restProduct) {
        result.push([item, ...restItem]);
      }
    }
    
    return result;
  }

  static karaokeToThai(karaoke: string): string[] {
    const possibleWords: string[] = [];
    
    for (const [thai, karaokes] of Object.entries(this.COMMON_WORDS)) {
      for (const k of karaokes) {
        if (k.toLowerCase() === karaoke.toLowerCase()) {
          possibleWords.push(thai);
        }
      }
    }
    
    return possibleWords;
  }

  static isKaraokeMatch(text: string, thaiWord: string): boolean {
    const karaokeVariants = this.thaiToKaraoke(thaiWord);
    const normalizedText = text.toLowerCase();
    
    for (const variant of karaokeVariants) {
      if (normalizedText.includes(variant.toLowerCase())) {
        return true;
      }
      
      const noSpaceVariant = variant.replace(/\s+/g, '');
      if (normalizedText.includes(noSpaceVariant.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  static detectKaraokeWords(text: string, thaiWords: string[]): Array<{
    word: string;
    karaoke: string;
    position: number;
  }> {
    const detections: Array<{
      word: string;
      karaoke: string;
      position: number;
    }> = [];
    
    const normalizedText = text.toLowerCase();
    
    for (const thaiWord of thaiWords) {
      const karaokeVariants = this.thaiToKaraoke(thaiWord);
      
      for (const variant of karaokeVariants) {
        // Skip very short variants (1-2 chars) unless they're whole words
        if (variant.length <= 2) {
          // Only match if it's a complete word and not part of a longer English word
          const wordRegex = new RegExp(`\\b${variant.toLowerCase()}\\b`, 'g');
          const matches = normalizedText.matchAll(wordRegex);
          
          for (const match of matches) {
            if (match.index !== undefined) {
              // Additional context check: avoid common English words
              const isCommonEnglish = this.isCommonEnglishWord(variant);
              if (!isCommonEnglish || this.hasThaiContext(text, match.index)) {
                detections.push({
                  word: thaiWord,
                  karaoke: variant,
                  position: match.index
                });
              }
            }
          }
        } else {
          // For longer variants, use substring matching
          const index = normalizedText.indexOf(variant.toLowerCase());
          if (index !== -1) {
            detections.push({
              word: thaiWord,
              karaoke: variant,
              position: index
            });
          }
        }
      }
    }
    
    return detections;
  }

  private static isCommonEnglishWord(word: string): boolean {
    const commonWords = [
      'i', 'a', 'is', 'to', 'in', 'it', 'of', 'me', 'my', 'we', 'he', 'be', 'do', 'go', 'no',
      'up', 'so', 'am', 'an', 'at', 'or', 'as', 'if', 'on', 'by', 'us', 'hi', 'ok', 'oh',
      'love', 'you', 'are', 'the', 'and', 'for', 'not', 'all', 'can', 'had', 'her', 'was',
      'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new',
      'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'run', 'say',
      'she', 'too', 'use', 'want', 'come', 'know', 'like', 'look', 'make', 'time', 'work',
      'chair', 'cheese', 'china', 'child', 'change', 'choose', 'check', 'cheap', 'cheer',
      'chief', 'church', 'chance', 'choice', 'charge'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  private static hasThaiContext(text: string, position: number): boolean {
    // Check if there are Thai characters nearby
    const contextWindow = 30;
    const start = Math.max(0, position - contextWindow);
    const end = Math.min(text.length, position + contextWindow);
    const context = text.substring(start, end);
    
    // Return true if Thai characters are found in the context
    return /[\u0E00-\u0E7F]/.test(context);
  }

  static detectWithLanguageContext(text: string, thaiWords: string[], languageConfidence: number): Array<{
    word: string;
    karaoke: string;
    position: number;
  }> {
    // If language detection is confident about English, be more restrictive
    if (languageConfidence > 0.8) {
      return this.detectKaraokeWords(text, thaiWords).filter(detection => {
        // Only keep detections that have Thai context or are not common English words
        return this.hasThaiContext(text, detection.position) || 
               !this.isCommonEnglishWord(detection.karaoke);
      });
    }
    
    // For uncertain language detection, use normal karaoke detection
    return this.detectKaraokeWords(text, thaiWords);
  }
}