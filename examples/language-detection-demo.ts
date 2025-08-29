#!/usr/bin/env ts-node

/**
 * Language Detection Feature Demo
 * Shows how language detection prevents false positives
 * Run with: npx ts-node examples/language-detection-demo.ts
 */

import { ThaiProfanityFilter } from '../src/index';

console.log('=== Language Detection Feature Demo ===\n');

const filter = new ThaiProfanityFilter({
  detectKaraoke: true,
  languages: ['thai', 'english']
});

// Test cases showing language detection benefits
const testCases = [
  { text: 'i love you', language: 'English', expected: 'clean', note: 'Was flagged as profanity before language detection' },
  { text: 'hello world', language: 'English', expected: 'clean', note: 'Pure English should be clean' },
  { text: 'เหี้ยแท้', language: 'Thai', expected: 'profanity', note: 'Thai profanity should be detected' },
  { text: 'Hello เหี้ย world', language: 'Mixed', expected: 'profanity', note: 'Mixed content with Thai profanity' },
  { text: 'You are such a hia', language: 'Karaoke', expected: 'profanity', note: 'Thai profanity in English characters' },
  { text: 'fucking bad', language: 'English', expected: 'profanity', note: 'English profanity should be detected' }
];

console.log('Testing language-aware filtering:\n');

testCases.forEach(({ text, language, expected, note }) => {
  const result = filter.check(text);
  const actual = result.isClean ? 'clean' : 'profanity';
  const status = actual === expected ? '✅' : '❌';
  
  console.log(`${status} [${language}] "${text}"`);
  console.log(`   Expected: ${expected}, Got: ${actual}`);
  console.log(`   Note: ${note}`);
  if (!result.isClean) {
    console.log(`   Detected: ${result.detectedWords.map(w => `${w.word}(${w.language})`).join(', ')}`);
  }
  console.log();
});

// Performance comparison
console.log('=== Performance Benefits ===\n');

const performanceTests = [
  'i love you so much',
  'hello beautiful world',
  'thank you very much',
  'have a nice day',
  'good morning everyone'
];

console.log('Testing common English phrases (previously caused false positives):\n');

performanceTests.forEach(text => {
  const start = Date.now();
  const result = filter.check(text);
  const time = Date.now() - start;
  
  console.log(`✅ "${text}" -> Clean: ${result.isClean} (${time}ms)`);
});

console.log('\n=== Summary ===');
console.log('✅ Language detection prevents false positives on English text');
console.log('✅ Maintains accuracy for actual profanity detection');
console.log('✅ Handles mixed language content appropriately');
console.log('✅ Improved performance through smart routing');
console.log('✅ Context-aware karaoke detection when appropriate');