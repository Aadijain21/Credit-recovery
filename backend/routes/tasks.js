const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

// Create a recovery task
router.post("/", async (req, res) => {
    try {
        const {
            assessmentId,
            title,
            description,
            category,
            dueDate
        } = req.body;

        if (!assessmentId || !title) {
            return res.status(400).json({
                success: false,
                error: "assessmentId and title are required"
            });
        }

        const task = {
            assessmentId,
            title,
            description: description || "",
            category: category || "general",
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date()
        };

        const docRef = await db
            .collection("tasks")
            .add(task);

        res.status(201).json({
            success: true,
            taskId: docRef.id,
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to create task"
        });
    }
});


// Get all tasks for an assessment
router.get("/:assessmentId", async (req, res) => {
    try {
        const snapshot = await db
            .collection("tasks")
            .where("assessmentId", "==", req.params.assessmentId)
            .get();

        const tasks = snapshot.docs.map(doc => ({
            taskId: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch tasks"
        });
    }
});


// Mark task as completed/uncompleted
router.patch("/:taskId", async (req, res) => {
    try {
        const { completed } = req.body;

        if (typeof completed !== "boolean") {
            return res.status(400).json({
                success: false,
                error: "completed must be true or false"
            });
        }

        const taskRef = db
            .collection("tasks")
            .doc(req.params.taskId);

        const doc = await taskRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: "Task not found"
            });
        }

        await taskRef.update({
            completed
        });

        res.json({
            success: true,
            message: completed
                ? "Task completed"
                : "Task marked incomplete"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to update task"
        });
    }
});

module.exports = router;