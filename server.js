const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  message: String,
  submittedAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

app.get('/registrations', async (req, res) => {
  const registrations = await Registration
    .find()
    .sort({ submittedAt: -1 });

  res.json(registrations);
});

app.post('/registrations', async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    res.status(201).json(registration);
  } catch (error) {
    res.status(400).json({ error: 'Invalid registration data' });
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(3000, () => {
      console.log('API running on http://localhost:3000');
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
  });