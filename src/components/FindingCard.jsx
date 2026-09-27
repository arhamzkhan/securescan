import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FindingCard({ finding }) {
  const [isOpen, setIsOpen] = useState(false);

  const { status, severity, title, what, why, fix } = finding;

  return (
    <div className="finding-card">
      <div className="finding-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="finding-left">
          <div className={`status-indicator ${status}`} />
          <span className="finding-title">{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {severity && (
            <span className={`severity-pill ${severity}`}>
              {severity}
            </span>
          )}
          {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
        </div>
      </div>

      {isOpen && (
        <div className="finding-body">
          {what && (
            <div className="finding-field">
              <span className="finding-label">What was detected</span>
              <span className="finding-value">{what}</span>
            </div>
          )}

          {why && (
            <div className="finding-field">
              <span className="finding-label">Why it matters</span>
              <span className="finding-value">{why}</span>
            </div>
          )}

          {fix && (
            <div className="finding-field">
              <span className="finding-label">Recommended Fix</span>
              <div className="fix-box">{fix}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
