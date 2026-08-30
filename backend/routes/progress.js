const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

// GET /api/progress/:assessmentId
router.get("/:assessmentId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }
    try {
        const snapshot = await db
            .collection("tasks")
            .where("assessmentId", "==", req.params.assessmentId)
            .get();

        const tasks = snapshot.docs.map(doc => doc.data());
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed === true).length;
        const remainingTasks = totalTasks - completedTasks;
        const progressPercentage = totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

        res.json({
            success: true,
            assessmentId: req.params.assessmentId,
            totalTasks,
            completedTasks,
            remainingTasks,
            progressPercentage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to calculate progress" });
    }
});

module.exports = router;