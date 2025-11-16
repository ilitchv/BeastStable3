require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ticket = require('./models/Ticket');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.options('*', cors()); 
app.use(cors());
// Increase limit to 10MB to accommodate Base64 image strings
app.use(express.json({ limit: '10mb' })); 

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/', (req, res) => {
    res.send('Beast Reader Lotto Backend is running.');
});

app.post('/api/tickets', async (req, res) => {
    try {
        const ticketData = req.body;
        
        if (!ticketData.ticketNumber || !ticketData.plays || ticketData.plays.length === 0) {
            return res.status(400).json({ message: 'Invalid ticket data provided.' });
        }

        const newTicket = new Ticket(ticketData);
        await newTicket.save();
        
        res.status(201).json({ message: 'Ticket saved successfully.', ticketId: newTicket._id });
    } catch (error) {
        console.error('Error saving ticket:', error);
        res.status(500).json({ message: 'An error occurred while saving the ticket.', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
