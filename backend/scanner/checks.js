import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { FINDINGS_CATALOG, KNOWN_THIRD_PARTIES } from './findings.js';

export async function runScanChecks(inputUrl) {
  let targetUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const findings = [];
  const thirdPartyConnections = [];
  let html = '';
  let responseHeaders = {};
  let rawCookies = [];
  let finalUrl = targetUrl;
  let mainDomain = '';

  try {
    mainDomain = new URL(targetUrl).hostname;
  } catch (err) {
    throw new Error(`Invalid URL format: ${inputUrl}`);
  }

  // 1. Fetch main request
  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'SecureScan-Auditor/1.0 (+https://securescan.dev)'
      },
      timeout: 10000
    });
    finalUrl = response.url;
    
    // Store headers lowercased
    response.headers.forEach((value, name) => {
      responseHeaders[name.toLowerCase()] = value;
    });

    // Retrieve raw Set-Cookie headers
    if (typeof response.headers.raw === 'function') {
      rawCookies = response.headers.raw()['set-cookie'] || [];
    } else if (response.headers.get('set-cookie')) {
      rawCookies = [response.headers.get('set-cookie')];
    }

    html = await response.text();
  } catch (err) {
    // If fetching failed (e.g., connection refused or invalid host)
    return {
      error: `Failed to fetch target site: ${err.message}`,
      finalUrl: targetUrl,
      findings: [],
      thirdPartyConnections: []
    };
  }

  // Check HTTP Enforcement & Redirects
  const finalProtocol = new URL(finalUrl).protocol;
  const isHttps = finalProtocol === 'https:';

  if (!isHttps) {
    findings.push(FINDINGS_CATALOG.HTTP_NOT_ENFORCED);
  } else {
    // If user provided http://, check if http:// actually redirected to https
    if (targetUrl.startsWith('http://')) {
      try {
        const httpRes = await fetch(targetUrl, { method: 'GET', redirect: 'manual' });
        const location = httpRes.headers.get('location') || '';
        if (httpRes.status < 300 || httpRes.status >= 400 || !location.startsWith('https://')) {
          findings.push(FINDINGS_CATALOG.HTTP_NOT_ENFORCED);
        }
      } catch (e) {
        // Ignore http test error if https succeeded
      }
    }
  }

  // 2. Security Headers Check
  // HSTS
  if (isHttps && !responseHeaders['strict-transport-security']) {
    findings.push(FINDINGS_CATALOG.MISSING_HSTS);
  }

  // CSP
  const cspHeader = responseHeaders['content-security-policy'];
  if (!cspHeader) {
    findings.push(FINDINGS_CATALOG.MISSING_CSP);
  }

  // X-Frame-Options or CSP frame-ancestors
  const xFrame = responseHeaders['x-frame-options'];
  const hasCspFrameAncestors = cspHeader && cspHeader.includes('frame-ancestors');
  if (!xFrame && !hasCspFrameAncestors) {
    findings.push(FINDINGS_CATALOG.MISSING_X_FRAME_OPTIONS);
  }

  // X-Content-Type-Options
  const xContentType = responseHeaders['x-content-type-options'];
  if (!xContentType || !xContentType.toLowerCase().includes('nosniff')) {
    findings.push(FINDINGS_CATALOG.MISSING_X_CONTENT_TYPE_OPTIONS);
  }

  // Referrer-Policy
  if (!responseHeaders['referrer-policy']) {
    findings.push(FINDINGS_CATALOG.MISSING_REFERRER_POLICY);
  }

  // Access-Control-Allow-Origin
  const corsOrigin = responseHeaders['access-control-allow-origin'];
  if (corsOrigin && corsOrigin.trim() === '*') {
    findings.push(FINDINGS_CATALOG.INSECURE_CORS_ORIGIN);
  }

  // 3. Cookie Security Check
  if (rawCookies.length > 0) {
    let missingSecure = false;
    let missingHttpOnly = false;
    let missingSameSite = false;

    rawCookies.forEach(cookieStr => {
      const lowerCookie = cookieStr.toLowerCase();
      if (!lowerCookie.includes('secure')) missingSecure = true;
      if (!lowerCookie.includes('httponly')) missingHttpOnly = true;
      if (!lowerCookie.includes('samesite')) missingSameSite = true;
    });

    if (missingSecure) findings.push(FINDINGS_CATALOG.COOKIE_MISSING_SECURE);
    if (missingHttpOnly) findings.push(FINDINGS_CATALOG.COOKIE_MISSING_HTTPONLY);
    if (missingSameSite) findings.push(FINDINGS_CATALOG.COOKIE_MISSING_SAMESITE);
  }

  // 4. HTML Parsing: Third-party domains & Privacy Policy
  const $ = cheerio.load(html);
  const detectedDomains = new Set();

  // Helper to extract hostname from src/href
  const addResourceDomain = (attrValue) => {
    if (!attrValue) return;
    try {
      // Ignore data: or relative URLs
      if (attrValue.startsWith('data:') || attrValue.startsWith('javascript:')) return;
      const parsedUrl = new URL(attrValue, finalUrl);
      const host = parsedUrl.hostname.toLowerCase();
      if (host && host !== mainDomain && !host.endsWith(`.${mainDomain}`)) {
        detectedDomains.add(host);
      }
    } catch (e) {
      // Invalid URL
    }
  };

  $('script[src]').each((_, el) => addResourceDomain($(el).attr('src')));
  $('link[href]').each((_, el) => addResourceDomain($(el).attr('href')));
  $('iframe[src]').each((_, el) => addResourceDomain($(el).attr('src')));

  detectedDomains.forEach(domain => {
    let category = 'Unclassified third-party domain';

    for (const known of KNOWN_THIRD_PARTIES) {
      if (known.domainMatches.some(match => domain === match || domain.endsWith(`.${match}`))) {
        category = known.category;
        break;
      }
    }

    thirdPartyConnections.push({ domain, category });
  });

  // Check Privacy Policy link
  let hasPrivacyLink = false;
  $('a').each((_, el) => {
    const text = $(el).text().toLowerCase();
    const href = ($(el).attr('href') || '').toLowerCase();
    if (text.includes('privacy') || href.includes('privacy')) {
      hasPrivacyLink = true;
    }
  });

  if (!hasPrivacyLink) {
    findings.push(FINDINGS_CATALOG.NO_PRIVACY_POLICY_LINK_FOUND);
  }

  return {
    finalUrl,
    findings,
    thirdPartyConnections
  };
}
