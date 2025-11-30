// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyAtouhuNEd702kfNtcb1d-Stw28lrIkmFw",
    authDomain: "abarrotesalex-ec387.firebaseapp.com",
    projectId: "abarrotesalex-ec387",
    storageBucket: "abarrotesalex-ec387.firebasestorage.app",
    messagingSenderId: "235882503504",
    appId: "1:235882503504:web:536b928471ffae3e776055",
    measurementId: "G-W3DWRPK1ET"
};

import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
