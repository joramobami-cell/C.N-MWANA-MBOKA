// ========================================
// FINANCE.JS
// COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// PARTIE 1 : FIREBASE + SÉCURITÉ
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

let admin = null;

let tousLesMouvements = [];

let toutesLesCotisations = [];

let tousLesPaiements = [];

let tousLesInvestissements = [];

let tousLesFinancements = [];

let toutesLesEntraides = [];

let toutesLesFormations = [];

let soldeGeneral = 0;


// ==========================
// SÉCURITÉ
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

admin = adminSnap.val();


// ==========================
// AUTORISATION
// ==========================

const role = (admin.role || "").toLowerCase();

if (

    role !== "admin"

    &&

    role !== "president"

) {

    alert("Accès refusé.");

    window.location.href = "espace.html";

}


// ==========================
// RACCOURCIS HTML
// ==========================

const listeMouvements = document.getElementById("listeMouvements");

const champRecherche = document.getElementById("recherche");

const filtreCategorie = document.getElementById("filtreCategorie");

const filtreType = document.getElementById("filtreType");


// ==========================
// INITIALISATION
// ==========================

console.log("✅ Finance.js - Partie 1 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 2 : TABLEAU DE BORD FINANCIER
// ========================================

// ==========================
// CHARGER LES MOUVEMENTS
// ==========================

function chargerFinance() {

    const mouvementsRef = ref(db, "finance/mouvements");

    onValue(mouvementsRef, (snapshot) => {

        tousLesMouvements = [];

        let recettes = 0;
        let depenses = 0;

        if (!snapshot.exists()) {

            mettreAJourTableauBord(0, 0, 0, 0);

            if (listeMouvements) {

                listeMouvements.innerHTML = `
                    <p style="text-align:center;">
                        Aucun mouvement financier.
                    </p>
                `;

            }

            return;

        }

        if (listeMouvements) {

            listeMouvements.innerHTML = "";

        }

        snapshot.forEach((item) => {

            const mouvement = item.val();

            tousLesMouvements.push(mouvement);

            const montant = Number(mouvement.montant || 0);

            if ((mouvement.type || "").toLowerCase() === "entrée") {

                recettes += montant;

            } else {

                depenses += montant;

            }

            if (listeMouvements) {

                afficherMouvement(mouvement);

            }

        });

        soldeGeneral = recettes - depenses;

        mettreAJourTableauBord(

            recettes,

            depenses,

            soldeGeneral,

            tousLesMouvements.length

        );

    });

}

// ==========================
// TABLEAU DE BORD
// ==========================

function mettreAJourTableauBord(

    recettes,
    depenses,
    solde,
    mouvements

) {

    if (document.getElementById("recettes")) {

        document.getElementById("recettes").innerText =
            recettes.toLocaleString() + " FCFA";

    }

    if (document.getElementById("depenses")) {

        document.getElementById("depenses").innerText =
            depenses.toLocaleString() + " FCFA";

    }

    if (document.getElementById("solde")) {

        document.getElementById("solde").innerText =
            solde.toLocaleString() + " FCFA";

    }

    if (document.getElementById("nbMouvements")) {

        document.getElementById("nbMouvements").innerText =
            mouvements;

    }

}

// ==========================
// AFFICHER UN MOUVEMENT
// ==========================

function afficherMouvement(mouvement) {

    const carte = document.createElement("div");

    carte.className = "carte-finance";

    carte.innerHTML = `

        <h3>${mouvement.categorie}</h3>

        <p><strong>Type :</strong> ${mouvement.type}</p>

        <p><strong>Montant :</strong>
            ${Number(mouvement.montant).toLocaleString()} FCFA
        </p>

        <p><strong>Bénéficiaire :</strong>
            ${mouvement.beneficiaire || "-"}
        </p>

        <p><strong>Date :</strong>
            ${mouvement.date || "-"}
        </p>

        <p><strong>Description :</strong>
            ${mouvement.description || "-"}
        </p>

    `;

    listeMouvements.appendChild(carte);

}

// ==========================
// DÉMARRAGE
// ==========================

chargerFinance();

console.log("✅ Finance.js - Partie 2 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 3 : AJOUT D'UN MOUVEMENT
// ========================================

// ==========================
// AJOUTER UN MOUVEMENT
// ==========================

window.ajouterMouvement = async function () {

    const type = document.getElementById("type").value;
    const categorie = document.getElementById("categorie").value;
    const beneficiaire = document.getElementById("beneficiaire").value.trim();
    const montant = Number(document.getElementById("montant").value);
    const description = document.getElementById("description").value.trim();

    if (!categorie || montant <= 0) {

        alert("Veuillez remplir correctement les informations.");

        return;

    }

    const id = "MVT-" + Date.now();

    const mouvement = {

        id,
        type,
        categorie,
        beneficiaire,
        montant,
        description,

        date: new Date().toLocaleDateString("fr-FR"),
        heure: new Date().toLocaleTimeString("fr-FR"),

        enregistrePar: admin.nom || admin.matricule

    };

    try {

        await set(

            ref(db, "finance/mouvements/" + id),

            mouvement

        );

        alert("✅ Mouvement enregistré avec succès.");

        // Réinitialisation du formulaire

        document.getElementById("beneficiaire").value = "";
        document.getElementById("montant").value = "";
        document.getElementById("description").value = "";

    }

    catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de l'enregistrement.");

    }

};

// ==========================
// CALCUL RAPIDE DU SOLDE
// ==========================

window.consulterSolde = function () {

    alert(

        "Solde actuel : " +

        soldeGeneral.toLocaleString() +

        " FCFA"

    );

};

console.log("✅ Finance.js - Partie 3 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 4 : RECHERCHE + MODIFICATION +
//            SUPPRESSION DES MOUVEMENTS
// ========================================

// ==========================
// VARIABLE
// ==========================

let mouvementEnModification = null;


// ==========================
// RECHERCHE
// ==========================

if (champRecherche) {

    champRecherche.addEventListener("input", rechercherMouvements);

}

if (filtreCategorie) {

    filtreCategorie.addEventListener("change", rechercherMouvements);

}

if (filtreType) {

    filtreType.addEventListener("change", rechercherMouvements);

}


function rechercherMouvements() {

    const texte = (champRecherche.value || "").toLowerCase().trim();

    const categorie = filtreCategorie.value;

    const type = filtreType.value;

    const resultat = tousLesMouvements.filter((mouvement) => {

        const okTexte =

            (mouvement.beneficiaire || "").toLowerCase().includes(texte)

            ||

            (mouvement.description || "").toLowerCase().includes(texte);

        const okCategorie =

            categorie === "" ||

            mouvement.categorie === categorie;

        const okType =

            type === "" ||

            mouvement.type === type;

        return okTexte && okCategorie && okType;

    });

    listeMouvements.innerHTML = "";

    resultat.forEach(afficherMouvement);

}


// ==========================
// MODIFIER
// ==========================

window.modifierMouvement = async function(id){

    const snap = await get(

        ref(db,"finance/mouvements/"+id)

    );

    if(!snap.exists()) return;

    const mouvement = snap.val();

    mouvementEnModification = id;

    document.getElementById("type").value = mouvement.type;

    document.getElementById("categorie").value = mouvement.categorie;

    document.getElementById("beneficiaire").value = mouvement.beneficiaire;

    document.getElementById("montant").value = mouvement.montant;

    document.getElementById("description").value = mouvement.description;

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};


// ==========================
// SUPPRIMER
// ==========================

window.supprimerMouvement = async function(id){

    if(!confirm("Supprimer ce mouvement ?")) return;

    await remove(

        ref(db,"finance/mouvements/"+id)

    );

    alert("✅ Mouvement supprimé.");

};


// ==========================
// ENREGISTRER MODIFICATION
// ==========================

window.enregistrerModification = async function(){

    if(!mouvementEnModification) return;

    await update(

        ref(db,

        "finance/mouvements/"+mouvementEnModification),

        {

            type:document.getElementById("type").value,

            categorie:document.getElementById("categorie").value,

            beneficiaire:document.getElementById("beneficiaire").value,

            montant:Number(document.getElementById("montant").value),

            description:document.getElementById("description").value

        }

    );

    mouvementEnModification = null;

    alert("✅ Mouvement modifié.");

};

console.log("✅ Finance.js - Partie 4 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 5 : CALCUL DES COMMISSIONS
// DES PARRAINS
// ========================================

// ==========================
// CALCULER LES COMMISSIONS
// ==========================

window.calculerCommissions = async function () {

    const cotisationsRef = ref(db, "cotisations");

    const snapshot = await get(cotisationsRef);

    if (!snapshot.exists()) {

        alert("Aucune cotisation enregistrée.");

        return;

    }

    const commissions = {};

    snapshot.forEach((item) => {

        const cotisation = item.val();

        if ((cotisation.statut || "").toLowerCase() !== "payée") return;

        const parrain = cotisation.parrain;

        if (!parrain) return;

        if (!commissions[parrain]) {

            commissions[parrain] = {

                matricule: parrain,

                nombreCotisations: 0,

                montant: 0

            };

        }

        commissions[parrain].nombreCotisations++;

        commissions[parrain].montant += 700;

    });

    await set(

        ref(db, "finance/commissions"),

        commissions

    );

    afficherCommissions(commissions);

    alert("✅ Calcul des commissions terminé.");

};

// ==========================
// AFFICHER LES COMMISSIONS
// ==========================

function afficherCommissions(commissions) {

    const zone = document.getElementById("listeCommissions");

    if (!zone) return;

    zone.innerHTML = "";

    Object.values(commissions).forEach((commission) => {

        zone.innerHTML += `

        <div class="carte-finance">

            <h3>${commission.matricule}</h3>

            <p><strong>Cotisations :</strong>
                ${commission.nombreCotisations}
            </p>

            <p><strong>Commission :</strong>
                ${commission.montant.toLocaleString()} FCFA
            </p>

            <button class="btn-admin"
                onclick="preparerPaiementParrain('${commission.matricule}')">

                Préparer le paiement

            </button>

        </div>

        `;

    });

}

console.log("✅ Finance.js - Partie 5 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 6 : VALIDATION DU PRÉSIDENT
// ========================================

// ==========================
// PRÉPARER LE PAIEMENT
// ==========================

window.preparerPaiementParrain = async function (matriculeParrain) {

    const aujourdHui = new Date();

    const jour = aujourdHui.getDate();

    // Paiement autorisé uniquement du 20 au 25
    if (jour < 20 || jour > 25) {

        alert("Les paiements des parrains sont autorisés uniquement du 20 au 25 de chaque mois.");

        return;

    }

    // Demande du code du Président
    const code = prompt("Saisissez le code secret du Président :");

    if (!code) return;

    // Lecture du code enregistré
    const codeRef = ref(db, "finance/securite/codePresident");

    const codeSnap = await get(codeRef);

    if (!codeSnap.exists()) {

        alert("Aucun code Président n'est enregistré.");

        return;

    }

    const codeOfficiel = codeSnap.val();

    if (code !== codeOfficiel) {

        alert("Code incorrect.");

        return;

    }

    // Lecture de la commission
    const commissionRef = ref(
        db,
        "finance/commissions/" + matriculeParrain
    );

    const commissionSnap = await get(commissionRef);

    if (!commissionSnap.exists()) {

        alert("Commission introuvable.");

        return;

    }

    const commission = commissionSnap.val();

    // Préparation du paiement
    const paiementID = "PAR-" + Date.now();

    await set(

        ref(db, "finance/paiementsParrains/" + paiementID),

        {

            id: paiementID,

            matricule: matriculeParrain,

            montant: commission.montant,

            nombreCotisations: commission.nombreCotisations,

            statut: "Autorisé",

            dateAutorisation:
                new Date().toLocaleDateString("fr-FR"),

            heureAutorisation:
                new Date().toLocaleTimeString("fr-FR"),

            autorisePar:
                admin.nom || admin.matricule

        }

    );

    alert("✅ Paiement autorisé par le Président.");

};

console.log("✅ Finance.js - Partie 6 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 7 : ENVOI DES PAIEMENTS
// ========================================

// ==========================
// ENVOYER LE PAIEMENT
// ==========================

window.envoyerPaiementParrain = async function (idPaiement) {

    try {

        const paiementRef = ref(
            db,
            "finance/paiementsParrains/" + idPaiement
        );

        const paiementSnap = await get(paiementRef);

        if (!paiementSnap.exists()) {

            alert("Paiement introuvable.");

            return;

        }

        const paiement = paiementSnap.val();

        if (paiement.statut !== "Autorisé") {

            alert("Ce paiement n'est pas autorisé.");

            return;

        }

        // ==========================
        // RÉCUPÉRER LE PARRAIN
        // ==========================

        const membreRef = ref(
            db,
            "membres/" + paiement.matricule
        );

        const membreSnap = await get(membreRef);

        if (!membreSnap.exists()) {

            alert("Parrain introuvable.");

            return;

        }

        const membre = membreSnap.val();

        // ==========================
        // FUTURE API MTN / AIRTEL
        // ==========================
        /*
        await envoyerPaiementMobileMoney({

            numero: membre.telephone,

            montant: paiement.montant,

            reference: idPaiement

        });
        */

        // ==========================
        // ENREGISTREMENT
        // ==========================

        await update(

            paiementRef,

            {

                statut: "En attente d'envoi",

                beneficiaire: membre.nom,

                telephone: membre.telephone,

                dateEnvoi:
                    new Date().toLocaleDateString("fr-FR"),

                heureEnvoi:
                    new Date().toLocaleTimeString("fr-FR"),

                envoyePar:
                    admin.nom || admin.matricule

            }

        );

        alert("✅ Paiement préparé avec succès.");

    }

    catch (erreur) {

        console.error(erreur);

        alert("Erreur lors de la préparation du paiement.");

    }

};

// ==========================
// HISTORIQUE DES PAIEMENTS
// ==========================

window.afficherPaiementsParrains = async function () {

    const zone = document.getElementById("listePaiements");

    if (!zone) return;

    zone.innerHTML = "";

    const snapshot = await get(
        ref(db, "finance/paiementsParrains")
    );

    if (!snapshot.exists()) {

        zone.innerHTML = `
            <p>Aucun paiement enregistré.</p>
        `;

        return;

    }

    snapshot.forEach((item) => {

        const paiement = item.val();

        zone.innerHTML += `

        <div class="carte-finance">

            <h3>${paiement.beneficiaire || paiement.matricule}</h3>

            <p><strong>Montant :</strong>
                ${Number(paiement.montant).toLocaleString()} FCFA
            </p>

            <p><strong>Statut :</strong>
                ${paiement.statut}
            </p>

            <p><strong>Date :</strong>
                ${paiement.dateAutorisation}
            </p>

            <button class="btn-admin"
                onclick="envoyerPaiementParrain('${paiement.id}')">

                Envoyer

            </button>

        </div>

        `;

    });

};

console.log("✅ Finance.js - Partie 7 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 8 : GESTION DES INVESTISSEMENTS
// ========================================

// ==========================
// AJOUTER UN INVESTISSEMENT
// ==========================

window.ajouterInvestissement = async function () {

    const titre = document.getElementById("titreInvestissement").value.trim();
    const responsable = document.getElementById("responsableInvestissement").value.trim();
    const montant = Number(document.getElementById("montantInvestissement").value);
    const description = document.getElementById("descriptionInvestissement").value.trim();

    if (!titre || montant <= 0) {

        alert("Veuillez remplir tous les champs.");

        return;

    }

    const id = "INV-" + Date.now();

    const investissement = {

        id,
        titre,
        responsable,
        montant,
        description,

        statut: "En attente",

        dateCreation: new Date().toLocaleDateString("fr-FR"),
        heureCreation: new Date().toLocaleTimeString("fr-FR"),

        creePar: admin.nom || admin.matricule

    };

    await set(

        ref(db, "finance/investissements/" + id),

        investissement

    );

    alert("✅ Investissement enregistré.");

};

// ==========================
// VALIDER
// ==========================

window.validerInvestissement = async function(id){

    await update(

        ref(db,"finance/investissements/"+id),

        {

            statut:"Validé",

            dateValidation:new Date().toLocaleDateString("fr-FR"),

            validePar:admin.nom || admin.matricule

        }

    );

    alert("✅ Investissement validé.");

};

// ==========================
// ANNULER
// ==========================

window.annulerInvestissement = async function(id){

    await update(

        ref(db,"finance/investissements/"+id),

        {

            statut:"Annulé"

        }

    );

    alert("Investissement annulé.");

};

// ==========================
// AFFICHER
// ==========================

window.chargerInvestissements = function(){

    const zone = document.getElementById("listeInvestissements");

    if(!zone) return;

    onValue(

        ref(db,"finance/investissements"),

        (snapshot)=>{

            zone.innerHTML="";

            if(!snapshot.exists()){

                zone.innerHTML="<p>Aucun investissement.</p>";

                return;

            }

            snapshot.forEach((item)=>{

                const inv=item.val();

                zone.innerHTML += `

                <div class="carte-finance">

                    <h3>${inv.titre}</h3>

                    <p><strong>Responsable :</strong> ${inv.responsable}</p>

                    <p><strong>Montant :</strong>
                    ${Number(inv.montant).toLocaleString()} FCFA</p>

                    <p><strong>Statut :</strong>
                    ${inv.statut}</p>

                    <button class="btn-admin"
                    onclick="validerInvestissement('${inv.id}')">

                    Valider

                    </button>

                    <button class="btn-danger"
                    onclick="annulerInvestissement('${inv.id}')">

                    Annuler

                    </button>

                </div>

                `;

            });

        }

    );

};

chargerInvestissements();

console.log("✅ Finance.js - Partie 8 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 9 : SUIVI DES INVESTISSEMENTS
// ========================================

// ==========================
// AJOUTER UN DÉCAISSEMENT
// ==========================

window.ajouterDecaissement = async function (id, montant) {

    const investissementRef = ref(db, "finance/investissements/" + id);

    const snapshot = await get(investissementRef);

    if (!snapshot.exists()) {

        alert("Investissement introuvable.");

        return;

    }

    const investissement = snapshot.val();

    const totalDecaisse = Number(investissement.totalDecaisse || 0);
    const nouveauTotal = totalDecaisse + Number(montant);

    await update(investissementRef, {

        totalDecaisse: nouveauTotal,

        derniereDepense: Number(montant),

        dateDernierDecaissement:
            new Date().toLocaleDateString("fr-FR")

    });

    alert("✅ Décaissement enregistré.");

};

// ==========================
// AJOUTER UN BÉNÉFICE
// ==========================

window.ajouterBenefice = async function (id, montant) {

    const investissementRef = ref(db, "finance/investissements/" + id);

    const snapshot = await get(investissementRef);

    if (!snapshot.exists()) {

        alert("Investissement introuvable.");

        return;

    }

    const investissement = snapshot.val();

    const benefice = Number(investissement.benefice || 0) + Number(montant);

    await update(investissementRef, {

        benefice,

        dateDernierBenefice:
            new Date().toLocaleDateString("fr-FR")

    });

    alert("✅ Bénéfice enregistré.");

};

// ==========================
// CALCUL DU ROI
// ==========================

window.calculerROI = async function (id) {

    const snapshot = await get(

        ref(db, "finance/investissements/" + id)

    );

    if (!snapshot.exists()) return;

    const inv = snapshot.val();

    const investi = Number(inv.totalDecaisse || 0);

    const benefice = Number(inv.benefice || 0);

    const roi = investi > 0
        ? ((benefice / investi) * 100).toFixed(2)
        : 0;

    await update(

        ref(db, "finance/investissements/" + id),

        {

            ROI: roi + "%"

        }

    );

};

// ==========================
// CLÔTURER UN INVESTISSEMENT
// ==========================

window.cloturerInvestissement = async function (id) {

    await update(

        ref(db, "finance/investissements/" + id),

        {

            statut: "Clôturé",

            dateCloture:
                new Date().toLocaleDateString("fr-FR")

        }

    );

    alert("✅ Investissement clôturé.");

};

// ==========================
// HISTORIQUE
// ==========================

window.afficherHistoriqueInvestissements = function () {

    const zone = document.getElementById("historiqueInvestissements");

    if (!zone) return;

    onValue(

        ref(db, "finance/investissements"),

        (snapshot) => {

            zone.innerHTML = "";

            if (!snapshot.exists()) {

                zone.innerHTML =
                "<p>Aucun investissement enregistré.</p>";

                return;

            }

            snapshot.forEach((item) => {

                const inv = item.val();

                zone.innerHTML += `

                <div class="carte-finance">

                    <h3>${inv.titre}</h3>

                    <p><strong>Montant prévu :</strong>
                    ${Number(inv.montant).toLocaleString()} FCFA</p>

                    <p><strong>Décaissements :</strong>
                    ${Number(inv.totalDecaisse || 0).toLocaleString()} FCFA</p>

                    <p><strong>Bénéfices :</strong>
                    ${Number(inv.benefice || 0).toLocaleString()} FCFA</p>

                    <p><strong>ROI :</strong>
                    ${inv.ROI || "0%"}</p>

                    <p><strong>Statut :</strong>
                    ${inv.statut}</p>

                </div>

                `;

            });

        }

    );

};

afficherHistoriqueInvestissements();

console.log("✅ Finance.js - Partie 9 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 10 : BUDGET GÉNÉRAL
// ========================================

// ==========================
// INITIALISER LE BUDGET
// ==========================

window.initialiserBudget = async function () {

    const budgetRef = ref(db, "finance/budget");

    const snapshot = await get(budgetRef);

    if (snapshot.exists()) return;

    await set(budgetRef, {

        soldeGeneral: 0,

        reserve: 0,

        cotisations: 0,

        projets: 0,

        formations: 0,

        investissements: 0,

        entraides: 0,

        paiementsParrains: 0,

        depenses: 0,

        recettes: 0,

        derniereMiseAJour:
            new Date().toLocaleString("fr-FR")

    });

};

// ==========================
// ACTUALISER LE BUDGET
// ==========================

window.actualiserBudget = async function (champ, montant) {

    const budgetRef = ref(db, "finance/budget");

    const snapshot = await get(budgetRef);

    if (!snapshot.exists()) return;

    const budget = snapshot.val();

    const valeur = Number(budget[champ] || 0) + Number(montant);

    await update(budgetRef, {

        [champ]: valeur,

        derniereMiseAJour:
            new Date().toLocaleString("fr-FR")

    });

};

// ==========================
// RECALCULER LE SOLDE
// ==========================

window.recalculerSolde = async function () {

    const budgetRef = ref(db, "finance/budget");

    const snapshot = await get(budgetRef);

    if (!snapshot.exists()) return;

    const budget = snapshot.val();

    const solde =

        Number(budget.recettes || 0)

        -

        Number(budget.depenses || 0);

    await update(budgetRef, {

        soldeGeneral: solde,

        derniereMiseAJour:
            new Date().toLocaleString("fr-FR")

    });

};

// ==========================
// AFFICHER LE BUDGET
// ==========================

window.afficherBudget = function () {

    const zone = document.getElementById("budgetGeneral");

    if (!zone) return;

    onValue(ref(db, "finance/budget"), (snapshot) => {

        if (!snapshot.exists()) {

            zone.innerHTML = "<p>Budget indisponible.</p>";

            return;

        }

        const b = snapshot.val();

        zone.innerHTML = `

        <div class="carte-finance">

            <h2>Budget Général</h2>

            <p><strong>Solde :</strong>
            ${Number(b.soldeGeneral).toLocaleString()} FCFA</p>

            <p><strong>Réserve :</strong>
            ${Number(b.reserve).toLocaleString()} FCFA</p>

            <p><strong>Cotisations :</strong>
            ${Number(b.cotisations).toLocaleString()} FCFA</p>

            <p><strong>Projets :</strong>
            ${Number(b.projets).toLocaleString()} FCFA</p>

            <p><strong>Formations :</strong>
            ${Number(b.formations).toLocaleString()} FCFA</p>

            <p><strong>Investissements :</strong>
            ${Number(b.investissements).toLocaleString()} FCFA</p>

            <p><strong>Entraides :</strong>
            ${Number(b.entraides).toLocaleString()} FCFA</p>

            <p><strong>Paiements Parrains :</strong>
            ${Number(b.paiementsParrains).toLocaleString()} FCFA</p>

            <p><strong>Recettes :</strong>
            ${Number(b.recettes).toLocaleString()} FCFA</p>

            <p><strong>Dépenses :</strong>
            ${Number(b.depenses).toLocaleString()} FCFA</p>

        </div>

        `;

    });

};

// ==========================
// INITIALISATION
// ==========================

initialiserBudget();

afficherBudget();

console.log("✅ Finance.js - Partie 10 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 11 : SÉCURITÉ DES DÉCAISSEMENTS
// ========================================

// ==========================
// INITIALISER LE CODE PRÉSIDENT
// ==========================

window.initialiserCodePresident = async function () {

    const refCode = ref(db, "finance/securite");

    const snapshot = await get(refCode);

    if (snapshot.exists()) return;

    await set(refCode, {

        codePresident: "123456", // À modifier dès la première utilisation

        derniereModification:
            new Date().toLocaleString("fr-FR")

    });

};

// ==========================
// VÉRIFIER LE CODE
// ==========================

window.verifierCodePresident = async function () {

    const code = prompt(
        "Saisissez le code secret du Président :"
    );

    if (!code) return false;

    const snapshot = await get(

        ref(db, "finance/securite")

    );

    if (!snapshot.exists()) {

        alert("Configuration de sécurité introuvable.");

        return false;

    }

    const securite = snapshot.val();

    if (code !== securite.codePresident) {

        alert("❌ Code secret incorrect.");

        return false;

    }

    return true;

};

// ==========================
// CHANGER LE CODE
// ==========================

window.changerCodePresident = async function () {

    const ancien = prompt("Ancien code :");

    if (!ancien) return;

    const snapshot = await get(

        ref(db, "finance/securite")

    );

    if (!snapshot.exists()) return;

    const securite = snapshot.val();

    if (ancien !== securite.codePresident) {

        alert("Ancien code incorrect.");

        return;

    }

    const nouveau = prompt("Nouveau code secret :");

    if (!nouveau || nouveau.length < 6) {

        alert("Le code doit contenir au moins 6 caractères.");

        return;

    }

    await update(

        ref(db, "finance/securite"),

        {

            codePresident: nouveau,

            derniereModification:
                new Date().toLocaleString("fr-FR")

        }

    );

    alert("✅ Code du Président modifié.");

};

// ==========================
// AUTORISER UN DÉCAISSEMENT
// ==========================

window.autoriserDecaissement = async function (callback) {

    const autorise = await verifierCodePresident();

    if (!autorise) return false;

    if (typeof callback === "function") {

        await callback();

    }

    return true;

};

// ==========================
// INITIALISATION
// ==========================

initialiserCodePresident();

console.log("✅ Finance.js - Partie 11 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 12 : JOURNAL D'AUDIT FINANCIER
// ========================================

// ==========================
// ENREGISTRER UNE OPÉRATION
// ==========================

window.enregistrerJournal = async function (

    typeOperation,
    montant,
    beneficiaire,
    description

) {

    try {

        const id = "LOG-" + Date.now();

        const journal = {

            id,

            type: typeOperation,

            montant: Number(montant),

            beneficiaire: beneficiaire || "-",

            description: description || "",

            utilisateur: admin.nom || admin.matricule,

            matricule: admin.matricule,

            date: new Date().toLocaleDateString("fr-FR"),

            heure: new Date().toLocaleTimeString("fr-FR"),

            timestamp: Date.now()

        };

        await set(

            ref(db, "finance/journal/" + id),

            journal

        );

    }

    catch (erreur) {

        console.error(erreur);

    }

};

// ==========================
// AFFICHER LE JOURNAL
// ==========================

window.chargerJournal = function () {

    const zone = document.getElementById("journalFinance");

    if (!zone) return;

    onValue(

        ref(db, "finance/journal"),

        (snapshot) => {

            zone.innerHTML = "";

            if (!snapshot.exists()) {

                zone.innerHTML = `
                    <p>Aucune opération enregistrée.</p>
                `;

                return;

            }

            const liste = [];

            snapshot.forEach((item) => {

                liste.push(item.val());

            });

            liste.sort((a, b) => b.timestamp - a.timestamp);

            liste.forEach((log) => {

                zone.innerHTML += `

                <div class="carte-finance">

                    <h3>${log.type}</h3>

                    <p><strong>Montant :</strong>
                    ${Number(log.montant).toLocaleString()} FCFA</p>

                    <p><strong>Bénéficiaire :</strong>
                    ${log.beneficiaire}</p>

                    <p><strong>Description :</strong>
                    ${log.description}</p>

                    <p><strong>Effectué par :</strong>
                    ${log.utilisateur}</p>

                    <p><strong>Date :</strong>
                    ${log.date} à ${log.heure}</p>

                </div>

                `;

            });

        }

    );

};

// ==========================
// EXPORTER LE JOURNAL
// ==========================

window.exporterJournal = async function () {

    const snapshot = await get(

        ref(db, "finance/journal")

    );

    if (!snapshot.exists()) {

        alert("Aucune donnée à exporter.");

        return;

    }

    const donnees = JSON.stringify(snapshot.val(), null, 2);

    const blob = new Blob([donnees], {

        type: "application/json"

    });

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;

    lien.download = "journal_finance.json";

    lien.click();

    URL.revokeObjectURL(url);

};

// ==========================
// INITIALISATION
// ==========================

chargerJournal();

console.log("✅ Finance.js - Partie 12 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 13 : TABLEAU DE BORD FINANCIER
// ========================================

// ==========================
// TABLEAU DE BORD
// ==========================

window.chargerTableauBord = function () {

    const zone = document.getElementById("tableauBordFinance");

    if (!zone) return;

    onValue(ref(db, "finance"), (snapshot) => {

        if (!snapshot.exists()) {

            zone.innerHTML = "<p>Aucune donnée financière disponible.</p>";

            return;

        }

        const finance = snapshot.val();

        const budget = finance.budget || {};
        const journal = finance.journal || {};
        const investissements = finance.investissements || {};

        const totalOperations = Object.keys(journal).length;
        const totalInvestissements = Object.keys(investissements).length;

        let montantInvestissements = 0;

        Object.values(investissements).forEach(inv => {

            montantInvestissements += Number(inv.montant || 0);

        });

        zone.innerHTML = `

        <div class="dashboard-finance">

            <div class="carte-dashboard">
                <h3>💰 Solde général</h3>
                <h2>${Number(budget.soldeGeneral || 0).toLocaleString()} FCFA</h2>
            </div>

            <div class="carte-dashboard">
                <h3>📈 Recettes</h3>
                <h2>${Number(budget.recettes || 0).toLocaleString()} FCFA</h2>
            </div>

            <div class="carte-dashboard">
                <h3>📉 Dépenses</h3>
                <h2>${Number(budget.depenses || 0).toLocaleString()} FCFA</h2>
            </div>

            <div class="carte-dashboard">
                <h3>🏦 Réserve</h3>
                <h2>${Number(budget.reserve || 0).toLocaleString()} FCFA</h2>
            </div>

            <div class="carte-dashboard">
                <h3>📊 Investissements</h3>
                <h2>${totalInvestissements}</h2>
            </div>

            <div class="carte-dashboard">
                <h3>💼 Montant investi</h3>
                <h2>${montantInvestissements.toLocaleString()} FCFA</h2>
            </div>

            <div class="carte-dashboard">
                <h3>📝 Opérations</h3>
                <h2>${totalOperations}</h2>
            </div>

        </div>

        `;

    });

};

// ==========================
// ALERTES FINANCIÈRES
// ==========================

window.verifierAlertes = async function () {

    const snap = await get(ref(db, "finance/budget"));

    if (!snap.exists()) return;

    const budget = snap.val();

    if (Number(budget.soldeGeneral) < 0) {

        alert("⚠️ Attention : le solde général est négatif.");

    }

    if (Number(budget.reserve) < 100000) {

        console.warn("Réserve financière faible.");

    }

};

// ==========================
// RAPPORT RAPIDE
// ==========================

window.rapportFinancier = async function () {

    const snap = await get(ref(db, "finance/budget"));

    if (!snap.exists()) return;

    const b = snap.val();

    console.table({

        Solde: b.soldeGeneral,

        Recettes: b.recettes,

        Dépenses: b.depenses,

        Réserve: b.reserve,

        Cotisations: b.cotisations,

        Investissements: b.investissements,

        Formations: b.formations,

        Entraides: b.entraides,

        Parrains: b.paiementsParrains

    });

};

// ==========================
// INITIALISATION
// ==========================

chargerTableauBord();

verifierAlertes();

console.log("✅ Finance.js - Partie 13 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 14 : CYCLE FINANCIER MENSUEL
// ========================================

// ==========================
// PARAMÈTRES
// ==========================

const CONFIG_FINANCE = {

    debutCotisation: 1,

    finCotisation: 10,

    debutCalcul: 11,

    finCalcul: 19,

    debutPaiement: 20,

    finPaiement: 25

};

// ==========================
// OBTENIR LA PHASE ACTUELLE
// ==========================

window.obtenirPhaseFinanciere = function () {

    const jour = new Date().getDate();

    if (jour >= CONFIG_FINANCE.debutCotisation &&
        jour <= CONFIG_FINANCE.finCotisation) {

        return "COTISATION";

    }

    if (jour >= CONFIG_FINANCE.debutCalcul &&
        jour <= CONFIG_FINANCE.finCalcul) {

        return "CALCUL";

    }

    if (jour >= CONFIG_FINANCE.debutPaiement &&
        jour <= CONFIG_FINANCE.finPaiement) {

        return "PAIEMENT";

    }

    return "CLÔTURE";

};

// ==========================
// AFFICHER LA PHASE
// ==========================

window.afficherPhaseFinanciere = function () {

    const zone = document.getElementById("phaseFinanciere");

    if (!zone) return;

    const phase = obtenirPhaseFinanciere();

    zone.innerHTML = `
        <h3>Période actuelle</h3>
        <h2>${phase}</h2>
    `;

};

// ==========================
// VÉRIFIER LES ACTIONS
// ==========================

window.verifierAutorisation = function (action) {

    const phase = obtenirPhaseFinanciere();

    if (action === "cotisation" && phase !== "COTISATION") {

        alert("La période de cotisation est terminée.");

        return false;

    }

    if (action === "paiement" && phase !== "PAIEMENT") {

        alert("Les paiements des parrains ne sont pas encore autorisés.");

        return false;

    }

    return true;

};

// ==========================
// CLÔTURE AUTOMATIQUE
// ==========================

window.cloturerMois = async function () {

    const phase = obtenirPhaseFinanciere();

    if (phase !== "CLÔTURE") return;

    await set(

        ref(db, "finance/historique/" + Date.now()),

        {

            date: new Date().toLocaleString("fr-FR"),

            utilisateur: admin.nom || admin.matricule,

            action: "Clôture mensuelle"

        }

    );

    console.log("✅ Clôture mensuelle enregistrée.");

};

// ==========================
// INITIALISATION
// ==========================

afficherPhaseFinanciere();

cloturerMois();

console.log("✅ Finance.js - Partie 14 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 15 : CALCUL AUTOMATIQUE DES PARRAINS
// ========================================

// ==========================
// GÉNÉRER LES PAIEMENTS
// ==========================

window.genererPaiementsParrains = async function () {

    if (!verifierAutorisation("paiement")) return;

    const membresSnap = await get(ref(db, "membres"));

    const cotisationsSnap = await get(ref(db, "cotisations"));

    if (!membresSnap.exists()) {

        alert("Aucun membre enregistré.");

        return;

    }

    const membres = membresSnap.val();

    const cotisations = cotisationsSnap.exists()
        ? cotisationsSnap.val()
        : {};

    // Supprime les anciens calculs
    await remove(ref(db, "finance/paiementsParrains"));

    for (const matricule in membres) {

        const membre = membres[matricule];

        let nombreCotisations = 0;

        let montantTotal = 0;

        // Recherche des filleuls
        for (const id in membres) {

            const filleul = membres[id];

            if (filleul.parrain === matricule) {

                // Vérifie si le filleul a payé
                if (
                    cotisations[id] &&
                    cotisations[id].statut === "Payée"
                ) {

                    nombreCotisations++;

                    montantTotal += 700;

                }

            }

        }

        if (montantTotal > 0) {

            await set(

                ref(db, "finance/paiementsParrains/" + matricule),

                {

                    matricule,

                    nom: membre.nom,

                    telephone: membre.telephone,

                    nombreCotisations,

                    montant: montantTotal,

                    statut: "En attente",

                    dateCalcul:
                        new Date().toLocaleDateString("fr-FR")

                }

            );

        }

    }

    alert("✅ Calcul des paiements terminé.");

};

// ==========================
// AFFICHER LES PAIEMENTS
// ==========================

window.chargerPaiementsParrains = function () {

    const zone = document.getElementById("listePaiementsParrains");

    if (!zone) return;

    onValue(

        ref(db, "finance/paiementsParrains"),

        (snapshot) => {

            zone.innerHTML = "";

            if (!snapshot.exists()) {

                zone.innerHTML =
                    "<p>Aucun paiement à effectuer.</p>";

                return;

            }

            snapshot.forEach((item) => {

                const p = item.val();

                zone.innerHTML += `

                <div class="carte-finance">

                    <h3>${p.nom}</h3>

                    <p><strong>Matricule :</strong> ${p.matricule}</p>

                    <p><strong>Filleuls ayant cotisé :</strong> ${p.nombreCotisations}</p>

                    <p><strong>Montant :</strong>
                    ${Number(p.montant).toLocaleString()} FCFA</p>

                    <p><strong>Statut :</strong> ${p.statut}</p>

                    <button class="btn-admin"
                        onclick="validerPaiementParrain('${p.matricule}')">

                        Valider le paiement

                    </button>

                </div>

                `;

            });

        }

    );

};

// ==========================
// VALIDER LE PAIEMENT
// ==========================

window.validerPaiementParrain = async function (matricule) {

    await autoriserDecaissement(async () => {

        await update(

            ref(db, "finance/paiementsParrains/" + matricule),

            {

                statut: "Payé",

                datePaiement:
                    new Date().toLocaleString("fr-FR"),

                validePar:
                    admin.nom || admin.matricule

            }

        );

        await enregistrerJournal(

            "Paiement Parrain",

            0,

            matricule,

            "Paiement validé par le Président"

        );

        alert("✅ Paiement validé.");

    });

};

// ==========================
// INITIALISATION
// ==========================

chargerPaiementsParrains();

console.log("✅ Finance.js - Partie 15 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 16 : FILE D'ATTENTE DES PAIEMENTS
// ========================================

// ==========================
// PRÉPARER LES PAIEMENTS
// ==========================

window.preparerPaiementsMobiles = async function () {

    const snapshot = await get(
        ref(db, "finance/paiementsParrains")
    );

    if (!snapshot.exists()) {

        alert("Aucun paiement à préparer.");

        return;

    }

    let compteur = 0;

    snapshot.forEach(async (item) => {

        const paiement = item.val();

        if (paiement.statut !== "Payé") return;

        await set(

            ref(
                db,
                "finance/filePaiements/" + paiement.matricule
            ),

            {

                matricule: paiement.matricule,

                nom: paiement.nom,

                telephone: paiement.telephone,

                montant: paiement.montant,

                operateur: "MTN",

                statut: "En attente d'envoi",

                datePreparation:
                    new Date().toLocaleString("fr-FR")

            }

        );

        compteur++;

    });

    alert(compteur + " paiement(s) préparé(s).");

};

// ==========================
// SIMULATION D'ENVOI
// ==========================

window.envoyerPaiementsMobiles = async function () {

    const autorise = await verifierCodePresident();

    if (!autorise) return;

    const snapshot = await get(
        ref(db, "finance/filePaiements")
    );

    if (!snapshot.exists()) {

        alert("Aucun paiement à envoyer.");

        return;

    }

    snapshot.forEach(async (item) => {

        const paiement = item.val();

        // FUTURE API MTN / AIRTEL
        /*
        await apiMobileMoney({
            numero: paiement.telephone,
            montant: paiement.montant,
            reference: paiement.matricule
        });
        */

        await update(

            ref(
                db,
                "finance/filePaiements/" + paiement.matricule
            ),

            {

                statut: "Envoyé",

                dateEnvoi:
                    new Date().toLocaleString("fr-FR")

            }

        );

        await enregistrerJournal(

            "Paiement Mobile Money",

            paiement.montant,

            paiement.nom,

            "Paiement envoyé"

        );

    });

    alert("✅ Tous les paiements ont été envoyés.");

};

// ==========================
// HISTORIQUE
// ==========================

window.chargerFilePaiements = function () {

    const zone = document.getElementById("listeFilePaiements");

    if (!zone) return;

    onValue(

        ref(db, "finance/filePaiements"),

        (snapshot) => {

            zone.innerHTML = "";

            if (!snapshot.exists()) {

                zone.innerHTML =
                "<p>Aucun paiement préparé.</p>";

                return;

            }

            snapshot.forEach((item) => {

                const p = item.val();

                zone.innerHTML += `

                <div class="carte-finance">

                    <h3>${p.nom}</h3>

                    <p><strong>Téléphone :</strong> ${p.telephone}</p>

                    <p><strong>Montant :</strong>
                    ${Number(p.montant).toLocaleString()} FCFA</p>

                    <p><strong>Opérateur :</strong> ${p.operateur}</p>

                    <p><strong>Statut :</strong> ${p.statut}</p>

                </div>

                `;

            });

        }

    );

};

// ==========================
// INITIALISATION
// ==========================

chargerFilePaiements();

console.log("✅ Finance.js - Partie 16 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 17 : TRÉSORERIE INTELLIGENTE
// ========================================

// ==========================
// METTRE À JOUR LA TRÉSORERIE
// ==========================

window.mettreAJourTresorerie = async function () {

    const budgetSnap = await get(ref(db, "finance/budget"));

    if (!budgetSnap.exists()) return;

    const budget = budgetSnap.val();

    const solde = Number(budget.soldeGeneral || 0);

    const reserve = Number(budget.reserve || 0);

    const projets = Number(budget.projets || 0);

    const formations = Number(budget.formations || 0);

    const entraides = Number(budget.entraides || 0);

    const investissements = Number(budget.investissements || 0);

    const parrains = Number(budget.paiementsParrains || 0);

    const disponible =
        solde -
        reserve -
        projets -
        formations -
        entraides -
        investissements -
        parrains;

    await set(

        ref(db, "finance/tresorerie"),

        {

            solde,

            reserve,

            projets,

            formations,

            entraides,

            investissements,

            paiementsParrains: parrains,

            disponible,

            derniereMiseAJour:
                new Date().toLocaleString("fr-FR")

        }

    );

};

// ==========================
// AFFICHER LA TRÉSORERIE
// ==========================

window.chargerTresorerie = function () {

    const zone = document.getElementById("tresorerie");

    if (!zone) return;

    onValue(

        ref(db, "finance/tresorerie"),

        (snapshot) => {

            if (!snapshot.exists()) return;

            const t = snapshot.val();

            zone.innerHTML = `

            <div class="carte-finance">

                <h2>Trésorerie</h2>

                <p><strong>Solde :</strong>
                ${Number(t.solde).toLocaleString()} FCFA</p>

                <p><strong>Réserve :</strong>
                ${Number(t.reserve).toLocaleString()} FCFA</p>

                <p><strong>Disponible :</strong>

                <span style="color:green;font-weight:bold;">

                ${Number(t.disponible).toLocaleString()} FCFA

                </span>

                </p>

            </div>

            `;

        }

    );

};

// ==========================
// ALERTE
// ==========================

window.verifierTresorerie = async function(){

    const snap = await get(ref(db,"finance/tresorerie"));

    if(!snap.exists()) return;

    const t = snap.val();

    if(Number(t.disponible) < 0){

        alert("⚠ Trésorerie insuffisante.");

    }

};

// ==========================
// INITIALISATION
// ==========================

mettreAJourTresorerie();

chargerTresorerie();

verifierTresorerie();

console.log("✅ Finance.js - Partie 17 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 18 : RÉPARTITION AUTOMATIQUE
// ========================================

// ==========================
// CONFIGURATION
// ==========================

const REPARTITION = {

    cotisation: 2000,

    parrain: 700,

    projets: 300,

    formations: 200,

    investissements: 300,

    entraides: 200,

    reserve: 300

};

// ==========================
// TRAITER UNE COTISATION
// ==========================

window.traiterCotisation = async function (matricule) {

    const cotisationRef = ref(db, "cotisations/" + matricule);

    const cotisationSnap = await get(cotisationRef);

    if (!cotisationSnap.exists()) {

        alert("Cotisation introuvable.");

        return;

    }

    const cotisation = cotisationSnap.val();

    if (cotisation.repartitionEffectuee) {

        return;

    }

    const membreSnap = await get(
        ref(db, "membres/" + matricule)
    );

    if (!membreSnap.exists()) return;

    const membre = membreSnap.val();

    // ==========================
    // MISE À JOUR DU BUDGET
    // ==========================

    await actualiserBudget("recettes", REPARTITION.cotisation);

    await actualiserBudget("cotisations", REPARTITION.cotisation);

    await actualiserBudget("projets", REPARTITION.projets);

    await actualiserBudget("formations", REPARTITION.formations);

    await actualiserBudget(
        "investissements",
        REPARTITION.investissements
    );

    await actualiserBudget(
        "entraides",
        REPARTITION.entraides
    );

    await actualiserBudget(
        "reserve",
        REPARTITION.reserve
    );

    await actualiserBudget(
        "paiementsParrains",
        REPARTITION.parrain
    );

    // ==========================
    // MARQUER LA COTISATION
    // ==========================

    await update(cotisationRef, {

        repartitionEffectuee: true,

        dateRepartition:
            new Date().toLocaleString("fr-FR")

    });

    // ==========================
    // JOURNAL
    // ==========================

    await enregistrerJournal(

        "Répartition automatique",

        REPARTITION.cotisation,

        membre.nom,

        "Cotisation répartie automatiquement"

    );

    // ==========================
    // MISE À JOUR
    // ==========================

    await recalculerSolde();

    await mettreAJourTresorerie();

};

// ==========================
// TRAITEMENT GLOBAL
// ==========================

window.traiterToutesLesCotisations = async function () {

    const snapshot = await get(
        ref(db, "cotisations")
    );

    if (!snapshot.exists()) return;

    snapshot.forEach(async (item) => {

        await traiterCotisation(item.key);

    });

    alert("✅ Toutes les cotisations ont été réparties.");

};

console.log("✅ Finance.js - Partie 18 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 19 : PRÉVISIONS FINANCIÈRES
// ========================================

// ==========================
// CALCULER LES PRÉVISIONS
// ==========================

window.calculerPrevisions = async function () {

    const budgetSnap = await get(ref(db, "finance/budget"));
    const membresSnap = await get(ref(db, "membres"));
    const paiementsSnap = await get(ref(db, "finance/paiementsParrains"));

    if (!budgetSnap.exists()) return;

    const budget = budgetSnap.val();

    const nombreMembres =
        membresSnap.exists()
            ? Object.keys(membresSnap.val()).length
            : 0;

    let montantParrains = 0;

    if (paiementsSnap.exists()) {

        paiementsSnap.forEach((item) => {

            montantParrains += Number(item.val().montant || 0);

        });

    }

    const recettesPrevues = nombreMembres * 2000;

    const depensesPrevues =
        montantParrains +
        Number(budget.projets || 0) +
        Number(budget.formations || 0) +
        Number(budget.entraides || 0) +
        Number(budget.investissements || 0);

    const resultat = recettesPrevues - depensesPrevues;

    await set(ref(db, "finance/previsions"), {

        nombreMembres,

        recettesPrevues,

        depensesPrevues,

        resultat,

        dateCalcul:
            new Date().toLocaleString("fr-FR")

    });

};

// ==========================
// AFFICHER LES PRÉVISIONS
// ==========================

window.chargerPrevisions = function () {

    const zone = document.getElementById("previsionsFinance");

    if (!zone) return;

    onValue(ref(db, "finance/previsions"), (snapshot) => {

        if (!snapshot.exists()) return;

        const p = snapshot.val();

        zone.innerHTML = `

        <div class="carte-finance">

            <h2>Prévisions financières</h2>

            <p><strong>Membres :</strong>
            ${p.nombreMembres}</p>

            <p><strong>Recettes prévues :</strong>
            ${Number(p.recettesPrevues).toLocaleString()} FCFA</p>

            <p><strong>Dépenses prévues :</strong>
            ${Number(p.depensesPrevues).toLocaleString()} FCFA</p>

            <p><strong>Résultat prévisionnel :</strong>

            <span style="font-weight:bold;
                color:${p.resultat >= 0 ? "green" : "red"};">

                ${Number(p.resultat).toLocaleString()} FCFA

            </span>

            </p>

        </div>

        `;

    });

};

// ==========================
// CONTRÔLE AUTOMATIQUE
// ==========================

window.verifierEquilibreFinancier = async function () {

    const snap = await get(ref(db, "finance/previsions"));

    if (!snap.exists()) return;

    const prevision = snap.val();

    if (prevision.resultat < 0) {

        alert(
            "⚠️ Les dépenses prévues dépassent les recettes prévues."
        );

    }

};

// ==========================
// INITIALISATION
// ==========================

calculerPrevisions();

chargerPrevisions();

verifierEquilibreFinancier();

console.log("✅ Finance.js - Partie 19 chargée.");

// ========================================
// FINANCE.JS
// PARTIE 20 : TABLEAU DE BORD EXÉCUTIF
// ========================================

// ==========================
// CHARGER LE TABLEAU DE BORD
// ==========================

window.chargerDashboardPresident = async function () {

    const zone = document.getElementById("dashboardPresident");

    if (!zone) return;

    const [
        budgetSnap,
        membresSnap,
        cotisationsSnap,
        paiementsSnap,
        projetsSnap,
        investissementsSnap
    ] = await Promise.all([

        get(ref(db, "finance/budget")),
        get(ref(db, "membres")),
        get(ref(db, "cotisations")),
        get(ref(db, "finance/paiementsParrains")),
        get(ref(db, "finance/projets")),
        get(ref(db, "finance/investissements"))

    ]);

    const budget = budgetSnap.exists() ? budgetSnap.val() : {};

    const nbMembres = membresSnap.exists()
        ? Object.keys(membresSnap.val()).length
        : 0;

    const nbCotisations = cotisationsSnap.exists()
        ? Object.keys(cotisationsSnap.val()).length
        : 0;

    const nbPaiements = paiementsSnap.exists()
        ? Object.keys(paiementsSnap.val()).length
        : 0;

    const nbProjets = projetsSnap.exists()
        ? Object.keys(projetsSnap.val()).length
        : 0;

    const nbInvestissements = investissementsSnap.exists()
        ? Object.keys(investissementsSnap.val()).length
        : 0;

    zone.innerHTML = `

    <div class="dashboard-president">

        <div class="carte-dashboard">
            <h3>Membres</h3>
            <h1>${nbMembres}</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Cotisations</h3>
            <h1>${nbCotisations}</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Paiements Parrains</h3>
            <h1>${nbPaiements}</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Projets</h3>
            <h1>${nbProjets}</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Investissements</h3>
            <h1>${nbInvestissements}</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Solde Général</h3>
            <h1>${Number(
                budget.soldeGeneral || 0
            ).toLocaleString()} FCFA</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Réserve</h3>
            <h1>${Number(
                budget.reserve || 0
            ).toLocaleString()} FCFA</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Recettes</h3>
            <h1>${Number(
                budget.recettes || 0
            ).toLocaleString()} FCFA</h1>
        </div>

        <div class="carte-dashboard">
            <h3>Dépenses</h3>
            <h1>${Number(
                budget.depenses || 0
            ).toLocaleString()} FCFA</h1>
        </div>

    </div>

    `;

};

// ==========================
// ALERTES EXÉCUTIVES
// ==========================

window.chargerAlertesPresident = async function () {

    const budgetSnap = await get(ref(db, "finance/budget"));

    if (!budgetSnap.exists()) return;

    const budget = budgetSnap.val();

    const alertes = [];

    if (Number(budget.soldeGeneral) < 0) {

        alertes.push("Solde général négatif.");

    }

    if (Number(budget.reserve) < 50000) {

        alertes.push("Réserve financière faible.");

    }

    if (Number(budget.paiementsParrains || 0) > Number(budget.soldeGeneral || 0)) {

        alertes.push("Les paiements des parrains dépassent le solde disponible.");

    }

    const zone = document.getElementById("alertesPresident");

    if (!zone) return;

    if (alertes.length === 0) {

        zone.innerHTML = `
            <div class="alerte-ok">
                ✅ Aucune alerte.
            </div>
        `;

        return;

    }

    zone.innerHTML = "";

    alertes.forEach((alerte) => {

        zone.innerHTML += `
            <div class="alerte-danger">
                ⚠ ${alerte}
            </div>
        `;

    });

};

// ==========================
// ACTUALISATION AUTOMATIQUE
// ==========================

window.actualiserDashboard = function () {

    chargerDashboardPresident();

    chargerAlertesPresident();

};

// ==========================
// DÉMARRAGE
// ==========================

actualiserDashboard();

console.log("✅ Finance.js - Partie 20 chargée.");
