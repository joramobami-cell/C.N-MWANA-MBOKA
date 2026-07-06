// ========================================
// ADMIN.JS - COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// Partie 1 : Firebase + Sécurité administrateur
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

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// ==========================
// VARIABLES GLOBALES
// ==========================

let membreEnModification = null;

let tousLesMembres = [];

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

    alert("Accès réservé à l'administrateur.");

    window.location.href = "espace.html";

}

// ==========================
// RACCOURCIS HTML
// ==========================

const listeMembres = document.getElementById("listeMembres");

const champRecherche = document.getElementById("recherche");

const btnAjouter = document.getElementById("btnAjouter");

const btnAnnuler = document.getElementById("btnAnnuler");

// ========================================
// PARTIE 2 : STATISTIQUES + CHARGEMENT
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

        if (!snapshot.exists()) {

            listeMembres.innerHTML = `
            <p style="text-align:center">
                Aucun membre enregistré.
            </p>
            `;

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

            afficherCarte(membre);

        });

        // ==========================
        // STATISTIQUES
        // ==========================

        if (document.getElementById("nbMembres")) {

            document.getElementById("nbMembres").innerText = total;

        }

        if (document.getElementById("statTotal")) {

            document.getElementById("statTotal").innerText = total;

        }

        if (document.getElementById("statActifs")) {

            document.getElementById("statActifs").innerText = actifs;

        }

        if (document.getElementById("statInactifs")) {

            document.getElementById("statInactifs").innerText = inactifs;

        }

    });

            }

// ========================================
// PARTIE 3 : AFFICHAGE DES CARTES MEMBRES
// ========================================

function afficherCarte(membre) {

    const carte = document.createElement("div");

    carte.className = "carte-membre";

    carte.innerHTML = `

        <div class="photo-zone">

            <img src="${membre.photo || "logo.png"}"
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

            <span class="${
                (membre.statut || "").toLowerCase() === "actif"
                ? "badge-actif"
                : "badge-inactif"
            }">

                ${membre.statut}

<p>

<strong>Rôle :</strong>

<span class="${
(membre.role || "membre") === "admin"
? "badge-actif"
: "badge-inactif"
}">

${membre.role || "membre"}

</span>

</p>
            </span>

        </p>

<div class="actions-admin">

<button
class="btn-modifier"
onclick="modifierMembre('${membre.matricule}')">

✏️ Modifier

</button>

<button
class="btn-danger"
onclick="supprimerMembre('${membre.matricule}')">

🗑️ Supprimer

</button>

<button
class="btn-admin"
onclick="changerRole('${membre.matricule}')">

👑 Changer le rôle

</button>

</div>

        </div>

    `;

    listeMembres.appendChild(carte);

}

// ========================================
// PARTIE 4 : RECHERCHE DES MEMBRES
// ========================================

function afficherListe(liste) {

    listeMembres.innerHTML = "";

    if (liste.length === 0) {

        listeMembres.innerHTML = `
            <p style="text-align:center;padding:20px;">
                Aucun membre trouvé.
            </p>
        `;

        return;
    }

    liste.forEach((membre) => {

        afficherCarte(membre);

    });

}

// ==========================
// RECHERCHE EN TEMPS RÉEL
// ==========================

if (champRecherche) {

    champRecherche.addEventListener("input", function () {

        const texte = this.value.trim().toLowerCase();

        if (texte === "") {

            afficherListe(tousLesMembres);

            return;

        }

        const resultat = tousLesMembres.filter((membre) => {

            return (
                (membre.nom || "").toLowerCase().includes(texte) ||
                (membre.matricule || "").toLowerCase().includes(texte) ||
                (membre.telephone || "").toLowerCase().includes(texte) ||
                (membre.profession || "").toLowerCase().includes(texte) ||
                (membre.adresse || "").toLowerCase().includes(texte)
            );

        });

        afficherListe(resultat);

    });

                      }

// ========================================
// PARTIE 5 : AJOUT ET MODIFICATION
// ========================================

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

    const membre = {

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

    if (membreEnModification) {

        await update(
            ref(db, "membres/" + membreEnModification),
            membre
        );

        alert("✅ Membre modifié avec succès.");

        membreEnModification = null;

        btnAjouter.innerHTML =
        '<i class="fa-solid fa-user-plus"></i> Ajouter le membre';

    } else {

        const existe = await get(
            ref(db, "membres/" + matricule)
        );

        if (existe.exists()) {

            alert("Ce matricule existe déjà.");

            return;

        }

        await set(
            ref(db, "membres/" + matricule),
            membre
        );

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

// ==========================
// CHARGER UN MEMBRE
// ==========================

window.modifierMembre = async function (matricule) {

    const snapshot = await get(ref(db, "membres/" + matricule));

    if (!snapshot.exists()) {

        alert("Membre introuvable.");

        return;

    }

    const membre = snapshot.val();

    membreEnModification = matricule;

    document.getElementById("matricule").value = membre.matricule;
    document.getElementById("nom").value = membre.nom;
    document.getElementById("telephone").value = membre.telephone;
    document.getElementById("motdepasse").value = membre.motdepasse;
    document.getElementById("profession").value = membre.profession || "";
    document.getElementById("adresse").value = membre.adresse || "";
    document.getElementById("parrain").value = membre.parrain || "";
    document.getElementById("statut").value = membre.statut;

    btnAjouter.innerHTML =
    '<i class="fa-solid fa-floppy-disk"></i> Enregistrer les modifications';

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

// ========================================
// PARTIE 6 : SUPPRESSION + INITIALISATION
// ========================================

// ==========================
// SUPPRIMER UN MEMBRE
// ==========================

window.supprimerMembre = async function (matricule) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer ce membre ?"
    );

    if (!confirmation) return;

    try {

        await remove(ref(db, "membres/" + matricule));

        alert("✅ Membre supprimé avec succès.");

    } catch (erreur) {

        console.error(erreur);

        alert("Une erreur est survenue lors de la suppression.");

    }

};

// ==========================
// ANNULER UNE MODIFICATION
// ==========================

if (btnAnnuler) {

    btnAnnuler.addEventListener("click", () => {

        membreEnModification = null;

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

    });

}

// ==========================
// DÉMARRAGE
// ==========================

// ========================================
// CHANGER LE RÔLE D'UN MEMBRE
// ========================================

window.changerRole = async function (matricule) {

    // Empêche l'administrateur connecté de perdre son propre rôle
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
        (membre.role || "membre") === "admin"
        ? "membre"
        : "admin";

    const confirmation = confirm(
        `Voulez-vous attribuer le rôle "${nouveauRole}" à ${membre.nom} ?`
    );

    if (!confirmation) return;

    await update(membreRef, {

        role: nouveauRole

    });

    alert("✅ Rôle mis à jour avec succès.");

};

chargerMembres();

console.log("✅ Admin.js chargé avec succès.");
