#!/usr/bin/env ts-node

/**
 * Ignore List Feature Demo
 * Shows how to use context-aware ignore patterns
 * Run with: npx ts-node examples/ignore-list-demo.ts
 */

import { ThaiProfanityFilter } from '../src/index';

console.log('=== Ignore List Feature Demo ===\n');

// Create filter with ignore list
const filter = new ThaiProfanityFilter({
  ignoreList: ["หีบ", "สัสดี", "หน้าหีบ", "ตด"]
});

console.log('Filter configured with ignore list: ["หีบ", "สัสดี", "หน้าหีบ", "ตด"]\n');

// Test cases demonstrating ignore functionality
const testCases = [
  { text: 'หีบ', description: 'หีบ (chest/box) - contains หี but should be clean' },
  { text: 'หน้าหีบ', description: 'หน้าหีบ (front of chest) - compound word' },
  { text: 'สัสดี', description: 'สัสดี (typo of สวัสดี) - should be ignored' },
  { text: 'ฉันตด', description: 'ฉันตด - ตด in compound context' },
  { text: 'แตด', description: 'แตด - standalone profanity (should still be detected)' },
  { text: 'สัส', description: 'สัส - not in ignore list (should be detected)' }
];

console.log('Testing ignore list functionality:\n');

testCases.forEach(({ text, description }) => {
  const result = filter.check(text);
  const status = result.isClean ? '✅ CLEAN' : '❌ PROFANITY';
  const detected = result.detectedWords.length > 0 ? 
    ` (detected: ${result.detectedWords.map(w => w.word).join(', ')})` : '';
  
  console.log(`${status} "${text}"`);
  console.log(`   ${description}${detected}`);
  console.log();
});

// Dynamic ignore list management
console.log('=== Dynamic Ignore List Management ===\n');

const dynamicFilter = new ThaiProfanityFilter();

console.log('1. Before adding to ignore list:');
let result = dynamicFilter.check('หีบ');
console.log(`"หีบ" -> Clean: ${result.isClean}\n`);

console.log('2. Adding "หีบ" to ignore list:');
dynamicFilter.addIgnoreWord('หีบ');
result = dynamicFilter.check('หีบ');
console.log(`"หีบ" -> Clean: ${result.isClean}\n`);

console.log('3. Removing "หีบ" from ignore list:');
dynamicFilter.removeIgnoreWord('หีบ');
result = dynamicFilter.check('หีบ');
console.log(`"หีบ" -> Clean: ${result.isClean}\n`);

console.log('=== Summary ===');
console.log('✅ Context-aware filtering prevents false positives');
console.log('✅ Compound words with profane substrings can be whitelisted');
console.log('✅ Dynamic ignore list management available');
console.log('✅ Standalone profanity still properly detected');