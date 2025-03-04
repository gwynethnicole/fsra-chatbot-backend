const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Health Check Route (Ensure server is running)
app.get("/", (req, res) => {
    res.send("✅ FSRA Chatbot Backend is running.");
});

// ✅ Chatbot Route
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    // Mock AI response (Replace with actual AI logic later)
    res.json({ reply: `You asked: "${userMessage}". This is a test response.` });
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
