/*==================================================
  COTISATIONS.JS
  GESTION DES COTISATIONS
  COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

  VERSION : COMPTABILITÉ SÉCURISÉE V2

  RÈGLES :
  - Cotisation payée = 2 000 FCFA recommandés
  - Parrain = 700 FCFA
  - Communauté = montant - 700 FCFA
  - Cotisation non payée = aucun mouvement financier
  - Modification = recalcul complet
  - Suppression = recalcul complet
  - Chaque opération = journal comptable
==================================================*/


/*==================================================
  IMPORTS FIREBASE
==================================================*/

import {
    getDatabase,
    ref,
    onValue,
    get,
    push,
    update
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { app } from "./firebase-config.js";


/*==================================================
  INITIALISATION
==================================================*/

const db = getDatabase(app);
const auth = getAuth(app);


/*==================================================
  VARIABLES GLOBALES
==================================================*/

let toutesLesCotisations = {};
let listeMembres = [];
let filtreActuel = "tous";
let cotisationEnModification = null;
let adminMatriculeConnecte = null;


/*==================================================
  RÉCUPÉRATION DES ÉLÉMENTS HTML
==================================================*/

const selectMembre = document.getElementById("membre");
const infoMembre = document.getElementById("infoMembre");
const montantInput = document.getElementById("montant");
const moisSelect = document.getElementById("moisCotisation");
const numeroMobile = document.getElementById("numeroMobile");
const refTransaction = document.getElementById("refTransaction");
const statutSelect = document.getElementById("statut");
const observationInput = document.getElementById("observation");

const groupeNumero = document.getElementById("groupeNumero");
const groupeRef = document.getElementById("groupeRef");
const zonePaiementAPI = document.getElementById("zonePaiementAPI");

const btnEnregistrer = document.getElementById("btnEnregistrer");
const btnAnnuler = document.getElementById("btnAnnuler");
const msgRetour = document.getElementById("msgRetour");

const rechercheInput = document.getElementById("recherche");
const listeCotisations = document.getElementById("listeCotisations");

const nbCotisants = document.getElementById("nbCotisants");
const totalCotisations = document.getElementById("totalCotisations");
const totalParrains = document.getElementById("totalParrains");
const totalCommunaute = document.getElementById("totalCommunaute");


/*==================================================
  OUTILS
==================================================*/

function afficherMessage(message, type = "success") {

    if (!msgRetour) return;

    msgRetour.textContent = message;
    msgRetour.className = `message-retour ${type}`;

    setTimeout(() => {
        msgRetour.textContent = "";
        msgRetour.className = "message-retour";
    }, 5000);
}


function formaterMontant(nombre) {

    return Number(nombre || 0).toLocaleString("fr-FR") + " FCFA";
}


function dateHeureActuelle() {

    return new Date().toISOString();
}


function echapperHTML(texte) {

    if (texte === null || texte === undefined) return "";

    return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*==================================================
  ADMINISTRATEUR
==================================================*/

async function verifierAdmin() {

    try {

        const matricule = localStorage.getItem("matricule");

        if (!matricule) {

            window.location.href = "connexion.html";
            return false;
        }

        adminMatriculeConnecte = matricule;

        const snapshot = await get(
            ref(db, `membres/${matricule}`)
        );

        if (!snapshot.exists()) {

            window.location.href = "connexion.html";
            return false;
        }

        const membre = snapshot.val();

        const role = String(membre.role || "")
            .trim()
            .toLowerCase();

        if (role !== "admin") {

            alert("Accès réservé à l'administration.");
            window.location.href = "index.html";
            return false;
        }

        return true;

    } catch (erreur) {

        console.error("Erreur vérification admin :", erreur);

        alert("Impossible de vérifier vos droits administrateur.");

        window.location.href = "connexion.html";

        return false;
    }
}


/*==================================================
  CHARGEMENT DES MEMBRES
==================================================*/

function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(membresRef, snapshot => {

        listeMembres = [];

        if (snapshot.exists()) {

            const donnees = snapshot.val();

            Object.entries(donnees).forEach(([cle, membre]) => {

                const matricule =
                    membre.matricule || cle;

                listeMembres.push({
                    ...membre,
                    matricule
                });
            });
        }

        listeMembres.sort((a, b) => {

            const nomA = String(a.nom || "").toLowerCase();
            const nomB = String(b.nom || "").toLowerCase();

            return nomA.localeCompare(nomB);
        });

        remplirSelectMembres();

    }, erreur => {

        console.error(
            "Erreur chargement membres :",
            erreur
        );

        afficherMessage(
            "Impossible de charger les membres.",
            "error"
        );
    });
}


/*==================================================
  REMPLIR LE SELECT MEMBRES
==================================================*/

function remplirSelectMembres() {

    if (!selectMembre) return;

    const ancienneValeur = selectMembre.value;

    selectMembre.innerHTML =
        `<option value="">-- Sélectionner un membre --</option>`;

    listeMembres.forEach(membre => {

        const option = document.createElement("option");

        option.value = membre.matricule;

        option.textContent =
            `${membre.nom || "Sans nom"} (${membre.matricule})`;

        selectMembre.appendChild(option);
    });

    if (ancienneValeur) {

        selectMembre.value = ancienneValeur;
        afficherInfosMembre();
    }
}


/*==================================================
  INFORMATIONS DU MEMBRE
==================================================*/

function afficherInfosMembre() {

    if (!selectMembre || !infoMembre) return;

    const matricule = selectMembre.value;

    if (!matricule) {

        infoMembre.innerHTML = "";
        return;
    }

    const membre = listeMembres.find(
        m => m.matricule === matricule
    );

    if (!membre) {

        infoMembre.innerHTML = "";
        return;
    }

    const photo =
        membre.photo ||
        membre.photoURL ||
        "logo.png";

    infoMembre.innerHTML = `
        <div class="info-membre-interne">

            <img
                src="${echapperHTML(photo)}"
                alt="Photo membre"
                class="photo-membre-info"
                onerror="this.src='logo.png'"
            >

            <div>
                <strong>
                    ${echapperHTML(membre.nom || "Nom non renseigné")}
                </strong>

                <span>
                    Matricule :
                    ${echapperHTML(membre.matricule)}
                </span>

                <span>
                    Téléphone :
                    ${echapperHTML(membre.telephone || "Non renseigné")}
                </span>

                <span>
                    Parrain :
                    ${echapperHTML(membre.parrain || "Aucun")}
                </span>

            </div>

        </div>
    `;
}


/*==================================================
  MODE DE PAIEMENT
==================================================*/

function obtenirModePaiement() {

    const radio = document.querySelector(
        'input[name="modePaiement"]:checked'
    );

    return radio ? radio.value : "Espèces";
}


function gererModePaiement() {

    const mode = obtenirModePaiement();

    const paiementMobile =
        mode === "Airtel Money" ||
        mode === "MTN Mobile Money";

    if (groupeNumero) {

        groupeNumero.style.display =
            paiementMobile ? "block" : "none";
    }

    if (groupeRef) {

        groupeRef.style.display =
            paiementMobile ? "block" : "none";
    }

    if (zonePaiementAPI) {

        zonePaiementAPI.style.display =
            paiementMobile ? "block" : "none";
    }

    if (!paiementMobile) {

        if (numeroMobile) numeroMobile.value = "";
        if (refTransaction) refTransaction.value = "";
    }
}


/*==================================================
  RÉPARTITION FINANCIÈRE
==================================================*/

function calculerRepartition(membre, montant, statut) {

    montant = Number(montant) || 0;

    /*
      Aucun argent réellement encaissé :
      aucune répartition financière.
    */

    if (statut !== "Payé") {

        return {
            partParrain: 0,
            partCommunaute: 0
        };
    }

    /*
      Règle MWANA MBOKA :

      Si le membre possède un parrain
      ET que la cotisation atteint au moins 2 000 FCFA :

      Parrain = 700 FCFA
      Communauté = reste
    */

    if (
        membre &&
        membre.parrain &&
        montant >= 2000
    ) {

        return {

            partParrain: 700,

            partCommunaute:
                montant - 700
        };
    }

    /*
      Si aucun parrain ou montant inférieur
      à 2 000 FCFA :

      Tout revient à la communauté.
    */

    return {

        partParrain: 0,

        partCommunaute: montant
    };
}


/*==================================================
  OBTENIR TOUTES LES COTISATIONS
==================================================*/

async function recupererCotisationsDepuisFirebase() {

    const snapshot =
        await get(ref(db, "cotisations"));

    if (!snapshot.exists()) {

        return {};
    }

    return snapshot.val();
}


/*==================================================
  VÉRIFICATION DOUBLON
==================================================*/

function cotisationPayeeExiste(
    cotisations,
    matricule,
    mois,
    annee,
    cleIgnoree = null
) {

    return Object.entries(cotisations).some(
        ([cle, cotisation]) => {

            if (cle === cleIgnoree) return false;

            return (
                cotisation.matricule === matricule &&
                cotisation.mois === mois &&
                Number(cotisation.annee) === Number(annee) &&
                cotisation.statut === "Payé"
            );
        }
    );
}


/*==================================================
  CALCUL DES STATISTIQUES D'UN MEMBRE
==================================================*/

function calculerStatsMembre(
    cotisations,
    matricule
) {

    const paiements = Object.values(cotisations)
        .filter(cotisation => {

            return (
                cotisation.matricule === matricule &&
                cotisation.statut === "Payé"
            );
        });

    paiements.sort(
        (a, b) =>
            Number(b.horodatage || 0) -
            Number(a.horodatage || 0)
    );

    return {

        nombreCotisations:
            paiements.length,

        derniereCotisation:
            paiements.length > 0
                ? paiements[0].date
                : null,

        dernierPaiementHorodatage:
            paiements.length > 0
                ? paiements[0].horodatage
                : null
    };
}


/*==================================================
  CALCUL DU BONUS PARRAIN
==================================================*/

function calculerBonusParrain(
    cotisations,
    matriculeParrain
) {

    if (!matriculeParrain) return 0;

    return Object.values(cotisations)
        .filter(cotisation => {

            return (
                cotisation.parrain === matriculeParrain &&
                cotisation.statut === "Payé"
            );
        })
        .reduce(
            (total, cotisation) =>
                total +
                Number(cotisation.partParrain || 0),
            0
        );
}


/*==================================================
  PRÉPARER LA SYNCHRONISATION DES MEMBRES
==================================================*/

function preparerSynchronisationMembre(
    misesAJour,
    cotisations,
    matricule
) {

    if (!matricule) return;

    const stats =
        calculerStatsMembre(
            cotisations,
            matricule
        );

    misesAJour[`membres/${matricule}/nombreCotisations`] =
        stats.nombreCotisations;

    misesAJour[`membres/${matricule}/derniereCotisation`] =
        stats.derniereCotisation;

    misesAJour[`membres/${matricule}/dernierPaiementHorodatage`] =
        stats.dernierPaiementHorodatage;
}


/*==================================================
  PRÉPARER LE BONUS DU PARRAIN
==================================================*/

function preparerSynchronisationParrain(
    misesAJour,
    cotisations,
    matriculeParrain
) {

    if (!matriculeParrain) return;

    const bonus =
        calculerBonusParrain(
            cotisations,
            matriculeParrain
        );

    /*
      Le champ "bonus" représente ici
      le cumul des primes de parrainage
      provenant des cotisations.
    */

    misesAJour[
        `membres/${matriculeParrain}/bonus`
    ] = bonus;
}


/*==================================================
  JOURNAL COMPTABLE
==================================================*/

function creerJournal(
    action,
    cleCotisation,
    ancienneDonnee,
    nouvelleDonnee
) {

    return {

        type: "COTISATION",

        action,

        cotisationId:
            cleCotisation || null,

        matricule:
            nouvelleDonnee?.matricule ||
            ancienneDonnee?.matricule ||
            null,

        nom:
            nouvelleDonnee?.nom ||
            ancienneDonnee?.nom ||
            null,

        ancienMontant:
            ancienneDonnee
                ? Number(ancienneDonnee.montant || 0)
                : 0,

        nouveauMontant:
            nouvelleDonnee
                ? Number(nouvelleDonnee.montant || 0)
                : 0,

        anciennePartParrain:
            ancienneDonnee
                ? Number(
                    ancienneDonnee.partParrain || 0
                )
                : 0,

        nouvellePartParrain:
            nouvelleDonnee
                ? Number(
                    nouvelleDonnee.partParrain || 0
                )
                : 0,

        anciennePartCommunaute:
            ancienneDonnee
                ? Number(
                    ancienneDonnee.partCommunaute || 0
                )
                : 0,

        nouvellePartCommunaute:
            nouvelleDonnee
                ? Number(
                    nouvelleDonnee.partCommunaute || 0
                )
                : 0,

        ancienStatut:
            ancienneDonnee?.statut || null,

        nouveauStatut:
            nouvelleDonnee?.statut || null,

        adminMatricule:
            adminMatriculeConnecte,

        horodatage:
            Date.now(),

        date:
            new Date().toLocaleString("fr-FR")
    };
}


/*==================================================
  CHARGEMENT DES COTISATIONS
==================================================*/

function chargerCotisations() {

    const cotisationsRef =
        ref(db, "cotisations");

    onValue(
        cotisationsRef,
        snapshot => {

            toutesLesCotisations =
                snapshot.exists()
                    ? snapshot.val()
                    : {};

            calculerTableauDeBord();

            afficherListeFiltree();

        },
        erreur => {

            console.error(
                "Erreur cotisations :",
                erreur
            );

            afficherMessage(
                "Impossible de charger les cotisations.",
                "error"
            );
        }
    );
}


/*==================================================
  TABLEAU DE BORD
==================================================*/

function calculerTableauDeBord() {

    const cotisationsPayees =
        Object.values(toutesLesCotisations)
            .filter(
                c => c.statut === "Payé"
            );

    const membresPayants =
        new Set(
            cotisationsPayees.map(
                c => c.matricule
            )
        );

    const total =
        cotisationsPayees.reduce(
            (somme, c) =>
                somme +
                Number(c.montant || 0),
            0
        );

    const parrains =
        cotisationsPayees.reduce(
            (somme, c) =>
                somme +
                Number(c.partParrain || 0),
            0
        );

    const communaute =
        cotisationsPayees.reduce(
            (somme, c) =>
                somme +
                Number(c.partCommunaute || 0),
            0
        );

    if (nbCotisants) {

        nbCotisants.textContent =
            membresPayants.size;
    }

    if (totalCotisations) {

        totalCotisations.textContent =
            formaterMontant(total);
    }

    if (totalParrains) {

        totalParrains.textContent =
            formaterMontant(parrains);
    }

    if (totalCommunaute) {

        totalCommunaute.textContent =
            formaterMontant(communaute);
    }
}


/*==================================================
  COULEUR STATUT
==================================================*/

function classeStatut(statut) {

    switch (statut) {

        case "Payé":
            return "badge-paye";

        case "En attente":
            return "badge-attente";

        case "Retard":
            return "badge-retard";

        default:
            return "";
    }
}


/*==================================================
  AFFICHAGE HISTORIQUE
==================================================*/

function afficherListeFiltree() {

    if (!listeCotisations) return;

    const recherche =
        rechercheInput
            ? rechercheInput.value
                .trim()
                .toLowerCase()
            : "";

    let liste =
        Object.entries(toutesLesCotisations);

    if (filtreActuel !== "tous") {

        liste = liste.filter(
            ([, cotisation]) =>
                cotisation.statut === filtreActuel
        );
    }

    if (recherche) {

        liste = liste.filter(
            ([, cotisation]) => {

                const texte = `
                    ${cotisation.nom || ""}
                    ${cotisation.matricule || ""}
                    ${cotisation.mois || ""}
                    ${cotisation.modePaiement || ""}
                    ${cotisation.statut || ""}
                `.toLowerCase();

                return texte.includes(recherche);
            }
        );
    }

    liste.sort(
        ([, a], [, b]) =>
            Number(b.horodatage || 0) -
            Number(a.horodatage || 0)
    );

    if (liste.length === 0) {

        listeCotisations.innerHTML = `
            <div class="aucune-donnee">
                Aucune cotisation trouvée.
            </div>
        `;

        return;
    }

    listeCotisations.innerHTML =
        liste.map(
            ([cle, cotisation]) => {

                const montant =
                    Number(cotisation.montant || 0);

                const parra
