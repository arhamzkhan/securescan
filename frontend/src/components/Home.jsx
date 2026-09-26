import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2, Globe } from 'lucide-react';

export function Home({ onStartScan, isLoading, error }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onStartScan(url.trim());
    }
  };

  const handlePreset = (presetUrl) => {
    setUrl(presetUrl);
    onStartScan(presetUrl);
  };

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">Website Privacy & Security Auditor</h1>
        <p className="hero-subtitle">
          Instantly audit headers, cookie security flags, third-party script connections, and privacy compliance in real-time.
        </p>

        <form onSubmit={handleSubmit} className="scan-box">
          <input
            type="text"
            className="scan-input"
            placeholder="Enter website URL (e.g. github.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <button type="submit" className="scan-btn" disabled={isLoading || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" style={{ width: 18, height: 18, margin: 0 }} />
                Scanning...
              </>
            ) : (
              <>
                Start Audit
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="presets">
          <span>Try quick demo scans:</span>
          <button type="button" className="preset-chip" onClick={() => handlePreset('github.com')}>github.com</button>
          <button type="button" className="preset-chip" onClick={() => handlePreset('example.com')}>example.com</button>
          <button type="button" className="preset-chip" onClick={() => handlePreset('wikipedia.org')}>wikipedia.org</button>
        </div>

        {error && (
          <div className="error-banner" style={{ maxWidth: 680, margin: '1.5rem auto 0 auto' }}>
            {error}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-card" style={{ maxWidth: 680, margin: '2rem auto' }}>
          <div className="spinner" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Performing Live Synchronous Audit</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Fetching target URL, following redirects, parsing HTTP security headers, Set-Cookie attributes, third-party script domains, and privacy links...
          </p>
        </div>
      )}
    </div>
  );
}
