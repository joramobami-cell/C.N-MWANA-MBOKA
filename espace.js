import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHMovN3CpVl6fQUDZGRNqFu6mLUUPR8Sc",
  authDomain: "c-n-mwana-mboka.firebaseapp.com",
  databaseURL: "https://c-n-mwana-mboka-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "c-n-mwana-mboka",
  storageBucket: "c-n-mwana-mboka.firebasestorage.app",
  messagingSenderId: "757726608581",
  appId: "1:757726608581:web:27fa7003ffa955188304ac"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Vérifier si le membre est connecté
const matricule = localStorage.getItem("matricule");

if (!matricule) {
    window.location.href = "connexion.html";
}

// Charger les informations du membre
async function chargerProfil() {

    const membreRef = ref(db, "membres/" + matricule);

    const snapshot = await get(membreRef);

    if (snapshot.exists()) {

        const membre = snapshot.val();

        document.getElementById("nom").textContent = membre.nom || "";
        document.getElementById("nomMembre").textContent = membre.nom || "";
        document.getElementById("matricule").textContent = membre.matricule || "";
        document.getElementById("telephone").textContent = membre.telephone || "";
        document.getElementById("statut").textContent = membre.statut || "";

        if (membre.photo) {
            document.getElementById("photo").src = membre.photo;
        }

    } else {

        alert("Membre introuvable.");

    }

}

chargerProfil();

// Déconnexion
window.deconnexion = function () {

    localStorage.clear();

    window.location.href = "connexion.html";

};
