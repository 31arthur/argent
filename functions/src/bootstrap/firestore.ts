import * as admin from 'firebase-admin';

/**
 * Firestore instance for dependency injection
 */

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

// Export Firestore instance
export const firestore = admin.firestore();
