import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Called once at module load
 */
export function initializeFirebase(): admin.firestore.Firestore {
    if (!admin.apps.length) {
        admin.initializeApp();
    }

    return admin.firestore();
}

/**
 * Get Firestore instance
 */
export const firestore = initializeFirebase();
