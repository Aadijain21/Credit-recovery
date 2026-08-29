function analyzeCredit(data) {
    const {
        creditScore,
        creditLimit,
        outstandingBalance,
        latePayments,
        activeLoans,
        recentInquiries
    } = data;

    // Payment history: 40 points
    const paymentScore = Math.max(
        0,
        40 - (latePayments * 10)
    );

    // Credit utilization: 30 points
    let utilization = 0;

    if (creditLimit > 0) {
        utilization = (outstandingBalance / creditLimit) * 100;
    }

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

    // Recent inquiries: 15 points
    const inquiryScore = Math.max(
        0,
        15 - (recentInquiries * 3)
    );

    // Active loans: 15 points
    const loanScore = Math.max(
        0,
        15 - (activeLoans * 2)
    );

    const score =
        paymentScore +
        utilizationScore +
        inquiryScore +
        loanScore;

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

    const recommendations = [];

    if (utilization > 30) {
        recommendations.push(
            "Reduce credit utilization below 30%"
        );
    }

    if (latePayments > 0) {
        recommendations.push(
            "Avoid late payments and pay bills on time"
        );
    }

    if (recentInquiries > 2) {
        recommendations.push(
            "Avoid applying for unnecessary new credit"
        );
    }

    if (activeLoans > 3) {
        recommendations.push(
            "Consider reducing the number of active loans"
        );
    }

    return {
        creditScore,
        score,
        status,
        utilization: Number(utilization.toFixed(2)),
        recommendations
    };
}

module.exports = analyzeCredit;