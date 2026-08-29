const express = require("express");
const db = require("../config/firebase");
const analyzeCredit = require("../services/creditAnalysis");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            name,
            creditScore,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries
        } = req.body;

        if (!name) {
            return res.status(400).json({
                error: "Name is required"
            });
        }

        const result = analyzeCredit({
            creditScore,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries
        });

        const assessment = {
            name,
            creditScore,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries,

            analysis: result,

            createdAt: new Date()
        };

        const docRef = await db
            .collection("assessments")
            .add(assessment);

        res.status(201).json({
            success: true,
            assessmentId: docRef.id,
            assessment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to create assessment"
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const snapshot = await db
            .collection("assessments")
            .orderBy("createdAt", "desc")
            .get();

        const assessments = snapshot.docs.map(doc => ({
            assessmentId: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            count: assessments.length,
            assessments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch assessments"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const doc = await db
            .collection("assessments")
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: "Assessment not found"
            });
        }

        res.json({
            success: true,
            assessmentId: doc.id,
            assessment: doc.data()
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch assessment"
        });
    }
});

module.exports = router;