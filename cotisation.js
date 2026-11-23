/* ============================================================
   MWANA MBOKA : GESTION DES COTISATIONS (version corrigée)
   ============================================================ */

import {
    getDatabase, ref, onValue, get, push, set, update, remove
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

import { getAuth, signOut } from
    "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { app } from "./firebase-config.js";

const db = getDatabase(app);
const auth = getAuth(app);

/* ---------- Paramètres financiers ---------- */
const COTISATION_MENSUELLE = 2000;
const BONUS_PARRAIN = 700;
const DELAI_RETARD_JOURS = 30;
const JOUR_MS = 24 * 60 * 60 * 1000;

/* ---------- État ---------- */
let toutesLesCotisations = {};
let listeMembres = [];
let filtreActuel = "Tous";
let cotisationEnModification = null;
let adminMatriculeConnecte = null;
let enregistrementEnCours = false;
let minuteurMessage = null;

/* ---------- Éléments HTML ---------- */
const el = (id) => document.getElementById(id);

const membreSelect = el("membre");
const infoMembre = el("infoMembre");
const montantInput = el("montant");
const moisInput = el("moisCotisation");
const numeroMobileInput = el("numeroMobile");
const referenceInput = el("refTransaction");
const statutSelect = el("statut");
const observationInput = el("observation");
const labelOperateur = el("labelOperateur");

const groupeMobile = el("groupeNumero");
const groupeReference = el("groupeRef");
const groupeAPI = el("zonePaiementAPI");

const boutonEnregistrer = el("btnEnregistrer");
const texteEnregistrer = el("texteEnregistrer");
const boutonAnnuler = el("btnAnnuler");
const boutonDeconnexion = el("btnDeconnexion");
const messageElement = el("msgRetour");
const titreFormulaire = el("titreFormulaire");

const rechercheInput = el("recherche");
const listeCotisations = el("listeCotisations");

const totalCotisationsElement = el("totalCotisations");
const totalParrainsElement = el("totalParrains");
const totalCommunauteElement = el("totalCommunaute");
const nombreMembresPayesElement = el("nbCotisants");

/* ============================================================
   OUTILS
   ============================================================ */

function afficherMessage(texte, type = "normal") {
    if (!messageElement) return console.log(texte);

    messageElement.textContent = texte;
    messageElement.className = `msg-retour message ${type}`;

    clearTimeout(minuteurMessage);
    if (type === "success") {
        minuteurMessage = setTimeout(() => {
            messageElement.textContent = "";
            messageElement.className = "msg-retour";
        }, 5000);
    }
}

const formaterMontant = (m) =>
    Number(m || 0).toLocaleString("fr-FR") + " FCFA";

const dateHeureActuelle = () => new Date().toISOString();

function echapperHTML(valeur) {
    return String(valeur ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const normaliserMatricule = (m) => String(m || "").trim().toUpperCase();

function obtenirNomMembre(membre) {
    if (!membre) return "Membre inconnu";
    return membre.nomComplet || membre.nom || membre.prenom || "Membre sans nom";
}

function moisCourant() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formaterPeriode(mois, annee) {
    return `${String(mois).padStart(2, "0")}/${annee}`;
}

/* ============================================================
   VÉRIFICATION ADMINISTRATEUR
   (contrôle d'affichage : la vraie protection doit être
   dans les règles de sécurité Firebase)
   ============================================================ */

async function verifierAdmin() {
    try {
        const matricule = normaliserMatricule(localStorage.getItem("matricule"));

        if (!matricule) {
            window.location.href = "connexion.html";
            return false;
        }

        const snapshot = await get(ref(db, `membres/${matricule}`));

        if (!snapshot.exists()) {
            afficherMessage("Compte administrateur introuvable.", "error");
            return false;
        }

        const role = String(snapshot.val().role || "").toLowerCase();

        if (role !== "admin" && role !== "administrateur") {
            window.location.href = "espace.html";
            return false;
        }

        adminMatriculeConnecte = matricule;
        return true;

    } catch (erreur) {
        console.error("Erreur de vérification administrateur :", erreur);
        afficherMessage("Impossible de vérifier les autorisations.", "error");
        return false;
    }
}

/* ============================================================
   MEMBRES
   ============================================================ */

function chargerMembres() {
    onValue(
        ref(db, "membres"),
        (snapshot) => {
            listeMembres = snapshot.exists()
                ? Object.entries(snapshot.val()).map(
                    ([matricule, membre]) => ({ matricule, ...membre })
                )
                : [];

            listeMembres.sort((a, b) =>
                obtenirNomMembre(a).localeCompare(obtenirNomMembre(b), "fr")
            );

            remplirSelectMembres();
        },
        (erreur) => {
            console.error("Erreur de chargement des membres :", erreur);
            afficherMessage("Impossible de charger les membres.", "error");
        }
    );
}

function remplirSelectMembres() {
    if (!membreSelect) return;

    const ancienne = membreSelect.value;

    membreSelect.innerHTML = '<option value="">-- Sélectionner un membre --</option>';

    listeMembres.forEach((membre) => {
        const option = document.createElement("option");
        option.value = membre.matricule;
        option.textContent = `${obtenirNomMembre(membre)} — ${membre.matricule}`;
        membreSelect.appendChild(option);
    });

    if (ancienne && listeMembres.some((m) => m.matricule === ancienne)) {
        membreSelect.value = ancienne;
    }
}

function afficherInfosMembre() {
    if (!membreSelect || !infoMembre) return;

    const membre = listeMembres.find(
        (m) => m.matricule === normaliserMatricule(membreSelect.value)
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
        </div>`;
}

/* ============================================================
   CALCULS
   ============================================================ */

function calculerRepartition(membre, montant, statut) {
    const resultat = { partParrain: 0, partCommunaute: 0 };

    if (statut !== "Payé") return resultat;

    const m = Number(montant || 0);

    if (membre && membre.parrain && m >= COTISATION_MENSUELLE) {
        resultat.partParrain = BONUS_PARRAIN;
        resultat.partCommunaute = m - BONUS_PARRAIN;
    } else {
        resultat.partCommunaute = m;
    }

    return resultat;
}

function cotisationPayeeExiste(matricule, mois, annee, idExclu = null) {
    return Object.entries(toutesLesCotisations).some(([id, c]) =>
        id !== idExclu &&
        normaliserMatricule(c.matricule) === normaliserMatricule(matricule) &&
        Number(c.mois) === Number(mois) &&
        Number(c.annee) === Number(annee) &&
        c.statut === "Payé"
    );
}

function calculerStatsMembre(matricule) {
    const payees = Object.values(toutesLesCotisations).filter(
        (c) =>
            normaliserMatricule(c.matricule) === normaliserMatricule(matricule) &&
            c.statut === "Payé"
    );

    const derniere = [...payees].sort(
        (a, b) => Number(b.horodatage || 0) - Number(a.horodatage || 0)
    )[0];

    return {
        nombreCotisationsPayees: payees.length,
        derniereDatePaiement: derniere ? derniere.date : null,
        dernierPaiementTimestamp: derniere ? Number(derniere.horodatage || 0) : null
    };
}

function calculerBonusParrain(matriculeParrain) {
    return Object.values(toutesLesCotisations)
        .filter(
            (c) =>
                normaliserMatricule(c.parrain) === normaliserMatricule(matriculeParrain) &&
                c.statut === "Payé"
        )
        .reduce((total, c) => total + Number(c.partParrain || 0), 0);
}

/* Situation du membre : actif si son dernier paiement date de
   30 jours ou moins, suspendu au-delà. */
function calculerSituationCotisation(membre) {
    const stats = calculerStatsMembre(membre.matricule);

    let dateReference = stats.dernierPaiementTimestamp;

    if (!dateReference) {
        dateReference = membre.dateAdhesion
            ? new Date(membre.dateAdhesion).getTime()
            : 0;
    }

    if (!dateReference || Number.isNaN(dateReference)) {
        return { statutCotisation: "A_VERIFIER", joursRetard: 0, suspendu: false };
    }

    const jours = Math.floor((Date.now() - dateReference) / JOUR_MS);

    if (jours <= DELAI_RETARD_JOURS) {
        return { statutCotisation: "ACTIF", joursRetard: 0, suspendu: false };
    }

    return {
        statutCotisation: "SUSPENDU",
        joursRetard: jours - DELAI_RETARD_JOURS,
        suspendu: true
    };
}

/* ============================================================
   JOURNAL ET SYNCHRONISATION
   ============================================================ */

async function creerJournal(action, idCotisation, ancienne = null, nouvelle = null) {
    const a = ancienne || {};
    const n = nouvelle || {};

    await set(push(ref(db, "journal_cotisations")), {
        action,
        idCotisation,
        matricule: n.matricule || a.matricule || "",
        nomMembre: n.nomMembre || a.nomMembre || "",
        ancienMontant: Number(a.montant || 0),
        nouveauMontant: Number(n.montant || 0),
        ancienStatut: a.statut || "",
        nouveauStatut: n.statut || "",
        anciennePartParrain: Number(a.partParrain || 0),
        nouvellePartParrain: Number(n.partParrain || 0),
        anciennePartCommunaute: Number(a.partCommunaute || 0),
        nouvellePartCommunaute: Number(n.partCommunaute || 0),
        administrateur: adminMatriculeConnecte || "",
        date: dateHeureActuelle(),
        horodatage: Date.now()
    });
}

async function synchroniserMembre(matricule) {
    const membre = listeMembres.find(
        (m) => normaliserMatricule(m.matricule) === normaliserMatricule(matricule)
    );

    if (!membre) return;

    const stats = calculerStatsMembre(matricule);
    const maj = {};

    maj[`membres/${matricule}/nombreCotisationsPayees`] = stats.nombreCotisationsPayees;
    maj[`membres/${matricule}/derniereDatePaiement`] = stats.derniereDatePaiement || "";
    maj[`membres/${matricule}/dernierPaiementTimestamp`] = stats.dernierPaiementTimestamp || 0;
    maj[`membres/${matricule}/derniereMiseAJourCotisation`] = dateHeureActuelle();

    if (membre.parrain) {
        const parrain = normaliserMatricule(membre.parrain);
        maj[`membres/${parrain}/bonus`] = calculerBonusParrain(parrain);
    }

    await update(ref(db), maj);
}

/* Met à jour le statut de cotisation, seulement quand il change */
async function actualiserStatutsCotisations() {
    const maj = {};

    listeMembres.forEach((membre) => {
        const s = calculerSituationCotisation(membre);

        if (
            membre.statutCotisation === s.statutCotisation &&
            Number(membre.joursRetardCotisation || 0) === s.joursRetard
        ) return;

        const base = `membres/${membre.matricule}`;
        maj[`${base}/statutCotisation`] = s.statutCotisation;
        maj[`${base}/joursRetardCotisation`] = s.joursRetard;
        maj[`${base}/suspensionCotisation`] = s.suspendu;
        maj[`${base}/miseAJourStatutCotisation`] = dateHeureActuelle();
    });

    if (Object.keys(maj).length > 0) await update(ref(db), maj);
}

/* ============================================================
   COTISATIONS EN TEMPS RÉEL
   ============================================================ */

function chargerCotisations() {
    onValue(
        ref(db, "cotisations"),
        (snapshot) => {
            toutesLesCotisations = snapshot.exists() ? snapshot.val() : {};
            calculerTableauDeBord();
            afficherListeFiltree();
        },
        (erreur) => {
            console.error("Erreur de chargement des cotisations :", erreur);
            afficherMessage("Impossible de charger les cotisations.", "error");
        }
    );
}

function calculerTableauDeBord() {
    const payees = Object.values(toutesLesCotisations).filter(
        (c) => c.statut === "Payé"
    );

    const somme = (champ) =>
        payees.reduce((t, c) => t + Number(c[champ] || 0), 0);

    if (totalCotisationsElement)
        totalCotisationsElement.textContent = formaterMontant(somme("montant"));
    if (totalParrainsElement)
        totalParrainsElement.textContent = formaterMontant(somme("partParrain"));
    if (totalCommunauteElement)
        totalCommunauteElement.textContent = formaterMontant(somme("partCommunaute"));
    if (nombreMembresPayesElement)
        nombreMembresPayesElement.textContent = new Set(
            payees.map((c) => normaliserMatricule(c.matricule))
        ).size;
}

function classeStatut(statut) {
    switch (String(statut || "").toLowerCase()) {
        case "payé": return "statut-paye";
        case "en attente": return "statut-attente";
        case "retard": return "statut-retard";
        default: return "statut-inconnu";
    }
}

function afficherListeFiltree() {
    if (!listeCotisations) return;

    const recherche = String(rechercheInput?.value || "").trim().toLowerCase();

    let liste = Object.entries(toutesLesCotisations);

    if (filtreActuel !== "Tous") {
        liste = liste.filter(([, c]) => c.statut === filtreActuel);
    }

    if (recherche) {
        liste = liste.filter(([, c]) =>
            [
                c.matricule,
                c.nomMembre,
                formaterPeriode(c.mois, c.annee),
                c.reference
            ].join(" ").toLowerCase().includes(recherche)
        );
    }

    liste.sort((a, b) => Number(b[1].horodatage || 0) - Number(a[1].horodatage || 0));

    if (liste.length === 0) {
        listeCotisations.innerHTML =
            '<p class="aucun-resultat">Aucune cotisation trouvée.</p>';
        return;
    }

    listeCotisations.innerHTML = liste.map(([cle, c]) => `
        <div class="cotisation-item">
            <div class="cotisation-infos">
                <strong>${echapperHTML(c.nomMembre || "Membre")}</strong>
                <p>Matricule : ${echapperHTML(c.matricule)}</p>
                <p>Période : ${echapperHTML(formaterPeriode(c.mois, c.annee))}</p>
                <p>Montant : ${formaterMontant(c.montant)}</p>
                <p>Mode : ${echapperHTML(c.modePaiement || "Non renseigné")}</p>
                ${c.reference ? `<p>Référence : ${echapperHTML(c.reference)}</p>` : ""}
                <span class="${classeStatut(c.statut)}">${echapperHTML(c.statut || "Inconnu")}</span>
            </div>
            <div class="cotisation-actions">
                <button type="button" data-action="modifier" data-id="${echapperHTML(cle)}">Modifier</button>
                <button type="button" data-action="supprimer" data-id="${echapperHTML(cle)}">Supprimer</button>
            </div>
        </div>`
    ).join("");
}

/* ============================================================
   MODE DE PAIEMENT
   ============================================================ */

function obtenirModePaiement() {
    const choix = document.querySelector('input[name="modePaiement"]:checked');
    return choix ? choix.value : "Espèces";
}

function gererModePaiement(mode = null) {
    if (mode) {
        const radio = document.querySelector(
            `input[name="modePaiement"][value="${mode}"]`
        );
        if (radio) radio.checked = true;
    }

    const actuel = obtenirModePaiement();
    const mobile = actuel !== "Espèces";

    if (groupeMobile) groupeMobile.style.display = mobile ? "block" : "none";
    if (groupeReference) groupeReference.style.display = mobile ? "block" : "none";
    if (groupeAPI) groupeAPI.style.display = mobile ? "flex" : "none";
    if (labelOperateur) labelOperateur.textContent = mobile ? actuel : "";

    if (!mobile && numeroMobileInput) numeroMobileInput.value = "";
}

/* ============================================================
   ENREGISTREMENT / MODIFICATION / SUPPRESSION
   ============================================================ */

async function enregistrerCotisation() {
    if (enregistrementEnCours) return;

    if (!adminMatriculeConnecte) {
        afficherMessage("Autorisation administrateur nécessaire.", "error");
        return;
    }

    const matricule = normaliserMatricule(membreSelect?.value);
    const membre = listeMembres.find((m) => m.matricule === matricule);
    const montant = Number(montantInput?.value || 0);

    if (!membre) return afficherMessage("Veuillez sélectionner un membre.", "error");

    if (!Number.isFinite(montant) || montant <= 0)
        return afficherMessage("Veuillez saisir un montant valide.", "error");

    const [anneeTexte, moisTexte] = String(moisInput?.value || "").split("-");
    const annee = Number(anneeTexte);
    const mois = Number(moisTexte);

    if (!Number.isInteger(annee) || !Number.isInteger(mois) || mois < 1 || mois > 12)
        return afficherMessage("Veuillez choisir le mois et l'année de la cotisation.", "error");

    const statut = statutSelect?.value || "En attente";
    const modePaiement = obtenirModePaiement();
    const reference = referenceInput?.value?.trim() || "";

    if (statut === "Payé" && modePaiement !== "Espèces" && !reference)
        return afficherMessage(
            "La référence de transaction est obligatoire pour un paiement mobile.",
            "error"
        );

    if (statut === "Payé" &&
        cotisationPayeeExiste(matricule, mois, annee, cotisationEnModification))
        return afficherMessage(
            "Une cotisation payée existe déjà pour ce membre et ce mois.",
            "error"
        );

    enregistrementEnCours = true;
    if (boutonEnregistrer) boutonEnregistrer.disabled = true;

    try {
        const repartition = calculerRepartition(membre, montant, statut);

        const ancienne = cotisationEnModification
            ? toutesLesCotisations[cotisationEnModification]
            : null;

        const nouvelle = {
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
            await update(ref(db, `cotisations/${id}`), nouvelle);
        } else {
            const nouvelleRef = push(ref(db, "cotisations"));
            id = nouvelleRef.key;
            await set(nouvelleRef, nouvelle);
        }

        await creerJournal(
            ancienne ? "MODIFICATION" : "CREATION",
            id,
            ancienne,
            nouvelle
        );

        const snapshot = await get(ref(db, "cotisations"));
        toutesLesCotisations = snapshot.exists() ? snapshot.val() : {};

        await synchroniserMembre(matricule);

        /* Si la cotisation a changé de membre, resynchroniser l'ancien */
        if (ancienne && normaliserMatricule(ancienne.matricule) !== matricule) {
            await synchroniserMembre(ancienne.matricule);
        }

        await actualiserStatutsCotisations();

        reinitialiserFormulaire();
        afficherMessage("Cotisation enregistrée avec succès.", "success");

    } catch (erreur) {
        console.error("Erreur d'enregistrement :", erreur);
        afficherMessage("Erreur lors de l'enregistrement de la cotisation.", "error");

    } finally {
        enregistrementEnCours = false;
        if (boutonEnregistrer) boutonEnregistrer.disabled = false;
    }
}

function modifierCotisation(id) {
    const c = toutesLesCotisations[id];

    if (!c) return afficherMessage("Cotisation introuvable.", "error");

    cotisationEnModification = id;

    if (membreSelect) {
        membreSelect.value = c.matricule;
        afficherInfosMembre();
    }
    if (montantInput) montantInput.value = c.montant || "";
    if (moisInput) moisInput.value = `${c.annee}-${String(c.mois).padStart(2, "0")}`;
    if (referenceInput) referenceInput.value = c.reference || "";
    if (numeroMobileInput) numeroMobileInput.value = c.numeroMobile || "";
    if (statutSelect) statutSelect.value = c.statut || "En attente";
    if (observationInput) observationInput.value = c.observation || "";

    gererModePaiement(c.modePaiement || "Espèces");

    if (texteEnregistrer) texteEnregistrer.textContent = "Enregistrer les modifications";
    if (boutonAnnuler) boutonAnnuler.style.display = "flex";
    if (titreFormulaire) titreFormulaire.textContent = "Modifier la cotisation";

    afficherMessage("Modification de la cotisation en cours.", "normal");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function supprimerCotisation(id) {
    if (!adminMatriculeConnecte)
        return afficherMessage("Action réservée à l'administration.", "error");

    const c = toutesLesCotisations[id];

    if (!c) return afficherMessage("Cotisation introuvable.", "error");

    if (!confirm(`Supprimer la cotisation de ${c.nomMembre || "ce membre"} (${formaterPeriode(c.mois, c.annee)}) ?`))
        return;

    try {
        await remove(ref(db, `cotisations/${id}`));
        await creerJournal("SUPPRESSION", id, c, null);

        const snapshot = await get(ref(db, "cotisations"));
        toutesLesCotisations = snapshot.exists() ? snapshot.val() : {};

        await synchroniserMembre(c.matricule);
        await actualiserStatutsCotisations();

        if (cotisationEnModification === id) reinitialiserFormulaire();

        afficherMessage("Cotisation supprimée avec succès.", "success");

    } catch (erreur) {
        console.error("Erreur de suppression :", erreur);
        afficherMessage("Impossible de supprimer cette cotisation.", "error");
    }
}

function reinitialiserFormulaire() {
    cotisationEnModification = null;

    if (membreSelect) membreSelect.value = "";
    if (montantInput) montantInput.value = COTISATION_MENSUELLE;
    if (moisInput) moisInput.value = moisCourant();
    if (numeroMobileInput) numeroMobileInput.value = "";
    if (referenceInput) referenceInput.value = "";
    if (observationInput) observationInput.value = "";
    if (statutSelect) statutSelect.value = "Payé";
    if (infoMembre) infoMembre.innerHTML = "";

    if (texteEnregistrer) texteEnregistrer.textContent = "Enregistrer la cotisation";
    if (boutonAnnuler) boutonAnnuler.style.display = "none";
    if (titreFormulaire) titreFormulaire.textContent = "Nouvelle cotisation";

    gererModePaiement("Espèces");
}

/* ============================================================
   DÉCONNEXION
   ============================================================ */

async function deconnecter() {
    try {
        await signOut(auth);
    } catch (erreur) {
        console.error("Erreur de déconnexion :", erreur);
    }

    localStorage.removeItem("matricule");
    window.location.href = "connexion.html";
}

/* ============================================================
   INITIALISATION
   ============================================================ */

async function initialiserCotisations() {
    /* Boutons accessibles même si la vérification échoue */
    boutonDeconnexion?.addEventListener("click", deconnecter);

    const autorise = await verifierAdmin();
    if (!autorise) return;

    chargerMembres();
    chargerCotisations();

    reinitialiserFormulaire();

    membreSelect?.addEventListener("change", afficherInfosMembre);
    boutonEnregistrer?.addEventListener("click", enregistrerCotisation);
    boutonAnnuler?.addEventListener("click", () => {
        reinitialiserFormulaire();
        afficherMessage("Modification annulée.", "normal");
    });
    rechercheInput?.addEventListener("input", afficherListeFiltree);

    document.querySelectorAll('input[name="modePaiement"]').forEach((radio) =>
        radio.addEventListener("change", () => gererModePaiement())
    );

    /* Filtres */
    document.querySelectorAll(".filtre-btn").forEach((bouton) =>
        bouton.addEventListener("click", () => {
            document.querySelectorAll(".filtre-btn")
                .forEach((b) => b.classList.remove("actif"));

            bouton.classList.add("actif");

            const valeur = bouton.dataset.filtre;
            filtreActuel = valeur === "tous" ? "Tous" : valeur;
            afficherListeFiltree();
        })
    );

    /* Boutons Modifier / Supprimer de la liste */
    listeCotisations?.addEventListener("click", (evenement) => {
        const bouton = evenement.target.closest("button[data-action]");
        if (!bouton) return;

        if (bouton.dataset.action === "modifier") modifierCotisation(bouton.dataset.id);
        if (bouton.dataset.action === "supprimer") supprimerCotisation(bouton.dataset.id);
    });
}

initialiserCotisations();
