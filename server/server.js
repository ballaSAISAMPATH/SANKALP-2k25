const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import your routes and model
const otpRoutes = require('./routes/otp-routes');
const authRouter = require('./routes/auth-routes');
const aiRoutes = require("./routes/ai_routes");
const Prompt = require('./models/Prompt'); // Ensure this path is correct

// Middleware setup
app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Route handlers
app.use('/api/auth', authRouter);
app.use('/ai/initial', aiRoutes);
app.use('/api/otp', otpRoutes);

app.post("/user/storeMongoDb", async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "prompt is required." });
        }
        const newPrompt = await Prompt.create({ prompt: prompt });        
        console.log("Successfully stored:", newPrompt);
        res.status(201).json({ 
            prompt: "Prompt stored successfully!", 
            data: newPrompt 
        });
    } catch (error) {
        console.error("Error storing prompt to MongoDB:", error);
        res.status(500).json({ 
            error: "Failed to store prompt.",
            details: error.prompt
        });
    }
});

app.get("/user/storeMongoDb", async (req, res) => {
    try {
        const allPrompts = await Prompt.find({});
        if (allPrompts.length === 0) {
            return res.status(404).json({ message: "No prompts found." });
        }
        res.status(200).json({ 
            message: "Prompts fetched successfully!", 
            data: allPrompts 
        });

    } catch (error) {
        console.error("Error fetching prompts from MongoDB:", error);
        res.status(500).json({ 
            error: "Failed to fetch prompts.",
            details: error.message
        });
    }
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});