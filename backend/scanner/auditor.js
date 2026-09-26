import { runScanChecks } from './checks.js';

export async function performAudit(inputUrl) {
  const scanData = await runScanChecks(inputUrl);

  if (scanData.error) {
    return {
      error: scanData.error,
      url: inputUrl,
      scanned_at: new Date().toISOString(),
      results: null
    };
  }

  const findings = scanData.findings;
  const thirdParties = scanData.thirdPartyConnections;

  // Calculate summary stats
  const totalSecurityCheckCount = 10;
  
  let securityFails = 0;
  let securityWarns = 0;
  let privacyFails = 0;
  let privacyWarns = 0;

  findings.forEach(f => {
    if (f.category === 'security') {
      if (f.status === 'fail') securityFails++;
      else if (f.status === 'warn') securityWarns++;
    } else if (f.category === 'privacy') {
      if (f.status === 'fail') privacyFails++;
      else if (f.status === 'warn') privacyWarns++;
    }
  });

  const securityPasses = Math.max(0, totalSecurityCheckCount - (securityFails + securityWarns));
  
  // Privacy summary: link check (1) + tracking check (1 if trackers exist)
  const hasPrivacyLinkWarn = findings.some(f => f.id === 'NO_PRIVACY_POLICY_LINK_FOUND');
  const hasThirdPartyTrackers = thirdParties.some(tp => tp.category === 'Analytics' || tp.category === 'Advertising/Tracking' || tp.category === 'Advertising');
  
  const privacyPasses = (hasPrivacyLinkWarn ? 0 : 1) + (hasThirdPartyTrackers ? 0 : 1);
  if (hasThirdPartyTrackers && !findings.some(f => f.category === 'privacy' && f.id !== 'NO_PRIVACY_POLICY_LINK_FOUND')) {
    privacyWarns += 1;
  }

  const summary = {
    security: {
      pass: securityPasses,
      warn: securityWarns,
      fail: securityFails
    },
    privacy: {
      pass: privacyPasses,
      warn: privacyWarns,
      fail: privacyFails
    }
  };

  return {
    url: scanData.finalUrl || inputUrl,
    scanned_at: new Date().toISOString(),
    results: {
      summary,
      findings,
      thirdPartyConnections: thirdParties
    }
  };
}
