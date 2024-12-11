const express = require('express');
const PlayHT = require('playht');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Import cors

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

// Set up middleware to parse JSON
app.use(express.json());

// Initialize PlayHT API
PlayHT.init({
  userId: process.env.PLAYHT_USER_ID || 'U5cy0zxOaYSYFPH6Gz4QD47gESl2',
  apiKey: process.env.PLAYHT_API_KEY || 'facf819f2a4a4c5fbe9a49bdac8216a0',
});

// Route to handle TTS requests
app.post('/generate-tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  try {
    const stream = await PlayHT.stream(text, { voiceEngine: 'PlayDialog' });
    const filePath = path.join(__dirname, 'output.mp3');
    const writeStream = fs.createWriteStream(filePath);

    // Save audio stream to file
    stream.pipe(writeStream);

    stream.on('end', () => {
      res.download(filePath, 'output.mp3', (err) => {
        if (err) console.error('Error sending file:', err);
        fs.unlinkSync(filePath); // Delete file after download
      });
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).send('Error generating audio');
    });
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).send('Error generating TTS');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
