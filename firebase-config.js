/*==================================================
    FIREBASE-CONFIG.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/


// Firebase SDK

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";


import { getAuth } 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import { getFirestore } 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


import { getDatabase } 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


import { getStorage } 
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";





// CONFIGURATION FIREBASE

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






// INITIALISATION

const app = initializeApp(firebaseConfig);






// SERVICES FIREBASE


// Authentification

const auth = getAuth(app);



// Base membres

const realtime = getDatabase(app);



// Base modules

const db = getFirestore(app);



// Fichiers/images

const storage = getStorage(app);







// EXPORT

export {

    app,

    auth,

    realtime,

    db,

    storage

};



console.log("Firebase MWANA MBOKA connecté");
