/*==================================================
    FIREBASE-CONFIG.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/

// ===============================
// IMPORTS FIREBASE
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

import {
    getAnalytics,
    isSupported
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";


// ===============================
// CONFIGURATION FIREBASE
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyDHMovN3CpVl6fQUDZGRNqFu6mLUUPR8Sc",

    authDomain: "c-n-mwana-mboka.firebaseapp.com",

    databaseURL: "https://c-n-mwana-mboka-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "c-n-mwana-mboka",

    storageBucket: "c-n-mwana-mboka.firebasestorage.app",

    messagingSenderId: "757726608581",

    appId: "1:757726608581:web:27fa7003ffa955188304ac",

    measurementId: "G-SPGC86XGPX"

};


// ===============================
// INITIALISATION DE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);


// ===============================
// SERVICES FIREBASE
// ===============================

// Authentification
const auth = getAuth(app);

// Cloud Firestore
const db = getFirestore(app);

// Realtime Database
const realtime = getDatabase(app);

// Firebase Storage
const storage = getStorage(app);


// ===============================
// FIREBASE ANALYTICS
// ===============================

let analytics = null;

try {

    if (await isSupported()) {

        analytics = getAnalytics(app);

        console.log("Firebase Analytics activé.");

    }

} catch (error) {

    console.warn("Analytics non disponible :", error);

}


// ===============================
// EXPORTS
// ===============================

export {

    app,

    auth,

    db,

    realtime,

    storage,

    analytics

};


// ===============================
// MESSAGE DE DÉMARRAGE
// ===============================

console.log("====================================");
console.log("MWANA MBOKA");
console.log("Firebase initialisé avec succès.");
console.log("Authentification : OK");
console.log("Firestore : OK");
console.log("Realtime Database : OK");
console.log("Storage : OK");
console.log("Analytics :", analytics ? "OK" : "Non disponible");
console.log("====================================");
