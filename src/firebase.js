// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "amigoconnect-d7900.firebaseapp.com",
    projectId: "amigoconnect-d7900",
    storageBucket: "amigoconnect-d7900.firebasestorage.app",
    messagingSenderId: "TU_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

// Al final de tu archivo, después de las constantes exportadas:
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

import { getStorage, connectStorageEmulator } from "firebase/storage";

export const storage = getStorage(app);

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    connectStorageEmulator(storage, "127.0.0.1", 9199);
}