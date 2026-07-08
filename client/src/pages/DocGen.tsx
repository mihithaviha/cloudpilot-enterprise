import React, { useState } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  Eye,
  CheckCircle2
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const DocGen: React.FC = () => {
  const { addToast } = useNotifications();

  const [docType, setDocType] = useState('invoice');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Invoice states
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(Math.random()*9000+1000)}`);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: 'CloudPilot Enterprise Access License', quantity: 1, unit_price: 1500, total: 1500 }
  ]);

  // Offer Letter states
  const [jobTitle, setJobTitle] = useState('Senior AI Architect');
  const [salary, setSalary] = useState('145,000');
  const [commencementDate, setCommencementDate] = useState('2026-08-01');
  const [managerName, setManagerName] = useState('Sarah Connor');

  // Generic descriptions
  const [details, setDetails] = useState('');

  // Results preview state
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const addInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, { description: '', quantity: 1, unit_price: 100, total: 100 }]);
  };

  const removeInvoiceItem = (idx: number) => {
    if (invoiceItems.length === 1) return;
    setInvoiceItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const q = field === 'quantity' ? Number(value) : item.quantity;
          const p = field === 'unit_price' ? Number(value) : item.unit_price;
          updated.total = q * p;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedHtml(null);
    addToast('Generating Document', 'Compiling AI-validated formatting templates...', 'info');

    // Compile post body
    const totalAmount = invoiceItems.reduce((sum, i) => sum + i.total, 0) * 1.1; // Sub + 10% tax
    const payload: any = {
      title: title || `${docType.toUpperCase()} file`,
      clientName,
      clientEmail,
      date: new Date().toLocaleDateString(),
      details
    };

    if (docType === 'invoice') {
      payload.invoiceNumber = invoiceNumber;
      payload.items = invoiceItems;
      payload.totalAmount = totalAmount;
    } else if (docType === 'offer_letter') {
      payload.jobTitle = jobTitle;
      payload.salary = salary;
      payload.commencementDate = commencementDate;
      payload.managerName = managerName;
    }

    try {
      const res = await api.documents.generate(docType, payload);
      setGeneratedHtml(res.html);
      addToast('Document Generated', 'Document compiled successfully.', 'success');
    } catch (err: any) {
      addToast('Generation Failed', err.message, 'danger');
    } finally {
      setGenerating(false);
    }
  };

  // Export as DOCX format using MSWord content type
  const exportDocx = () => {
    if (!generatedHtml) return;
    const blob = new Blob(['\ufeff' + generatedHtml], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}_document.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('Export Successful', 'Editable Word document download complete.', 'success');
  };

  // Native Printable view trigger (perfect PDF generation!)
  const exportPdf = () => {
    if (!generatedHtml) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Export PDF - CloudPilot AI</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body onload="window.print();window.close();">
            ${generatedHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      addToast('Export Triggered', 'System print window loaded.', 'info');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          AI Document Exporter
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select standard layouts to generate corporate contracts, job letters, or sales billing sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 1. Configuration Panel Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Document Type</label>
            <select
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setGeneratedHtml(null);
              }}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-500/30 text-slate-800 dark:text-slate-200"
            >
              <option value="invoice">Commercial Business Invoice</option>
              <option value="offer_letter">Official Employment Offer Letter</option>
              <option value="contract">Standard Vendor Service Contract</option>
              <option value="minutes">Board / Team Meeting Minutes</option>
            </select>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/60" />

          {/* Dynamic Forms */}
          <div className="space-y-4">
            
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  {docType === 'offer_letter' ? 'Employee Full Name' : 'Client / Partner Name'}
                </label>
                <input
                  type="text"
                  placeholder={docType === 'offer_letter' ? 'Jane Foster' : 'Vercel Inc'}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  {docType === 'offer_letter' ? 'Employee Contact Email' : 'Client Contact Email'}
                </label>
                <input
                  type="email"
                  placeholder="billing@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Dynamic Template Inputs */}
            {docType === 'invoice' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Invoice Items</label>
                  <button
                    onClick={addInvoiceItem}
                    className="text-[10px] text-brand-500 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-105/50 dark:border-slate-800/30">
                    <input
                      type="text"
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="flex-1 bg-transparent px-2 py-1 text-xs border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-12 bg-transparent px-2 py-1 text-xs border-b border-slate-200 dark:border-slate-700 text-center focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-16 bg-transparent px-2 py-1 text-xs border-b border-slate-200 dark:border-slate-700 text-right focus:outline-none focus:border-brand-500 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={() => removeInvoiceItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {docType === 'offer_letter' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Compensation (USD/yr)</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Commencement Date</label>
                  <input
                    type="date"
                    value={commencementDate}
                    onChange={(e) => setCommencementDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Signing Executive</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Custom Description text boxes */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Additional Details & Summary</label>
              <textarea
                placeholder="Specify contract details, leave guidelines description, or meeting summary..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500/20 text-slate-800 dark:text-slate-200 resize-none"
              />
            </div>

          </div>

          {/* Trigger Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex justify-center items-center gap-2 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>{generating ? 'Exporting File...' : 'Generate Document'}</span>
          </button>
        </div>

        {/* 2. Interactive Document Preview Drawer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-brand-500" />
              <span>Layout Viewer</span>
            </span>

            {/* Export options */}
            {generatedHtml && (
              <div className="flex gap-2">
                <button
                  onClick={exportDocx}
                  className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Word</span>
                </button>
                <button
                  onClick={exportPdf}
                  className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/40 overflow-hidden min-h-[350px] bg-white flex flex-col justify-center">
            {generatedHtml ? (
              <div 
                className="p-6 bg-white overflow-y-auto max-h-[500px]"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mx-auto text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Awaiting Generation</h3>
                <p className="text-[10px] text-slate-450 max-w-xs mx-auto leading-relaxed">
                  Configure fields on the settings panel and click "Generate Document" to view layout previews.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default DocGen;
