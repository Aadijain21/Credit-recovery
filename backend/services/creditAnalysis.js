function analyzeCredit(data) {

    const {
        creditScore,
        creditLimit,
        outstandingBalance,
        latePayments,
        activeLoans,
        recentInquiries
    } = data;


    // ---------------------------------------------------------
    // CREDIT UTILIZATION
    // ---------------------------------------------------------

    let utilization = 0;

    if (creditLimit > 0) {
        utilization =
            (outstandingBalance / creditLimit) * 100;
    }


    // ---------------------------------------------------------
    // PAYMENT HISTORY
    // ---------------------------------------------------------

    const paymentScore = Math.max(
        0,
        40 - (latePayments * 10)
    );


    // ---------------------------------------------------------
    // CREDIT UTILIZATION SCORE
    // ---------------------------------------------------------

    let utilizationScore;

    if (utilization <= 10) {

        utilizationScore = 30;

    } else if (utilization <= 30) {

        utilizationScore = 25;

    } else if (utilization <= 50) {

        utilizationScore = 15;

    } else {

        utilizationScore = 5;
    }


    // ---------------------------------------------------------
    // RECENT INQUIRIES
    // ---------------------------------------------------------

    const inquiryScore = Math.max(
        0,
        15 - (recentInquiries * 3)
    );


    // ---------------------------------------------------------
    // ACTIVE LOANS
    // ---------------------------------------------------------

    const loanScore = Math.max(
        0,
        15 - (activeLoans * 2)
    );


    // ---------------------------------------------------------
    // FINAL SCORE
    // ---------------------------------------------------------

    const score =
        paymentScore +
        utilizationScore +
        inquiryScore +
        loanScore;


    // ---------------------------------------------------------
    // STATUS
    // ---------------------------------------------------------

    let status;

    if (score >= 80) {

        status = "Excellent";

    } else if (score >= 65) {

        status = "Good";

    } else if (score >= 50) {

        status = "Fair";

    } else {

        status = "Poor";
    }


    // ---------------------------------------------------------
    // RECOMMENDATIONS
    // ---------------------------------------------------------

    const recommendations = [];


    if (utilization > 30) {

        recommendations.push(
            "Reduce credit utilization below 30%."
        );

    } else {

        recommendations.push(
            "Maintain credit utilization below 30%."
        );
    }


    if (latePayments > 0) {

        recommendations.push(
            "Avoid late payments and pay all bills on time."
        );

    } else {

        recommendations.push(
            "Continue making all EMI and credit card payments on time."
        );
    }


    if (recentInquiries > 2) {

        recommendations.push(
            "Avoid applying for unnecessary new credit."
        );

    } else {

        recommendations.push(
            "Avoid unnecessary credit applications."
        );
    }


    if (activeLoans > 3) {

        recommendations.push(
            "Focus on reducing existing loans before taking new debt."
        );

    } else {

        recommendations.push(
            "Keep your existing loan obligations manageable."
        );
    }


    // ---------------------------------------------------------
    // RETURN ANALYSIS
    // ---------------------------------------------------------

    return {

        creditScore,

        score,

        status,

        utilization:
            Number(utilization.toFixed(2)),

        recommendations
    };
}


module.exports = analyzeCredit;