// -------------------------------------------------------------
// Firebase Firestore Web SDK Configuration & Initialization
// -------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration for project: cibil-health-score
const firebaseConfig = {
    apiKey: "AIzaSyASgD9_bjhkBaldOOJQKKjXK9RM5a0ql6Q",
    authDomain: "cibil-health-score.firebaseapp.com",
    projectId: "cibil-health-score",
    storageBucket: "cibil-health-score.firebasestorage.app",
    messagingSenderId: "951290163744",
    appId: "1:951290163744:web:701907f468dae45f84c245",
    measurementId: "G-J0BB6Z06H5"
};

// Initialize Firebase & Firestore safely
let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase App & Firestore initialized.");
} catch (error) {
    console.warn("Firebase initialization warning (please verify firebaseConfig):", error);
}

// Helper function to persist assessment records in Firestore
async function saveAssessmentToFirestore(assessmentData) {
    if (!db) {
        console.warn("Firestore database instance not ready. Skipping cloud save.");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "assessments"), assessmentData);
        console.log("Assessment successfully saved to Firestore with ID:", docRef.id);
    } catch (error) {
        console.error("Failed to save assessment to Firestore:", error);
    }
}

// -------------------------------------------------------------
// Credit Recovery Analysis & Roadmap Logic
// -------------------------------------------------------------
const analyzeBtn = document.getElementById("analyzeBtn");

analyzeBtn.addEventListener("click", function () {

  if (
    document.getElementById("name").value === "" ||
    document.getElementById("creditScore").value === "" ||
    document.getElementById("income").value === "" ||
    document.getElementById("creditLimit").value === "" ||
    document.getElementById("outstandingBalance").value === "" ||
    document.getElementById("latePayments").value === "" ||
    document.getElementById("activeLoans").value === "" ||
    document.getElementById("recentInquiries").value === ""
) {
    alert("Please fill in all the fields.");
    return;
}

    // Get values
    const name = document.getElementById("name").value;
    const creditScore = Number(document.getElementById("creditScore").value);
    const income = Number(document.getElementById("income").value);
    const creditLimit = Number(document.getElementById("creditLimit").value);
    const outstandingBalance = Number(document.getElementById("outstandingBalance").value);
    const latePayments = Number(document.getElementById("latePayments").value);
    const activeLoans = Number(document.getElementById("activeLoans").value);
    const recentInquiries = Number(document.getElementById("recentInquiries").value);


    // Credit utilization
    const utilization = (outstandingBalance / creditLimit) * 100;

    if (creditLimit <= 0) {
    alert("Credit limit must be greater than 0.");
    return;
} 

    // -----------------------------
    // 1. PAYMENT HISTORY
    // -----------------------------

    let paymentPoints;

    if (latePayments === 0) {
        paymentPoints = 40;
    }
    else if (latePayments === 1) {
        paymentPoints = 30;
    }
    else if (latePayments === 2) {
        paymentPoints = 20;
    }
    else {
        paymentPoints = 10;
    }


    // -----------------------------
    // 2. CREDIT UTILIZATION
    // -----------------------------

    let utilizationPoints;

    if (utilization <= 30) {
        utilizationPoints = 30;
    }
    else if (utilization <= 50) {
        utilizationPoints = 20;
    }
    else if (utilization <= 70) {
        utilizationPoints = 10;
    }
    else {
        utilizationPoints = 5;
    }


    // -----------------------------
    // 3. RECENT INQUIRIES
    // -----------------------------

    let inquiryPoints;

    if (recentInquiries <= 1) {
        inquiryPoints = 15;
    }
    else if (recentInquiries <= 3) {
        inquiryPoints = 10;
    }
    else {
        inquiryPoints = 5;
    }


    // -----------------------------
    // 4. ACTIVE LOANS
    // -----------------------------

    let loanPoints;

    if (activeLoans <= 1) {
        loanPoints = 15;
    }
    else if (activeLoans <= 3) {
        loanPoints = 10;
    }
    else {
        loanPoints = 5;
    }


    // -----------------------------
    // FINAL HEALTH SCORE
    // -----------------------------

    const healthScore =
        paymentPoints +
        utilizationPoints +
        inquiryPoints +
        loanPoints;


    // -----------------------------
    // CREDIT HEALTH STATUS
    // -----------------------------

    let status;

    if (healthScore >= 80) {
        status = "Excellent";
    }
    else if (healthScore >= 60) {
        status = "Good";
    }
    else if (healthScore >= 40) {
        status = "Needs Improvement";
    }
    else {
        status = "Poor";
    }


    // -----------------------------
    // DISPLAY RESULT
    // -----------------------------

    const result = document.getElementById("result");

    result.style.display = "block";

    result.innerHTML = `
        <div class="result-title">
            ${name}'s Credit Health
        </div>

        <div class="score">
            ${healthScore}/100
        </div>

        <div class="result-title">
            ${status}
        </div>

        <div class="warning">
            Credit Utilization: ${utilization.toFixed(2)}%
        </div>

        <div class="warning">
            Late Payments: ${latePayments}
        </div>

        <div class="warning">
            Recent Inquiries: ${recentInquiries}
        </div>

        <div class="warning">
            Active Loans: ${activeLoans}
        </div>
    `;


    // -----------------------------
    // RECOVERY PLAN
    // -----------------------------

    const recoveryPlan = document.getElementById("recoveryPlan");

    let recommendations = [];


    if (utilization > 30) {
        recommendations.push(
            "Reduce your credit card utilization below 30%."
        );
    }


    if (latePayments > 0) {
        recommendations.push(
            "Make all future EMI and credit card payments on time."
        );
    }


    if (recentInquiries > 1) {
        recommendations.push(
            "Avoid unnecessary loan or credit card applications."
        );
    }


    if (activeLoans > 3) {
        recommendations.push(
            "Focus on managing existing loans before taking new debt."
        );
    }


    if (recommendations.length === 0) {
        recommendations.push(
            "Maintain your current payment and credit habits."
        );
    }


    recoveryPlan.style.display = "block";

    recoveryPlan.innerHTML = `
        <h2>🎯 Your Recovery Plan</h2>

        ${recommendations.map((item, index) => `
            <div class="plan-item">
                <strong>Priority ${index + 1}</strong><br>
                ${item}
            </div>
        `).join("")}
    `;


    // -----------------------------
    // 3-MONTH ROADMAP
    // -----------------------------

    const roadmap = document.getElementById("roadmap");

    let month1 = [];
    let month2 = [];
    let month3 = [];


    // MONTH 1
    month1.push(
        "Make all EMI and credit card payments on time."
    );

    if (utilization > 30) {
        month1.push(
            "Start reducing your credit utilization."
        );
    }

    if (recentInquiries > 1) {
        month1.push(
            "Avoid unnecessary credit applications."
        );
    }

    if (latePayments > 0) {
        month1.push(
            "Set reminders for all upcoming payments."
        );
    }


    // MONTH 2
    month2.push(
        "Maintain 100% on-time payments."
    );

    if (utilization > 30) {
        month2.push(
            "Continue reducing credit utilization toward 30% or lower."
        );
    }

    if (activeLoans > 2) {
        month2.push(
            "Focus on managing existing loans before taking new debt."
        );
    }


    // MONTH 3
    month3.push(
        "Continue making every payment on time."
    );

    month3.push(
        "Review your credit health and spending habits."
    );

    if (utilization > 30) {
        month3.push(
            "Aim to maintain credit utilization below 30%."
        );
    }


    // DISPLAY ROADMAP

    roadmap.style.display = "block";

    roadmap.innerHTML = `
        <h2>📅 Your 3-Month Recovery Roadmap</h2>

        <div class="month">
            <h3>Month 1 — Stabilize</h3>
            ${month1.map(task => `
                <div class="task">☐ ${task}</div>
            `).join("")}
        </div>

        <div class="month">
            <h3>Month 2 — Improve</h3>
            ${month2.map(task => `
                <div class="task">☐ ${task}</div>
            `).join("")}
        </div>

        <div class="month">
            <h3>Month 3 — Maintain</h3>
            ${month3.map(task => `
                <div class="task">☐ ${task}</div>
            `).join("")}
        </div>
    `;


    // Console
    console.log("Name:", name);
    console.log("Credit Score:", creditScore);
    console.log("Monthly Income:", income);
    console.log("Credit Utilization:", utilization.toFixed(2) + "%");
    console.log("Credit Health Score:", healthScore + "/100");

    // -------------------------------------------------------------
    // SAVE TO FIRESTORE ("assessments" collection)
    // -------------------------------------------------------------
    const assessmentData = {
        name: name,
        creditScore: creditScore,
        income: income,
        creditLimit: creditLimit,
        outstandingBalance: outstandingBalance,
        latePayments: latePayments,
        activeLoans: activeLoans,
        recentInquiries: recentInquiries,
        creditUtilization: Number(utilization.toFixed(2)),
        healthScore: healthScore,
        healthStatus: status,
        recommendations: recommendations,
        roadmap: {
            month1: month1,
            month2: month2,
            month3: month3
        },
        createdAt: serverTimestamp()
    };

    saveAssessmentToFirestore(assessmentData);

});