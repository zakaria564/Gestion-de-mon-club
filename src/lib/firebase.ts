


// #############################################################################
// # ÉTAPES DE CONFIGURATION DE FIREBASE                                       #
// #############################################################################
// #
// # Pour que l'application puisse sauvegarder des données et des images,
// # vous devez activer Firestore et Storage et définir leurs règles de sécurité.
// #
// # ----------------   ÉTAPE 1 : FIRESTORE (Base de données)   ----------------
// #
// # 1. Allez sur la console Firebase : https://console.firebase.google.com/
// # 2. Sélectionnez votre projet : "gestion-de-mon-club"
// # 3. Dans le menu, allez dans "Build > Firestore Database".
// # 4. Cliquez sur "Créer une base de données", démarrez en "mode production".
// # 5. Allez dans l'onglet "Règles".
// # 6. Remplacez le contenu par ceci et cliquez sur "Publier":
// #
// #    rules_version = '2';
// #    service cloud.firestore {
// #      match /databases/{database}/documents {
// #        // Permet aux utilisateurs d'accéder uniquement à leurs propres données
// #        match /users/{userId}/{document=**} {
// #           allow read, write: if request.auth != null && request.auth.uid == userId;
// #        }
// #      }
// #    }
// #
// # ----------------   ÉTAPE 2 : STORAGE (Pour les photos)   ------------------
// #
// # 1. Dans la console Firebase, allez dans "Build > Storage".
// # 2. Cliquez sur "Commencer" et suivez les étapes (les options par défaut sont bonnes).
// # 3. Une fois créé, allez dans l'onglet "Règles".
// # 4. Remplacez le contenu par ceci et cliquez sur "Publier":
// #
// #    rules_version = '2';
// #    service firebase.storage {
// #      match /b/{bucket}/o {
// #        // Permet aux utilisateurs d'accéder uniquement à leur propre dossier
// #        match /users/{userId}/{allPaths=**} {
// #          allow read, write: if request.auth != null && request.auth.uid == userId;
// #        }
// #      }
// #    }
// #
// #############################################################################

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


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { app };
