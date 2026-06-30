import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDHMovN3CpVl6fQUDZGRNqFu6mLUUPR8Sc",
    authDomain: "c-n-mwana-mboka.firebaseapp.com",
    databaseURL: "https://c-n-mwana-mboka-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "c-n-mwana-mboka",
    storageBucket: "c-n-mwana-mboka.firebasestorage.app",
    messagingSenderId: "757726608581",
    appId: "1:757726608581:web:27fa7003ffa955188304ac"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Vérifie si un membre est connecté
const matricule = localStorage.getItem("matricule");

if (!matricule) {
    window.location.href = "connexion.html";
}

// Affiche les informations du membre
document.getElementById("nom").textContent =
localStorage.getItem("nom");

document.getElementById("matricule").textContent =
localStorage.getItem("matricule");

document.getElementById("statut").textContent =
"🟢 " + localStorage.getItem("statut");

// Fonction Déconnexion
window.deconnexion = function () {

    localStorage.clear();

    window.location.href = "connexion.html";

}

// ===============================
// COMPTEUR DES MEMBRES
// ===============================

const membresRef = ref(database, "membres");

get(membresRef).then((snapshot)=>{

    if(snapshot.exists()){

        const total = Object.keys(snapshot.val()).length;

        document.getElementById("nbMembres").textContent = total;

    }else{

        document.getElementById("nbMembres").textContent = "0";

    }

});

// ===============================
// NOTIFICATIONS
// ===============================

const notifRef = ref(database,"notifications");

get(notifRef).then((snapshot)=>{

    if(snapshot.exists()){

        const total = Object.keys(snapshot.val()).length;

        document.getElementById("nbNotifications").textContent = total;

    }else{

        document.getElementById("nbNotifications").textContent = "0";

    }

});

// ===============================
// ANNONCES
// ===============================

const annoncesRef = ref(database,"annonces");

get(annoncesRef).then((snapshot)=>{

    if(snapshot.exists()){

        const total = Object.keys(snapshot.val()).length;

        document.getElementById("nbAnnonces").textContent = total;

    }else{

        document.getElementById("nbAnnonces").textContent = "0";

    }

});

// ===============================
// FORMATIONS
// ===============================

const formationsRef = ref(database,"formations");

get(formationsRef).then((snapshot)=>{

    if(snapshot.exists()){

        const total = Object.keys(snapshot.val()).length;

        document.getElementById("nbFormations").textContent = total;

    }else{

        document.getElementById("nbFormations").textContent = "0";

    }

});

