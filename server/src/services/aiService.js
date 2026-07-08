import { db } from '../models/db.js';

// Simple RAG text similarity check
function calculateSimilarity(text, query) {
  const queryWords = query.toLowerCase().split(/\W+/).filter(Boolean);
  const textWords = text.toLowerCase().split(/\W+/).filter(Boolean);
  
  let matchCount = 0;
  for (const word of queryWords) {
    if (textWords.includes(word)) {
      matchCount++;
    }
  }
  return matchCount;
}

export const aiService = {
  // Simulates chat response using RAG from indexed documents
  generateChatResponse: async (userId, prompt, sessionId) => {
    // 1. Fetch user context & all documents
    const documents = db.find('documents', () => true);
    
    // 2. Rank documents based on text overlap with prompt (RAG search)
    let bestDoc = null;
    let maxMatches = 0;
    
    for (const doc of documents) {
      if (doc.content) {
        const matches = calculateSimilarity(doc.content, prompt);
        if (matches > maxMatches && matches > 1) { // requires at least 2 keyword matches
          maxMatches = matches;
          bestDoc = doc;
        }
      }
    }
    
    let aiResponse = '';
    let sources = [];
    
    if (bestDoc) {
      sources.push({ id: bestDoc.id, name: bestDoc.name });
      
      // Customize reply based on document matches
      const contentLower = bestDoc.content.toLowerCase();
      
      if (prompt.toLowerCase().includes('leave') || prompt.toLowerCase().includes('vacation')) {
        aiResponse = `Based on the document **${bestDoc.name}**, standard leave entitlement for full-time employees is **25 days per calendar year**. 
        
Here are the core rules:
- **Sick Leave**: Up to 10 days of fully paid medical leave.
- **Maternity/Paternity**: 16 weeks fully paid for maternity, 4 weeks for paternity.
- **Carry-over**: Up to 5 unused leave days can be carried over, to be used by March 31st.

The automated leave request workflow checks leave balance, requests manager approval, notifies HR, syncs the calendar, and shoots confirmation email automatically. Let me know if you would like me to draft a request.`;
      } else if (prompt.toLowerCase().includes('sales') || prompt.toLowerCase().includes('target') || prompt.toLowerCase().includes('revenue')) {
        aiResponse = `According to the **${bestDoc.name}** CSV dashboard records, the achieved revenues are:
- **Jan 2026**: $125,000 (Target: $120,000) - Met
- **Feb 2026**: $115,000 (Target: $130,000) - Unmet
- **Mar 2026**: $165,000 (Target: $150,000) - Met
- **Apr 2026**: $178,000 (Target: $160,000) - Met
- **May 2026**: $195,000 (Target: $180,000) - Met
- **Jun 2026**: $210,000 (Target: $200,000) - Met

Overall performance indicates robust Q2 growth with category shift to **Growth** customers from April. Let me know if you need financial reports compiled.`;
      } else if (prompt.toLowerCase().includes('spec') || prompt.toLowerCase().includes('cloudpilot') || prompt.toLowerCase().includes('architecture')) {
        aiResponse = `Based on the **${bestDoc.name}** project details:
- **Tech Stack**: React + Vite + TS + Tailwind (Frontend) and Node.js + Express + JWT (Backend).
- **Core capabilities**: Smart Search, AI document generator, and workflow integration connector state-runner.
- **Database**: PostgreSQL (Supabase schema with UUIDs).

Is there a specific section of the codebase or implementation architecture you want me to write code for?`;
      } else {
        // General query citing the best doc
        aiResponse = `According to your company knowledge file **${bestDoc.name}**:
        
${bestDoc.content.substring(0, 400)}...

*This response was automatically retrieved from the indexed document.* Let me know if you want me to expand on any specific section of this file.`;
      }
    } else {
      // General model response
      if (prompt.toLowerCase().includes('invoice') || prompt.toLowerCase().includes('billing')) {
        aiResponse = `To manage billing:
1. Navigate to the **AI Document Generator**.
2. Select **Invoices** from the drop-down selector.
3. Fill in client information, quantity, and unit prices.
4. Export as **PDF** or **DOCX**, which will automatically record the transaction metrics in the Database.`;
      } else if (prompt.toLowerCase().includes('workflow') || prompt.toLowerCase().includes('automate')) {
        aiResponse = `You can create Zapier-like automated systems in the **Workflow Automation** tab:
1. Select a **Trigger** (e.g. *Leave Request Submitted* or *New Invoice Created*).
2. Configure automation blocks (e.g., *Check Leave Balance*, *Request Manager Approval*, *HR Notify*).
3. The platform will automatically run the steps and display execution logs dynamically.`;
      } else {
        aiResponse = `Hello! I am your **CloudPilot AI Employee Copilot**. I can help you:
- Automate workflows (like employee leave requests or client invoices).
- Retrieve company guidelines using RAG (just upload TXT/CSV files in the **Knowledge Base**).
- Generate premium business files (offers, contracts, invoices).
- Track real-time company analytics.

How can I assist you in streamlining Acme Corp's operations today?`;
      }
    }

    // Save message to database chat messages
    const messageRecord = db.insert('chat_messages', {
      session_id: sessionId,
      sender: 'assistant',
      content: aiResponse,
      source_documents: sources
    });

    // Track AI Usage Analytics
    const logs = db.get('analytics');
    if (logs && logs.aiUsage) {
      logs.aiUsage.push({
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        tokens: Math.floor(Math.random() * 2000) + 1000,
        requests: 1,
        savings: Math.floor(Math.random() * 10) + 5
      });
      db.update('analytics', () => true, logs);
    }

    return messageRecord;
  },

  // Search autocomplete / suggestions engine (Smart Search)
  smartSearch: async (query) => {
    const q = query.toLowerCase();
    const documents = db.get('documents');
    const invoices = db.get('invoices');
    const tasks = db.get('tasks');
    
    const results = [];

    // Search documents
    documents.forEach(doc => {
      if (doc.name.toLowerCase().includes(q) || (doc.content && doc.content.toLowerCase().includes(q))) {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.name,
          subtitle: `Knowledge Base (${doc.file_type} File)`,
          url: `/knowledge-base`
        });
      }
    });

    // Search invoices
    invoices.forEach(inv => {
      if (inv.invoice_number.toLowerCase().includes(q) || inv.client_name.toLowerCase().includes(q)) {
        results.push({
          id: inv.id,
          type: 'invoice',
          title: `${inv.invoice_number} - ${inv.client_name}`,
          subtitle: `Finance Invoice (Status: ${inv.status.toUpperCase()}, Amount: $${inv.amount})`,
          url: `/analytics`
        });
      }
    });

    // Search tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(q) || (task.description && task.description.toLowerCase().includes(q))) {
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Dashboard Task (Priority: ${task.priority.toUpperCase()}, Status: ${task.status})`,
          url: `/dashboard`
        });
      }
    });

    return results.slice(0, 10);
  }
};
