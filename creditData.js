// -------------------------------------------------------------
// Credit Recovery — Shared Financial & User State (Client-Side)
// -------------------------------------------------------------

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
