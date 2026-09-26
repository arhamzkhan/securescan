import React from 'react';

export function ThirdPartyTable({ connections }) {
  if (!connections || connections.length === 0) {
    return (
      <div style={{ padding: '1.5rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontSize: '0.9rem' }}>
        No external third-party domain connections detected on the main page.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Domain Host</th>
            <th>Category / Type</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((item, index) => (
            <tr key={index}>
              <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.domain}</td>
              <td>
                <span className={`cat-pill ${item.category}`}>
                  {item.category}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
