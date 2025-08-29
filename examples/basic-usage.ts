import { ThaiProfanityFilter } from '../src';

console.log('=== Thai Profanity Filter Examples ===\n');

const filter = new ThaiProfanityFilter({
  languages: ['thai', 'english'],
  detectKaraoke: true,
  levenshteinThreshold: 0.8,
  similarityThreshold: 0.7,
  checkLeetspeak: true,
  checkVariations: true,
  replaceChar: '*'
});

console.log('1. Basic Thai profanity detection:');
const thaiTest = filter.check('เหี้ยแท้ กูไม่ชอบมึงเลย');
console.log(`Text: "เหี้ยแท้ กูไม่ชอบมึงเลย"`);
console.log(`Is Clean: ${thaiTest.isClean}`);
console.log(`Detected words: ${thaiTest.detectedWords.map(d => d.word).join(', ')}`);
console.log(`Severity: ${thaiTest.severity}`);
console.log(`Cleaned: ${thaiTest.cleanedText}\n`);

console.log('2. English profanity detection:');
const englishTest = filter.check('This is fucking bullshit!');
console.log(`Text: "This is fucking bullshit!"`);
console.log(`Is Clean: ${englishTest.isClean}`);
console.log(`Detected words: ${englishTest.detectedWords.map(d => d.word).join(', ')}`);
console.log(`Cleaned: ${englishTest.cleanedText}\n`);

console.log('3. Karaoke transliteration detection:');
const karaokeTest = filter.check('You are such a hia and kuay!');
console.log(`Text: "You are such a hia and kuay!"`);
console.log(`Is Clean: ${karaokeTest.isClean}`);
console.log(`Detected words: ${karaokeTest.detectedWords.map(d => `${d.originalWord} (${d.word})`).join(', ')}`);
console.log(`Language: ${karaokeTest.detectedWords.map(d => d.language).join(', ')}\n`);

console.log('4. Fuzzy matching and variations:');
const fuzzyTest = filter.check('fvck this sh1t and เหี่ย');
console.log(`Text: "fvck this sh1t and เหี่ย"`);
console.log(`Is Clean: ${fuzzyTest.isClean}`);
fuzzyTest.detectedWords.forEach(d => {
  console.log(`  - "${d.originalWord}" -> "${d.word}" (method: ${d.method}, confidence: ${d.confidence.toFixed(2)})`);
});
console.log(`Cleaned: ${fuzzyTest.cleanedText}\n`);

console.log('5. Mixed language content:');
const mixedTest = filter.check('Hello เหี้ย world, this is fucking สัส behavior!');
console.log(`Text: "Hello เหี้ย world, this is fucking สัส behavior!"`);
console.log(`Is Clean: ${mixedTest.isClean}`);
console.log(`Detected words by language:`);
const byLanguage = mixedTest.detectedWords.reduce((acc, d) => {
  if (!acc[d.language]) acc[d.language] = [];
  acc[d.language].push(d.word);
  return acc;
}, {} as Record<string, string[]>);
Object.entries(byLanguage).forEach(([lang, words]) => {
  console.log(`  ${lang}: ${words.join(', ')}`);
});
console.log(`Overall Severity: ${mixedTest.severity}\n`);

console.log('6. Custom configuration example:');
const customFilter = new ThaiProfanityFilter({
  languages: ['english'],
  levenshteinThreshold: 0.9,
  customBadWords: ['badword', 'anotherbad'],
  whitelistWords: ['damn', 'hell'],
  replaceChar: '#'
});

const customTest = customFilter.check('damn this badword but not hell');
console.log(`Text: "damn this badword but not hell"`);
console.log(`Is Clean: ${customTest.isClean}`);
console.log(`Detected: ${customTest.detectedWords.map(d => d.word).join(', ')}`);
console.log(`Cleaned: ${customTest.cleanedText}\n`);

console.log('7. Performance test with repeating characters:');
const repeatingFilter = new ThaiProfanityFilter({ 
  checkRepeatingChars: true,
  maxRepeatingChars: 2 
});
const repeatingTest = repeatingFilter.check('fuuuuucccckkkk thiiissss shiiiittt');
console.log(`Text: "fuuuuucccckkkk thiiissss shiiiittt"`);
console.log(`Is Clean: ${repeatingTest.isClean}`);
console.log(`Detected words: ${repeatingTest.detectedWords.map(d => `${d.originalWord} -> ${d.word}`).join(', ')}\n`);

console.log('8. Dynamic word management:');
filter.addCustomWord('testbadword');
filter.addWhitelistWord('shit');

const dynamicTest1 = filter.check('testbadword and shit');
console.log(`After adding custom bad word and whitelisting "shit":`);
console.log(`Text: "testbadword and shit"`);
console.log(`Is Clean: ${dynamicTest1.isClean}`);
console.log(`Detected: ${dynamicTest1.detectedWords.map(d => d.word).join(', ')}\n`);

console.log('=== End of Examples ===');