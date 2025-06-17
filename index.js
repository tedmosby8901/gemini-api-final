const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000; // Render provides the PORT env var

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Environment Variables ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Routes ---

// Root route for simple testing
app.get('/', (req, res) => {
  res.send('Gemini Proxy is alive!');
});

// The main route for asking Gemini a question
app.post('/ask', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "A 'question' field is required in the request body." });
  }

  const prompt = `You are a quiz expert. Answer the following multiple-choice question with only the text of the correct answer. Do not add any explanation. Question: ${question}`;

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const answer = geminiResponse.data.candidates[0].content.parts[0].text;
    res.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Failed to communicate with the Gemini API." });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});