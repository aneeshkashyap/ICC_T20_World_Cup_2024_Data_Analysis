import React, { Suspense } from 'react';
import Navbar        from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard     from './pages/Dashboard';

/* Full-page skeleton shown while JS chunks hydrate */
const PageLoader = () => (
  <div
    role="status"
    aria-label="Loading ICC T20 Dashboard…"
    aria-busy="true"
    className="min-h-screen bg-icc-dark flex items-center justify-center"
  >
    <div className="text-center flex flex-col items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl bg-icc-gold flex items-center justify-center
                   font-condensed font-black text-icc-dark text-sm animate-pulse"
        aria-hidden="true"
      >
        T20
      </div>
      <p className="text-icc-muted text-sm animate-pulse">Loading dashboard…</p>
    </div>
    <span className="sr-only">Loading, please wait.</span>
  </div>
);

function App() {
  return (
    <>
      {/* Skip to main content — keyboard accessibility */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200]
                   focus:bg-icc-gold focus:text-icc-dark focus:px-4 focus:py-2 focus:rounded-lg
                   focus:font-bold focus:text-sm"
      >
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        className="pt-14 bg-gradient-to-br from-[#0B1E3C] via-[#020617] to-black min-h-screen text-white"
        role="main"
        aria-label="ICC T20 World Cup 2024 Analytics Dashboard"
      >
        <ErrorBoundary fallbackMessage="The dashboard failed to load. Please refresh the page.">
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default App;
