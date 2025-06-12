// File: netlify/functions/generate.js

exports.handler = async function(event, context) {
  // 1. Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Get the API key from secure environment variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: 'API key is not set on the server.' };
  }

  // 3. Get the prompt from the request body sent by the frontend
  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
      return { statusCode: 400, body: 'No prompt provided.' };
  }

  // 4. Prepare the request to the real Gemini API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
      contents: [{
          role: "user",
          parts: [{ text: prompt }]
      }]
  };

  try {
    // 5. Make the secure call to the Gemini API from the server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // If the API call fails, pass the error back to the frontend
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      return { statusCode: response.status, body: errorBody };
    }

    const data = await response.json();

    // 6. Return the successful response to your frontend
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error in serverless function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};