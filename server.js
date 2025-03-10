const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// ✅ AI Chatbot Route (Connects to OpenAI API)
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4", // Use "gpt-3.5-turbo" if GPT-4 is unavailable
                messages: [
                    { role: "system", content: "You are an FSRA policy expert. Respond based on FSRA policies and underwriting rules." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();

        // ✅ Fix: Ensure the response is properly handled
        if (data.choices && data.choices.length > 0) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error("Error: Invalid API Response", data);
            res.status(500).json({ error: "Invalid API Response" });
        }

    } catch (error) {
        console.error("Error connecting to OpenAI API:", error);
        res.status(500).json({ error: "Failed to connect to OpenAI API" });
    }
});

// ✅ Test Route (Check if server is running)
app.get("/", (req, res) => {
    res.send("FSRA Chatbot Backend is running.");
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Simulated authentication (Replace this with real database authentication)
    const users = [
        { email: "whynettenikolle@gmail.com", name: "Nicole Gonzales", role: "Insurance Carrier" },
        { email: "gwynethnicole.gonzales@yahoo.ca", name: "Gwyneth Gonzales", role: "FSRA" }
    ];

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ name: user.name, role: user.role });
});

app.get("/pending-requests", async (req, res) => {
    // Simulated pending requests for FSRA roles
    res.json({ requests: ["Request 1: Review Policy #A123", "Request 2: Customer Inquiry #B456"] });
});
