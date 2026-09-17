import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PeriodProvider } from './context/PeriodContext';
import './index.css';
import { runDomainInvariants } from './data/domain/invariants';

try {
  runDomainInvariants();
} catch (e) {
  console.warn('[domain] runDomainInvariants gagal', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PeriodProvider>
        <App />
      </PeriodProvider>
    </ErrorBoundary>
  </StrictMode>,
);
