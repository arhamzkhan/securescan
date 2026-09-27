import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ResultsView } from './components/ResultsView';
import { Shield, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [currentScan, setCurrentScan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
      fetchScanById(id);
    }
  }, []);

  const fetchScanById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scans/${id}`);
      if (!res.ok) {
        throw new Error('Stored audit report not found.');
      }
      const data = await res.json();
      setCurrentScan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScan = async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete scan');
      }

      setCurrentScan(data);
      window.history.pushState({}, '', `?id=${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetScan = () => {
    setCurrentScan(null);
    setError(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="brand" onClick={handleResetScan}>
          <Shield size={22} color="#3b82f6" />
          <span>SecureScan</span>
          <span className="brand-tag">v1.0 (Vercel)</span>
        </div>
        <a href="/" className="portfolio-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          Back to Portfolio <ArrowUpRight size={14} />
        </a>
      </header>

      <main>
        {currentScan ? (
          <ResultsView scanRecord={currentScan} onNewScan={handleResetScan} />
        ) : (
          <Home onStartScan={handleStartScan} isLoading={isLoading} error={error} />
        )}
      </main>
    </div>
  );
}
