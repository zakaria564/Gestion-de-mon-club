// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration - Hardcoded for reliability
// IMPORTANT: For this application to work, you must configure your Firestore
// security rules in the Firebase Console to allow read and write operations.
// By default, all access is denied.
const firebaseConfig = {
  apiKey: "AIzaSyBhwLEcWSSt3G3L9sgGefVW8GKoOgPG_GA",
  authDomain: "gestion-de-mon-club.firebaseapp.com",
  projectId: "gestion-de-mon-club",
  storageBucket: "gestion-de-mon-club.firebasestorage.app",
  messagingSenderId: "1047250842586",
  appId: "1:1047250842586:web:2d2b9c6a12d776fdb286e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
