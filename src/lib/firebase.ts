// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID
};

// Validate the Firebase configuration
const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length > 0) {
  const errorMessage = `
    ****************************************************************************************
    * FIREBASE CONFIGURATION ERROR                                                         *
    * ------------------------------------------------------------------------------------ *
    * The following Firebase environment variables are missing:                            *
    *   - ${missingConfigKeys.join("\n    - ")}                                                     *
    *                                                                                      *
    * Please make sure you have a .env.local file in the root of your project with all the *
    * required NEXT_PUBLIC_* variables.                                                    *
    * The application will not work correctly until this is resolved.                      *
    ****************************************************************************************
  `;
  console.error(errorMessage);
}


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
