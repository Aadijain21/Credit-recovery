function generateRoadmap({
    utilization,
    latePayments,
    activeLoans,
    recentInquiries
}) {

    const month1 = [];
    const month2 = [];
    const month3 = [];


    // ---------------------------------------------------------
    // MONTH 1 — STABILIZE
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // MONTH 2 — IMPROVE
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // MONTH 3 — MAINTAIN
    // ---------------------------------------------------------

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


    return {
        month1,
        month2,
        month3
    };
}


module.exports = generateRoadmap;