
const express = require("express");
const cors = require("cors");

const db = require("./config/firebase");
const analysisRoutes = require("./routes/analysis");
const assessmentRoutes = require("./routes/assessments");

const taskRoutes = require("./routes/tasks");
const progressRoutes = require("./routes/progress");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Credit Recovery Backend is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});

app.use("/api/analyze", analysisRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/progress", progressRoutes);

const PORT = process.env.PORT || 5000;

app.get("/api/test-firestore", async (req, res) => {
    try {
        await db.collection("test").doc("connection").set({
            message: "Firestore connection works",
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: "Firestore connection works"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});