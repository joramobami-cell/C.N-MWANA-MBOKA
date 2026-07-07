// ========================================
// ADMIN.JS
// COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// PARTIE 1
// Firebase - Sécurité - Variables
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

// ==========================
// INITIALISATION FIREBASE
// ==========================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// ==========================
// VARIABLES GLOBALES
// ==========================

let membreEnModification = null;

let tousLesMembres = [];

let administrateur = null;

let matriculeAdmin = "";

// ==========================
// RACCOURCIS HTML
// ==========================

const listeMembres = document.getElementById("listeMembres");

const champRecherche = document.getElementById("recherche");

const btnAjouter = document.getElementById("btnAjouter");

const btnAnnuler = document.getElementById("btnAnnuler");

// ==========================
// VÉRIFICATION ADMINISTRATEUR
// ==========================

async function verifierAdministrateur() {

    try {

        matriculeAdmin = localStorage.getItem("matricule");

        if (!matriculeAdmin) {

            window.location.href = "connexion.html";

            return false;

        }

        const snapshot = await get(
            ref(db, "membres/" + matriculeAdmin)
        );

        if (!snapshot.exists()) {

            localStorage.removeItem("matricule");

            window.location.href = "connexion.html";

            return false;

        }

        administrateur = snapshot.val();

        if ((administrateur.role || "").toLowerCase() !== "admin") {

            alert("Accès réservé à l'administrateur.");

            window.location.href = "espace.html";

            return false;

        }

        return true;

    } catch (erreur) {

        console.error(erreur);

        alert("Impossible de vérifier les droits administrateur.");

        window.location.href = "connexion.html";

        return false;

    }

}

// ========================================
// PARTIE 2
// CHARGEMENT DES MEMBRES
// STATISTIQUES
// ========================================

// ==========================
// CHARGER LES MEMBRES
// ==========================

function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(membresRef, (snapshot) => {

        tousLesMembres = [];

        listeMembres.innerHTML = "";

        let total = 0;
        let actifs = 0;
        let inactifs = 0;
        let admins = 0;

        if (!snapshot.exists()) {

            listeMembres.innerHTML = `
                <p style="text-align:center;padding:30px;">
                    Aucun membre enregistré.
                </p>
            `;

            mettreAJourStatistiques(0, 0, 0, 0);

            return;

        }

        snapshot.forEach((item) => {

            const membre = item.val();

            tousLesMembres.push(membre);

            total++;

            if ((membre.statut || "").toLowerCase() === "actif") {

                actifs++;

            } else {

                inactifs++;

            }

            if ((membre.role || "").toLowerCase() === "admin") {

                admins++;

            }

            afficherCarte(membre);

        });

        mettreAJourStatistiques(
            total,
            actifs,
            inactifs,
            admins
        );

    });

}

// ==========================
// METTRE À JOUR
// LES STATISTIQUES
// ==========================

function mettreAJourStatistiques(
    total,
    actifs,
    inactifs,
    admins
) {

    const nbMembres = document.getElementById("nbMembres");
    const statTotal = document.getElementById("statTotal");
    const statActifs = document.getElementById("statActifs");
    const statInactifs = document.getElementById("statInactifs");
    const statAdmins = document.getElementById("statAdmins");

    if (nbMembres) {

        nbMembres.innerText = total;

    }

    if (statTotal) {

        statTotal.innerText = total;

    }

    if (statActifs) {

        statActifs.innerText = actifs;

    }

    if (statInactifs) {

        statInactifs.innerText = inactifs;

    }

    if (statAdmins) {

        statAdmins.innerText = admins;

    }

}

// ==========================
// INITIALISATION
// ==========================

async function initialiserAdministration() {

    const autorise = await verifierAdministrateur();

    if (!autorise) {

        return;

    }

    chargerMembres();

}

initialiserAdministration();
