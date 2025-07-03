import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let auth: Auth | null = null;
let initialized = false;

/**
 * Initializes Firebase services on the first call and returns the auth instance.
 * This lazy initialization prevents app-breaking errors on startup if the config is invalid.
 * @returns {Promise<{ auth: Auth | null }>} - A promise that resolves to an object containing the Firebase Auth instance or null if initialization fails.
 */
export async function getFirebaseServices(): Promise<{ auth: Auth | null }> {
    if (initialized) {
        return { auth };
    }

    initialized = true; // Attempt initialization only once per session.

    const allConfigValuesPresent =
        firebaseConfig.apiKey?.trim() &&
        firebaseConfig.authDomain?.trim() &&
        firebaseConfig.projectId?.trim() &&
        firebaseConfig.storageBucket?.trim() &&
        firebaseConfig.messagingSenderId?.trim() &&
        firebaseConfig.appId?.trim();

    if (allConfigValuesPresent) {
        try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            // This is a critical error, likely due to invalid config values.
            // We set auth to null to prevent further issues.
            auth = null;
        }
    } else {
        // Config values are not present, so auth remains null.
        auth = null;
    }

    return { auth };
}
