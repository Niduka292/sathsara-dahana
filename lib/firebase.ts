import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | undefined;
let database: Database | undefined;

function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}

function assertFirebaseConfig() {
  if (!firebaseConfig.databaseURL?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL. Copy .env.local.example to .env.local, fill in your Firebase Realtime Database URL, then restart the dev server.",
    );
  }

  if (!firebaseConfig.projectId?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID. Copy .env.local.example to .env.local, then restart the dev server.",
    );
  }
}

export function getDb(): Database {
  if (typeof window === "undefined") {
    throw new Error("Firebase Realtime Database is only available in the browser.");
  }

  assertFirebaseConfig();

  if (!database) {
    database = getDatabase(getFirebaseApp());
  }

  return database;
}

export const LIGHTSHOW_STATE_PATH = "lightshow/state";
export const LIGHTSHOW_META_PATH = "lightshow/meta";
