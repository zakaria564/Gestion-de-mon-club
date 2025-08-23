// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration - Hardcoded for reliability
// IMPORTANT: For this application to work, you must configure your Firestore
// security rules in the Firebase Console to allow read and write operations.
// By default, all access is denied.
const firebaseConfig = {
  apiKey: "AIzaSyBhwLEcWSSt3G3L9sgGefVW8GKoOgPG_GA",
  authDomain: "gestion-de-mon-club.firebaseapp.com",
  projectId: "gestion-de-mon-club",
  storageBucket: "gestion-de-mon-club.appspot.com",
  messagingSenderId: "1047250842586",
  appId: "1:1047250842586:web:2d2b9c6a12d776fdb286e3"
};


// #############################################################################
// #  IMPORTANT: FIREBASE SECURITY RULES                                       #
// #############################################################################
// #
// # Your application will not be able to save or load data until you configure
// # your Firebase security rules in the Firebase Console.
// #
// # ----------------   1. FIRESTORE DATABASE RULES   ----------------
// #
// # 1. Go to the Firebase Console: https://console.firebase.google.com/
// # 2. Select your project: "gestion-de-mon-club"
// # 3. Go to "Firestore Database" > "Rules" tab.
// # 4. Replace the existing rules with:
// #
// #    rules_version = '2';
// #    service cloud.firestore {
// #      match /databases/{database}/documents {
// #        // Allow users to only access their own data
// #        match /users/{userId}/{document=**} {
// #           allow read, write: if request.auth != null && request.auth.uid == userId;
// #        }
// #      }
// #    }
// #
// # 5. Click "Publish".
// #
// # ----------------   2. STORAGE RULES (For Images)   ----------------
// #
// # 1. In the Firebase Console, go to "Storage" > "Rules" tab.
// # 2. Replace the existing rules with:
// #
// #    rules_version = '2';
// #    service firebase.storage {
// #      match /b/{bucket}/o {
// #        // Allow users to only access their own folder
// #        match /users/{userId}/{allPaths=**} {
// #          allow read, write: if request.auth != null && request.auth.uid == userId;
// #        }
// #      }
// #    }
// #
// # 3. Click "Publish".
// #
// #############################################################################


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };
