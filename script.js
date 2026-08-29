// -------------------------------------------------------------
// CREDIT RECOVERY FRONTEND
// -------------------------------------------------------------
// Frontend only:
// 1. Collect form data
// 2. Call backend API
// 3. Display backend response
//
// Backend:
// 1. Credit analysis
// 2. Recommendations
// 3. Roadmap
// 4. Firestore
// -------------------------------------------------------------

const API_URL = "http://localhost:5000/api";

const analyzeBtn =
    document.getElementById("analyzeBtn");


// -------------------------------------------------------------
// ANALYZE
// -------------------------------------------------------------

analyzeBtn.addEventListener(
    "click",
    async function () {

        // -----------------------------------------------------
        // GET FORM VALUES
        // -----------------------------------------------------

        const name =
            document.getElementById("name").value.trim();

        const creditScore =
            Number(
                document.getElementById("creditScore").value
            );

        const income =
            Number(
                document.getElementById("income").value
            );

        const creditLimit =
            Number(
                document.getElementById("creditLimit").value
            );

        const outstandingBalance =
            Number(
                document.getElementById(
                    "outstandingBalance"
                ).value
            );

        const latePayments =
            Number(
                document.getElementById(
                    "latePayments"
                ).value
            );

        const activeLoans =
            Number(
                document.getElementById(
                    "activeLoans"
                ).value
            );

        const recentInquiries =
            Number(
                document.getElementById(
                    "recentInquiries"
                ).value
            );


        // -----------------------------------------------------
        // VALIDATE EMPTY FIELDS
        // -----------------------------------------------------

        if (
            name === "" ||
            document.getElementById("creditScore").value === "" ||
            document.getElementById("income").value === "" ||
            document.getElementById("creditLimit").value === "" ||
            document.getElementById("outstandingBalance").value === "" ||
            document.getElementById("latePayments").value === "" ||
            document.getElementById("activeLoans").value === "" ||
            document.getElementById("recentInquiries").value === ""
        ) {

            alert(
                "Please fill in all the fields."
            );

            return;
        }


        // -----------------------------------------------------
        // BASIC FRONTEND VALIDATION
        // -----------------------------------------------------

        if (creditLimit <= 0) {

            alert(
                "Credit limit must be greater than 0."
            );

            return;
        }


        if (
            creditScore < 0 ||
            creditScore > 900
        ) {

            alert(
                "Please enter a valid credit score between 0 and 900."
            );

            return;
        }


        // -----------------------------------------------------
        // DISABLE BUTTON
        // -----------------------------------------------------

        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "Analyzing...";


        try {

            // -------------------------------------------------
            // CALL BACKEND
            // -------------------------------------------------

            const response =
                await fetch(
                    `${API_URL}/assessments`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name,

                            creditScore,

                            income,

                            creditLimit,

                            outstandingBalance,

                            latePayments,

                            activeLoans,

                            recentInquiries

                        })

                    }
                );


            const data =
                await response.json();


            // -------------------------------------------------
            // HANDLE ERROR
            // -------------------------------------------------

            if (
                !response.ok ||
                !data.success
            ) {

                console.error(
                    "Backend error:",
                    data
                );

                alert(
                    data.error ||
                    "Failed to analyze credit."
                );

                return;
            }


            // -------------------------------------------------
            // BACKEND RESULT
            // -------------------------------------------------

            const assessment =
                data.assessment;

            const analysis =
                assessment.analysis;

            const roadmap =
                assessment.roadmap;


            // Save ID for future APIs
            localStorage.setItem(
                "assessmentId",
                data.assessmentId
            );


            console.log(
                "Assessment ID:",
                data.assessmentId
            );


            // -------------------------------------------------
            // CREDIT HEALTH
            // -------------------------------------------------

            const result =
                document.getElementById(
                    "result"
                );


            result.style.display =
                "block";


            result.innerHTML = `

                <div class="result-title">
                    ${assessment.name}'s Credit Health
                </div>

                <div class="score">
                    ${analysis.score}/100
                </div>

                <div class="result-title">
                    ${analysis.status}
                </div>

                <div class="warning">
                    Credit Utilization:
                    ${analysis.utilization.toFixed(2)}%
                </div>

                <div class="warning">
                    Credit Score:
                    ${analysis.creditScore}
                </div>

                <div class="warning">
                    Late Payments:
                    ${assessment.latePayments}
                </div>

                <div class="warning">
                    Recent Inquiries:
                    ${assessment.recentInquiries}
                </div>

                <div class="warning">
                    Active Loans:
                    ${assessment.activeLoans}
                </div>

            `;


            // -------------------------------------------------
            // RECOMMENDATIONS
            // -------------------------------------------------

            const recoveryPlan =
                document.getElementById(
                    "recoveryPlan"
                );


            const recommendations =
                analysis.recommendations || [];


            recoveryPlan.style.display =
                "block";


            recoveryPlan.innerHTML = `

                <h2>
                    🎯 Your Recovery Plan
                </h2>

                ${

                    recommendations.length > 0

                    ?

                    recommendations
                        .map(
                            (item, index) => `

                                <div class="plan-item">

                                    <strong>
                                        Priority ${index + 1}
                                    </strong>

                                    <br>

                                    ${item}

                                </div>

                            `
                        )
                        .join("")

                    :

                    `
                        <div class="plan-item">
                            Maintain your current credit habits.
                        </div>
                    `

                }

            `;


            // -------------------------------------------------
            // ROADMAP
            // -------------------------------------------------

            const roadmapElement =
                document.getElementById(
                    "roadmap"
                );


            roadmapElement.style.display =
                "block";


            roadmapElement.innerHTML = `

                <h2>
                    📅 Your 3-Month Recovery Roadmap
                </h2>


                <div class="month">

                    <h3>
                        Month 1 — Stabilize
                    </h3>

                    ${
                        (roadmap.month1 || [])
                            .map(
                                task => `

                                    <div class="task">

                                        <input
                                            type="checkbox"
                                        >

                                        <span>
                                            ${task}
                                        </span>

                                    </div>

                                `
                            )
                            .join("")
                    }

                </div>


                <div class="month">

                    <h3>
                        Month 2 — Improve
                    </h3>

                    ${
                        (roadmap.month2 || [])
                            .map(
                                task => `

                                    <div class="task">

                                        <input
                                            type="checkbox"
                                        >

                                        <span>
                                            ${task}
                                        </span>

                                    </div>

                                `
                            )
                            .join("")
                    }

                </div>


                <div class="month">

                    <h3>
                        Month 3 — Maintain
                    </h3>

                    ${
                        (roadmap.month3 || [])
                            .map(
                                task => `

                                    <div class="task">

                                        <input
                                            type="checkbox"
                                        >

                                        <span>
                                            ${task}
                                        </span>

                                    </div>

                                `
                            )
                            .join("")
                    }

                </div>

            `;


            // -------------------------------------------------
            // CONSOLE
            // -------------------------------------------------

            console.log(
                "Backend response:",
                data
            );

            console.log(
                "Analysis:",
                analysis
            );

            console.log(
                "Roadmap:",
                roadmap
            );

        }


        catch (error) {

            console.error(
                "Backend connection failed:",
                error
            );


            alert(
                "Unable to connect to the backend. " +
                "Make sure the Express server is running."
            );

        }


        finally {

            analyzeBtn.disabled =
                false;

            analyzeBtn.textContent =
                "Analyze";

        }

    }
);