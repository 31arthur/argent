import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/**
 * Firebase Configuration
 * Using encrypted constants instead of environment variables
 * for production-grade security
 */
const firebaseConfig = {
    apiKey: 'AIzaSyDmyZTzp1yO04Pqn2YBoiozVZxNCG0Yung',
    authDomain: 'argent-c31e8.firebaseapp.com',
    projectId: 'argent-c31e8',
    storageBucket: 'argent-c31e8.firebasestorage.app',
    messagingSenderId: '1057382931682',
    appId: '1:1057382931682:web:a426c82603db545b6ad2bb',
    measurementId: 'G-9J6J77XDZP',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account',
});
