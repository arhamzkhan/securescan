import { saveScan } from '../lib/db.js';
import { performAudit } from '../lib/scanner/auditor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL field is required' });
  }

  try {
    const auditData = await performAudit(url);

    if (auditData.error) {
      return res.status(422).json({ error: auditData.error });
    }

    const savedRecord = await saveScan(auditData.url, auditData.results);
    return res.status(201).json(savedRecord);
  } catch (err) {
    console.error('[Vercel API Error /api/scan]:', err);
    return res.status(500).json({ error: 'Internal server error while auditing URL' });
  }
}
