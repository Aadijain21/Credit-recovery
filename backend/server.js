const express = require("express");
const cors = require("cors");

const db = require("./config/firebase");
const analysisRoutes = require("./routes/analysis");
const assessmentRoutes = require("./routes/assessments");
const taskRoutes = require("./routes/tasks");
const progressRoutes = require("./routes/progress");
const cardRoutes = require("./routes/cards");
const loanRoutes = require("./routes/loans");

const app = express();

// Allow requests from the frontend dev server and file://
app.use(cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080", "null"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Health-check endpoints
app.get("/", (req, res) => {
    res.json({
        message: "Credit Recovery Backend is running",
        firebase: db ? "connected" : "not connected (missing serviceAccountKey.json)"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        firebase: db ? "connected" : "unavailable"
    });
});

// Route mounts
app.use("/api/analyze", analysisRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/loans", loanRoutes);

// Firestore connection test
app.get("/api/test-firestore", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Firestore is not initialized. Add serviceAccountKey.json to backend/ directory."
        });
    }
    try {
        await db.collection("test").doc("connection").set({
            message: "Firestore connection works",
            timestamp: new Date()
        });
        res.json({ success: true, message: "Firestore connection works" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("===========================================");
    console.log(`  Credit Recovery Backend running on :${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log(`  Firebase: ${db ? "✅ Connected" : "❌ Not connected — add serviceAccountKey.json"}`);
    console.log("===========================================");
});