# Credit Recovery — Project Context

## Project Goal

Credit Recovery is a fintech hackathon project that helps users understand
their credit health and provides a personalized plan to improve their
financial habits.

The project is NOT intended to calculate or reproduce the official CIBIL score.

## Core Idea

Input → Analyze → Identify Problems → Recovery Plan → 30/60/90 Day Roadmap → Track Progress

## Current Tech Stack

- HTML5
- CSS3
- JavaScript
- Firebase Firestore
- Git/GitHub

## Current Files

### index.html
Contains the main user interface and credit information form.

### style.css
Contains the styling and layout.

### script.js
Contains:
- Input handling
- Credit utilization calculation
- Credit Health Score calculation
- Health status
- Recovery recommendations
- 3-month recovery roadmap

## User Inputs

The application currently collects:

- Name
- Credit Score
- Monthly Income
- Total Credit Limit
- Outstanding Balance
- Late Payments
- Active Loans
- Recent Credit Inquiries

## Credit Utilization

Formula:

Outstanding Balance / Credit Limit × 100

## Credit Health Score

The current prototype uses:

Payment History: 40 points
Credit Utilization: 30 points
Recent Inquiries: 15 points
Active Loans: 15 points

Total: 100 points

## Score Categories

80–100 → Excellent
60–79 → Good
40–59 → Needs Improvement
0–39 → Poor

## Important Disclaimer

The Credit Health Score is a project-created educational indicator.
It is NOT the official CIBIL score and must not be presented as one.

## Main Product Principle

The application should not simply tell users their score.

It should answer:

"Why is my credit health weak, and what should I do next?"

## Development Rule

Do not rewrite the project from scratch.

Before making changes:

1. Inspect existing files.
2. Understand existing functionality.
3. Preserve working features.
4. Make incremental changes.
5. Test after changes.
