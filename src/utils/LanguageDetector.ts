import { loadModule, LanguageIdentifier, LanguageResult } from 'cld3-asm';

export type DetectedLanguage = 'thai' | 'english' | 'mixed' | 'unknown';

// Use the LanguageResult from cld3-asm directly

export interface DetectorResult {
  primary: DetectedLanguage;
  confidence: number;
  details: {
    code: string;
    name: string;
    percent: number;
  }[];
  isReliable: boolean;
}

// Module-level language identifier
let cldIdentifier: LanguageIdentifier | null = null;

export class LanguageDetector {
  private static readonly THAI_CHAR_REGEX = /[\u0E00-\u0E7F]/g;
  private static readonly ENGLISH_CHAR_REGEX = /[a-zA-Z]/g;
  
  private static async ensureCldInitialized(): Promise<void> {
    if (!cldIdentifier) {
      try {
        const cldFactory = await loadModule();
        cldIdentifier = cldFactory.create();
      } catch (error) {
        console.warn('Failed to initialize CLD3:', error);
      }
    }
  }
  
  static async detect(text: string): Promise<DetectorResult> {
    try {
      // Quick heuristic check first
      const heuristic = this.quickHeuristic(text);
      
      // For very short text or obvious cases, return heuristic result
      if (text.trim().length < 10 || heuristic.confidence > 0.9) {
        return heuristic;
      }
      
      // Initialize CLD3 if needed
      await this.ensureCldInitialized();
      
      // Use CLD3 for more complex detection if available
      if (cldIdentifier) {
        const detection = cldIdentifier.findLanguage(text);
        return this.processCld3Detection(detection, text);
      }
      
      // Fallback to heuristic if CLD3 not available
      return heuristic;
      
    } catch (error) {
      // Fallback to heuristic if CLD3 fails
      return this.quickHeuristic(text);
    }
  }
  
  static detectSync(text: string): DetectorResult {
    // CLD3-asm is async only, so use heuristic for sync calls
    return this.quickHeuristic(text);
  }
  
  private static quickHeuristic(text: string): DetectorResult {
    const thaiMatches = text.match(this.THAI_CHAR_REGEX) || [];
    const englishMatches = text.match(this.ENGLISH_CHAR_REGEX) || [];
    const totalChars = text.replace(/\s+/g, '').length;
    
    if (totalChars === 0) {
      return {
        primary: 'unknown',
        confidence: 0,
        details: [],
        isReliable: false
      };
    }
    
    const thaiPercent = (thaiMatches.length / totalChars) * 100;
    const englishPercent = (englishMatches.length / totalChars) * 100;
    
    // Determine primary language
    let primary: DetectedLanguage;
    let confidence: number;
    
    if (thaiPercent > 60) {
      primary = 'thai';
      confidence = Math.min(thaiPercent / 100, 0.95);
    } else if (englishPercent > 60) {
      primary = 'english';
      confidence = Math.min(englishPercent / 100, 0.95);
    } else if (thaiPercent > 20 && englishPercent > 20) {
      primary = 'mixed';
      confidence = 0.7;
    } else if (thaiPercent > englishPercent && thaiPercent > 10) {
      primary = 'thai';
      confidence = 0.6;
    } else if (englishPercent > 10) {
      primary = 'english';
      confidence = 0.6;
    } else {
      primary = 'unknown';
      confidence = 0.3;
    }
    
    return {
      primary,
      confidence,
      details: [
        { code: 'th', name: 'Thai', percent: thaiPercent },
        { code: 'en', name: 'English', percent: englishPercent }
      ],
      isReliable: confidence > 0.7
    };
  }
  
  private static processCld3Detection(detection: LanguageResult, originalText: string): DetectorResult {
    const heuristic = this.quickHeuristic(originalText);
    
    if (!detection || !detection.language) {
      return heuristic;
    }
    
    const isReliable = detection.is_reliable;
    
    // Map CLD3 language codes to our types
    let primary: DetectedLanguage;
    
    switch (detection.language) {
      case 'th':
        primary = 'thai';
        break;
      case 'en':
        primary = 'english';
        break;
      default:
        // For unknown languages, use heuristic
        if (heuristic.primary === 'thai' || heuristic.primary === 'english') {
          primary = heuristic.primary;
        } else {
          primary = 'unknown';
        }
        break;
    }
    
    // Check for mixed content
    if (heuristic.primary === 'mixed' && heuristic.confidence > 0.6) {
      primary = 'mixed';
    }
    
    // Combine CLD3 confidence with heuristic
    const combinedConfidence = isReliable ? 
      Math.max(detection.probability, heuristic.confidence) :
      Math.min(detection.probability, heuristic.confidence);
    
    return {
      primary,
      confidence: combinedConfidence,
      details: [{
        code: detection.language,
        name: detection.language,
        percent: detection.probability * 100
      }],
      isReliable
    };
  }
  
  static isThai(text: string): boolean {
    const result = this.detectSync(text);
    return result.primary === 'thai' || result.primary === 'mixed';
  }
  
  static isEnglish(text: string): boolean {
    const result = this.detectSync(text);
    return result.primary === 'english' || result.primary === 'mixed';
  }
  
  static isMixed(text: string): boolean {
    const result = this.detectSync(text);
    return result.primary === 'mixed';
  }
  
  static shouldUseKaraoke(text: string): boolean {
    const result = this.detectSync(text);
    
    // Use karaoke detection for:
    // 1. Mixed language content
    // 2. Unknown language content that might be transliterated Thai
    // 3. English text in Thai context (low confidence English)
    return (
      result.primary === 'mixed' ||
      result.primary === 'unknown' ||
      (result.primary === 'english' && result.confidence < 0.7)
    );
  }
  
  static hasThaiContext(text: string, position?: number): boolean {
    // Check if there are Thai characters in the text
    if (position !== undefined) {
      // Check context window around position
      const contextWindow = 50;
      const start = Math.max(0, position - contextWindow);
      const end = Math.min(text.length, position + contextWindow);
      const context = text.substring(start, end);
      return this.THAI_CHAR_REGEX.test(context);
    }
    
    return this.THAI_CHAR_REGEX.test(text);
  }
}