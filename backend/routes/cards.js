const express = require("express");
const db = require("../config/firebase");

const router = express.Router();

// -------------------------------------------------------------
// Helper: derive computed fields from raw inputs
// -------------------------------------------------------------
function buildCardObject(data) {
    const creditLimit = Number(data.creditLimit) || 0;
    const currentBalance = Number(data.currentBalance) || 0;

    const availableLimit = Math.max(0, creditLimit - currentBalance);
    const utilizationPercentage = creditLimit > 0
        ? Number(((currentBalance / creditLimit) * 100).toFixed(2))
        : 0;

    return {
        profileId: data.profileId || "default",
        cardName: data.cardName || "",
        bank: data.bank || "",
        cardNumberMasked: data.cardNumberMasked || "",
        creditLimit,
        currentBalance,
        availableLimit,
        utilizationPercentage,
        dueDate: data.dueDate || "",
        minimumDue: Number(data.minimumDue) || 0,
        paymentStatus: data.paymentStatus || "Active",
        latePayments: Number(data.latePayments) || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date()
    };
}

// -------------------------------------------------------------
// POST /api/cards  —  Add a new credit card
// -------------------------------------------------------------
router.post("/", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const { profileId, cardName, bank, creditLimit } = req.body;

        if (!profileId) {
            return res.status(400).json({ success: false, error: "profileId is required" });
        }
        if (!cardName || !bank) {
            return res.status(400).json({ success: false, error: "cardName and bank are required" });
        }
        if (!creditLimit || Number(creditLimit) <= 0) {
            return res.status(400).json({ success: false, error: "creditLimit must be greater than 0" });
        }

        const card = buildCardObject(req.body);

        const docRef = await db.collection("cards").add(card);

        res.status(201).json({
            success: true,
            cardId: docRef.id,
            card: { cardId: docRef.id, ...card }
        });
    } catch (error) {
        console.error("Create card error:", error);
        res.status(500).json({ success: false, error: "Failed to create card" });
    }
});

// -------------------------------------------------------------
// GET /api/cards/:profileId  —  Get all cards for a profile
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
            .collection("cards")
            .where("profileId", "==", req.params.profileId)
            .orderBy("createdAt", "asc")
            .get();

        const cards = snapshot.docs.map(doc => ({
            cardId: doc.id,
            ...doc.data()
        }));

        // Aggregate summary
        const totalLimit = cards.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
        const totalBalance = cards.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
        const totalAvailable = cards.reduce((sum, c) => sum + (c.availableLimit || 0), 0);
        const overallUtilization = totalLimit > 0
            ? Number(((totalBalance / totalLimit) * 100).toFixed(2))
            : 0;
        const totalLatePayments = cards.reduce((sum, c) => sum + (c.latePayments || 0), 0);

        res.json({
            success: true,
            count: cards.length,
            summary: { totalLimit, totalBalance, totalAvailable, overallUtilization, totalLatePayments },
            cards
        });
    } catch (error) {
        console.error("Fetch cards error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch cards" });
    }
});

// -------------------------------------------------------------
// PATCH /api/cards/:cardId  —  Update a card (balance, status, etc.)
// -------------------------------------------------------------
router.patch("/:cardId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const cardRef = db.collection("cards").doc(req.params.cardId);
        const doc = await cardRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Card not found" });
        }

        // Merge existing data with incoming patch, then recompute derived fields
        const merged = { ...doc.data(), ...req.body };
        const updatedFields = buildCardObject(merged);
        delete updatedFields.createdAt; // preserve original createdAt

        await cardRef.update(updatedFields);

        res.json({
            success: true,
            cardId: req.params.cardId,
            card: { cardId: req.params.cardId, ...updatedFields }
        });
    } catch (error) {
        console.error("Update card error:", error);
        res.status(500).json({ success: false, error: "Failed to update card" });
    }
});

// -------------------------------------------------------------
// DELETE /api/cards/:cardId  —  Remove a card
// -------------------------------------------------------------
router.delete("/:cardId", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            error: "Database not available. Add serviceAccountKey.json to backend/ and restart."
        });
    }

    try {
        const cardRef = db.collection("cards").doc(req.params.cardId);
        const doc = await cardRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, error: "Card not found" });
        }

        await cardRef.delete();

        res.json({ success: true, message: "Card deleted successfully", cardId: req.params.cardId });
    } catch (error) {
        console.error("Delete card error:", error);
        res.status(500).json({ success: false, error: "Failed to delete card" });
    }
});

module.exports = router;
