import React, { useState } from 'react';
import { FindingCard } from './FindingCard';
import { ThirdPartyTable } from './ThirdPartyTable';
import { ShieldCheck, Eye, Share2, ArrowLeft, Check, ExternalLink } from 'lucide-react';

export function ResultsView({ scanRecord, onNewScan }) {
  const [copied, setCopied] = useState(false);

  if (!scanRecord || !scanRecord.results) {
    return (
      <div className="error-banner">
        Invalid scan record payload.
      </div>
    );
  }

  const { id, url, scanned_at, results } = scanRecord;
  const { summary, findings, thirdPartyConnections } = results;

  const securityFindings = findings.filter(f => f.category === 'security');
  const privacyFindings = findings.filter(f => f.category === 'privacy');

  const formattedDate = new Date(scanned_at).toLocaleString();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="results-header">
        <div>
          <div className="target-url">{url}</div>
          <div className="target-meta">
            <span>Scanned: {formattedDate}</span>
            <span>•</span>
            <span>Scan ID #{id}</span>
          </div>
        </div>
        <div className="action-bar">
          <button className="btn-secondary" onClick={handleShare}>
            {copied ? <Check size={15} color="#22c55e" /> : <Share2 size={15} />}
            {copied ? 'Copied Link' : 'Share Audit'}
          </button>
          <button className="btn-secondary" onClick={onNewScan}>
            <ArrowLeft size={15} />
            New Scan
          </button>
        </div>
      </div>

      {/* Summary Bars */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#3b82f6" />
            Security Posture
          </div>
          <div className="badge-row">
            <div className="stat-badge pass">
              {summary.security.pass}
              <span>Pass</span>
            </div>
            <div className="stat-badge warn">
              {summary.security.warn}
              <span>Warn</span>
            </div>
            <div className="stat-badge fail">
              {summary.security.fail}
              <span>Fail</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Eye size={16} color="#a855f7" />
            Privacy & Compliance
          </div>
          <div className="badge-row">
            <div className="stat-badge pass">
              {summary.privacy.pass}
              <span>Pass</span>
            </div>
            <div className="stat-badge warn">
              {summary.privacy.warn}
              <span>Warn</span>
            </div>
            <div className="stat-badge fail">
              {summary.privacy.fail}
              <span>Fail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Findings */}
      <div className="section-heading">
        <ShieldCheck size={18} color="#3b82f6" />
        Security Findings ({securityFindings.length})
      </div>
      {securityFindings.length === 0 ? (
        <div style={{ padding: '1rem 1.25rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--pass)', fontSize: '0.9rem' }}>
          ✓ No security header or cookie flags triggered!
        </div>
      ) : (
        <div className="findings-list">
          {securityFindings.map((f, index) => (
            <FindingCard key={index} finding={f} />
          ))}
        </div>
      )}

      {/* Privacy Findings */}
      <div className="section-heading">
        <Eye size={18} color="#a855f7" />
        Privacy Findings ({privacyFindings.length})
      </div>
      {privacyFindings.length === 0 ? (
        <div style={{ padding: '1rem 1.25rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--pass)', fontSize: '0.9rem' }}>
          ✓ Privacy policy link detected and no policy flags triggered.
        </div>
      ) : (
        <div className="findings-list">
          {privacyFindings.map((f, index) => (
            <FindingCard key={index} finding={f} />
          ))}
        </div>
      )}

      {/* Third Party Connections Table */}
      <div className="section-heading">
        <ExternalLink size={18} color="#888" />
        Third-Party Domain Connections ({thirdPartyConnections.length})
      </div>
      <ThirdPartyTable connections={thirdPartyConnections} />
    </div>
  );
}
