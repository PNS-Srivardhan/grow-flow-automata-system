
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error handling for the entire app
const handleError = (error: Error) => {
  console.error('Application error:', error);
  // Create a simple error display
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: red; margin: 20px; font-family: sans-serif;">
        <h2>Application Error</h2>
        <p>Something went wrong loading the application. Please check the console for more details.</p>
        <pre>${error.message}</pre>
      </div>
    `;
  }
};

try {
  console.log('Initializing application...');
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Could not find root element');
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log('Application rendered successfully');
} catch (error) {
  handleError(error as Error);
}
