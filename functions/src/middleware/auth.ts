import { https } from 'firebase-functions/v2';
import type { CallableRequest } from 'firebase-functions/v2/https';

/**
 * Authentication Middleware
 * Helpers for verifying user authentication and authorization
 */

/**
 * Require user to be authenticated
 * Extracts and returns userId from auth context
 * 
 * @throws HttpsError if user is not authenticated
 */
export function requireAuth(request: CallableRequest): string {
    if (!request.auth) {
        throw new https.HttpsError(
            'unauthenticated',
            'User must be authenticated to perform this action'
        );
    }

    return request.auth.uid;
}

/**
 * Verify resource ownership
 * Ensures the requesting user owns the resource
 * 
 * @throws HttpsError if user doesn't own the resource
 */
export function verifyOwnership(resourceUserId: string, requestUserId: string): void {
    if (resourceUserId !== requestUserId) {
        throw new https.HttpsError(
            'permission-denied',
            'You do not have permission to access this resource'
        );
    }
}
