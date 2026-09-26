export const FINDINGS_CATALOG = {
  HTTP_NOT_ENFORCED: {
    id: "HTTP_NOT_ENFORCED",
    category: "security",
    status: "fail",
    severity: "high",
    title: "HTTP Not Enforced (Missing HTTPS Redirect)",
    what: "The site either served content over unencrypted HTTP or failed to redirect HTTP requests to HTTPS.",
    why: "Unencrypted HTTP connections expose data in transit to eavesdropping, tampering, and man-in-the-middle attacks.",
    fix: "Configure your web server to redirect all HTTP traffic to HTTPS (301 Permanent Redirect) and enforce TLS for all endpoints."
  },
  MISSING_HSTS: {
    id: "MISSING_HSTS",
    category: "security",
    status: "fail",
    severity: "medium",
    title: "Missing Strict-Transport-Security (HSTS)",
    what: "No Strict-Transport-Security header was detected on the HTTPS response.",
    why: "Without HSTS, browsers may still attempt initial connections over plain HTTP, exposing users to sslstrip and downgrade attacks.",
    fix: "Add the header 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' to all HTTPS responses."
  },
  MISSING_CSP: {
    id: "MISSING_CSP",
    category: "security",
    status: "fail",
    severity: "high",
    title: "Missing Content-Security-Policy",
    what: "No Content-Security-Policy header was found on this response.",
    why: "Without CSP, the browser has no restriction on which scripts can execute, increasing risk from injected or malicious scripts (XSS).",
    fix: "Add a Content-Security-Policy header, starting with a restrictive default-src 'self' and allowing only known-necessary sources."
  },
  MISSING_X_FRAME_OPTIONS: {
    id: "MISSING_X_FRAME_OPTIONS",
    category: "security",
    status: "fail",
    severity: "medium",
    title: "Missing X-Frame-Options Header",
    what: "Neither an X-Frame-Options header nor a CSP frame-ancestors directive was detected.",
    why: "Without frame restrictions, malicious sites can embed your web pages inside an iframe to execute clickjacking attacks.",
    fix: "Set 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN', or define frame-ancestors in your CSP header."
  },
  MISSING_X_CONTENT_TYPE_OPTIONS: {
    id: "MISSING_X_CONTENT_TYPE_OPTIONS",
    category: "security",
    status: "fail",
    severity: "low",
    title: "Missing X-Content-Type-Options Header",
    what: "The X-Content-Type-Options header is missing or not set to 'nosniff'.",
    why: "Browsers may attempt to MIME-sniff response payloads, executing untrusted non-script content (e.g. user uploads) as JavaScript.",
    fix: "Add the header 'X-Content-Type-Options: nosniff' to all HTTP responses."
  },
  MISSING_REFERRER_POLICY: {
    id: "MISSING_REFERRER_POLICY",
    category: "security",
    status: "fail",
    severity: "low",
    title: "Missing Referrer-Policy Header",
    what: "No Referrer-Policy header was specified in the response.",
    why: "Browsers may leak sensitive URL parameters and request paths to third-party destinations via the HTTP Referer header.",
    fix: "Set 'Referrer-Policy: strict-origin-when-cross-origin' or 'no-referrer' to limit cross-origin leakages."
  },
  INSECURE_CORS_ORIGIN: {
    id: "INSECURE_CORS_ORIGIN",
    category: "security",
    status: "warn",
    severity: "medium",
    title: "Wildcard CORS Access-Control-Allow-Origin",
    what: "The server response header Access-Control-Allow-Origin is set to '*'.",
    why: "Allowing wildcard cross-origin access permits any third-party website script to read response content from your server.",
    fix: "Restrict Access-Control-Allow-Origin to trusted explicit origins instead of a wildcard '*'."
  },
  COOKIE_MISSING_SECURE: {
    id: "COOKIE_MISSING_SECURE",
    category: "security",
    status: "fail",
    severity: "medium",
    title: "Cookie Missing Secure Attribute",
    what: "One or more cookies set by the server lack the 'Secure' attribute.",
    why: "Cookies without the Secure flag can be transmitted over plain HTTP connections, exposing session tokens to network sniffing.",
    fix: "Append '; Secure' to all Set-Cookie header definitions."
  },
  COOKIE_MISSING_HTTPONLY: {
    id: "COOKIE_MISSING_HTTPONLY",
    category: "security",
    status: "fail",
    severity: "high",
    title: "Cookie Missing HttpOnly Attribute",
    what: "One or more cookies set by the server lack the 'HttpOnly' attribute.",
    why: "Without HttpOnly, client-side JavaScript can access cookie tokens (via document.cookie), opening them to theft via XSS.",
    fix: "Append '; HttpOnly' to sensitive Set-Cookie header definitions."
  },
  COOKIE_MISSING_SAMESITE: {
    id: "COOKIE_MISSING_SAMESITE",
    category: "security",
    status: "fail",
    severity: "medium",
    title: "Cookie Missing SameSite Attribute",
    what: "One or more cookies set by the server do not specify a SameSite policy (Strict or Lax).",
    why: "Without SameSite attributes, cookies are sent automatically with cross-site requests, increasing risk of Cross-Site Request Forgery (CSRF).",
    fix: "Append '; SameSite=Lax' or '; SameSite=Strict' to all Set-Cookie header definitions."
  },
  NO_PRIVACY_POLICY_LINK_FOUND: {
    id: "NO_PRIVACY_POLICY_LINK_FOUND",
    category: "privacy",
    status: "warn",
    severity: "medium",
    title: "No Privacy Policy Link Detected",
    what: "No hyperlink containing the word 'privacy' in its text or URL was found on the scanned page.",
    why: "Privacy regulations require sites collecting visitor data to provide clear, accessible privacy disclosures.",
    fix: "Add a visible link in your website navigation or footer pointing to your Privacy Policy document (Note: This check is a heuristic scan)."
  }
};

export const KNOWN_THIRD_PARTIES = [
  { domainMatches: ["google-analytics.com", "googletagmanager.com"], category: "Analytics" },
  { domainMatches: ["connect.facebook.net", "facebook.com/tr"], category: "Advertising/Tracking" },
  { domainMatches: ["fonts.googleapis.com", "fonts.gstatic.com"], category: "External resource" },
  { domainMatches: ["youtube.com", "youtube-nocookie.com"], category: "Embedded content" },
  { domainMatches: ["doubleclick.net"], category: "Advertising" },
  { domainMatches: ["hotjar.com"], category: "Analytics" }
];
