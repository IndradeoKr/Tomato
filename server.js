const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// User model
const userSchema = new mongoose.Schema({
  email: String,
  password: String // Should hash passwords in production
});
const User = mongoose.model('User', userSchema);

// Register
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ email, password });
    await user.save();
    res.status(200).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload and Predict
const upload = multer({ dest: 'uploads/' });

app.post('/predict', upload.single('image'), (req, res) => {
  const python = spawn('python', ['predict.py', req.file.path]);

  let resultData = '';

  python.stdout.on('data', (data) => {
    resultData += data.toString(); // accumulate stdout data
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
    // Remove the uploaded file after Python script finishes
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(`Failed to delete uploaded file: ${req.file.path}`, err);
      } else {
        console.log(`Deleted uploaded file: ${req.file.path}`);
      }
    });

    try {
      // Use a regular expression to extract only the JSON line
      const match = resultData.match(/\{.*\}/);
      if (!match) {
        throw new Error("No valid JSON found in Python output");
      }

      const result = JSON.parse(match[0]); // only parse the JSON part

      if (result.error) {
        return res.status(500).json({ error: result.error });
      }

      res.json({ prediction: result.class });
    } catch (err) {
      console.error("Failed to parse prediction:", err);
      res.status(500).json({ error: "Invalid JSON from Python script" });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
