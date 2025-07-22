import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChatTestPage } from '@/pages/ChatTestPage';
import { TestPage } from '@/pages/TestPage';
import { queryClient } from '@/utils/queryClient';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Global CSS reset and base styles
const globalStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f7fafc;
    overflow: hidden;
  }
  
  #root {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
  
  /* Custom scrollbar for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
  
  /* Framer motion spin animation */
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Fix mobile viewport issues */
  @media (max-width: 768px) {
    html, body {
      height: 100vh;
      height: 100dvh; /* Dynamic viewport height for mobile */
      overflow: hidden;
      position: fixed;
      width: 100%;
    }
    
    #root {
      height: 100vh;
      height: 100dvh;
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
    }
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ChatTestPage />
        <ReactQueryDevtools initialIsOpen={false} />
      </LanguageProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 