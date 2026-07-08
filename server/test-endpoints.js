// Verification Script for CloudPilot AI API routes
// Uses native Node fetch (v18+)

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== Starting CloudPilot AI Verification Tests ===\n');

  // Test 1: Health check
  try {
    const health = await fetch('http://localhost:5000/health').then(r => r.json());
    console.log('✅ TEST 1: Health Check endpoint active:', health);
  } catch (err) {
    console.error('❌ TEST 1 FAILED: Server is offline.', err.message);
    process.exit(1);
  }

  // Test 2: Auth Login with seed credentials
  let token = '';
  try {
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cloudpilot.ai', password: 'password123' })
    });
    
    if (!loginRes.ok) throw new Error(`Status ${loginRes.status}`);
    const data = await loginRes.json();
    token = data.token;
    console.log('✅ TEST 2: Auth Login seed check successful. User:', data.user.full_name, `[Role: ${data.user.role}]`);
  } catch (err) {
    console.error('❌ TEST 2 FAILED: Auth route returned error.', err.message);
    process.exit(1);
  }

  // Test 3: Document Generation check
  try {
    const genRes = await fetch(`${API_BASE}/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'invoice',
        data: {
          invoiceNumber: 'TEST-INV-100',
          clientName: 'Google Test Corp',
          clientEmail: 'billing@google.com',
          totalAmount: 3200,
          items: [{ description: 'Test Seat Licensing', quantity: 2, unit_price: 1600, total: 3200 }]
        }
      })
    });

    if (!genRes.ok) throw new Error(`Status ${genRes.status}`);
    const data = await genRes.json();
    console.log('✅ TEST 3: Invoice Document generation check successful. File mapped ID:', data.document.id);
  } catch (err) {
    console.error('❌ TEST 3 FAILED: Document generation endpoint error.', err.message);
    process.exit(1);
  }

  // Test 4: RAG Chat session
  try {
    // Get chat sessions
    const sessions = await fetch(`${API_BASE}/chat/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    const sessionId = sessions[0]?.id;
    if (!sessionId) throw new Error('No active sessions found');

    // Post RAG query
    const messageRes = await fetch(`${API_BASE}/chat/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: 'What is our standard maternity leave entitlement?' })
    });

    if (!messageRes.ok) throw new Error(`Status ${messageRes.status}`);
    const msgData = await messageRes.json();
    console.log('✅ TEST 4: Chat RAG response successful. Answer snippet:\n', msgData.assistantMessage.content.substring(0, 150) + '...\n');
  } catch (err) {
    console.error('❌ TEST 4 FAILED: Chat RAG endpoint failed.', err.message);
    process.exit(1);
  }

  console.log('🎉 All backend tests completed successfully. CloudPilot AI API is stable and operational!');
}

runTests();
