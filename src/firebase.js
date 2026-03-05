// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBwYo_dsKQv2rxFKgB597G2zAA0whsjlMM",
    authDomain: "amigoconnect-d7900.firebaseapp.com",
    projectId: "amigoconnect-d7900",
    storageBucket: "amigoconnect-d7900.firebasestorage.app",
    messagingSenderId: "988250213964",
    appId: "1:988250213964:web:7215a62e58996a87f4eee9",
    measurementId: "G-364GZ6C0MW"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// --- MODO EMULADOR (Comentado para usar la NUBE REAL) ---
/*
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
}
*/