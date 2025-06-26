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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Check if all Firebase config values are present and non-empty.
const allConfigValuesPresent =
  firebaseConfig.apiKey?.trim() &&
  firebaseConfig.authDomain?.trim() &&
  firebaseConfig.projectId?.trim() &&
  firebaseConfig.storageBucket?.trim() &&
  firebaseConfig.messagingSenderId?.trim() &&
  firebaseConfig.appId?.trim();

// Only initialize Firebase if all required config values are present
if (allConfigValuesPresent) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    // If initialization fails, ensure auth remains null.
    app = null;
    auth = null;
  }
}

export { app, auth };
