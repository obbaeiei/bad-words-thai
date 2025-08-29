# Publishing Steps for bad-words-thai

## Pre-Publish Checklist

✅ Package name updated to `bad-words-thai`
✅ Repository URL updated to `git@github.com:obbaeiei/bad-words-thai.git`
✅ All documentation updated with new name
✅ Build is working
✅ Core functionality tested

## Step-by-Step Publishing

### 1. Final Build and Test
```bash
npm run build
npm run typecheck
npm run lint
```

### 2. Test Package Locally
```bash
# Create a test package
npm pack

# This creates bad-words-thai-2.0.0.tgz
# Test it in another project:
# npm install ./bad-words-thai-2.0.0.tgz
```

### 3. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Bad Words Thai v2.0.0"
git branch -M main
git remote add origin git@github.com:obbaeiei/bad-words-thai.git
git push -u origin main
```

### 4. Login to NPM
```bash
npm login
# Enter your npm credentials
```

### 5. Publish to NPM
```bash
# Publish the package
npm publish

# If you need to publish a scoped package:
# npm publish --access public
```

### 6. Verify Publication
```bash
# Check if package is available
npm info bad-words-thai

# Test installation
mkdir test-install
cd test-install
npm init -y
npm install bad-words-thai
```

### 7. Create GitHub Release
1. Go to https://github.com/obbaeiei/bad-words-thai
2. Click "Releases" → "Create a new release"
3. Tag: `v2.0.0`
4. Title: `Bad Words Thai v2.0.0 - Language Detection & Ignore List`
5. Description: Copy from CHANGELOG.md

## Post-Publish

### Update Documentation
- [ ] Add npm badge to README
- [ ] Update installation examples
- [ ] Create usage examples

### Monitor
- [ ] NPM download stats
- [ ] GitHub issues
- [ ] Community feedback

## Usage After Publishing

Users can now install with:
```bash
npm install bad-words-thai
```

And use with:
```typescript
import { ThaiProfanityFilter } from 'bad-words-thai';

const filter = new ThaiProfanityFilter({
  ignoreList: ["หีบ", "สัสดี", "หน้าหีบ", "ตด"]
});

const result = filter.check('ฉันตด'); // Clean (context-aware)
console.log(result.isClean); // true
```

## Troubleshooting

### If Publish Fails
- Check npm credentials: `npm whoami`
- Verify package name availability: `npm info bad-words-thai`
- Check for version conflicts

### If Package Name Taken
```bash
# Check if name exists
npm info bad-words-thai

# If taken, consider alternatives:
# - bad-words-thai-filter
# - thai-bad-words
# - profanity-filter-thai
```

## Success Indicators
- ✅ Package appears on npmjs.com/package/bad-words-thai
- ✅ Can install via `npm install bad-words-thai`
- ✅ TypeScript types work correctly
- ✅ Examples run without errors