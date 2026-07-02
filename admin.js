import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get
}
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

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

// ===========================
// SÉCURITÉ ADMINISTRATEUR
// ===========================

const matricule = localStorage.getItem("matricule");

if (!matricule) {
    window.location.href = "connexion.html";
}

const adminRef = ref(db, "membres/" + matricule);

get(adminRef).then((snapshot) => {

    if (!snapshot.exists()) {
        window.location.href = "connexion.html";
        return;
    }

    const membre = snapshot.val();

    if (membre.role !== "admin") {

        alert("Accès refusé. Réservé à l'administrateur.");

        window.location.href = "espace.html";

        return;
    }

});
window.ajouterMembre = async function () {

  const matricule = document.getElementById("matricule").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const motdepasse = document.getElementById("motdepasse").value.trim();
  const statut = document.getElementById("statut").value;

  if (!matricule || !nom || !telephone || !motdepasse) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  await set(ref(db, "membres/" + matricule), {
    matricule,
    nom,
    telephone,
    motdepasse,
    statut,
    profession: "",
    adresse: "",
    parrain: "",
    dateadhesion: new Date().toLocaleDateString("fr-FR")
  });

  alert("✅ Membre ajouté avec succès.");

  document.getElementById("matricule").value = "";
  document.getElementById("nom").value = "";
  document.getElementById("telephone").value = "";
  document.getElementById("motdepasse").value = "";
  document.getElementById("statut").value = "Actif";
};
