const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

// -------------------------------------------------------------
// Helper: build a clean loan object with computed fields
// -------------------------------------------------------------
function buildLoanObject(data) {
    const originalAmount = Number(data.originalAmount) || 0;
    const outstandingAmount = Number(data.outstandingAmount) || 0;
    const monthlyEMI = Number(data.monthlyEMI) || 0;
    const remainingTenure = Number(data.remainingTenure) || 0;

    const repaidAmount = Math.max(0, originalAmount - outstandingAmount);
    const repaymentProgress = originalAmount > 0
        ? Number(((repaidAmount / originalAmount) * 100).toFixed(2))
        : 0;

    return {
        profileId: data.profileId || "default",
        loanType: data.loanType || "",
        lender: data.lender || "",
        loanNumber: data.loanNumber || "",
        originalAmount,
        outstandingAmount,
        monthlyEMI,
        interestRate: Number(data.interestRate) || 0,
        remainingTenure,
        tenureMonths: Number(data.tenureMonths) || 0,
        repaidAmount,
        repaymentProgress,
        paymentStatus: data.paymentStatus || "Active - Regular",
        latePayments: Number(data.latePayments) || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date()
    };
}

// -------------------------------------------------------------
// POST /api/loans  —  Add a new loan
// -------------------------------------------------------------
router.post("/", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const { profileId, loanType, lender, originalAmount } = req.body;

        if (!profileId) {
            return res.status(400).json({ success: false, error: "profileId is required" });
        }
        if (!loanType || !lender) {
            return res.status(400).json({ success: false, error: "loanType and lender are required" });
        }
        if (!originalAmount || Number(originalAmount) <= 0) {
            return res.status(400).json({ success: false, error: "originalAmount must be greater than 0" });
        }

        const loan = buildLoanObject(req.body);

        const docRef = await db.collection("loans").add(loan);

        res.status(201).json({
            success: true,
            loanId: docRef.id,
            loan: { loanId: docRef.id, ...loan }
        });
    } catch (error) {
        console.error("Create loan error:", error);
        res.status(500).json({ success: false, error: "Failed to create loan" });
    }
});

// -------------------------------------------------------------
// GET /api/loans/:profileId  —  Get all loans for a profile
// -------------------------------------------------------------
router.get("/:profileId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const snapshot = await db
            .collection("loans")
            .where("profileId", "==", req.params.profileId)
            .orderBy("createdAt", "asc")
            .get();

        const loans = snapshot.docs.map(doc => ({
            loanId: doc.id,
            ...doc.data()
        }));

        // Aggregate summary
        const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
        const totalEMI = loans.reduce((sum, l) => sum + (l.monthlyEMI || 0), 0);
        const totalOriginal = loans.reduce((sum, l) => sum + (l.originalAmount || 0), 0);
        const totalLatePayments = loans.reduce((sum, l) => sum + (l.latePayments || 0), 0);

        res.json({
            success: true,
            count: loans.length,
            summary: { totalOutstanding, totalEMI, totalOriginal, totalLatePayments },
            loans
        });
    } catch (error) {
        console.error("Fetch loans error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch loans" });
    }
});

// -------------------------------------------------------------
// PATCH /api/loans/:loanId  —  Update a loan
// -------------------------------------------------------------
router.patch("/:loanId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const loanRef = db.collection("loans").doc(req.params.loanId);
        const doc = await loanRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Loan not found" });
        }

        const merged = { ...doc.data(), ...req.body };
        const updatedFields = buildLoanObject(merged);
        delete updatedFields.createdAt; // preserve original createdAt

        await loanRef.update(updatedFields);

        res.json({
            success: true,
            loanId: req.params.loanId,
            loan: { loanId: req.params.loanId, ...updatedFields }
        });
    } catch (error) {
        console.error("Update loan error:", error);
        res.status(500).json({ success: false, error: "Failed to update loan" });
    }
});

// -------------------------------------------------------------
// DELETE /api/loans/:loanId  —  Remove a loan
// -------------------------------------------------------------
router.delete("/:loanId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const loanRef = db.collection("loans").doc(req.params.loanId);
        const doc = await loanRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Loan not found" });
        }

        await loanRef.delete();

        res.json({ success: true, message: "Loan deleted successfully", loanId: req.params.loanId });
    } catch (error) {
        console.error("Delete loan error:", error);
        res.status(500).json({ success: false, error: "Failed to delete loan" });
    }
});

module.exports = router;
