import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../models/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { pdfService } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = express.Router();

// GET /api/documents - List all documents
router.get('/', authenticateToken, (req, res) => {
  const documents = db.get('documents');
  res.json(documents);
});

// POST /api/documents/upload - Upload file and extract content
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file was uploaded.' });
    }

    const fileExt = path.extname(file.originalname).substring(1).toUpperCase();
    let extractedContent = '';

    // If text or CSV, read content directly
    if (fileExt === 'TXT' || fileExt === 'CSV') {
      extractedContent = fs.readFileSync(file.path, 'utf8');
    } else {
      // For PDF, DOCX, Excel - simulate rich text indexing
      extractedContent = `MOCK EXTRACTED CONTENT FOR BINARY FILE: ${file.originalname}
File Type: ${fileExt}
Size: ${file.size} bytes
Upload Timestamp: ${new Date().toISOString()}
Indexed by: CloudPilot AI Document Extraction Service.
Description: This document has been scanned, and text metadata blocks have been mapped into the database vectors. You can now semantic-search queries matching this file contents.`;
    }

    const newDoc = db.insert('documents', {
      user_id: req.user.id,
      name: file.originalname,
      file_path: `uploads/${file.filename}`,
      file_type: fileExt,
      file_size: file.size,
      content: extractedContent,
      status: 'processed'
    });

    // Notify user
    db.insert('notifications', {
      user_id: req.user.id,
      title: 'File Processed',
      message: `"${file.originalname}" was uploaded and mapped successfully.`,
      type: 'success',
      is_read: false,
      created_at: new Date().toISOString()
    });

    // Audit Log
    db.insert('audit_logs', {
      user_id: req.user.id,
      action: 'FILE_UPLOAD',
      target_type: 'document',
      target_id: newDoc.id,
      details: { name: file.originalname, size: file.size },
      ip_address: req.ip
    });

    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/generate - Exporter endpoint
router.post('/generate', authenticateToken, (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: 'Template type and details are required.' });
    }

    const htmlContent = pdfService.generateDocument(type, data);
    
    // Save invoice in DB if type is invoice
    if (type.toLowerCase() === 'invoice') {
      db.insert('invoices', {
        user_id: req.user.id,
        invoice_number: data.invoiceNumber || `INV-${Date.now()}`,
        client_name: data.clientName || 'Acme Client',
        client_email: data.clientEmail || 'billing@client.com',
        amount: Number(data.totalAmount || 1500),
        status: 'unpaid',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: data.items || []
      });
      
      // Update Analytics
      const logs = db.get('analytics');
      if (logs && logs.revenue) {
        // Add to latest month
        const latest = logs.revenue[logs.revenue.length - 1];
        if (latest) {
          latest.revenue += Number(data.totalAmount || 1500);
          db.update('analytics', () => true, logs);
        }
      }
    }

    // Save as text document in file base for search
    const filename = `${type}_${Date.now()}.html`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, htmlContent, 'utf8');

    const newDoc = db.insert('documents', {
      user_id: req.user.id,
      name: `${data.title || type.toUpperCase()}.html`,
      file_path: `uploads/${filename}`,
      file_type: 'HTML',
      file_size: htmlContent.length,
      content: htmlContent.replace(/<[^>]*>/g, ''), // Strip tags for index search
      status: 'processed'
    });

    res.json({ document: newDoc, html: htmlContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documents/:id - Delete file
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const doc = db.findOne('documents', d => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Remove physical file
    const physicalPath = path.join(__dirname, '../../', doc.file_path);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    db.delete('documents', d => d.id === req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
