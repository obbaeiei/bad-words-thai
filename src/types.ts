export interface FilterOptions {
  languages?: ('thai' | 'english')[];
  detectKaraoke?: boolean;
  levenshteinThreshold?: number;
  similarityThreshold?: number;
  customBadWords?: string[];
  whitelistWords?: string[];
  ignoreList?: string[];
  replaceChar?: string;
  checkVariations?: boolean;
  checkLeetspeak?: boolean;
  checkRepeatingChars?: boolean;
  maxRepeatingChars?: number;
  caseInsensitive?: boolean;
}

export interface FilterResult {
  isClean: boolean;
  detectedWords: DetectedWord[];
  cleanedText?: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  confidence: number;
}

export interface DetectedWord {
  word: string;
  originalWord: string;
  position: number;
  length: number;
  method: DetectionMethod;
  confidence: number;
  language: 'thai' | 'english' | 'karaoke';
}

export type DetectionMethod = 
  | 'exact'
  | 'levenshtein'
  | 'similarity'
  | 'leetspeak'
  | 'repeating'
  | 'karaoke'
  | 'variation';

export interface Dictionary {
  words: string[];
  severity: { [key: string]: 'mild' | 'moderate' | 'severe' };
  variations?: { [key: string]: string[] };
}

export interface KaraokeMapping {
  thai: string;
  karaoke: string[];
}