# Contributing to Bad Words Thai

Thank you for considering contributing to Bad Words Thai! We welcome contributions from the community.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bad-words-thai.git
   cd bad-words-thai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run tests:
   ```bash
   npm test
   ```
4. Run linting:
   ```bash
   npm run lint
   ```
5. Run type checking:
   ```bash
   npm run typecheck
   ```
6. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```
7. Push to your fork and create a pull request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style enforced by ESLint
- Add type annotations for all public APIs
- Write comprehensive tests for new features

## Testing

- Add tests for all new functionality
- Ensure all existing tests pass
- Test coverage should remain above 80%

## Pull Request Guidelines

- Provide a clear description of the problem and solution
- Include relevant issue numbers if applicable
- Add tests for new features
- Update documentation as needed
- Ensure CI passes

## Reporting Issues

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce
- Add relevant code examples

## Adding New Profanity Words

When adding new profanity words to the dictionaries:

1. Consider cultural sensitivity
2. Add appropriate severity levels
3. Include variations if applicable
4. Add test cases
5. Document the reasoning in your PR

## Language Support

When adding support for new languages:

1. Create appropriate dictionary files
2. Add language detection support
3. Include transliteration mappings if needed
4. Add comprehensive test coverage
5. Update documentation

## Security Considerations

- Never commit actual profanity lists to public repositories without careful consideration
- Be mindful of cultural differences in what constitutes offensive language
- Consider the impact of false positives and negatives

Thank you for contributing!