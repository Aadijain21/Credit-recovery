const express = require("express");
const analyzeCredit = require("../services/creditAnalysis");

const router = express.Router();

router.post("/", (req, res) => {
    try {
        const result = analyzeCredit(req.body);

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Credit analysis failed"
        });
    }
});

module.exports = router;