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
const database = getDatabase(app);

// Matricule du membre connecté
const matricule = localStorage.getItem("matricule");

if (!matricule) {
    window.location.href = "connexion.html";
}

const membreRef = ref(database, "membres/" + matricule);

get(membreRef).then((snapshot) => {

    if (snapshot.exists()) {

        const membre = snapshot.val();

        document.getElementById("nom").innerText = membre.nom || "";
        document.getElementById("matricule").innerText = membre.matricule || "";
        document.getElementById("telephone").innerText = membre.telephone || "";
        document.getElementById("profession").innerText = membre.profession || "";
        document.getElementById("adresse").innerText = membre.adresse || "";
        document.getElementById("parrain").innerText = membre.parrain || "";
        document.getElementById("dateadhesion").innerText = membre.dateadhesion || "";
        document.getElementById("statut").innerText = membre.statut || "";

        if (membre.photo) {
            document.getElementById("photo").src = membre.photo;
        }

    } else {

        alert("Membre introuvable.");

    }

});
