/* ============================================================
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   GESTION DES COTISATIONS
   VERSION RECONSTRUITE
   PARTIE 1/3 : INITIALISATION ET FONCTIONS DE BASE
   ============================================================ */

import {
    getDatabase,
    ref,
    onValue,
    get,
    push,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { app } from "./firebase-config.js";

/* ============================================================
   1. INITIALISATION FIREBASE
   ============================================================ */

const db = getDatabase(app);
const auth = getAuth(app);

/* ============================================================
   2. PARAMÈTRES FINANCIERS
   ============================================================ */

const COTISATION_MENSUELLE = 2000;
const BONUS_PARRAIN = 700;
const DELAI_RETARD_JOURS = 30;
const DELAI_RETARD_MS = DELAI_RETARD_JOURS * 24 * 60 * 60 * 1000;

/* ============================================================
   3. VARIABLES GLOBALES
   ============================================================ */

let toutesLesCotisations = {};
let listeMembres = [];
let filtreActuel = "Tous";
let cotisationEnModification = null;
let adminMatriculeConnecte = null;
let ecouteCotisationsActive = false;
let ecouteMembresActive = false;

/* ============================================================
   4. RÉCUPÉRATION DES ÉLÉMENTS HTML
   ============================================================ */

const element = (id) => document.getElementById(id);

const membreSelect = element("membre");
const infoMembre = element("infoMembre");
const montantInput = element("montant");
const moisInput = element("moisCotisation");
const numeroMobileInput = element("numeroMobile");
const referenceInput = element("refTransaction");
const statutSelect = element("statut");
const observationInput = element("observation");

const groupeMobile = element("groupeMobile");
const groupeReference = element("groupeReference");
const groupeAPI = element("groupeAPI");

const boutonEnregistrer = element("boutonEnregistrer");
const boutonAnnuler = element("boutonAnnuler");
const messageElement = element("message");

const rechercheInput = element("rechercheCotisation");
const listeCotisations = element("listeCotisations");

const totalCotisationsElement = element("totalCotisations");
const totalParrainsElement = element("totalParrains");
const totalCommunauteElement = element("totalCommunaute");
const nombreMembresPayesElement = element("nombreMembresPayes");

/* ============================================================
   5. OUTILS GÉNÉRAUX
   ============================================================ */

function afficherMessage(message, type = "normal") {
    if (!messageElement) {
        console.log(message);
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
}

function formaterMontant(montant) {
    return Number(montant || 0).toLocaleString("fr-FR") + " FCFA";
}

function dateHeureActuelle() {
    return new Date().toISOString();
}

function echapperHTML(valeur) {
    return String(valeur ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function obtenirDateLocale() {
    const maintenant = new Date();

    return {
        jour: maintenant.getDate(),
        mois: maintenant.getMonth() + 1,
        annee: maintenant.getFullYear(),
        timestamp: maintenant.getTime()
    };
}

function normaliserMatricule(matricule) {
    return String(matricule || "").trim().toUpperCase();
}

function obtenirNomMembre(membre) {
    if (!membre) return "Membre inconnu";

    return (
        membre.nomComplet ||
        membre.nom ||
        membre.prenom ||
        "Membre sans nom"
    );
}

/* ============================================================
   6. VÉRIFICATION DE L'ADMINISTRATEUR
   ============================================================ */

async function verifierAdmin() {
    try {
        const matricule = normaliserMatricule(
            localStorage.getItem("matricule")
        );

        if (!matricule) {
            afficherMessage(
                "Accès refusé. Veuillez vous connecter.",
                "error"
            );

            window.location.href = "connexion.html";
            return false;
        }

        const snapshot = await get(
            ref(db, `membres/${matricule}`)
        );

        if (!snapshot.exists()) {
            afficherMessage(
                "Compte administrateur introuvable.",
                "error"
            );

            return false;
        }

        const membre = snapshot.val();
        const role = String(membre.role || "").toLowerCase();

        if (role !== "admin" && role !== "administrateur") {
            afficherMessage(
                "Accès réservé aux administrateurs.",
                "error"
            );

            window.location.href = "espace.html";
            return false;
        }

        adminMatriculeConnecte = matricule;

        return true;

    } catch (erreur) {
        console.error(
            "Erreur de vérification administrateur :",
            erreur
        );

        afficherMessage(
            "Impossible de vérifier les autorisations.",
            "error"
        );

        return false;
    }
}

/* ============================================================
   7. CHARGEMENT DES MEMBRES
   ============================================================ */

function chargerMembres() {
    if (ecouteMembresActive) return;

    ecouteMembresActive = true;

    onValue(
        ref(db, "membres"),

        (snapshot) => {
            listeMembres = [];

            if (snapshot.exists()) {
                const donnees = snapshot.val();

                Object.entries(donnees).forEach(
                    ([matricule, membre]) => {
                        listeMembres.push({
                            matricule,
                            ...membre
                        });
                    }
                );
            }

            listeMembres.sort((a, b) =>
                obtenirNomMembre(a).localeCompare(
                    obtenirNomMembre(b),
                    "fr"
                )
            );

            remplirSelectMembres();
        },

        (erreur) => {
            console.error(
                "Erreur de chargement des membres :",
                erreur
            );

            afficherMessage(
                "Impossible de charger les membres.",
                "error"
            );
        }
    );
}

/* ============================================================
   8. REMPLISSAGE DE LA LISTE DES MEMBRES
   ============================================================ */

function remplirSelectMembres() {
    if (!membreSelect) return;

    const ancienneValeur = membreSelect.value;

    membreSelect.innerHTML =
        '<option value="">Sélectionner un membre</option>';

    listeMembres.forEach((membre) => {
        const option = document.createElement("option");

        option.value = membre.matricule;

        option.textContent =
            `${obtenirNomMembre(membre)} — ${membre.matricule}`;

        membreSelect.appendChild(option);
    });

    if (
        ancienneValeur &&
        listeMembres.some(
            membre => membre.matricule === ancienneValeur
        )
    ) {
        membreSelect.value = ancienneValeur;
    }
}

/* ============================================================
   9. AFFICHAGE DES INFORMATIONS DU MEMBRE
   ============================================================ */

function afficherInfosMembre() {
    if (!membreSelect || !infoMembre) return;

    const matricule = normaliserMatricule(
        membreSelect.value
    );

    const membre = listeMembres.find(
        element => element.matricule === matricule
    );

    if (!membre) {
        infoMembre.innerHTML = "";
        return;
    }

    infoMembre.innerHTML = `
        <div class="info-membre">
            <strong>${echapperHTML(obtenirNomMembre(membre))}</strong>
            <p>Matricule : ${echapperHTML(membre.matricule)}</p>
            <p>Téléphone : ${echapperHTML(membre.telephone || "Non renseigné")}</p>
            <p>Parrain : ${echapperHTML(membre.parrain || "Aucun")}</p>
        </div>
    `;
}

/* ============================================================
   10. RÉPARTITION FINANCIÈRE
   ============================================================ */

function calculerRepartition(membre, montant, statut) {
    const resultat = {
        partParrain: 0,
        partCommunaute: 0
    };

    if (statut !== "Payé") {
        return resultat;
    }

    const montantNumerique = Number(montant || 0);

    if (
        membre &&
        membre.parrain &&
        montantNumerique >= COTISATION_MENSUELLE
    ) {
        resultat.partParrain = BONUS_PARRAIN;
        resultat.partCommunaute =
            montantNumerique - BONUS_PARRAIN;
    } else {
        resultat.partCommunaute = montantNumerique;
    }

    return resultat;
}

/* ============================================================
   FIN DE LA PARTIE 1/3
   NE PAS AJOUTER DE BALISE SCRIPT ICI.
   ============================================================ */

/* ============================================================
   11. RÉCUPÉRATION DES COTISATIONS DE FIREBASE
   ============================================================ */

async function recupererCotisationsDepuisFirebase() {
    try {
        const snapshot = await get(ref(db, "cotisations"));

        if (!snapshot.exists()) {
            return {};
        }

        return snapshot.val();

    } catch (erreur) {
        console.error("Erreur de récupération des cotisations :", erreur);
        throw erreur;
    }
}

/* ============================================================
   12. VÉRIFICATION DES DOUBLONS
   ============================================================ */

function cotisationPayeeExiste(matricule, mois, annee, idExclu = null) {
    return Object.entries(toutesLesCotisations).some(
        ([id, cotisation]) => {
            if (id === idExclu) return false;

            return (
                normaliserMatricule(cotisation.matricule) ===
                    normaliserMatricule(matricule) &&
                Number(cotisation.mois) === Number(mois) &&
                Number(cotisation.annee) === Number(annee) &&
                cotisation.statut === "Payé"
            );
        }
    );
}

/* ============================================================
   13. CALCUL DES STATISTIQUES D'UN MEMBRE
   ============================================================ */

function calculerStatsMembre(matricule) {
    const cotisationsMembre = Object.values(toutesLesCotisations)
        .filter(cotisation =>
            normaliserMatricule(cotisation.matricule) ===
                normaliserMatricule(matricule) &&
            cotisation.statut === "Payé"
        );

    const derniereCotisation = cotisationsMembre
        .sort((a, b) =>
            Number(b.horodatage || 0) -
            Number(a.horodatage || 0)
        )[0];

    return {
        nombreCotisationsPayees: cotisationsMembre.length,
        derniereDatePaiement: derniereCotisation
            ? derniereCotisation.date
            : null,
        dernierPaiementTimestamp: derniereCotisation
            ? Number(derniereCotisation.horodatage || 0)
            : null
    };
}

/* ============================================================
   14. CALCUL DES BONUS D'UN PARRAIN
   ============================================================ */

function calculerBonusParrain(matriculeParrain) {
    return Object.values(toutesLesCotisations)
        .filter(cotisation =>
            normaliserMatricule(cotisation.parrain) ===
                normaliserMatricule(matriculeParrain) &&
            cotisation.statut === "Payé"
        )
        .reduce(
            (total, cotisation) =>
                total + Number(cotisation.partParrain || 0),
            0
        );
}

/* ============================================================
   15. PRÉPARATION DE LA SYNCHRONISATION DU MEMBRE
   ============================================================ */

function preparerSynchronisationMembre(matricule) {
    const stats = calculerStatsMembre(matricule);

    return {
        nombreCotisationsPayees: stats.nombreCotisationsPayees,
        derniereDatePaiement: stats.derniereDatePaiement || "",
        dernierPaiementTimestamp:
            stats.dernierPaiementTimestamp || 0,
        derniereMiseAJourCotisation: dateHeureActuelle()
    };
}

/* ============================================================
   16. PRÉPARATION DE LA SYNCHRONISATION DU PARRAIN
   ============================================================ */

function preparerSynchronisationParrain(matriculeParrain) {
    return {
        bonus: calculerBonusParrain(matriculeParrain),
        derniereMiseAJourBonus: dateHeureActuelle()
    };
}

/* ============================================================
   17. JOURNAL COMPTABLE
   ============================================================ */

async function creerJournal(action, idCotisation, ancienneDonnee = null, nouvelleDonnee = null) {
    try {
        const journalRef = push(ref(db, "journal_cotisations"));

        const ancienne = ancienneDonnee || {};
        const nouvelle = nouvelleDonnee || {};

        await set(journalRef, {
            action,
            idCotisation,
            matricule: nouvelle.matricule ||
                ancienne.matricule || "",
            nomMembre: nouvelle.nomMembre ||
                ancienne.nomMembre || "",
            ancienMontant: Number(ancienne.montant || 0),
            nouveauMontant: Number(nouvelle.montant || 0),
            ancienStatut: ancienne.statut || "",
            nouveauStatut: nouvelle.statut || "",
            anciennePartParrain:
                Number(ancienne.partParrain || 0),
            nouvellePartParrain:
                Number(nouvelle.partParrain || 0),
            anciennePartCommunaute:
                Number(ancienne.partCommunaute || 0),
            nouvellePartCommunaute:
                Number(nouvelle.partCommunaute || 0),
            administrateur: adminMatriculeConnecte || "",
            date: dateHeureActuelle(),
            horodatage: Date.now()
        });

    } catch (erreur) {
        console.error("Erreur journal comptable :", erreur);
        throw erreur;
    }
}

/* ============================================================
   18. SYNCHRONISATION DES INFORMATIONS DES MEMBRES
   ============================================================ */

async function synchroniserMembre(matricule) {
    const membre = listeMembres.find(
        element =>
            normaliserMatricule(element.matricule) ===
                normaliserMatricule(matricule)
    );

    if (!membre) {
        throw new Error("Membre introuvable pour synchronisation.");
    }

    const misesAJour = {};

    misesAJour[`membres/${matricule}`] =
        preparerSynchronisationMembre(matricule);

    if (membre.parrain) {
        const matriculeParrain =
            normaliserMatricule(membre.parrain);

        misesAJour[`membres/${matriculeParrain}/bonus`] =
            calculerBonusParrain(matriculeParrain);
    }

    await update(ref(db), misesAJour);
}

/* ============================================================
   19. CHARGEMENT EN TEMPS RÉEL DES COTISATIONS
   ============================================================ */

function chargerCotisations() {
    if (ecouteCotisationsActive) return;

    ecouteCotisationsActive = true;

    onValue(
        ref(db, "cotisations"),

        (snapshot) => {
            toutesLesCotisations = snapshot.exists()
                ? snapshot.val()
                : {};

            calculerTableauDeBord();
            afficherListeFiltree();
        },

        (erreur) => {
            console.error(
                "Erreur de chargement des cotisations :",
                erreur
            );

            afficherMessage(
                "Impossible de charger les cotisations.",
                "error"
            );
        }
    );
}

/* ============================================================
   20. CALCUL DU TABLEAU DE BORD
   ============================================================ */

function calculerTableauDeBord() {
    const cotisations = Object.values(toutesLesCotisations);

    const payees = cotisations.filter(
        cotisation => cotisation.statut === "Payé"
    );

    const totalCotisations = payees.reduce(
        (total, cotisation) =>
            total + Number(cotisation.montant || 0),
        0
    );

    const totalParrains = payees.reduce(
        (total, cotisation) =>
            total + Number(cotisation.partParrain || 0),
        0
    );

    const totalCommunaute = payees.reduce(
        (total, cotisation) =>
            total + Number(cotisation.partCommunaute || 0),
        0
    );

    if (totalCotisationsElement) {
        totalCotisationsElement.textContent =
            formaterMontant(totalCotisations);
    }

    if (totalParrainsElement) {
        totalParrainsElement.textContent =
            formaterMontant(totalParrains);
    }

    if (totalCommunauteElement) {
        totalCommunauteElement.textContent =
            formaterMontant(totalCommunaute);
    }

    if (nombreMembresPayesElement) {
        const membresPayes = new Set(
            payees.map(cotisation =>
                normaliserMatricule(cotisation.matricule)
            )
        );

        nombreMembresPayesElement.textContent =
            membresPayes.size;
    }
}

/* ============================================================
   21. CLASSES VISUELLES DES STATUTS
   ============================================================ */

function classeStatut(statut) {
    switch (String(statut || "").toLowerCase()) {
        case "payé":
            return "statut-paye";

        case "en attente":
            return "statut-attente";

        case "retard":
            return "statut-retard";

        default:
            return "statut-inconnu";
    }
}

/* ============================================================
   22. AFFICHAGE DE LA LISTE FILTRÉE
   ============================================================ */

function afficherListeFiltree() {
    if (!listeCotisations) return;

    const recherche = String(
        rechercheInput?.value || ""
    ).trim().toLowerCase();

    let liste = Object.entries(toutesLesCotisations);

    if (filtreActuel !== "Tous") {
        liste = liste.filter(
            ([, cotisation]) =>
                cotisation.statut === filtreActuel
        );
    }

    if (recherche) {
        liste = liste.filter(([, cotisation]) => {
            const texte = [
                cotisation.matricule,
                cotisation.nomMembre,
                cotisation.mois,
                cotisation.annee,
                cotisation.reference
            ].join(" ").toLowerCase();

            return texte.includes(recherche);
        });
    }

    liste.sort((a, b) =>
        Number(b[1].horodatage || 0) -
        Number(a[1].horodatage || 0)
    );

    if (liste.length === 0) {
        listeCotisations.innerHTML =
            '<p class="aucun-resultat">Aucune cotisation trouvée.</p>';

        return;
    }

    listeCotisations.innerHTML = liste.map(
        ([cle, cotisation]) => {
            const montant = Number(cotisation.montant || 0);

            return `
                <div class="cotisation-item">
                    <div class="cotisation-infos">
                        <strong>
                            ${echapperHTML(cotisation.nomMembre || "Membre")}
                        </strong>

                        <p>
                            Matricule :
                            ${echapperHTML(cotisation.matricule || "")}
                        </p>

                        <p>
                            Période :
                            ${echapperHTML(cotisation.mois || "")}/
                            ${echapperHTML(cotisation.annee || "")}
                        </p>

                        <p>
                            Montant :
                            ${formaterMontant(montant)}
                        </p>

                        <p>
                            Mode :
                            ${echapperHTML(cotisation.modePaiement || "Non renseigné")}
                        </p>

                        <span class="${classeStatut(cotisation.statut)}">
                            ${echapperHTML(cotisation.statut || "Inconnu")}
                        </span>
                    </div>

                    <div class="cotisation-actions">
                        <button
                            type="button"
                            onclick="modifierCotisation('${echapperHTML(cle)}')"
                        >
                            Modifier
                        </button>

                        <button
                            type="button"
                            onclick="supprimerCotisation('${echapperHTML(cle)}')"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            `;
        }
    ).join("");
}

/* ============================================================
   FIN DE LA PARTIE 2/3
   LA PARTIE 3 CONTINUERA DIRECTEMENT APRÈS CE CODE.
   ============================================================ */

/* ============================================================
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   PARTIE 3/3 : OPÉRATIONS ET FINALISATION
   ============================================================ */

/* ============================================================
   23. SYNCHRONISATION SANS EFFACER LES AUTRES DONNÉES
   ============================================================ */

// Cette version corrige la synchronisation de la partie 2.
// Elle met à jour uniquement les champs concernés.

async function synchroniserMembre(matricule) {
    const membre = listeMembres.find(
        element =>
            normaliserMatricule(element.matricule) ===
            normaliserMatricule(matricule)
    );

    if (!membre) {
        throw new Error("Membre introuvable.");
    }

    const stats = calculerStatsMembre(matricule);

    const misesAJour = {};

    misesAJour[`membres/${matricule}/nombreCotisationsPayees`] =
        stats.nombreCotisationsPayees;

    misesAJour[`membres/${matricule}/derniereDatePaiement`] =
        stats.derniereDatePaiement || "";

    misesAJour[`membres/${matricule}/dernierPaiementTimestamp`] =
        stats.dernierPaiementTimestamp || 0;

    misesAJour[`membres/${matricule}/derniereMiseAJourCotisation`] =
        dateHeureActuelle();

    if (membre.parrain) {
        const parrain = normaliserMatricule(membre.parrain);

        misesAJour[`membres/${parrain}/bonus`] =
            calculerBonusParrain(parrain);
    }

    await update(ref(db), misesAJour);
}

/* ============================================================
   24. CALCUL DU RETARD DE COTISATION
   ============================================================ */

// La date de référence est le dernier paiement validé.
// Si le membre n'a jamais payé, on utilise sa date d'adhésion.
// La suspension intervient après 30 jours sans régularisation.

function calculerSituationCotisation(membre) {
    const maintenant = Date.now();

    const stats = calculerStatsMembre(membre.matricule);

    let dateReference = stats.dernierPaiementTimestamp;

    if (!dateReference) {
        const dateAdhesion = membre.dateAdhesion
            ? new Date(membre.dateAdhesion).getTime()
            : 0;

        dateReference = dateAdhesion;
    }

    if (!dateReference || Number.isNaN(dateReference)) {
        return {
            statutCotisation: "A_VERIFIER",
            joursRetard: 0,
            suspendu: false
        };
    }

    const joursEcoules = Math.floor(
        (maintenant - dateReference) / (24 * 60 * 60 * 1000)
    );

    if (joursEcoules <= 30) {
        return {
            statutCotisation: joursEcoules === 0
                ? "ACTIF"
                : "EN_RETARD",
            joursRetard: joursEcoules,
            suspendu: false
        };
    }

    return {
        statutCotisation: "SUSPENDU",
        joursRetard: joursEcoules,
        suspendu: true
    };
}

/* ============================================================
   25. MISE À JOUR DU STATUT DE COTISATION
   ============================================================ */

async function actualiserStatutsCotisations() {
    const misesAJour = {};

    listeMembres.forEach(membre => {
        const situation = calculerSituationCotisation(membre);

        misesAJour[
            `membres/${membre.matricule}/statutCotisation`
        ] = situation.statutCotisation;

        misesAJour[
            `membres/${membre.matricule}/joursRetardCotisation`
        ] = situation.joursRetard;

        misesAJour[
            `membres/${membre.matricule}/suspensionCotisation`
        ] = situation.suspendu;

        misesAJour[
            `membres/${membre.matricule}/miseAJourStatutCotisation`
        ] = dateHeureActuelle();
    });

    if (Object.keys(misesAJour).length > 0) {
        await update(ref(db), misesAJour);
    }
}

/* ============================================================
   26. ENREGISTREMENT D'UNE COTISATION
   ============================================================ */

async function enregistrerCotisation() {
    try {
        if (!adminMatriculeConnecte) {
            afficherMessage(
                "Autorisation administrateur nécessaire.",
                "error"
            );
            return;
        }

        const matricule = normaliserMatricule(
            membreSelect?.value
        );

        const membre = listeMembres.find(
            element => element.matricule === matricule
        );

        const montant = Number(montantInput?.value || 0);
        const periode = moisInput?.value || "";

        if (!membre) {
            afficherMessage(
                "Veuillez sélectionner un membre.",
                "error"
            );
            return;
        }

        if (!Number.isFinite(montant) || montant <= 0) {
            afficherMessage(
                "Veuillez saisir un montant valide.",
                "error"
            );
            return;
        }

        if (!periode) {
            afficherMessage(
                "Veuillez sélectionner le mois de cotisation.",
                "error"
            );
            return;
        }

        const parties = periode.split("-");

        const annee = Number(parties[0]);
        const mois = Number(parties[1]);

        if (
            !Number.isInteger(annee) ||
            !Number.isInteger(mois) ||
            mois < 1 ||
            mois > 12
        ) {
            afficherMessage(
                "La période sélectionnée est invalide.",
                "error"
            );
            return;
        }

        const statut = statutSelect?.value || "En attente";

        const modePaiement = obtenirModePaiement();

        const reference = referenceInput?.value?.trim() || "";

        if (
            statut === "Payé" &&
            modePaiement !== "Espèces" &&
            !reference
        ) {
            afficherMessage(
                "La référence de transaction est obligatoire pour ce paiement.",
                "error"
            );
            return;
        }

        if (
            cotisationPayeeExiste(
                matricule,
                mois,
                annee,
                cotisationEnModification
            ) &&
            statut === "Payé"
        ) {
            afficherMessage(
                "Une cotisation payée existe déjà pour ce mois.",
                "error"
            );
            return;
        }

        const repartition = calculerRepartition(
            membre,
            montant,
            statut
        );

        const ancienneDonnee = cotisationEnModification
            ? toutesLesCotisations[cotisationEnModification]
            : null;

        const nouvelleDonnee = {
            matricule,
            nomMembre: obtenirNomMembre(membre),
            parrain: membre.parrain || "",
            montant,
            mois,
            annee,
            statut,
            modePaiement,
            numeroMobile: numeroMobileInput?.value?.trim() || "",
            reference,
            observation: observationInput?.value?.trim() || "",
            partParrain: repartition.partParrain,
            partCommunaute: repartition.partCommunaute,
            date: dateHeureActuelle(),
            horodatage: Date.now(),
            administrateur: adminMatriculeConnecte
        };

        let id = cotisationEnModification;

        if (id) {
            await update(
                ref(db, `cotisations/${id}`),
                nouvelleDonnee
            );
        } else {
            const nouvelleReference = push(
                ref(db, "cotisations")
            );

            id = nouvelleReference.key;

            await set(
                nouvelleReference,
                nouvelleDonnee
            );
        }

        await creerJournal(
            cotisationEnModification ? "MODIFICATION" : "CREATION",
            id,
            ancienneDonnee,
            nouvelleDonnee
        );

        toutesLesCotisations =
            await recupererCotisationsDepuisFirebase();

        await synchroniserMembre(matricule);
        await actualiserStatutsCotisations();

        afficherMessage(
            "Cotisation enregistrée avec succès.",
            "success"
        );

        reinitialiserFormulaire();

    } catch (erreur) {
        console.error(
            "Erreur d'enregistrement :",
            erreur
        );

        afficherMessage(
            "Erreur lors de l'enregistrement de la cotisation.",
            "error"
        );
    }
}

/* ============================================================
   27. MODIFICATION D'UNE COTISATION
   ============================================================ */

async function modifierCotisation(id) {
    const cotisation = toutesLesCotisations[id];

    if (!cotisation) {
        afficherMessage(
            "Cotisation introuvable.",
            "error"
        );
        return;
    }

    cotisationEnModification = id;

    if (membreSelect) {
        membreSelect.value = cotisation.matricule;
        afficherInfosMembre();
    }

    if (montantInput) {
        montantInput.value = cotisation.montant || "";
    }

    if (moisInput) {
        moisInput.value =
            `${cotisation.annee}-${String(cotisation.mois).padStart(2, "0")}`;
    }

    if (referenceInput) {
        referenceInput.value = cotisation.reference || "";
    }

    if (numeroMobileInput) {
        numeroMobileInput.value =
            cotisation.numeroMobile || "";
    }

    if (statutSelect) {
        statutSelect.value = cotisation.statut || "En attente";
    }

    if (observationInput) {
        observationInput.value =
            cotisation.observation || "";
    }

    gererModePaiement(cotisation.modePaiement || "");

    if (boutonEnregistrer) {
        boutonEnregistrer.textContent =
            "Enregistrer les modifications";
    }

    if (boutonAnnuler) {
        boutonAnnuler.style.display = "inline-block";
    }

    afficherMessage(
        "Modification de la cotisation en cours.",
        "normal"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* ============================================================
   28. SUPPRESSION D'UNE COTISATION
   ============================================================ */

async function supprimerCotisation(id) {
    if (!adminMatriculeConnecte) {
        afficherMessage(
            "Action réservée à l'administration.",
            "error"
        );
        return;
    }

    const cotisation = toutesLesCotisations[id];

    if (!cotisation) {
        afficherMessage(
            "Cotisation introuvable.",
            "error"
        );
        return;
    }

    const confirmation = confirm(
        "Confirmer la suppression de cette cotisation ?"
    );

    if (!confirmation) return;

    try {
        await remove(ref(db, `cotisations/${id}`));

        await creerJournal(
            "SUPPRESSION",
            id,
            cotisation,
            null
        );

        toutesLesCotisations =
            await recupererCotisationsDepuisFirebase();

        await synchroniserMembre(cotisation.matricule);
        await actualiserStatutsCotisations();

        afficherMessage(
            "Cotisation supprimée avec succès.",
            "success"
        );

    } catch (erreur) {
        console.error(
            "Erreur de suppression :",
            erreur
        );

        afficherMessage(
            "Impossible de supprimer cette cotisation.",
            "error"
        );
    }
}

/* ============================================================
   29. RÉINITIALISATION DU FORMULAIRE
   ============================================================ */

function reinitialiserFormulaire() {
    cotisationEnModification = null;

    if (membreSelect) membreSelect.value = "";
    if (montantInput) montantInput.value = "";
    if (moisInput) moisInput.value = "";
    if (numeroMobileInput) numeroMobileInput.value = "";
    if (referenceInput) referenceInput.value = "";
    if (observationInput) observationInput.value = "";

    if (statutSelect) {
        statutSelect.value = "En attente";
    }

    if (infoMembre) {
        infoMembre.innerHTML = "";
    }

    if (boutonEnregistrer) {
        boutonEnregistrer.textContent =
            "Enregistrer la cotisation";
    }

    if (boutonAnnuler) {
        boutonAnnuler.style.display = "none";
    }

    gererModePaiement("");
}

/* ============================================================
   30. MODE DE PAIEMENT
   ============================================================ */

function obtenirModePaiement() {
    const selection = document.querySelector(
        'input[name="modePaiement"]:checked'
    );

    return selection ? selection.value : "Espèces";
}

function gererModePaiement(mode = null) {
    if (mode) {
        const radio = document.querySelector(
            `input[name="modePaiement"][value="${mode}"]`
        );

        if (radio) radio.checked = true;
    }

    const modeActuel = obtenirModePaiement();

    if (groupeMobile) {
        groupeMobile.style.display =
            modeActuel === "Espèces" ? "none" : "block";
    }

    if (groupeReference) {
        groupeReference.style.display =
            modeActuel === "Espèces" ? "none" : "block";
    }

    if (groupeAPI) {
        groupeAPI.style.display = "none";
    }
}

/* ============================================================
   31. FILTRES DES COTISATIONS
   ============================================================ */

function definirFiltre(statut) {
    filtreActuel = statut || "Tous";
    afficherListeFiltree();
}

/* ============================================================
   32. INITIALISATION DE LA PAGE
   ============================================================ */

async function initialiserCotisations() {
    const autorise = await verifierAdmin();

    if (!autorise) return;

    chargerMembres();
    chargerCotisations();

    if (membreSelect) {
        membreSelect.addEventListener(
            "change",
            afficherInfosMembre
        );
    }

    if (boutonEnregistrer) {
        boutonEnregistrer.addEventListener(
            "click",
            enregistrerCotisation
        );
    }

    if (boutonAnnuler) {
        boutonAnnuler.addEventListener(
            "click",
            reinitialiserFormulaire
        );

        boutonAnnuler.style.display = "none";
    }

    if (rechercheInput) {
        rechercheInput.addEventListener(
            "input",
            afficherListeFiltree
        );
    }

    document.querySelectorAll(
        'input[name="modePaiement"]'
    ).forEach(radio => {
        radio.addEventListener(
            "change",
            () => gererModePaiement()
        );
    });

    if (statutSelect) {
        statutSelect.addEventListener(
            "change",
            () => {
                if (statutSelect.value === "Payé") {
                    afficherMessage(
                        "Vérifiez le paiement avant de sélectionner Payé.",
                        "normal"
                    );
                }
            }
        );
    }

    await actualiserStatutsCotisations();

    console.log(
        "MWANA MBOKA : gestion des cotisations initialisée."
    );
}

/* ============================================================
   33. FONCTIONS ACCESSIBLES DEPUIS LE HTML
   ============================================================ */

window.modifierCotisation = modifierCotisation;
window.supprimerCotisation = supprimerCotisation;
window.definirFiltre = definirFiltre;
window.reinitialiserFormulaire = reinitialiserFormulaire;

/* ============================================================
   34. DÉMARRAGE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initialiserCotisations
);

/* ============================================================
   FIN DU FICHIER COTISATIONS.JS
   ============================================================ */
