# Contributing to Global-Fi Ultra

Thank you for your interest in contributing to Global-Fi Ultra! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue using the Bug Report template
3. Provide as much detail as possible:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Logs and screenshots

### Suggesting Features

1. Check if the feature has already been suggested in [Issues](../../issues)
2. If not, create a new issue using the Feature Request template
3. Clearly describe:
   - The problem it solves
   - Your proposed solution
   - Use cases

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/global-fi-ultra.git
   cd global-fi-ultra
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add JSDoc comments for new functions
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run test:integration
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit!

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 5+
- Redis 6+
- Docker (optional)

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your API keys to .env

# Start development server
npm run dev
```

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Use async/await over callbacks
- Add JSDoc comments for functions
- Follow existing patterns

### Example
```javascript
/**
 * Analyze sentiment of text
 * 
 * @param {string} text - Text to analyze
 * @param {string} type - Type of text (news, general)
 * @returns {Promise<Object>} Sentiment analysis result
 */
async analyzeSentiment(text, type = 'general') {
  // Implementation
}
```

### File Structure
- Follow Clean Architecture pattern
- Place files in appropriate directories:
  - `src/infrastructure/` - External integrations
  - `src/application/` - Business logic
  - `src/domain/` - Core concepts
  - `src/presentation/` - HTTP layer

## Documentation

- Update README.md if adding features
- Add JSDoc comments to new functions
- Update API documentation for new endpoints
- Include examples for new features

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Add integration tests for API endpoints
- Test edge cases and error scenarios

## Questions?

- Open an issue with the "question" label
- Check existing documentation
- Review closed issues for similar questions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🚀
