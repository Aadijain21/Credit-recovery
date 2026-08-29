const express = require("express");

const db = require("../config/firebase");

const analyzeCredit =
    require("../services/creditAnalysis");

const generateRoadmap =
    require("../services/roadmap");


const router = express.Router();


// -------------------------------------------------------------
// CREATE ASSESSMENT
// -------------------------------------------------------------

router.post("/", async (req, res) => {

    try {

        const {
            name,
            creditScore,
            income,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries
        } = req.body;


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!name) {

            return res.status(400).json({
                success: false,
                error: "Name is required"
            });

        }


        if (creditLimit <= 0) {

            return res.status(400).json({
                success: false,
                error: "Credit limit must be greater than 0"
            });

        }


        // -----------------------------------------------------
        // CREDIT ANALYSIS
        // -----------------------------------------------------

        const analysis = analyzeCredit({

            creditScore,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries

        });


        // -----------------------------------------------------
        // ROADMAP
        // -----------------------------------------------------

        const roadmap = generateRoadmap({

            utilization: analysis.utilization,

            latePayments,

            activeLoans,

            recentInquiries

        });


        // -----------------------------------------------------
        // ASSESSMENT OBJECT
        // -----------------------------------------------------

        const assessment = {

            name,

            creditScore,

            income,

            creditLimit,

            outstandingBalance,

            latePayments,

            activeLoans,

            recentInquiries,

            analysis,

            roadmap,

            createdAt: new Date()

        };


        // -----------------------------------------------------
        // SAVE TO FIRESTORE
        // -----------------------------------------------------

        const docRef = await db
            .collection("assessments")
            .add(assessment);


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        res.status(201).json({

            success: true,

            assessmentId: docRef.id,

            assessment

        });

    }


    catch (error) {

        console.error(
            "Assessment error:",
            error
        );


        res.status(500).json({

            success: false,

            error: "Failed to create assessment"

        });

    }

});


// -------------------------------------------------------------
// GET ASSESSMENT
// -------------------------------------------------------------

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

    }


    catch (error) {

        console.error(
            "Fetch assessment error:",
            error
        );


        res.status(500).json({

            success: false,

            error: "Failed to fetch assessment"

        });

    }

});


module.exports = router;