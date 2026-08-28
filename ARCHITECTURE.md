# Architecture

## Application Flow

User
 ↓
HTML Form
 ↓
JavaScript
 ↓
Credit Analysis
 ↓
Credit Health Score
 ↓
Recovery Recommendations
 ↓
Recovery Roadmap
 ↓
Firestore
 ↓
Dashboard / Progress Tracking

## Frontend

HTML → Structure
CSS → Styling
JavaScript → Logic

## Database

Firebase Firestore stores:

User profile
Credit information
Analysis results
Recovery recommendations
Recovery progress

## Important

Keep business logic in JavaScript.

Do not move everything into Firebase.

Firebase is primarily used for persistence and data storage.
