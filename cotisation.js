// ========================================
// COTISATION.JS
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
    push,
    update,
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

let toutesLesCotisations = [];
let cotisationEnModification = null;

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

const listeCotisations = document.getElementById("listeCotisations");

const champRecherche = document.getElementById("recherche");

const btnAjouter = document.getElementById("btnAjouter");

const btnAnnuler = document.getElementById("btnAnnuler");

console.log("✅ Cotisation.js - Partie 1 chargée.");

// ========================================
// PARTIE 2 : CHARGEMENT DES MEMBRES
// ========================================

// Références HTML
const selectMembre = document.getElementById("membre");
const infoMembre = document.getElementById("infoMembre");

// Liste des membres
let listeMembres = [];

// Charger les membres actifs
function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(membresRef, (snapshot) => {

        selectMembre.innerHTML =
            '<option value="">-- Sélectionner un membre --</option>';

        listeMembres = [];

        if (!snapshot.exists()) return;

        snapshot.forEach((item) => {

            const membre = item.val();

            listeMembres.push(membre);

            const option = document.createElement("option");

            option.value = membre.matricule;

            option.textContent =
                `${membre.nom} (${membre.matricule})`;

            selectMembre.appendChild(option);

        });

    });

}

// ========================================
// AFFICHAGE DES INFORMATIONS DU MEMBRE
// ========================================

selectMembre.addEventListener("change", () => {

    const matricule = selectMembre.value;

    if (matricule === "") {

        infoMembre.innerHTML = "";

        return;

    }

    const membre = listeMembres.find(
        m => m.matricule === matricule
    );

    if (!membre) return;

    infoMembre.innerHTML = `

        <div class="carte-info">

            <img src="${membre.photo || "logo.png"}"
                 class="photo-membre">

            <h3>${membre.nom}</h3>

            <p><strong>Matricule :</strong> ${membre.matricule}</p>

            <p><strong>Téléphone :</strong> ${membre.telephone}</p>

            <p><strong>Profession :</strong> ${membre.profession || "-"}</p>

            <p><strong>Statut :</strong> ${membre.statut}</p>

        </div>

    `;

});

// Lancer le chargement
chargerMembres();

// ========================================
// PARTIE 3 : AFFICHAGE DES COTISATIONS
// ========================================

function afficherCotisations() {

    const cotisationsRef = ref(db, "cotisations");

    onValue(cotisationsRef, (snapshot) => {

        tbody.innerHTML = "";

        let totalCotisations = 0;
        let montantTotal = 0;
        let totalParrain = 0;
        let totalCommunaute = 0;

        if (!snapshot.exists()) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Aucune cotisation enregistrée.
                    </td>
                </tr>
            `;

            if (document.getElementById("nbCotisations"))
                document.getElementById("nbCotisations").innerText = 0;

            if (document.getElementById("montantTotal"))
                document.getElementById("montantTotal").innerText = "0 FCFA";

            if (document.getElementById("partParrains"))
                document.getElementById("partParrains").innerText = "0 FCFA";

            if (document.getElementById("partCommunaute"))
                document.getElementById("partCommunaute").innerText = "0 FCFA";

            return;

        }

        snapshot.forEach((item) => {

            const cotisation = item.val();

            totalCotisations++;

            montantTotal += Number(cotisation.montant || 0);

            totalParrain += Number(cotisation.partParrain || 0);

            totalCommunaute += Number(cotisation.partCommunaute || 0);

            const ligne = document.createElement("tr");

            ligne.innerHTML = `

                <td>${cotisation.date}</td>

                <td>${cotisation.matricule}</td>

                <td>${cotisation.nom}</td>

                <td>${cotisation.parrain || "-"}</td>

                <td>${Number(cotisation.montant).toLocaleString()} FCFA</td>

                <td>${Number(cotisation.partParrain).toLocaleString()} FCFA</td>

                <td>${Number(cotisation.partCommunaute).toLocaleString()} FCFA</td>

                <td>
                    <button class="btn-danger"
                        onclick="supprimerCotisation('${item.key}')">
                        Supprimer
                    </button>
                </td>

            `;

            tbody.appendChild(ligne);

        });

        if (document.getElementById("nbCotisations"))
            document.getElementById("nbCotisations").innerText = totalCotisations;

        if (document.getElementById("montantTotal"))
            document.getElementById("montantTotal").innerText =
                montantTotal.toLocaleString() + " FCFA";

        if (document.getElementById("partParrains"))
            document.getElementById("partParrains").innerText =
                totalParrain.toLocaleString() + " FCFA";

        if (document.getElementById("partCommunaute"))
            document.getElementById("partCommunaute").innerText =
                totalCommunaute.toLocaleString() + " FCFA";

    });

}

// ========================================
// PARTIE 4 : ENREGISTRER UNE COTISATION
// ========================================

window.enregistrerCotisation = async function () {

    const matricule = document.getElementById("matricule").value.trim();

    if (!matricule) {

        alert("Veuillez saisir le matricule du membre.");

        return;

    }

    // Recherche du membre
    const membreRef = ref(db, "membres/" + matricule);

    const membreSnap = await get(membreRef);

    if (!membreSnap.exists()) {

        alert("Membre introuvable.");

        return;

    }

    const membre = membreSnap.val();

    // Paramètres de cotisation
    const montant = 2000;
    const partParrain = 700;
    const partCommunaute = 1300;

    const date = new Date().toLocaleDateString("fr-FR");

    const heure = new Date().toLocaleTimeString("fr-FR");

    // Identifiant unique
    const id = "COT" + Date.now();

    // Enregistrement de la cotisation
    await set(ref(db, "cotisations/" + id), {

        id,
        date,
        heure,

        matricule: membre.matricule,
        nom: membre.nom,
        telephone: membre.telephone || "",

        parrain: membre.parrain || "",

        montant,
        partParrain,
        partCommunaute

    });

    // Mise à jour du nombre de cotisations du membre
    await update(membreRef, {

        nombreCotisations:
            (membre.nombreCotisations || 0) + 1,

        derniereCotisation: date

    });

    alert("✅ Cotisation enregistrée avec succès.");

    // Réinitialisation du formulaire
    document.getElementById("matricule").value = "";

};

// ========================================
// PARTIE 6 : ENREGISTRER UNE COTISATION
// ========================================

window.enregistrerCotisation = async function () {

    const matricule = document.getElementById("matricule").value.trim();

    if (!matricule) {
        alert("Sélectionnez un membre.");
        return;
    }

    const membreSnap = await get(ref(db, "membres/" + matricule));

    if (!membreSnap.exists()) {
        alert("Membre introuvable.");
        return;
    }

    const membre = membreSnap.val();

    const montant = 2000;
    const partParrain = 700;
    const partCommunaute = 1300;

    const date = new Date().toLocaleString("fr-FR");

    // Enregistrer la cotisation
    await push(ref(db, "cotisations"), {

        matricule: membre.matricule,
        nom: membre.nom,
        montant,
        date,
        statut: "Payée"

    });

    // Ajouter la part communautaire
    const caisseRef = ref(db, "caisse");

    const caisseSnap = await get(caisseRef);

    let caisse = 0;

    if (caisseSnap.exists()) {
        caisse = caisseSnap.val().solde || 0;
    }

    await set(caisseRef, {

        solde: caisse + partCommunaute

    });

    // Créditer le parrain
    if (membre.parrain) {

        const parrainRef = ref(db, "membres/" + membre.parrain);

        const parrainSnap = await get(parrainRef);

        if (parrainSnap.exists()) {

            const ancienBonus = parrainSnap.val().bonus || 0;

            await update(parrainRef, {

                bonus: ancienBonus + partParrain

            });

        }

    }

    alert("✅ Cotisation enregistrée avec succès.");

    document.getElementById("matricule").value = "";

};

// ========================================
// PARTIE 7 : SUPPRESSION D'UNE COTISATION
// ========================================

window.supprimerCotisation = async function (id) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cette cotisation ?"
    );

    if (!confirmation) return;

    try {

        const cotisationRef = ref(db, "cotisations/" + id);
        const cotisationSnap = await get(cotisationRef);

        if (!cotisationSnap.exists()) {

            alert("Cotisation introuvable.");
            return;

        }

        const cotisation = cotisationSnap.val();

        // Suppression de la cotisation
        await remove(cotisationRef);

        // Mise à jour du total des cotisations du membre
        const membreRef = ref(db, "membres/" + cotisation.matricule);
        const membreSnap = await get(membreRef);

        if (membreSnap.exists()) {

            const membre = membreSnap.val();

            const totalActuel = Number(membre.totalCotisations || 0);
            const nouveauTotal = Math.max(
                0,
                totalActuel - Number(cotisation.montant)
            );

            await update(membreRef, {
                totalCotisations: nouveauTotal
            });

        }

        alert("✅ Cotisation supprimée avec succès.");

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de la suppression.");

    }

};

// ========================================
// PARTIE 8 : MODIFICATION - SUPPRESSION
// INITIALISATION
// ========================================

// ==========================
// MODIFIER UNE COTISATION
// ==========================

window.modifierCotisation = async function (id) {

    const snapshot = await get(ref(db, "cotisations/" + id));

    if (!snapshot.exists()) {

        alert("Cotisation introuvable.");
        return;

    }

    const cotisation = snapshot.val();

    cotisationEnModification = id;

    document.getElementById("matricule").value = cotisation.matricule;
    document.getElementById("montant").value = cotisation.montant;
    document.getElementById("mois").value = cotisation.mois;
    document.getElementById("annee").value = cotisation.annee;
    document.getElementById("modePaiement").value = cotisation.modePaiement;
    document.getElementById("observation").value =
        cotisation.observation || "";

    document.getElementById("btnEnregistrer").innerHTML =
        '<i class="fa-solid fa-floppy-disk"></i> Enregistrer les modifications';

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

};

// ==========================
// SUPPRIMER UNE COTISATION
// ==========================

window.supprimerCotisation = async function (id) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cette cotisation ?"
    );

    if (!confirmation) return;

    try {

        await remove(ref(db, "cotisations/" + id));

        alert("✅ Cotisation supprimée.");

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de la suppression.");

    }

};

// ==========================
// ANNULER MODIFICATION
// ==========================

const btnAnnuler = document.getElementById("btnAnnuler");

if (btnAnnuler) {

    btnAnnuler.addEventListener("click", () => {

        cotisationEnModification = null;

        document.getElementById("matricule").value = "";
        document.getElementById("montant").value = "";
        document.getElementById("mois").value = "";
        document.getElementById("annee").value =
            new Date().getFullYear();

        document.getElementById("modePaiement").value = "Espèces";
        document.getElementById("observation").value = "";

        document.getElementById("btnEnregistrer").innerHTML =
            '<i class="fa-solid fa-money-bill-wave"></i> Enregistrer la cotisation';

    });

}

// ==========================
// DÉMARRAGE
// ==========================

chargerCotisations();

console.log("✅ cotisation.js chargé avec succès.");

