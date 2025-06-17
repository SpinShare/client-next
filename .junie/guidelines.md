# SpinShare Client Development Guidelines

This document provides essential information for developers working on the SpinShare client project.

## Build/Configuration Instructions

### Prerequisites
- Node.js (latest LTS version recommended)
- npm (comes with Node.js)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
To start the development server with hot-reload:
```bash
npm start
```

### Building
To package the application for distribution:
```bash
npm run package
```

To create installers for the current platform:
```bash
npm run make
```

## Testing Information

### Testing Framework
The project uses Vitest for testing, which integrates well with the Vite build system. The testing setup includes:
- Vitest for running tests
- JSDOM for DOM simulation
- @testing-library/vue for Vue component testing

### Running Tests
To run all tests once:
```bash
npm test
```

To run tests in watch mode (for development):
```bash
npm run test:watch
```

### Adding New Tests
Tests are located in the `tests` directory. The naming convention is `[name].test.js`.

#### Unit Tests Example
Here's an example of a unit test for a class:

```javascript
import { describe, it, expect } from 'vitest';
import { YourClass } from '../src/path/to/your/class';

describe('YourClass', () => {
  it('should do something specific', () => {
    // Arrange
    const instance = new YourClass();
    
    // Act
    const result = instance.someMethod();
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

#### Component Tests Example
For Vue components, use @testing-library/vue:

```javascript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/vue';
import YourComponent from '../src/path/to/YourComponent.vue';

describe('YourComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(YourComponent, {
      props: {
        // Your props here
      }
    });
    
    expect(getByText('Expected Text')).toBeTruthy();
  });
  
  it('should respond to user interaction', async () => {
    const { getByText } = render(YourComponent);
    
    await fireEvent.click(getByText('Click Me'));
    
    // Assert the expected outcome
  });
});
```

## Project Structure

The project follows an Electron application structure with Vue.js for the frontend:

- `src/main`: Electron main process code
  - `api`: API client for communicating with the SpinShare server
  - `auth`: Authentication handling
  - `library`: Chart library management
  - `queue`: Download queue management
  - `settings`: Application settings management
- `src/renderer`: Vue.js frontend code
  - `components`: Reusable Vue components
  - `layouts`: Page layouts
  - `modules`: Frontend modules
  - `views`: Page views
- `src/main.js`: Entry point for the Electron main process
- `src/preload.js`: Preload script for secure IPC communication

## Code Style and Development Guidelines

### Vue Components
- Use the Composition API for new components
- Follow the Single File Component pattern
- Use PascalCase for component names
- Use kebab-case for custom events

### JavaScript
- Use ES6+ features
- Use async/await for asynchronous code
- Document functions and classes with JSDoc comments

### Electron
- Use IPC for communication between main and renderer processes
- Use the preload script for exposing main process functionality to the renderer
- Follow the principle of least privilege when exposing APIs

### Testing
- Write tests for new functionality
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies

## Debugging

### Main Process
To debug the main process:
1. Run the application with the `--inspect` flag:
   ```bash
   npm start -- --inspect
   ```
2. Open Chrome and navigate to `chrome://inspect`
3. Click on "Open dedicated DevTools for Node"

### Renderer Process
The renderer process can be debugged using the built-in DevTools:
1. Run the application
2. Press `Ctrl+Shift+I` (or `Cmd+Option+I` on macOS) to open DevTools