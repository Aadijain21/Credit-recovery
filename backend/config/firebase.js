// backend/config/firebase.js
// Supports two auth modes:
//   1. GOOGLE_APPLICATION_CREDENTIALS env var (recommended for production)
//   2. serviceAccountKey.json file in the backend directory (local dev)

const { initializeApp, cert, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

const serviceKeyPath = path.join(__dirname, "..", "serviceAccountKey.json");

let db;

try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Mode 1: Use env-var credentials (CI/CD or production)
        initializeApp({ credential: applicationDefault() });
        console.log("[Firebase] Using GOOGLE_APPLICATION_CREDENTIALS env var.");
    } else if (fs.existsSync(serviceKeyPath)) {
        // Mode 2: Use local serviceAccountKey.json file
        const serviceAccount = require(serviceKeyPath);
        initializeApp({ credential: cert(serviceAccount) });
        console.log("[Firebase] Using local serviceAccountKey.json.");
    } else {
        throw new Error(
            "No Firebase credentials found.\n" +
            "  Option A: Place serviceAccountKey.json in the backend/ directory.\n" +
            "  Option B: Set GOOGLE_APPLICATION_CREDENTIALS env var to the key file path.\n" +
            "  Download the key from: Firebase Console → Project Settings → Service Accounts → Generate new private key."
        );
    }

    db = getFirestore();
    console.log("[Firebase] Firestore initialized successfully.");
} catch (err) {
    console.error("\n❌ Firebase initialization failed:", err.message, "\n");
    // Provide a null db so routes can return helpful 503 errors instead of crashing
    db = null;
}

module.exports = db;