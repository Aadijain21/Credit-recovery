const express = require("express");
const cors = require("cors");

const analysisRoutes = require("./routes/analysis");

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});