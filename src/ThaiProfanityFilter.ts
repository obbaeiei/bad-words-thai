import { 
  FilterOptions, 
  FilterResult, 
  DetectedWord, 
  DetectionMethod 
} from './types';
import { 
  defaultThaiProfanityList, 
  defaultEnglishProfanityList,
  thaiKaraokeMapping,
  severityMap,
  englishVariations,
  thaiVariations
} from './dictionaries';
import { TextNormalizer } from './utils/TextNormalizer';
import { FuzzyMatcher } from './utils/FuzzyMatcher';
import { KaraokeTransliterator } from './utils/KaraokeTransliterator';
import { LanguageDetector, DetectorResult } from './utils/LanguageDetector';

export class ThaiProfanityFilter {
  private thaiBadWords: Set<string>;
  private englishBadWords: Set<string>;
  private whitelistWords: Set<string>;
  private ignoreWords: Set<string>;
  private options: Required<FilterOptions>;
  private allBadWords: string[];
  private badWordVariations: Map<string, string[]>;

  constructor(options: FilterOptions = {}) {
    this.options = {
      languages: options.languages || ['thai', 'english'],
      detectKaraoke: options.detectKaraoke !== false,
      levenshteinThreshold: options.levenshteinThreshold || 0.8,
      similarityThreshold: options.similarityThreshold || 0.9,
      customBadWords: options.customBadWords || [],
      whitelistWords: options.whitelistWords || [],
      ignoreList: options.ignoreList || ["หีบ", "สัสดี", "หน้าหีบ", "ตด"],
      replaceChar: options.replaceChar || '*',
      checkVariations: options.checkVariations !== false,
      checkLeetspeak: options.checkLeetspeak !== false,
      checkRepeatingChars: options.checkRepeatingChars !== false,
      maxRepeatingChars: options.maxRepeatingChars || 2,
      caseInsensitive: options.caseInsensitive !== false
    };

    this.thaiBadWords = new Set(defaultThaiProfanityList);
    this.englishBadWords = new Set(defaultEnglishProfanityList);
    this.whitelistWords = new Set(this.options.whitelistWords);
    this.ignoreWords = new Set(this.options.ignoreList);
    
    for (const word of this.options.customBadWords) {
      if (this.isThaiText(word)) {
        this.thaiBadWords.add(word);
      } else {
        this.englishBadWords.add(word);
      }
    }

    this.allBadWords = [...this.thaiBadWords, ...this.englishBadWords];
    this.badWordVariations = this.generateBadWordVariations();
  }

  private isThaiText(text: string): boolean {
    return /[\u0E00-\u0E7F]/.test(text);
  }

  private generateBadWordVariations(): Map<string, string[]> {
    const variationsMap = new Map<string, string[]>();
    
    for (const word of this.thaiBadWords) {
      const variations: string[] = [word];
      
      if (thaiVariations[word]) {
        variations.push(...thaiVariations[word]);
      }
      
      variations.push(...TextNormalizer.generateVariations(word));
      
      if (this.options.detectKaraoke) {
        if (thaiKaraokeMapping[word]) {
          variations.push(...thaiKaraokeMapping[word]);
        }
        variations.push(...KaraokeTransliterator.thaiToKaraoke(word));
      }
      
      variationsMap.set(word, [...new Set(variations)]);
    }
    
    for (const word of this.englishBadWords) {
      const variations: string[] = [word];
      
      if (englishVariations[word]) {
        variations.push(...englishVariations[word]);
      }
      
      if (this.options.checkLeetspeak) {
        variations.push(...TextNormalizer.decodeLeetspeak(word));
      }
      
      variations.push(...TextNormalizer.generateVariations(word));
      
      variationsMap.set(word, [...new Set(variations)]);
    }
    
    return variationsMap;
  }

  check(text: string): FilterResult {
    const detectedWords: DetectedWord[] = [];
    
    // Early return for empty/whitespace
    if (!text || text.trim().length === 0) {
      return {
        isClean: true,
        detectedWords: [],
        cleanedText: text,
        severity: 'none',
        confidence: 1.0
      };
    }
    
    // Step 1: Detect language first
    const languageResult = LanguageDetector.detectSync(text);
    
    // Step 2: Apply language-specific filtering strategy
    if (languageResult.primary === 'thai') {
      // Pure Thai text - focus on Thai detection
      if (this.options.languages?.includes('thai')) {
        const exactMatches = this.detectExactMatchesForLanguage(text, 'thai');
        detectedWords.push(...exactMatches);
        
        if (this.options.checkVariations) {
          const variationMatches = this.detectVariationsForLanguage(text, 'thai');
          detectedWords.push(...variationMatches);
        }
      }
    } else if (languageResult.primary === 'english') {
      // Pure English text - focus on English detection
      if (this.options.languages?.includes('english')) {
        const exactMatches = this.detectExactMatchesForLanguage(text, 'english');
        detectedWords.push(...exactMatches);
        
        if (this.options.checkVariations) {
          const variationMatches = this.detectVariationsForLanguage(text, 'english');
          detectedWords.push(...variationMatches);
        }
        
        if (this.options.checkLeetspeak) {
          const leetspeakMatches = this.detectLeetspeak(text);
          detectedWords.push(...leetspeakMatches);
        }
      }
      
      // Only use karaoke if confidence is low (might be transliterated Thai)
      if (this.options.detectKaraoke && languageResult.confidence < 0.8) {
        const karaokeMatches = this.detectKaraokeWithContext(text, languageResult.confidence);
        detectedWords.push(...karaokeMatches);
      }
    } else {
      // Mixed, unknown, or potentially karaoke content
      // Use all detection methods
      const exactMatches = this.detectExactMatches(text);
      detectedWords.push(...exactMatches);
      
      if (this.options.checkVariations) {
        const variationMatches = this.detectVariations(text);
        detectedWords.push(...variationMatches);
      }
      
      if (this.options.checkLeetspeak && this.options.languages?.includes('english')) {
        const leetspeakMatches = this.detectLeetspeak(text);
        detectedWords.push(...leetspeakMatches);
      }
      
      if (this.options.detectKaraoke && this.options.languages?.includes('thai')) {
        const karaokeMatches = this.detectKaraoke(text);
        detectedWords.push(...karaokeMatches);
      }
    }
    
    // Common detection methods for all languages
    if (this.options.checkRepeatingChars) {
      const repeatingMatches = this.detectRepeatingChars(text);
      detectedWords.push(...repeatingMatches);
    }
    
    const fuzzyMatches = this.detectFuzzyMatches(text);
    detectedWords.push(...fuzzyMatches);
    
    const filteredWords = this.filterWhitelisted(detectedWords);
    const ignoreFilteredWords = this.filterIgnoreList(filteredWords, text);
    const languageFilteredWords = this.filterByLanguage(ignoreFilteredWords);
    const uniqueWords = this.deduplicateDetections(languageFilteredWords);
    
    const severity = this.calculateSeverity(uniqueWords);
    const confidence = this.calculateConfidence(uniqueWords);
    
    const cleanedText = this.options.replaceChar ? 
      this.censorText(text, uniqueWords) : undefined;
    
    return {
      isClean: uniqueWords.length === 0,
      detectedWords: uniqueWords,
      cleanedText,
      severity,
      confidence
    };
  }

  private detectExactMatchesForLanguage(text: string, language: 'thai' | 'english'): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const normalizedText = this.options.caseInsensitive ? 
      text.toLowerCase() : text;
    
    const wordsToCheck = language === 'thai' ? 
      Array.from(this.thaiBadWords) : 
      Array.from(this.englishBadWords);
    
    for (const badWord of wordsToCheck) {
      const searchWord = this.options.caseInsensitive ? 
        badWord.toLowerCase() : badWord;
      
      if (language === 'english') {
        const wordRegex = new RegExp(`\\b${searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = normalizedText.matchAll(wordRegex);
        
        for (const match of matches) {
          if (match.index !== undefined) {
            detected.push({
              word: badWord,
              originalWord: text.substring(match.index, match.index + match[0].length),
              position: match.index,
              length: match[0].length,
              method: 'exact',
              confidence: 1.0,
              language: 'english'
            });
          }
        }
      } else {
        let index = normalizedText.indexOf(searchWord);
        while (index !== -1) {
          detected.push({
            word: badWord,
            originalWord: text.substring(index, index + badWord.length),
            position: index,
            length: badWord.length,
            method: 'exact',
            confidence: 1.0,
            language: 'thai'
          });
          index = normalizedText.indexOf(searchWord, index + 1);
        }
      }
    }
    
    return detected;
  }

  private detectVariationsForLanguage(text: string, language: 'thai' | 'english'): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const normalizedText = this.options.caseInsensitive ? 
      text.toLowerCase() : text;
    
    const wordsToCheck = language === 'thai' ? 
      Array.from(this.thaiBadWords) : 
      Array.from(this.englishBadWords);
    
    for (const badWord of wordsToCheck) {
      const variations = this.badWordVariations.get(badWord);
      if (!variations) continue;
      
      for (const variant of variations) {
        if (variant === badWord || variant.length < 3) continue;
        
        const searchVariant = this.options.caseInsensitive ? 
          variant.toLowerCase() : variant;
        
        if (language === 'english') {
          const wordRegex = new RegExp(`\\b${searchVariant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          const matches = normalizedText.matchAll(wordRegex);
          
          for (const match of matches) {
            if (match.index !== undefined) {
              detected.push({
                word: badWord,
                originalWord: text.substring(match.index, match.index + match[0].length),
                position: match.index,
                length: match[0].length,
                method: 'variation',
                confidence: 0.9,
                language: 'english'
              });
            }
          }
        } else {
          let index = normalizedText.indexOf(searchVariant);
          while (index !== -1) {
            detected.push({
              word: badWord,
              originalWord: text.substring(index, index + variant.length),
              position: index,
              length: variant.length,
              method: 'variation',
              confidence: 0.9,
              language: 'thai'
            });
            index = normalizedText.indexOf(searchVariant, index + 1);
          }
        }
      }
    }
    
    return detected;
  }

  private detectExactMatches(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const normalizedText = this.options.caseInsensitive ? 
      text.toLowerCase() : text;
    
    // Get words to check based on language settings
    const wordsToCheck = this.getWordsForLanguages();
    
    for (const badWord of wordsToCheck) {
      const searchWord = this.options.caseInsensitive ? 
        badWord.toLowerCase() : badWord;
      
      // Only find whole word matches for English to reduce false positives
      if (!this.isThaiText(badWord)) {
        const wordRegex = new RegExp(`\\b${searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = normalizedText.matchAll(wordRegex);
        
        for (const match of matches) {
          if (match.index !== undefined) {
            detected.push({
              word: badWord,
              originalWord: text.substring(match.index, match.index + match[0].length),
              position: match.index,
              length: match[0].length,
              method: 'exact',
              confidence: 1.0,
              language: 'english'
            });
          }
        }
      } else {
        // For Thai, use simple substring matching
        let index = normalizedText.indexOf(searchWord);
        while (index !== -1) {
          detected.push({
            word: badWord,
            originalWord: text.substring(index, index + badWord.length),
            position: index,
            length: badWord.length,
            method: 'exact',
            confidence: 1.0,
            language: 'thai'
          });
          index = normalizedText.indexOf(searchWord, index + 1);
        }
      }
    }
    
    return detected;
  }

  private detectVariations(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const normalizedText = this.options.caseInsensitive ? 
      text.toLowerCase() : text;
    
    const wordsToCheck = this.getWordsForLanguages();
    
    for (const badWord of wordsToCheck) {
      const variations = this.badWordVariations.get(badWord);
      if (!variations) continue;
      
      for (const variant of variations) {
        if (variant === badWord || variant.length < 3) continue; // Skip short variations
        
        const searchVariant = this.options.caseInsensitive ? 
          variant.toLowerCase() : variant;
        
        // For English, use word boundaries to reduce false positives
        if (!this.isThaiText(badWord)) {
          const wordRegex = new RegExp(`\\b${searchVariant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          const matches = normalizedText.matchAll(wordRegex);
          
          for (const match of matches) {
            if (match.index !== undefined) {
              detected.push({
                word: badWord,
                originalWord: text.substring(match.index, match.index + match[0].length),
                position: match.index,
                length: match[0].length,
                method: 'variation',
                confidence: 0.9,
                language: 'english'
              });
            }
          }
        } else {
          // For Thai, use simple substring matching
          let index = normalizedText.indexOf(searchVariant);
          while (index !== -1) {
            detected.push({
              word: badWord,
              originalWord: text.substring(index, index + variant.length),
              position: index,
              length: variant.length,
              method: 'variation',
              confidence: 0.9,
              language: 'thai'
            });
            index = normalizedText.indexOf(searchVariant, index + 1);
          }
        }
      }
    }
    
    return detected;
  }

  private detectLeetspeak(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const words = text.split(/\s+/);
    const englishWords = this.options.languages?.includes('english') ? 
      Array.from(this.englishBadWords) : [];
    
    for (const word of words) {
      if (word.length < 3) continue;
      
      const decodedVariants = TextNormalizer.decodeLeetspeak(word);
      
      for (const decoded of decodedVariants) {
        if (decoded === word.toLowerCase()) continue;
        
        for (const badWord of englishWords) {
          if (decoded === badWord.toLowerCase()) {
            const position = text.indexOf(word);
            if (position !== -1) {
              detected.push({
                word: badWord,
                originalWord: word,
                position,
                length: word.length,
                method: 'leetspeak',
                confidence: 0.85,
                language: 'english'
              });
            }
            break;
          }
        }
      }
    }
    
    return detected;
  }

  private detectRepeatingChars(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const words = text.split(/\s+/);
    const wordsToCheck = this.getWordsForLanguages();
    
    for (const word of words) {
      const normalized = TextNormalizer.normalizeRepeatingChars(word);
      
      // Skip if no repeating chars found
      if (normalized === word) continue;
      
      // Check if normalized word matches any bad word
      for (const badWord of wordsToCheck) {
        const searchWord = this.options.caseInsensitive ? 
          badWord.toLowerCase() : badWord;
        const searchNormalized = this.options.caseInsensitive ? 
          normalized.toLowerCase() : normalized;
        
        if (searchNormalized === searchWord) {
          const position = text.indexOf(word);
          if (position !== -1) {
            detected.push({
              word: badWord,
              originalWord: word,
              position,
              length: word.length,
              method: 'repeating',
              confidence: 0.8,
              language: this.isThaiText(badWord) ? 'thai' : 'english'
            });
          }
          break;
        }
      }
    }
    
    return detected;
  }

  private detectFuzzyMatches(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const words = TextNormalizer.extractWords(text).filter(w => w.length >= 4); // Only check words with 4+ characters
    const wordsToCheck = this.getWordsForLanguages();
    
    for (const word of words) {
      if (word.length < 4) continue;
      
      // Only do expensive fuzzy matching for similar-length words (stricter length matching)
      const candidateWords = wordsToCheck.filter(badWord => 
        Math.abs(badWord.length - word.length) <= 1 && badWord.length >= 4
      );
      
      const bestMatch = FuzzyMatcher.findBestMatch(word, candidateWords);
      
      // Only flag if very similar AND not a common word
      if (bestMatch && 
          bestMatch.rating >= this.options.similarityThreshold && 
          !this.isCommonWord(word.toLowerCase())) {
        const position = text.indexOf(word);
        if (position !== -1) {
          detected.push({
            word: bestMatch.target,
            originalWord: word,
            position,
            length: word.length,
            method: 'similarity',
            confidence: bestMatch.rating,
            language: this.isThaiText(bestMatch.target) ? 'thai' : 'english'
          });
        }
      }
      
      // Only check Levenshtein for words that are similar in length
      for (const badWord of candidateWords) {
        if (Math.abs(badWord.length - word.length) > 1) continue;
        
        if (FuzzyMatcher.isLevenshteinMatch(
          word, 
          badWord, 
          this.options.levenshteinThreshold
        )) {
          const position = text.indexOf(word);
          const similarity = FuzzyMatcher.calculateLevenshteinSimilarity(word, badWord);
          
          if (position !== -1 && !this.isCommonWord(word.toLowerCase())) {
            detected.push({
              word: badWord,
              originalWord: word,
              position,
              length: word.length,
              method: 'levenshtein',
              confidence: similarity,
              language: this.isThaiText(badWord) ? 'thai' : 'english'
            });
          }
        }
      }
    }
    
    return detected;
  }

  private detectKaraoke(text: string): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const thaiWords = Array.from(this.thaiBadWords);
    
    const karaokeDetections = KaraokeTransliterator.detectKaraokeWords(
      text, 
      thaiWords
    );
    
    for (const detection of karaokeDetections) {
      detected.push({
        word: detection.word,
        originalWord: detection.karaoke,
        position: detection.position,
        length: detection.karaoke.length,
        method: 'karaoke',
        confidence: 0.85,
        language: 'karaoke'
      });
    }
    
    return detected;
  }

  private detectKaraokeWithContext(text: string, languageConfidence: number): DetectedWord[] {
    const detected: DetectedWord[] = [];
    const thaiWords = Array.from(this.thaiBadWords);
    
    const karaokeDetections = KaraokeTransliterator.detectWithLanguageContext(
      text, 
      thaiWords,
      languageConfidence
    );
    
    for (const detection of karaokeDetections) {
      detected.push({
        word: detection.word,
        originalWord: detection.karaoke,
        position: detection.position,
        length: detection.karaoke.length,
        method: 'karaoke',
        confidence: 0.85,
        language: 'karaoke'
      });
    }
    
    return detected;
  }

  private filterWhitelisted(detectedWords: DetectedWord[]): DetectedWord[] {
    return detectedWords.filter(detection => {
      return !this.whitelistWords.has(detection.originalWord.toLowerCase()) &&
             !this.whitelistWords.has(detection.word.toLowerCase());
    });
  }

  private filterIgnoreList(detectedWords: DetectedWord[], originalText: string): DetectedWord[] {
    return detectedWords.filter(detection => {
      return !this.isInIgnoreContext(detection, originalText);
    });
  }

  private isInIgnoreContext(detection: DetectedWord, text: string): boolean {
    // Check if the detected word is part of an ignored compound word
    const detectionStart = detection.position;
    const detectionEnd = detection.position + detection.length;
    
    for (const ignorePattern of this.ignoreWords) {
      // Find all occurrences of the ignore pattern in the text
      const regex = new RegExp(ignorePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.matchAll(regex);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const ignoreStart = match.index;
          const ignoreEnd = match.index + ignorePattern.length;
          
          // Check if the detection overlaps with or is contained within the ignore pattern
          if (detectionStart >= ignoreStart && detectionEnd <= ignoreEnd) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  private getWordsForLanguages(): string[] {
    const words: string[] = [];
    
    if (this.options.languages?.includes('thai')) {
      words.push(...this.thaiBadWords);
    }
    if (this.options.languages?.includes('english')) {
      words.push(...this.englishBadWords);
    }
    
    return words;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'hello', 'world', 'nice', 'good', 'great', 'well', 'help', 'call', 'will', 'tell', 
      'sell', 'bell', 'hell', 'hell', 'fill', 'bill', 'kill', 'mill', 'pill', 'till',
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its',
      'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man',
      'men', 'run', 'say', 'she', 'too', 'use'
    ];
    return commonWords.includes(word.toLowerCase());
  }

  private filterByLanguage(detectedWords: DetectedWord[]): DetectedWord[] {
    return detectedWords.filter(detection => {
      if (detection.language === 'karaoke') {
        return this.options.languages?.includes('thai');
      }
      return this.options.languages?.includes(detection.language as 'thai' | 'english');
    });
  }

  private deduplicateDetections(detectedWords: DetectedWord[]): DetectedWord[] {
    const seen = new Set<string>();
    const unique: DetectedWord[] = [];
    
    const sorted = detectedWords.sort((a, b) => b.confidence - a.confidence);
    
    for (const detection of sorted) {
      const key = `${detection.position}-${detection.length}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(detection);
      }
    }
    
    return unique;
  }

  private calculateSeverity(detectedWords: DetectedWord[]): 'none' | 'mild' | 'moderate' | 'severe' {
    if (detectedWords.length === 0) return 'none';
    
    let maxSeverity: 'mild' | 'moderate' | 'severe' = 'mild';
    
    for (const detection of detectedWords) {
      const severity = severityMap[detection.word] || 'mild';
      
      if (severity === 'severe') return 'severe';
      if (severity === 'moderate' && maxSeverity === 'mild') {
        maxSeverity = 'moderate';
      }
    }
    
    return maxSeverity;
  }

  private calculateConfidence(detectedWords: DetectedWord[]): number {
    if (detectedWords.length === 0) return 1.0;
    
    const totalConfidence = detectedWords.reduce(
      (sum, detection) => sum + detection.confidence, 
      0
    );
    
    return totalConfidence / detectedWords.length;
  }

  private censorText(text: string, detectedWords: DetectedWord[]): string {
    let censored = text;
    
    const sortedByPosition = detectedWords.sort((a, b) => b.position - a.position);
    
    for (const detection of sortedByPosition) {
      const replacement = this.options.replaceChar.repeat(detection.length);
      censored = censored.substring(0, detection.position) + 
                 replacement + 
                 censored.substring(detection.position + detection.length);
    }
    
    return censored;
  }

  addCustomWord(word: string): void {
    if (this.isThaiText(word)) {
      this.thaiBadWords.add(word);
    } else {
      this.englishBadWords.add(word);
    }
    this.allBadWords.push(word);
    this.badWordVariations = this.generateBadWordVariations();
  }

  removeCustomWord(word: string): void {
    this.thaiBadWords.delete(word);
    this.englishBadWords.delete(word);
    this.allBadWords = this.allBadWords.filter(w => w !== word);
    this.badWordVariations.delete(word);
  }

  addWhitelistWord(word: string): void {
    this.whitelistWords.add(word.toLowerCase());
  }

  removeWhitelistWord(word: string): void {
    this.whitelistWords.delete(word.toLowerCase());
  }

  addIgnoreWord(word: string): void {
    this.ignoreWords.add(word.toLowerCase());
  }

  removeIgnoreWord(word: string): void {
    this.ignoreWords.delete(word.toLowerCase());
  }

  updateOptions(options: Partial<FilterOptions>): void {
    this.options = { ...this.options, ...options };
    if (options.whitelistWords) {
      this.whitelistWords = new Set(options.whitelistWords);
    }
    if (options.ignoreList) {
      this.ignoreWords = new Set(options.ignoreList.map(w => w.toLowerCase()));
    }
    if (options.customBadWords) {
      for (const word of options.customBadWords) {
        this.addCustomWord(word);
      }
    }
  }
}