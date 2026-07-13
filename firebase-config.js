// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Configuration Firebase
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

// Initialisation
const app = initializeApp(firebaseConfig);

// Services Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export
export { app, auth, db, storage };
