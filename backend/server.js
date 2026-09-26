import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, saveScan, getScanById } from './db.js';
import { performAudit } from './scanner/auditor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize Database connection / table
initDb();

// POST /api/scan - Runs live synchronous scan, saves to DB, returns full result JSON
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;

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
    console.error('[API Error /api/scan]:', err);
    return res.status(500).json({ error: 'Internal server error while auditing URL' });
  }
});

// GET /api/scans/:id - Returns a stored scan by ID
app.get('/api/scans/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const record = await getScanById(id);
    if (!record) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    return res.json(record);
  } catch (err) {
    console.error('[API Error /api/scans/:id]:', err);
    return res.status(500).json({ error: 'Internal server error fetching scan record' });
  }
});

app.listen(PORT, () => {
  console.log(`[SecureScan Backend] Server running on http://localhost:${PORT}`);
});
