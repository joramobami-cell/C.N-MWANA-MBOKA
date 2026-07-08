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

// ========================================
// PARTIE 5 : VALIDATION DES DEMANDES
// ========================================

// ==========================
// VALIDER UNE DEMANDE
// ==========================

window.validerProjet = async function (id) {

    const confirmation = confirm(
        "Valider cette demande de financement ?"
    );

    if (!confirmation) return;

    try {

        await update(ref(db, "financements/" + id), {

            statut: "Validé",
            decision: "Approuvée",
            dateValidation: new Date().toLocaleDateString("fr-FR"),
            heureValidation: new Date().toLocaleTimeString("fr-FR"),
            validePar: admin.nom || admin.matricule

        });

        alert("✅ Demande validée avec succès.");

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de la validation.");

    }

};

// ==========================
// REFUSER UNE DEMANDE
// ==========================

window.refuserProjet = async function (id) {

    const motif = prompt(
        "Indiquez le motif du refus :"
    );

    if (motif === null) return;

    try {

        await update(ref(db, "financements/" + id), {

            statut: "Refusé",
            decision: motif,
            dateValidation: new Date().toLocaleDateString("fr-FR"),
            heureValidation: new Date().toLocaleTimeString("fr-FR"),
            validePar: admin.nom || admin.matricule

        });

        alert("❌ Demande refusée.");

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors du refus.");

    }

};

console.log("✅ Partie 5 - Validation des financements OK");

// ========================================
// PARTIE 6 : DÉTAIL D'UNE DEMANDE
// ========================================

// ==========================
// VOIR LES DÉTAILS
// ==========================

window.voirProjet = async function (id) {

    const projetRef = ref(db, "financements/" + id);

    const snapshot = await get(projetRef);

    if (!snapshot.exists()) {

        alert("Demande introuvable.");

        return;

    }

    const projet = snapshot.val();

    const message = `

==============================
 DEMANDE DE FINANCEMENT
==============================

Nom :
${projet.nom}

Matricule :
${projet.matricule}

Type :
${projet.type}

Montant :
${Number(projet.montant).toLocaleString()} FCFA

Objet :
${projet.objet}

Date :
${projet.date}

Heure :
${projet.heure}

Statut :
${projet.statut}

Décision :
${projet.decision || "Aucune"}

Validé par :
${projet.validePar || "-"}

Date validation :
${projet.dateValidation || "-"}

Heure validation :
${projet.heureValidation || "-"}

`;

    alert(message);

};

console.log("✅ Partie 6 - Consultation d'une demande OK");

// ========================================
// PARTIE 7 : RECHERCHE ET FILTRES
// ========================================

// ==========================
// AFFICHER UNE LISTE
// ==========================

function afficherListeProjets(liste) {

    listeProjets.innerHTML = "";

    if (liste.length === 0) {

        listeProjets.innerHTML = `
            <p style="text-align:center;padding:20px;">
                Aucune demande trouvée.
            </p>
        `;

        return;

    }

    liste.forEach((projet) => {

        afficherProjet(projet);

    });

}

// ==========================
// RECHERCHE EN TEMPS RÉEL
// ==========================

if (champRecherche) {

    champRecherche.addEventListener("input", function () {

        const texte = this.value.trim().toLowerCase();

        if (texte === "") {

            afficherListeProjets(tousLesProjets);

            return;

        }

        const resultat = tousLesProjets.filter((projet) => {

            return (

                (projet.nom || "")
                .toLowerCase()
                .includes(texte)

                ||

                (projet.matricule || "")
                .toLowerCase()
                .includes(texte)

                ||

                (projet.type || "")
                .toLowerCase()
                .includes(texte)

                ||

                (projet.statut || "")
                .toLowerCase()
                .includes(texte)

            );

        });

        afficherListeProjets(resultat);

    });

}

// ==========================
// FILTRE PAR STATUT
// ==========================

window.filtrerStatut = function (statut) {

    if (statut === "Tous") {

        afficherListeProjets(tousLesProjets);

        return;

    }

    const resultat = tousLesProjets.filter((projet) =>

        (projet.statut || "").toLowerCase() ===
        statut.toLowerCase()

    );

    afficherListeProjets(resultat);

};

// ==========================
// FILTRE PAR TYPE
// ==========================

window.filtrerType = function (type) {

    if (type === "Tous") {

        afficherListeProjets(tousLesProjets);

        return;

    }

    const resultat = tousLesProjets.filter((projet) =>

        (projet.type || "").toLowerCase() ===
        type.toLowerCase()

    );

    afficherListeProjets(resultat);

};

console.log("✅ Partie 7 - Recherche et filtres OK");

// ========================================
// PARTIE 8 : VALIDATION PRÉSIDENT
// ========================================

// ==========================
// AUTORISER LE DÉCAISSEMENT
// ==========================

window.autoriserDecaissement = async function (id) {

    const code = prompt(
        "Saisissez le code secret du Président :"
    );

    if (!code) {

        return;

    }

    try {

        // Recherche du président
        const membresRef = ref(db, "membres");

        const membresSnap = await get(membresRef);

        if (!membresSnap.exists()) {

            alert("Impossible de vérifier le Président.");

            return;

        }

        let president = null;

        membresSnap.forEach((item) => {

            const membre = item.val();

            if ((membre.role || "").toLowerCase() === "president") {

                president = membre;

            }

        });

        if (!president) {

            alert("Président introuvable.");

            return;

        }

        // Vérification du code secret

        if (president.motdepasse !== code) {

            alert("❌ Code secret incorrect.");

            return;

        }

        // Validation du décaissement

        await update(

            ref(db, "financements/" + id),

            {

                autorisationPresident: true,

                dateAutorisation:
                    new Date().toLocaleDateString("fr-FR"),

                heureAutorisation:
                    new Date().toLocaleTimeString("fr-FR"),

                autorisePar:
                    president.nom,

                statutPaiement:
                    "Autorisé"

            }

        );

        alert("✅ Décaissement autorisé par le Président.");

    }

    catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de l'autorisation.");

    }

};

console.log("✅ Partie 8 - Validation Président OK");

// ========================================
// PARTIE 9 : DÉCAISSEMENT DU FINANCEMENT
// ========================================

// ==========================
// EFFECTUER LE PAIEMENT
// ==========================

window.effectuerPaiement = async function (id) {

    try {

        const projetRef = ref(db, "financements/" + id);

        const projetSnap = await get(projetRef);

        if (!projetSnap.exists()) {

            alert("Financement introuvable.");

            return;

        }

        const projet = projetSnap.val();

        if (projet.autorisationPresident !== true) {

            alert("Le Président doit d'abord autoriser ce décaissement.");

            return;

        }

        if (projet.statutPaiement === "Payé") {

            alert("Ce financement a déjà été payé.");

            return;

        }

        // ==========================
        // ENREGISTRER DANS LA CAISSE
        // ==========================

        const mouvementID = "SORTIE-" + Date.now();

        await set(

            ref(db, "finance/mouvements/" + mouvementID),

            {

                id: mouvementID,

                type: "Sortie",

                categorie: "Financement",

                beneficiaire: projet.nom,

                matricule: projet.matricule,

                montant: Number(projet.montant),

                description: projet.objet,

                date: new Date().toLocaleDateString("fr-FR"),

                heure: new Date().toLocaleTimeString("fr-FR"),

                referenceFinancement: projet.id,

                enregistrePar: admin.nom || admin.matricule

            }

        );

        // ==========================
        // METTRE À JOUR LE DOSSIER
        // ==========================

        await update(projetRef, {

            statutPaiement: "Payé",

            datePaiement: new Date().toLocaleDateString("fr-FR"),

            heurePaiement: new Date().toLocaleTimeString("fr-FR"),

            paiementEffectuePar: admin.nom || admin.matricule

        });

        alert("✅ Décaissement enregistré avec succès.");

    }

    catch (erreur) {

        console.error(erreur);

        alert("Erreur lors du décaissement.");

    }

};

console.log("✅ Partie 9 - Décaissement OK");

// ========================================
// PARTIE 10 : HISTORIQUE DES FINANCEMENTS
// ========================================

// ==========================
// CHARGER L'HISTORIQUE
// ==========================

window.chargerHistorique = async function () {

    const historique = [];

    const snapshot = await get(ref(db, "financements"));

    if (!snapshot.exists()) {

        alert("Aucun historique disponible.");

        return;

    }

    snapshot.forEach((item) => {

        historique.push(item.val());

    });

    historique.sort((a, b) => {

        return (b.datePaiement || "")
            .localeCompare(a.datePaiement || "");

    });

    afficherHistorique(historique);

};

// ==========================
// AFFICHER L'HISTORIQUE
// ==========================

function afficherHistorique(liste) {

    const zone = document.getElementById("historiqueFinancements");

    if (!zone) return;

    zone.innerHTML = "";

    if (liste.length === 0) {

        zone.innerHTML = `
        <p style="text-align:center">
            Aucun financement trouvé.
        </p>`;

        return;

    }

    liste.forEach((projet) => {

        zone.innerHTML += `

        <div class="carte-historique">

            <h3>${projet.nom}</h3>

            <p><strong>Matricule :</strong> ${projet.matricule}</p>

            <p><strong>Type :</strong> ${projet.type}</p>

            <p><strong>Montant :</strong>
                ${Number(projet.montant).toLocaleString()} FCFA
            </p>

            <p><strong>Statut :</strong>
                ${projet.statutPaiement || projet.statut}
            </p>

            <p><strong>Date paiement :</strong>
                ${projet.datePaiement || "-"}
            </p>

            <p><strong>Autorisé par :</strong>
                ${projet.autorisePar || "-"}
            </p>

        </div>

        `;

    });

}

// ==========================
// RECHERCHE HISTORIQUE
// ==========================

window.rechercherHistorique = function () {

    const texte = document
        .getElementById("rechercheHistorique")
        .value
        .trim()
        .toLowerCase();

    const resultat = tousLesProjets.filter((projet) => {

        return (

            (projet.nom || "")
            .toLowerCase()
            .includes(texte)

            ||

            (projet.matricule || "")
            .toLowerCase()
            .includes(texte)

            ||

            (projet.type || "")
            .toLowerCase()
            .includes(texte)

        );

    });

    afficherHistorique(resultat);

};

console.log("✅ Partie 10 - Historique des financements OK");

// ========================================
// PARTIE 11 : TABLEAU DE BORD FINANCIER
// ========================================

// ==========================
// STATISTIQUES
// ==========================

window.calculerStatistiques = async function () {

    const snapshot = await get(ref(db, "financements"));

    if (!snapshot.exists()) return;

    let nbDemandes = 0;
    let nbValides = 0;
    let nbRefuses = 0;
    let nbPayes = 0;

    let montantDemande = 0;
    let montantValide = 0;
    let montantPaye = 0;

    snapshot.forEach((item) => {

        const projet = item.val();

        nbDemandes++;

        montantDemande += Number(projet.montant || 0);

        if (projet.statut === "Validé") {

            nbValides++;

            montantValide += Number(projet.montant || 0);

        }

        if (projet.statut === "Refusé") {

            nbRefuses++;

        }

        if (projet.statutPaiement === "Payé") {

            nbPayes++;

            montantPaye += Number(projet.montant || 0);

        }

    });

    // ==========================
    // AFFICHAGE
    // ==========================

    document.getElementById("nbDemandes").innerText = nbDemandes;

    document.getElementById("nbValides").innerText = nbValides;

    document.getElementById("nbRefuses").innerText = nbRefuses;

    document.getElementById("nbPayes").innerText = nbPayes;

    document.getElementById("montantDemande").innerText =
        montantDemande.toLocaleString() + " FCFA";

    document.getElementById("montantValide").innerText =
        montantValide.toLocaleString() + " FCFA";

    document.getElementById("montantPaye").innerText =
        montantPaye.toLocaleString() + " FCFA";

};

calculerStatistiques();

console.log("✅ Partie 11 - Tableau de bord financier OK");

// ========================================
// PARTIE 12 : PAIEMENT ÉLECTRONIQUE
// ========================================

// ==========================
// ENVOYER LE PAIEMENT
// ==========================

window.envoyerPaiement = async function (id) {

    try {

        const financementRef = ref(db, "financements/" + id);

        const snapshot = await get(financementRef);

        if (!snapshot.exists()) {

            alert("Financement introuvable.");

            return;

        }

        const financement = snapshot.val();

        if (financement.statutPaiement !== "Autorisé") {

            alert("Le Président doit d'abord autoriser le paiement.");

            return;

        }

        // ==========================
        // ENREGISTREMENT DE LA DEMANDE
        // ==========================

        const transactionID = "PAY-" + Date.now();

        await set(

            ref(db, "paiements/" + transactionID),

            {

                id: transactionID,

                financement: id,

                matricule: financement.matricule,

                beneficiaire: financement.nom,

                telephone: financement.telephone || "",

                montant: Number(financement.montant),

                moyen: "MTN Mobile Money",

                statut: "En attente",

                date: new Date().toLocaleDateString("fr-FR"),

                heure: new Date().toLocaleTimeString("fr-FR"),

                creePar: admin.nom || admin.matricule

            }

        );

        await update(financementRef, {

            statutPaiement: "Paiement en attente",

            transaction: transactionID

        });

        alert("✅ Paiement préparé avec succès.");

    } catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de la préparation du paiement.");

    }

};

console.log("✅ Partie 12 - Paiement électronique OK");
