import { distance as levenshteinDistance } from 'fastest-levenshtein';
import * as stringSimilarity from 'string-similarity';

export class FuzzyMatcher {
  static calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    return 1 - (distance / maxLength);
  }

  static isLevenshteinMatch(str1: string, str2: string, threshold: number = 0.8): boolean {
    const similarity = this.calculateLevenshteinSimilarity(str1.toLowerCase(), str2.toLowerCase());
    return similarity >= threshold;
  }

  static calculateDiceCoefficient(str1: string, str2: string): number {
    return stringSimilarity.compareTwoStrings(str1.toLowerCase(), str2.toLowerCase());
  }

  static isDiceMatch(str1: string, str2: string, threshold: number = 0.7): boolean {
    const similarity = this.calculateDiceCoefficient(str1, str2);
    return similarity >= threshold;
  }

  static findBestMatch(mainString: string, targets: string[]): { target: string; rating: number } | null {
    if (targets.length === 0) return null;
    
    const matches = stringSimilarity.findBestMatch(mainString.toLowerCase(), 
      targets.map(t => t.toLowerCase()));
    
    return {
      target: targets[matches.bestMatchIndex],
      rating: matches.bestMatch.rating
    };
  }

  static calculateJaroWinklerSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    if (len1 === 0 || len2 === 0) return 0;
    
    const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1;
    let matches = 0;
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);
    
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - maxDist);
      const end = Math.min(i + maxDist + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0;
    
    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
    
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }
    
    return jaro + prefix * 0.1 * (1 - jaro);
  }

  static containsFuzzy(text: string, pattern: string, threshold: number = 0.8): boolean {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    if (textLower.includes(patternLower)) return true;
    
    const words = textLower.split(/\s+/);
    for (const word of words) {
      if (this.isLevenshteinMatch(word, patternLower, threshold)) {
        return true;
      }
    }
    
    for (let i = 0; i <= text.length - pattern.length + 2; i++) {
      const substring = text.substring(i, i + pattern.length + 2);
      if (this.isLevenshteinMatch(substring, pattern, threshold)) {
        return true;
      }
    }
    
    return false;
  }

  static findAllFuzzyMatches(text: string, patterns: string[], threshold: number = 0.8): Array<{
    pattern: string;
    position: number;
    similarity: number;
    matchedText: string;
  }> {
    const matches: Array<{
      pattern: string;
      position: number;
      similarity: number;
      matchedText: string;
    }> = [];
    
    const words = text.split(/(\s+)/).filter(w => w.trim());
    let position = 0;
    
    for (const word of words) {
      for (const pattern of patterns) {
        const similarity = this.calculateLevenshteinSimilarity(word.toLowerCase(), pattern.toLowerCase());
        
        if (similarity >= threshold) {
          matches.push({
            pattern,
            position: text.indexOf(word, position),
            similarity,
            matchedText: word
          });
        }
      }
      position += word.length;
    }
    
    return matches;
  }
}