// -------------------------------------------------------------
// Credit Recovery — Shared Financial & User State (Client-Side)
// & Backend API Integration Layer
// -------------------------------------------------------------

export const API_BASE_URL = "http://localhost:5000/api";

export const DEFAULT_FINANCIAL_PROFILE = {
    name: "Aaditya Sharma",
    phone: "9876543210",
    pan: "ABCDE1234F",
    creditScore: 680,
    income: 45000,
    creditLimit: 120000,
    outstandingBalance: 65000,
    latePayments: 1,
    activeLoans: 2,
    recentInquiries: 2,
    currentAssessmentId: null,
    latestAssessment: null,
    cards: [
        {
            id: "card-1",
            name: "HDFC Millennia Credit Card",
            bank: "HDFC Bank",
            cardNumber: "•••• •••• •••• 4821",
            limit: 75000,
            outstanding: 42000,
            dueDate: "15th of every month",
            status: "Active"
        },
        {
            id: "card-2",
            name: "ICICI Amazon Pay Credit Card",
            bank: "ICICI Bank",
            cardNumber: "•••• •••• •••• 9104",
            limit: 45000,
            outstanding: 23000,
            dueDate: "20th of every month",
            status: "Active"
        }
    ],
    loans: [
        {
            id: "loan-1",
            name: "Personal Loan",
            lender: "HDFC Bank",
            loanNumber: "PL-84920491",
            principal: 200000,
            outstanding: 145000,
            emi: 8500,
            tenureMonths: 24,
            remainingMonths: 16,
            status: "Active - Regular"
        },
        {
            id: "loan-2",
            name: "Two Wheeler Loan",
            lender: "Bajaj Finserv",
            loanNumber: "TW-39281740",
            principal: 80000,
            outstanding: 32000,
            emi: 3400,
            tenureMonths: 24,
            remainingMonths: 9,
            status: "Active - Regular"
        }
    ]
};

// -------------------------------------------------------------
// Client Storage Helpers
// -------------------------------------------------------------

export function getProfile() {
    const stored = localStorage.getItem("cr_user_profile");
    if (stored) {
        try {
            return { ...DEFAULT_FINANCIAL_PROFILE, ...JSON.parse(stored) };
        } catch (e) {
            return DEFAULT_FINANCIAL_PROFILE;
        }
    }
    return DEFAULT_FINANCIAL_PROFILE;
}

export function saveProfile(profile) {
    const current = getProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem("cr_user_profile", JSON.stringify(updated));
    return updated;
}

// -------------------------------------------------------------
// Backend REST API Client Integration
// -------------------------------------------------------------

// 1. POST /api/analyze
export async function analyzeCreditAPI(data) {
    try {
        const res = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/analyze not available, using client calculation:", err.message);
        return null;
    }
}

// 2. POST /api/assessments
export async function createAssessmentAPI(assessmentData) {
    try {
        const res = await fetch(`${API_BASE_URL}/assessments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(assessmentData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/assessments not available, falling back to local state:", err.message);
        return null;
    }
}

// 3. GET /api/assessments/:id
export async function getAssessmentAPI(assessmentId) {
    if (!assessmentId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/assessments/:id not available:", err.message);
        return null;
    }
}

// 4. POST /api/tasks
export async function createTaskAPI(taskData) {
    try {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/tasks not available:", err.message);
        return null;
    }
}

// 5. GET /api/tasks/:assessmentId
export async function getTasksAPI(assessmentId) {
    if (!assessmentId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/tasks/${assessmentId}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/tasks/:assessmentId not available:", err.message);
        return null;
    }
}

// 6. PATCH /api/tasks/:taskId
export async function updateTaskStatusAPI(taskId, completed) {
    if (!taskId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed })
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/tasks/:taskId not available:", err.message);
        return null;
    }
}

// 7. GET /api/progress/:assessmentId
export async function getProgressAPI(assessmentId) {
    if (!assessmentId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/progress/${assessmentId}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/progress/:assessmentId not available:", err.message);
        return null;
    }
}

// -------------------------------------------------------------
// Profile ID  —  stable key used to tie cards/loans to a user
// Derived from PAN (unique per user). Falls back to phone, then name.
// -------------------------------------------------------------
export function getProfileId() {
    const profile = getProfile();
    if (profile.pan && profile.pan !== "ABCDE1234F") {
        return profile.pan.toUpperCase();
    }
    if (profile.phone && profile.phone !== "9876543210") {
        return `ph_${profile.phone}`;
    }
    // Last-resort stable key using name
    return `nm_${(profile.name || "default").toLowerCase().replace(/\s+/g, "_")}`;
}

// -------------------------------------------------------------
// 8. POST /api/cards
// -------------------------------------------------------------
export async function createCardAPI(cardData) {
    try {
        const res = await fetch(`${API_BASE_URL}/cards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cardData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/cards POST not available:", err.message);
        return null;
    }
}

// 9. GET /api/cards/:profileId
export async function getCardsAPI(profileId) {
    if (!profileId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/cards/${encodeURIComponent(profileId)}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/cards/:profileId not available:", err.message);
        return null;
    }
}

// 10. PATCH /api/cards/:cardId
export async function updateCardAPI(cardId, patchData) {
    if (!cardId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/cards/:cardId PATCH not available:", err.message);
        return null;
    }
}

// 11. DELETE /api/cards/:cardId
export async function deleteCardAPI(cardId) {
    if (!cardId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/cards/${cardId}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/cards/:cardId DELETE not available:", err.message);
        return null;
    }
}

// 12. POST /api/loans
export async function createLoanAPI(loanData) {
    try {
        const res = await fetch(`${API_BASE_URL}/loans`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/loans POST not available:", err.message);
        return null;
    }
}

// 13. GET /api/loans/:profileId
export async function getLoansAPI(profileId) {
    if (!profileId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/loans/${encodeURIComponent(profileId)}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/loans/:profileId not available:", err.message);
        return null;
    }
}

// 14. PATCH /api/loans/:loanId
export async function updateLoanAPI(loanId, patchData) {
    if (!loanId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/loans/${loanId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchData)
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/loans/:loanId PATCH not available:", err.message);
        return null;
    }
}

// 15. DELETE /api/loans/:loanId
export async function deleteLoanAPI(loanId) {
    if (!loanId) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/loans/${loanId}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn("Backend /api/loans/:loanId DELETE not available:", err.message);
        return null;
    }
}
