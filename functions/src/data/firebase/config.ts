import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK Configuration for Cloud Functions
 * This is the server-side SDK, not the client SDK
 */

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

// Export Firestore instance for repository use
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

