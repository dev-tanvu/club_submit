// Vercel serverless function to handle form submission
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbzWFzMnuJcpsSfY1qyOVXFdpEsVfx0b5r7Uleuiw-vlxZ8S3z9KrG6BuO60oTuADFkzWg/exec';
    
    const response = await fetch(googleAppsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with status: ${response.status}`);
    }

    const result = await response.json();
    res.status(200).json(result);

  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit form data',
      details: error.message 
    });
  }
}
