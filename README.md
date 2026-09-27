# SecureScan

A website privacy & security auditing tool. Enter a URL, get an instant breakdown of security headers, cookie security, third-party trackers, and privacy signals — with plain-language explanations of what each finding means and how to fix it.

**Live demo:** https://trysecurescan.vercel.app

## What it checks

**Security**
- HTTPS enforcement & redirect behavior
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- CORS configuration
- Cookie security attributes (Secure, HttpOnly, SameSite)

**Privacy**
- Third-party scripts and trackers (analytics, ads, embedded content)
- Privacy policy link presence

Every finding includes what was found, why it matters, and how to fix it — not just a bare score.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Vercel serverless functions (Node.js)
- **Database:** PostgreSQL (Supabase)

## Running locally

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## Disclaimer

SecureScan analyzes publicly accessible information about websites (HTTP headers, cookies, third-party scripts visible in page source). It does not perform invasive testing, exploitation, or unauthorized access of any kind. Only scan domains you own or have explicit permission to test. Provided for educational and informational purposes, with no warranty of accuracy or completeness.