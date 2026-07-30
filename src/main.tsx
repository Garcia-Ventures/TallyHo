import { ThemeProvider, TooltipProvider } from '@gv-tech/ui-web';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './shim-require';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
