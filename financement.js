// ========================================
// FINANCEMENT.JS
// COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// Partie 1 : Firebase + Sécurité
// ========================================

// ==========================
// IMPORT FIREBASE
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update,
    remove,
    push,
    onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// ==========================
// CONFIGURATION FIREBASE
// ==========================

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

// ==========================
// VARIABLES GLOBALES
// ==========================

let projetEnModification = null;
let tousLesProjets = [];

// ==========================
// SÉCURITÉ ADMINISTRATEUR
// ==========================

const matriculeAdmin = localStorage.getItem("matricule");

if (!matriculeAdmin) {

    window.location.href = "connexion.html";

}

const adminRef = ref(db, "membres/" + matriculeAdmin);
const adminSnap = await get(adminRef);

if (!adminSnap.exists()) {

    window.location.href = "connexion.html";

}

const admin = adminSnap.val();

if ((admin.role || "").toLowerCase() !== "admin") {

    alert("Accès réservé aux administrateurs.");

    window.location.href = "espace.html";

}

// ==========================
// RACCOURCIS HTML
// ==========================

const listeProjets = document.getElementById("listeProjets");
const champRecherche = document.getElementById("rechercheProjet");
const btnValider = document.getElementById("btnValider");
const btnAnnuler = document.getElementById("btnAnnuler");

console.log("✅ Financement.js - Partie 1 chargée.");

// ========================================
// PARTIE 2 : CHARGEMENT DES FINANCEMENTS
// ========================================

// ==========================
// CHARGER LES DEMANDES
// ==========================

function chargerFinancements() {

    const financementRef = ref(db, "financements");

    onValue(financementRef, (snapshot) => {

        tousLesProjets = [];

        if (listeProjets) {

            listeProjets.innerHTML = "";

        }

        let total = 0;
        let attente = 0;
        let valide = 0;
        let refuse = 0;

        if (!snapshot.exists()) {

            if (listeProjets) {

                listeProjets.innerHTML = `
                    <p style="text-align:center;padding:20px;">
                        Aucune demande de financement.
                    </p>
                `;

            }

            mettreAJourStatistiques(0,0,0,0);

            return;

        }

        snapshot.forEach((item) => {

            const projet = item.val();

            projet.id = item.key;

            tousLesProjets.push(projet);

            total++;

            switch ((projet.statut || "").toLowerCase()) {

                case "validé":
                case "valide":
                    valide++;
                    break;

                case "refusé":
                case "refuse":
                    refuse++;
                    break;

                default:
                    attente++;
                    break;

            }

            afficherProjet(projet);

        });

        mettreAJourStatistiques(
            total,
            attente,
            valide,
            refuse
        );

    });

}

// ==========================
// STATISTIQUES
// ==========================

function mettreAJourStatistiques(
    total,
    attente,
    valide,
    refuse
) {

    if (document.getElementById("statTotal")) {

        document.getElementById("statTotal").innerText = total;

    }

    if (document.getElementById("statAttente")) {

        document.getElementById("statAttente").innerText = attente;

    }

    if (document.getElementById("statValides")) {

        document.getElementById("statValides").innerText = valide;

    }

    if (document.getElementById("statRefuses")) {

        document.getElementById("statRefuses").innerText = refuse;

    }

}

console.log("✅ Partie 2 - Chargement des financements OK");

// ========================================
// PARTIE 3 : AFFICHAGE DES DEMANDES
// ========================================

function afficherProjet(projet) {

    const carte = document.createElement("div");

    carte.className = "carte-projet";

    const statut = (projet.statut || "En attente").toLowerCase();

    let badge = "badge-attente";

    if (statut === "validé" || statut === "valide") {

        badge = "badge-valide";

    } else if (statut === "refusé" || statut === "refuse") {

        badge = "badge-refuse";

    }

    carte.innerHTML = `

        <div class="photo-zone">

            <img src="${projet.photo || 'logo.png'}"
                 class="photo-membre">

        </div>

        <h2>${projet.nom}</h2>

        <p><strong>Matricule :</strong> ${projet.matricule}</p>

        <p><strong>Type :</strong> ${projet.type}</p>

        <p><strong>Montant demandé :</strong>
            ${Number(projet.montant || 0).toLocaleString()} FCFA
        </p>

        <p><strong>Objet :</strong><br>
            ${projet.objet || "-"}
        </p>

        <p><strong>Date :</strong>
            ${projet.date || "-"}
        </p>

        <p>

            <strong>Statut :</strong>

            <span class="${badge}">
                ${projet.statut || "En attente"}
            </span>

        </p>

        <div class="actions-financement">

            <button class="btn-details"
                onclick="voirProjet('${projet.id}')">

                📄 Détails

            </button>

            <button class="btn-valider"
                onclick="validerProjet('${projet.id}')">

                ✅ Valider

            </button>

            <button class="btn-refuser"
                onclick="refuserProjet('${projet.id}')">

                ❌ Refuser

            </button>

        </div>

    `;

    listeProjets.appendChild(carte);

}

console.log("✅ Partie 3 - Affichage des demandes OK");

// ========================================
// PARTIE 4 : ENREGISTRER UNE DEMANDE
// ========================================

window.enregistrerProjet = async function () {

    const matricule = document.getElementById("matricule").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const type = document.getElementById("type").value;
    const montant = document.getElementById("montant").value.trim();
    const objet = document.getElementById("objet").value.trim();

    if (!matricule || !nom || !type || !montant || !objet) {

        alert("Veuillez remplir tous les champs.");

        return;

    }

    const id = "FIN-" + Date.now();

    const projet = {

        id,
        matricule,
        nom,
        type,
        montant: Number(montant),
        objet,
        date: new Date().toLocaleDateString("fr-FR"),
        heure: new Date().toLocaleTimeString("fr-FR"),
        statut: "En attente",
        photo: "",
        decision: "",
        dateValidation: "",
        validePar: ""

    };

    try {

        await set(
            ref(db, "financements/" + id),
            projet
        );

        alert("✅ Votre demande de financement a été enregistrée.");

        document.getElementById("type").value = "";
        document.getElementById("montant").value = "";
        document.getElementById("objet").value = "";

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de l'enregistrement.");

    }

};

console.log("✅ Partie 4 - Enregistrement des demandes OK");
