export const pdfService = {
  // Returns HTML contents based on template type and metadata inputs
  generateDocument: (type, data) => {
    const title = data.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Document`;
    const clientName = data.clientName || data.employeeName || 'Acme Client';
    const date = data.date || new Date().toLocaleDateString();
    const details = data.details || '';
    
    let templateHtml = '';
    
    switch (type.toLowerCase()) {
      case 'invoice': {
        const items = data.items || [{ description: 'General Consultation', quantity: 1, unit_price: 1500, total: 1500 }];
        const subtotal = items.reduce((sum, item) => sum + (item.total || (item.quantity * item.unit_price)), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        
        templateHtml = `
          <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; border: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
              <div>
                <h1 style="color: #6366f1; margin: 0; font-size: 32px; font-weight: bold;">CloudPilot AI</h1>
                <p style="margin: 5px 0;">100 Vercel Way, Suite 400</p>
                <p style="margin: 5px 0;">San Francisco, CA 94107</p>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; color: #4b5563;">INVOICE</h2>
                <p style="margin: 5px 0; font-weight: bold;"># ${data.invoiceNumber || 'INV-2026-X10'}</p>
                <p style="margin: 5px 0;">Date: ${date}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 40px;">
              <h3 style="color: #4b5563; border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Billed To:</h3>
              <p style="margin: 5px 0; font-weight: bold;">${clientName}</p>
              <p style="margin: 5px 0;">${data.clientEmail || 'billing@client.com'}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
              <thead>
                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                  <th style="text-align: left; padding: 12px; font-weight: bold;">Description</th>
                  <th style="text-align: center; padding: 12px; font-weight: bold;">Quantity</th>
                  <th style="text-align: right; padding: 12px; font-weight: bold;">Unit Price</th>
                  <th style="text-align: right; padding: 12px; font-weight: bold;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px;">${item.description}</td>
                    <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right;">$${Number(item.unit_price).toFixed(2)}</td>
                    <td style="padding: 12px; text-align: right;">$${Number(item.total || (item.quantity * item.unit_price)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="display: flex; justify-content: flex-end;">
              <table style="width: 250px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">VAT (10%):</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${tax.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #6366f1;">
                  <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">Total Due:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #6366f1;">$${total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>Thank you for choosing CloudPilot AI workspace! Payments are due within 30 days.</p>
            </div>
          </div>
        `;
        break;
      }
      case 'offer_letter': {
        templateHtml = `
          <div style="font-family: Georgia, serif; padding: 50px; color: #222; max-width: 800px; margin: auto; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 50px;">
              <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: 1px;">CLOUDPILOT AI INC.</h1>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">OFFICIAL LETTER OF EMPLOYMENT</p>
            </div>
            
            <p style="margin-bottom: 20px;">Date: ${date}</p>
            <p style="margin-bottom: 25px;">To,<br><strong>${clientName}</strong><br>${data.address || 'Address Line 1'}</p>
            
            <h3 style="margin-top: 30px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Subject: Offer of Employment - ${data.jobTitle || 'AI Software Engineer'}</h3>
            
            <p>Dear ${clientName.split(' ')[0] || 'Candidate'},</p>
            <p>We are absolutely thrilled to offer you a full-time position at CloudPilot AI Inc. as a <strong>${data.jobTitle || 'AI Software Engineer'}</strong>. We were incredibly impressed by your interviews and believe you will bring outstanding value to our core product team.</p>
            
            <h4 style="margin-top: 25px; margin-bottom: 10px;">Terms and Conditions:</h4>
            <ul>
              <li><strong>Commencement Date:</strong> ${data.commencementDate || 'August 1, 2026'}</li>
              <li><strong>Reporting Manager:</strong> ${data.managerName || 'Alice Smith (Engineering Lead)'}</li>
              <li><strong>Compensation:</strong> $${data.salary || '110,000'} USD base per annum, paid bi-weekly.</li>
              <li><strong>Stock Options:</strong> Subject to Board approval, you will be granted 10,000 stock options.</li>
              <li><strong>Work Model:</strong> ${data.workModel || 'Hybrid (San Francisco HQ)'}</li>
            </ul>
            
            <p>${details || 'Standard medical health benefits, dental insurance, and 25 days of annual paid time off are provided as part of our core package.'}</p>
            
            <p style="margin-top: 40px;">To accept this offer, please sign and return this document on or before ${data.expiryDate || 'July 20, 2026'}.</p>
            
            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
              <div>
                <p style="margin-bottom: 40px;">For CloudPilot AI Inc.</p>
                <p><strong>Sarah Connor</strong><br>Managing Director</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 40px;">Accepted By</p>
                <p style="border-top: 1px solid #333; width: 200px; display: inline-block;"></p>
                <p>${clientName}</p>
              </div>
            </div>
          </div>
        `;
        break;
      }
      default: {
        // Fallback for contract, reports, minutes
        templateHtml = `
          <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; line-height: 1.5;">
            <h1 style="color: #6366f1; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 20px;">${title}</h1>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Primary Partner/Attendee:</strong> ${clientName}</p>
            
            <div style="margin-top: 30px; background: #fafafa; border-left: 4px solid #6366f1; padding: 20px;">
              <h3 style="margin-top: 0; color: #1f2937;">Document Summary</h3>
              <p>${details || 'This document contains standard operating minutes, contract specifications, or corporate guidelines compiled by the CloudPilot AI business engine.'}</p>
            </div>
            
            <div style="margin-top: 40px;">
              <h4 style="color: #4b5563;">General Guidelines:</h4>
              <p>1. All content in this file represents proprietary assets of CloudPilot AI and associated clients.</p>
              <p>2. Modifications should be completed using the CloudPilot Document Generator workspace to log modifications in the audit tables.</p>
            </div>
            
            <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #9ca3af;">
              <p>CloudPilot AI Workspace Document Engine | Confidential</p>
            </div>
          </div>
        `;
      }
    }
    
    return templateHtml;
  }
};
