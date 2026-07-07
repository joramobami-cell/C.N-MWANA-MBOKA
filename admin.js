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

// ========================================
// PARTIE 3
// AFFICHAGE DES MEMBRES
// ========================================

// ==========================
// AFFICHER UNE CARTE MEMBRE
// ==========================

function afficherCarte(membre) {

    const carte = document.createElement("div");

    carte.className = "carte-membre";

    const statutClasse =
        (membre.statut || "").toLowerCase() === "actif"
        ? "badge-actif"
        : "badge-inactif";

    const roleClasse =
        (membre.role || "membre").toLowerCase() === "admin"
        ? "badge-admin"
        : "badge-membre";

    const texteRole =
        (membre.role || "membre").toLowerCase() === "admin"
        ? "Administrateur"
        : "Membre";

    const boutonRole =
        (membre.role || "membre").toLowerCase() === "admin"
        ? "👤 Retirer administrateur"
        : "👑 Nommer administrateur";

    carte.innerHTML = `

        <div class="photo-zone">

            <img
                src="${membre.photo || 'logo.png'}"
                alt="${membre.nom}"
                class="photo-membre-admin">

        </div>

        <h2>${membre.nom}</h2>

        <p><strong>Matricule :</strong> ${membre.matricule}</p>

        <p><strong>Téléphone :</strong> ${membre.telephone}</p>

        <p><strong>Profession :</strong> ${membre.profession || "-"}</p>

        <p><strong>Adresse :</strong> ${membre.adresse || "-"}</p>

        <p><strong>Parrain :</strong> ${membre.parrain || "-"}</p>

        <p><strong>Date d'adhésion :</strong> ${membre.dateadhesion || "-"}</p>

        <p>

            <strong>Statut :</strong>

            <span class="${statutClasse}">
                ${membre.statut || "Inactif"}
            </span>

        </p>

        <p>

            <strong>Rôle :</strong>

            <span class="${roleClasse}">
                ${texteRole}
            </span>

        </p>

        <div class="actions-admin">

            <button
                class="btn-modifier"
                onclick="modifierMembre('${membre.matricule}')">

                <i class="fa-solid fa-pen"></i>

                Modifier

            </button>

            <button
                class="btn-danger"
                onclick="supprimerMembre('${membre.matricule}')">

                <i class="fa-solid fa-trash"></i>

                Supprimer

            </button>

            <button
                class="btn-admin"
                onclick="changerRole('${membre.matricule}')">

                ${boutonRole}

            </button>

        </div>

    `;

    listeMembres.appendChild(carte);

}

// ========================================
// PARTIE 4
// RECHERCHE ET FILTRAGE
// ========================================

// ==========================
// AFFICHER UNE LISTE
// ==========================

function afficherListe(liste) {

    listeMembres.innerHTML = "";

    if (liste.length === 0) {

        listeMembres.innerHTML = `

            <div class="aucun-resultat">

                <h3>Aucun membre trouvé</h3>

                <p>Essayez une autre recherche.</p>

            </div>

        `;

        return;

    }

    liste.forEach((membre) => {

        afficherCarte(membre);

    });

}

// ==========================
// FILTRER LES MEMBRES
// ==========================

function rechercherMembres(texte) {

    texte = texte.trim().toLowerCase();

    if (texte === "") {

        afficherListe(tousLesMembres);

        return;

    }

    const resultat = tousLesMembres.filter((membre) => {

        return (

            (membre.nom || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.matricule || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.telephone || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.profession || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.adresse || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.parrain || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.role || "")
                .toLowerCase()
                .includes(texte)

            ||

            (membre.statut || "")
                .toLowerCase()
                .includes(texte)

        );

    });

    afficherListe(resultat);

}

// ==========================
// RECHERCHE EN TEMPS RÉEL
// ==========================

if (champRecherche) {

    champRecherche.addEventListener("input", (e) => {

        rechercherMembres(e.target.value);

    });

}

// ==========================
// RAFRAÎCHIR LA LISTE
// ==========================

function rafraichirListe() {

    afficherListe(tousLesMembres);

}

// ========================================
// PARTIE 5
// AJOUT ET MODIFICATION DES MEMBRES
// ========================================

// ==========================
// ENREGISTRER UN MEMBRE
// ==========================

window.ajouterMembre = async function () {

    try {

        const matricule = document.getElementById("matricule").value.trim();
        const nom = document.getElementById("nom").value.trim();
        const telephone = document.getElementById("telephone").value.trim();
        const motdepasse = document.getElementById("motdepasse").value.trim();
        const profession = document.getElementById("profession").value.trim();
        const adresse = document.getElementById("adresse").value.trim();
        const parrain = document.getElementById("parrain").value.trim();
        const statut = document.getElementById("statut").value;

        // Vérification

        if (!matricule || !nom || !telephone || !motdepasse) {

            alert("Veuillez remplir tous les champs obligatoires.");

            return;

        }

        let membre = {};

        // ==========================
        // MODIFICATION
        // ==========================

        if (membreEnModification) {

            const ancien = await get(
                ref(db, "membres/" + membreEnModification)
            );

            if (!ancien.exists()) {

                alert("Le membre est introuvable.");

                return;

            }

            const ancienMembre = ancien.val();

            membre = {

                matricule: membreEnModification,

                nom,
                telephone,
                motdepasse,
                profession,
                adresse,
                parrain,
                statut,

                role: ancienMembre.role || "membre",

                photo: ancienMembre.photo || "",

                dateadhesion:
                    ancienMembre.dateadhesion ||

                    new Date().toLocaleDateString("fr-FR")

            };

            await set(

                ref(db, "membres/" + membreEnModification),

                membre

            );

            alert("✅ Membre modifié avec succès.");

        }

        // ==========================
        // AJOUT
        // ==========================

        else {

            const existe = await get(

                ref(db, "membres/" + matricule)

            );

            if (existe.exists()) {

                alert("Ce matricule existe déjà.");

                return;

            }

            membre = {

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

                dateadhesion:
                    new Date().toLocaleDateString("fr-FR")

            };

            await set(

                ref(db, "membres/" + matricule),

                membre

            );

            alert("✅ Nouveau membre ajouté.");

        }

        reinitialiserFormulaire();

    }

    catch (erreur) {

        console.error(erreur);

        alert("Une erreur est survenue.");

    }

};

// ========================================
// PARTIE 6
// MODIFIER UN MEMBRE
// RÉINITIALISER LE FORMULAIRE
// ========================================

// ==========================
// CHARGER UN MEMBRE
// ==========================

window.modifierMembre = async function (matricule) {

    try {

        const snapshot = await get(

            ref(db, "membres/" + matricule)

        );

        if (!snapshot.exists()) {

            alert("Membre introuvable.");

            return;

        }

        const membre = snapshot.val();

        membreEnModification = matricule;

        document.getElementById("matricule").value = membre.matricule;
        document.getElementById("matricule").disabled = true;

        document.getElementById("nom").value = membre.nom || "";
        document.getElementById("telephone").value = membre.telephone || "";
        document.getElementById("motdepasse").value = membre.motdepasse || "";
        document.getElementById("profession").value = membre.profession || "";
        document.getElementById("adresse").value = membre.adresse || "";
        document.getElementById("parrain").value = membre.parrain || "";
        document.getElementById("statut").value = membre.statut || "Actif";

        btnAjouter.innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Enregistrer les modifications';

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

    catch (erreur) {

        console.error(erreur);

        alert("Impossible de charger le membre.");

    }

};

// ==========================
// RÉINITIALISER LE FORMULAIRE
// ==========================

function reinitialiserFormulaire() {

    membreEnModification = null;

    document.getElementById("matricule").disabled = false;

    document.getElementById("matricule").value = "";
    document.getElementById("nom").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("motdepasse").value = "";
    document.getElementById("profession").value = "";
    document.getElementById("adresse").value = "";
    document.getElementById("parrain").value = "";
    document.getElementById("statut").value = "Actif";

    btnAjouter.innerHTML =
    '<i class="fa-solid fa-user-plus"></i> Ajouter le membre';

}

// ==========================
// BOUTON ANNULER
// ==========================

if (btnAnnuler) {

    btnAnnuler.addEventListener("click", () => {

        reinitialiserFormulaire();

    });

    }

// ========================================
// PARTIE 7
// SUPPRESSION ET GESTION DES ADMINISTRATEURS
// ========================================

// ==========================
// SUPPRIMER UN MEMBRE
// ==========================

window.supprimerMembre = async function (matricule) {

    try {

        // Interdiction de supprimer son propre compte
        if (matricule === matriculeAdmin) {

            alert("Vous ne pouvez pas supprimer votre propre compte.");

            return;

        }

        const confirmation = confirm(
            "Voulez-vous vraiment supprimer ce membre ?"
        );

        if (!confirmation) return;

        const membreRef = ref(db, "membres/" + matricule);

        const snapshot = await get(membreRef);

        if (!snapshot.exists()) {

            alert("Membre introuvable.");

            return;

        }

        await remove(membreRef);

        alert("✅ Membre supprimé avec succès.");

    }

    catch (erreur) {

        console.error(erreur);

        alert("Une erreur est survenue lors de la suppression.");

    }

};

// ==========================
// CHANGER LE RÔLE
// ==========================

window.changerRole = async function (matricule) {

    try {

        // Empêche l'administrateur connecté
        // de modifier son propre rôle

        if (matricule === matriculeAdmin) {

            alert("Vous ne pouvez pas modifier votre propre rôle.");

            return;

        }

        const membreRef = ref(db, "membres/" + matricule);

        const snapshot = await get(membreRef);

        if (!snapshot.exists()) {

            alert("Membre introuvable.");

            return;

        }

        const membre = snapshot.val();

        const nouveauRole =

            (membre.role || "membre").toLowerCase() === "admin"

            ? "membre"

            : "admin";

        const message =

            nouveauRole === "admin"

            ? `Nommer ${membre.nom} administrateur ?`

            : `Retirer les droits administrateur à ${membre.nom} ?`;

        if (!confirm(message)) {

            return;

        }

        await update(membreRef, {

            role: nouveauRole

        });

        alert("✅ Le rôle a été mis à jour.");

    }

    catch (erreur) {

        console.error(erreur);

        alert("Impossible de modifier le rôle.");

    }

};

// ==========================
// RAFRAÎCHIR LA PAGE
// ==========================

window.actualiserAdministration = function () {

    reinitialiserFormulaire();

    chargerMembres();

};

// ========================================
// PARTIE 8
// INITIALISATION ET FONCTIONS UTILITAIRES
// ========================================

// ==========================
// DÉCONNEXION
// ==========================

window.deconnexion = function () {

    const confirmation = confirm(
        "Voulez-vous vraiment vous déconnecter ?"
    );

    if (!confirmation) return;

    localStorage.removeItem("matricule");

    window.location.href = "connexion.html";

};

// ==========================
// ACTUALISER LES STATISTIQUES
// ==========================

window.actualiser = function () {

    reinitialiserFormulaire();

    chargerMembres();

};

// ==========================
// RECHARGER LA PAGE
// ==========================

window.rechargerPage = function () {

    location.reload();

};

// ==========================
// AFFICHER LE NOM DE L'ADMIN
// ==========================

function afficherAdministrateur() {

    const zoneNom = document.getElementById("nomAdministrateur");

    if (zoneNom && administrateur) {

        zoneNom.innerHTML = administrateur.nom;

    }

}

// ==========================
// DÉMARRAGE DE L'APPLICATION
// ==========================

async function demarrerApplication() {

    const autorise = await verifierAdministrateur();

    if (!autorise) return;

    afficherAdministrateur();

    chargerMembres();

    console.log("================================");

    console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");

    console.log("Administration chargée");

    console.log("Administrateur :", administrateur.nom);

    console.log("================================");

}

demarrerApplication();
