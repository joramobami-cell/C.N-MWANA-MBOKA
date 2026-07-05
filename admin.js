// ===========================
// FIREBASE
// ===========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// ===========================
// CONFIGURATION FIREBASE
// ===========================

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
// VARIABLES GLOBALES
// ===========================

let membreEnCours = null;
let tousLesMembres = [];

const listeMembres = document.getElementById("listeMembres");

// ===========================
// SÉCURITÉ ADMINISTRATEUR
// ===========================

const matriculeAdmin = localStorage.getItem("matricule");

if (!matriculeAdmin) {
    window.location.href = "connexion.html";
}

const adminRef = ref(db, "membres/" + matriculeAdmin);

get(adminRef).then((snapshot) => {

    if (!snapshot.exists()) {
        window.location.href = "connexion.html";
        return;
    }

    const admin = snapshot.val();

    if ((admin.role || "").toLowerCase() !== "admin") {

        alert("Accès réservé à l'administrateur.");

        window.location.href = "espace.html";

        return;
    }

}).catch(() => {

    window.location.href = "connexion.html";

});// ===========================
// CHARGER LES MEMBRES
// ===========================

function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(membresRef, (snapshot) => {

        listeMembres.innerHTML = "";

        tousLesMembres = [];

        let total = 0;
        let actifs = 0;
        let inactifs = 0;
        let admins = 0;

        if (!snapshot.exists()) {

            listeMembres.innerHTML =
            "<p style='text-align:center;'>Aucun membre enregistré.</p>";

            return;
        }

        snapshot.forEach((item) => {

            total++;

            const membre = item.val();

            tousLesMembres.push(membre);

            if ((membre.statut || "") === "Actif") actifs++;
            else inactifs++;

            if ((membre.role || "").toLowerCase() === "admin") admins++;

            listeMembres.innerHTML += `

<div class="carte-membre">

<div class="photo-zone">

<img src="${membre.photo || 'logo.png'}"
class="photo-membre-admin">

</div>

<h2>${membre.nom}</h2>

<p><strong>Matricule :</strong> ${membre.matricule}</p>

<p><strong>Téléphone :</strong> ${membre.telephone}</p>

<p><strong>Profession :</strong> ${membre.profession || "-"}</p>

<p><strong>Adresse :</strong> ${membre.adresse || "-"}</p>

<p><strong>Date d'adhésion :</strong> ${membre.dateadhesion || "-"}</p>

<p>

<strong>Statut :</strong>

<span class="${membre.statut === "Actif" ? "badge-actif" : "badge-inactif"}">

${membre.statut}

</span>

</p>

<div class="actions-admin">

<button onclick="modifierMembre('${membre.matricule}')">

✏️ Modifier

</button>

<button class="btn-danger"

onclick="supprimerMembre('${membre.matricule}')">

🗑️ Supprimer

</button>

</div>

</div>

`;

        });

        document.getElementById("nbMembres").innerText = total;

        document.getElementById("statTotal").innerText = total;

        document.getElementById("statActifs").innerText = actifs;

        document.getElementById("statInactifs").innerText = inactifs;

        document.getElementById("statAdmins").innerText = admins;

    });

}

chargerMembres();

// ===========================
// AJOUTER OU MODIFIER UN MEMBRE
// ===========================

window.ajouterMembre = async function () {

    const matricule = document.getElementById("matricule").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const motdepasse = document.getElementById("motdepasse").value.trim();
    const profession = document.getElementById("profession").value.trim();
    const adresse = document.getElementById("adresse").value.trim();
    const parrain = document.getElementById("parrain").value.trim();
    const statut = document.getElementById("statut").value;

    if (!matricule || !nom || !telephone || !motdepasse) {

        alert("Veuillez remplir tous les champs obligatoires.");

        return;
    }

    const donnees = {

        matricule,
        nom,
        telephone,
        motdepasse,
        profession,
        adresse,
        parrain,
        statut,

        role: "membre",

        photo: "",

        dateadhesion: new Date().toLocaleDateString("fr-FR")

    };

    if (membreEnCours !== null) {

        donnees.dateadhesion =
        document.getElementById("dateadhesion")?.value ||
        donnees.dateadhesion;

        await update(
            ref(db, "membres/" + membreEnCours),
            donnees
        );

        alert("✅ Membre modifié avec succès.");

        membreEnCours = null;

        document.querySelector("#btnAjouter").innerHTML =
        '<i class="fa-solid fa-user-plus"></i> Ajouter le membre';

    } else {

        const existe = await get(ref(db, "membres/" + matricule));

        if (existe.exists()) {

            alert("Ce matricule existe déjà.");

            return;

        }

        await set(ref(db, "membres/" + matricule), donnees);

        alert("✅ Nouveau membre ajouté.");

    }

    document.getElementById("matricule").value = "";
    document.getElementById("nom").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("motdepasse").value = "";
    document.getElementById("profession").value = "";
    document.getElementById("adresse").value = "";
    document.getElementById("parrain").value = "";
    document.getElementById("statut").value = "Actif";

};

// ===========================
// CHARGER UN MEMBRE
// ===========================

window.modifierMembre = async function (matricule) {

    const snapshot = await get(ref(db, "membres/" + matricule));

    if (!snapshot.exists()) {

        alert("Membre introuvable.");

        return;

    }

    const membre = snapshot.val();

    membreEnCours = matricule;

    document.getElementById("matricule").value = membre.matricule;
    document.getElementById("nom").value = membre.nom;
    document.getElementById("telephone").value = membre.telephone;
    document.getElementById("motdepasse").value = membre.motdepasse;
    document.getElementById("profession").value = membre.profession || "";
    document.getElementById("adresse").value = membre.adresse || "";
    document.getElementById("parrain").value = membre.parrain || "";
    document.getElementById("statut").value = membre.statut;

    document.querySelector("#btnAjouter").innerHTML =
    '<i class="fa-solid fa-floppy-disk"></i> Enregistrer';

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

