// -------------------------------------------------------------
// Credit Recovery Analysis & Roadmap Logic (Frontend-Backend Bridge)
// -------------------------------------------------------------
import { 
    getProfile, 
    saveProfile, 
    analyzeCreditAPI, 
    createAssessmentAPI, 
    getAssessmentAPI, 
    createTaskAPI, 
    getTasksAPI, 
    updateTaskStatusAPI, 
    getProgressAPI 
} from "./creditData.js";

// -------------------------------------------------------------
// Initialize & Pre-fill User Profile Data
// -------------------------------------------------------------
const profile = getProfile();

const navUserName = document.getElementById("navUserName");
if (navUserName && profile.name) {
    navUserName.textContent = `👤 ${profile.name}`;
}

const nameInput = document.getElementById("name");
const creditScoreInput = document.getElementById("creditScore");
const incomeInput = document.getElementById("income");
const creditLimitInput = document.getElementById("creditLimit");
const outstandingBalanceInput = document.getElementById("outstandingBalance");
const latePaymentsInput = document.getElementById("latePayments");
const activeLoansInput = document.getElementById("activeLoans");
const recentInquiriesInput = document.getElementById("recentInquiries");

if (nameInput && profile.name) nameInput.value = profile.name;
if (creditScoreInput && profile.creditScore) creditScoreInput.value = profile.creditScore;
if (incomeInput && profile.income) incomeInput.value = profile.income;
if (creditLimitInput && profile.creditLimit) creditLimitInput.value = profile.creditLimit;
if (outstandingBalanceInput && profile.outstandingBalance) outstandingBalanceInput.value = profile.outstandingBalance;
if (latePaymentsInput && profile.latePayments !== undefined) latePaymentsInput.value = profile.latePayments;
if (activeLoansInput && profile.activeLoans !== undefined) activeLoansInput.value = profile.activeLoans;
if (recentInquiriesInput && profile.recentInquiries !== undefined) recentInquiriesInput.value = profile.recentInquiries;

// -------------------------------------------------------------
// Helper: Calculate scoring locally (Preserved formula)
// -------------------------------------------------------------
function calculateScoreLocally(data) {
    const { creditLimit, outstandingBalance, latePayments, activeLoans, recentInquiries } = data;
    const utilization = creditLimit > 0 ? (outstandingBalance / creditLimit) * 100 : 0;

    let paymentPoints;
    if (latePayments === 0) paymentPoints = 40;
    else if (latePayments === 1) paymentPoints = 30;
    else if (latePayments === 2) paymentPoints = 20;
    else paymentPoints = 10;

    let utilizationPoints;
    if (utilization <= 30) utilizationPoints = 30;
    else if (utilization <= 50) utilizationPoints = 20;
    else if (utilization <= 70) utilizationPoints = 10;
    else utilizationPoints = 5;

    let inquiryPoints;
    if (recentInquiries <= 1) inquiryPoints = 15;
    else if (recentInquiries <= 3) inquiryPoints = 10;
    else inquiryPoints = 5;

    let loanPoints;
    if (activeLoans <= 1) loanPoints = 15;
    else if (activeLoans <= 3) loanPoints = 10;
    else loanPoints = 5;

    const healthScore = paymentPoints + utilizationPoints + inquiryPoints + loanPoints;

    let status;
    if (healthScore >= 80) status = "Excellent";
    else if (healthScore >= 60) status = "Good";
    else if (healthScore >= 40) status = "Needs Improvement";
    else status = "Poor";

    const recommendations = [];
    if (utilization > 30) recommendations.push("Reduce your credit card utilization below 30%.");
    if (latePayments > 0) recommendations.push("Make all future EMI and credit card payments on time.");
    if (recentInquiries > 1) recommendations.push("Avoid unnecessary loan or credit card applications.");
    if (activeLoans > 3) recommendations.push("Focus on managing existing loans before taking new debt.");
    if (recommendations.length === 0) recommendations.push("Maintain your current payment and credit habits.");

    return {
        healthScore,
        status,
        utilization,
        recommendations
    };
}

// Helper: Generate 3-Month Roadmap tasks
function generateRoadmapTasks(utilization, latePayments, activeLoans, recentInquiries) {
    const month1 = ["Make all EMI and credit card payments on time."];
    if (utilization > 30) month1.push("Start reducing your credit utilization.");
    if (recentInquiries > 1) month1.push("Avoid unnecessary credit applications.");
    if (latePayments > 0) month1.push("Set reminders for all upcoming payments.");

    const month2 = ["Maintain 100% on-time payments."];
    if (utilization > 30) month2.push("Continue reducing credit utilization toward 30% or lower.");
    if (activeLoans > 2) month2.push("Focus on managing existing loans before taking new debt.");

    const month3 = [
        "Continue making every payment on time.",
        "Review your credit health and spending habits."
    ];
    if (utilization > 30) month3.push("Aim to maintain credit utilization below 30%.");

    return { month1, month2, month3 };
}

// -------------------------------------------------------------
// Live Recovery Progress Updater (Syncs with backend GET /api/progress/:id)
// -------------------------------------------------------------
async function updateProgressUI(assessmentId) {
    const progressStats = document.getElementById("progressStats");
    const progressPercentage = document.getElementById("progressPercentage");
    const progressBarFill = document.getElementById("progressBarFill");

    let total = 0;
    let completed = 0;
    let percentage = 0;

    if (assessmentId && !assessmentId.startsWith("local_")) {
        const backendProgress = await getProgressAPI(assessmentId);
        if (backendProgress && backendProgress.success) {
            total = backendProgress.totalTasks;
            completed = backendProgress.completedTasks;
            percentage = backendProgress.progressPercentage;
        } else {
            // Fallback to DOM count
            const checkboxes = document.querySelectorAll(".task-checkbox");
            const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
            total = checkboxes.length;
            completed = checkedBoxes.length;
            percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        }
    } else {
        const checkboxes = document.querySelectorAll(".task-checkbox");
        const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
        total = checkboxes.length;
        completed = checkedBoxes.length;
        percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    if (progressStats) progressStats.textContent = `${completed} / ${total} tasks completed`;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
}

// -------------------------------------------------------------
// Render Roadmap & Attach Task Completion Handlers
// -------------------------------------------------------------
function renderRoadmapAndProgress(tasksByMonth, assessmentId) {
    const roadmap = document.getElementById("roadmap");
    if (!roadmap) return;

    roadmap.style.display = "block";
    roadmap.innerHTML = `
        <h2>📅 Your 3-Month Recovery Roadmap</h2>

        <div class="month">
            <h3>Month 1 — Stabilize</h3>
            ${tasksByMonth.month1.map((task, index) => `
                <div class="task">
                    <input type="checkbox" 
                           id="${task.elementId || `task-m1-${index}`}" 
                           class="task-checkbox" 
                           data-task-id="${task.taskId || ''}"
                           ${task.completed ? 'checked' : ''}>
                    <label for="${task.elementId || `task-m1-${index}`}">${task.title}</label>
                </div>
            `).join("")}
        </div>

        <div class="month">
            <h3>Month 2 — Improve</h3>
            ${tasksByMonth.month2.map((task, index) => `
                <div class="task">
                    <input type="checkbox" 
                           id="${task.elementId || `task-m2-${index}`}" 
                           class="task-checkbox" 
                           data-task-id="${task.taskId || ''}"
                           ${task.completed ? 'checked' : ''}>
                    <label for="${task.elementId || `task-m2-${index}`}">${task.title}</label>
                </div>
            `).join("")}
        </div>

        <div class="month">
            <h3>Month 3 — Maintain</h3>
            ${tasksByMonth.month3.map((task, index) => `
                <div class="task">
                    <input type="checkbox" 
                           id="${task.elementId || `task-m3-${index}`}" 
                           class="task-checkbox" 
                           data-task-id="${task.taskId || ''}"
                           ${task.completed ? 'checked' : ''}>
                    <label for="${task.elementId || `task-m3-${index}`}">${task.title}</label>
                </div>
            `).join("")}
        </div>
    `;

    const progressSection = document.getElementById("progressSection");
    if (progressSection) {
        progressSection.style.display = "block";
        progressSection.innerHTML = `
            <h2>📊 Recovery Progress</h2>
            <div class="progress-info">
                <span id="progressStats">0 / 0 tasks completed</span>
                <span id="progressPercentage">0%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" id="progressBarFill"></div>
            </div>
        `;
    }

    // Attach real-time task update listener (PATCH /api/tasks/:taskId)
    const taskCheckboxes = document.querySelectorAll(".task-checkbox");
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", async function () {
            const taskId = this.getAttribute("data-task-id");
            const isChecked = this.checked;

            if (taskId && !taskId.startsWith("local_")) {
                await updateTaskStatusAPI(taskId, isChecked);
            }
            await updateProgressUI(assessmentId);
        });
    });

    updateProgressUI(assessmentId);
}

// -------------------------------------------------------------
// Analyze My Credit Event Listener
// -------------------------------------------------------------
const analyzeBtn = document.getElementById("analyzeBtn");

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async function () {

        if (
            !nameInput.value ||
            !creditScoreInput.value ||
            !incomeInput.value ||
            !creditLimitInput.value ||
            !outstandingBalanceInput.value ||
            !latePaymentsInput.value ||
            !activeLoansInput.value ||
            !recentInquiriesInput.value
        ) {
            alert("Please fill in all the fields.");
            return;
        }

        const name = nameInput.value.trim();
        const creditScore = Number(creditScoreInput.value);
        const income = Number(incomeInput.value);
        const creditLimit = Number(creditLimitInput.value);
        const outstandingBalance = Number(outstandingBalanceInput.value);
        const latePayments = Number(latePaymentsInput.value);
        const activeLoans = Number(activeLoansInput.value);
        const recentInquiries = Number(recentInquiriesInput.value);

        if (creditLimit <= 0) {
            alert("Credit limit must be greater than 0.");
            return;
        }

        const payload = {
            name,
            creditScore,
            income,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries
        };

        // 1. Call Backend POST /api/analyze (or local calculation fallback)
        let analysis = await analyzeCreditAPI({
            creditScore,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries
        });

        if (!analysis) {
            analysis = calculateScoreLocally(payload);
        }

        const healthScore = analysis.score || analysis.healthScore;
        const status = analysis.status;
        const utilization = analysis.utilization;
        const recommendations = analysis.recommendations || [];

        // 2. Render Results
        const result = document.getElementById("result");
        if (result) {
            result.style.display = "block";
            result.innerHTML = `
                <div class="result-title">${name}'s Credit Health</div>
                <div class="score">${healthScore}/100</div>
                <div class="result-title">${status}</div>
                <div class="warning">Credit Utilization: ${Number(utilization).toFixed(2)}%</div>
                <div class="warning">Late Payments: ${latePayments}</div>
                <div class="warning">Recent Inquiries: ${recentInquiries}</div>
                <div class="warning">Active Loans: ${activeLoans}</div>
            `;
        }

        // 3. Render Recommendations
        const recoveryPlan = document.getElementById("recoveryPlan");
        if (recoveryPlan) {
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
        }

        // 4. Save Assessment via POST /api/assessments
        const assessmentRes = await createAssessmentAPI(payload);
        let assessmentId = assessmentRes?.assessmentId || `local_${Date.now()}`;

        // 5. Generate Roadmap Tasks & Save to Backend (POST /api/tasks)
        const rawRoadmap = generateRoadmapTasks(utilization, latePayments, activeLoans, recentInquiries);
        const tasksByMonth = { month1: [], month2: [], month3: [] };

        for (const [mIdx, title] of rawRoadmap.month1.entries()) {
            let taskId = `local_m1_${mIdx}`;
            if (assessmentRes?.success) {
                const taskRes = await createTaskAPI({
                    assessmentId,
                    title,
                    category: "month1"
                });
                if (taskRes?.taskId) taskId = taskRes.taskId;
            }
            tasksByMonth.month1.push({ title, taskId, completed: false, elementId: `task-m1-${mIdx}` });
        }

        for (const [mIdx, title] of rawRoadmap.month2.entries()) {
            let taskId = `local_m2_${mIdx}`;
            if (assessmentRes?.success) {
                const taskRes = await createTaskAPI({
                    assessmentId,
                    title,
                    category: "month2"
                });
                if (taskRes?.taskId) taskId = taskRes.taskId;
            }
            tasksByMonth.month2.push({ title, taskId, completed: false, elementId: `task-m2-${mIdx}` });
        }

        for (const [mIdx, title] of rawRoadmap.month3.entries()) {
            let taskId = `local_m3_${mIdx}`;
            if (assessmentRes?.success) {
                const taskRes = await createTaskAPI({
                    assessmentId,
                    title,
                    category: "month3"
                });
                if (taskRes?.taskId) taskId = taskRes.taskId;
            }
            tasksByMonth.month3.push({ title, taskId, completed: false, elementId: `task-m3-${mIdx}` });
        }

        // Render Roadmap and Progress section
        renderRoadmapAndProgress(tasksByMonth, assessmentId);

        // Save session state to localStorage
        saveProfile({
            name,
            creditScore,
            income,
            creditLimit,
            outstandingBalance,
            latePayments,
            activeLoans,
            recentInquiries,
            currentAssessmentId: assessmentId,
            latestAssessment: {
                healthScore,
                status,
                utilization,
                recommendations,
                assessmentId
            }
        });
    });
}