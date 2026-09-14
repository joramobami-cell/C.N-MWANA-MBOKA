// ========================================
// COTISATIONS.JS
// COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// VERSION CORRIGÉE
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    push,
    remove,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";


// ========================================
// CONFIGURATION FIREBASE
// ========================================

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


// ========================================
// VARIABLES GLOBALES
// ========================================

let toutesLesCotisations = [];
let listeMembres = [];
let filtreActuel = "tous";
let cotisationEnModification = null;


// ========================================
// ÉLÉMENTS DU DOM
// ========================================

const selectMembre = document.getElementById("membre");
const infoMembre = document.getElementById("infoMembre");
const montantInput = document.getElementById("montant");
const moisSelect = document.getElementById("moisCotisation");
const statutSelect = document.getElementById("statut");
const observationInput = document.getElementById("observation");

const groupeNumero = document.getElementById("groupeNumero");
const groupeRef = document.getElementById("groupeRef");
const labelOperateur = document.getElementById("labelOperateur");

const numeroMobileInput = document.getElementById("numeroMobile");
const refTransactionInput = document.getElementById("refTransaction");

const btnEnregistrer = document.getElementById("btnEnregistrer");
const btnAnnuler = document.getElementById("btnAnnuler");
const btnDeconnexion = document.getElementById("btnDeconnexion");

const msgRetour = document.getElementById("msgRetour");
const rechercheInput = document.getElementById("recherche");
const listeCotisationsContainer = document.getElementById("listeCotisations");


// ========================================
// SÉCURITÉ ADMINISTRATEUR
// ========================================

async function verifierAdmin() {

    const matriculeAdmin = localStorage.getItem("matricule");

    if (!matriculeAdmin) {
        window.location.href = "connexion.html";
        return false;
    }

    try {

        const adminRef = ref(
            db,
            "membres/" + matriculeAdmin
        );

        const adminSnap = await get(adminRef);

        if (!adminSnap.exists()) {

            localStorage.removeItem("matricule");

            window.location.href = "connexion.html";

            return false;
        }

        const admin = adminSnap.val();

        if (
            String(admin.role || "").toLowerCase() !== "admin"
        ) {

            alert(
                "Accès réservé à l'administrateur."
            );

            window.location.href = "espace.html";

            return false;
        }

        return true;

    } catch (erreur) {

        console.error(
            "Erreur de vérification administrateur :",
            erreur
        );

        afficherMessage(
            "Impossible de vérifier les droits administrateur.",
            "erreur"
        );

        return false;
    }
}


// ========================================
// CHARGEMENT DES MEMBRES
// ========================================

function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(
        membresRef,
        (snapshot) => {

            if (!selectMembre) return;

            selectMembre.innerHTML =
                '<option value="">-- Sélectionner un membre --</option>';

            listeMembres = [];

            if (!snapshot.exists()) {
                return;
            }

            snapshot.forEach((item) => {

                const membre = item.val();

                if (!membre) return;

                /*
                 * On récupère toujours le matricule depuis
                 * la donnée ou, à défaut, depuis la clé Firebase.
                 */

                const matricule =
                    membre.matricule || item.key;

                membre.matricule = matricule;

                listeMembres.push(membre);

                const option =
                    document.createElement("option");

                option.value = matricule;

                option.textContent =
                    `${membre.nom || "Membre"} (${matricule})`;

                selectMembre.appendChild(option);
            });
        },
        (erreur) => {

            console.error(
                "Erreur chargement membres :",
                erreur
            );

            afficherMessage(
                "Impossible de charger les membres.",
                "erreur"
            );
        }
    );
}


// ========================================
// INFORMATIONS DU MEMBRE
// ========================================

if (selectMembre) {

    selectMembre.addEventListener(
        "change",
        () => {

            const matricule =
                selectMembre.value;

            if (!matricule) {

                infoMembre.innerHTML = "";

                return;
            }

            const membre =
                listeMembres.find(
                    m => m.matricule === matricule
                );

            if (!membre) {

                infoMembre.innerHTML = "";

                return;
            }

            const photo =
                membre.photo || "logo.png";

            infoMembre.innerHTML = `
                <div
                    class="carte-info"
                    style="
                        padding:10px;
                        background:#f8fafc;
                        border-radius:10px;
                        margin-top:10px;
                        border:1px solid #e2e8f0;
                        display:flex;
                        gap:12px;
                        align-items:center;
                    "
                >

                    <img
                        src="${photo}"
                        alt="Photo du membre"
                        style="
                            width:45px;
                            height:45px;
                            border-radius:50%;
                            object-fit:cover;
                        "
                        onerror="this.src='logo.png'"
                    >

                    <div style="font-size:0.85rem;">

                        <h4
                            style="
                                margin:0;
                                font-weight:bold;
                            "
                        >
                            ${membre.nom || "Membre"}
                        </h4>

                        <p style="margin:2px 0;">

                            <strong>Matricule :</strong>
                            ${membre.matricule}

                            |

                            <strong>Tél :</strong>
                            ${membre.telephone || "-"}

                        </p>

                        <p
                            style="
                                margin:0;
                                color:#055c3a;
                            "
                        >
                            <strong>Parrain :</strong>
                            ${membre.parrain || "Aucun"}
                        </p>

                    </div>

                </div>
            `;
        }
    );
}


// ========================================
// GESTION DES MODES DE PAIEMENT
// ========================================

function ecouterModesPaiement() {

    const radiosMode =
        document.querySelectorAll(
            'input[name="modePaiement"]'
        );

    radiosMode.forEach(
        radio => {

            radio.addEventListener(
                "change",
                (event) => {

                    const mode =
                        event.target.value;

                    const paiementMobile =
                        mode === "Airtel Money" ||
                        mode === "MTN Mobile Money";

                    if (paiementMobile) {

                        if (groupeNumero) {
                            groupeNumero.style.display =
                                "block";
                        }

                        if (groupeRef) {
                            groupeRef.style.display =
                                "block";
                        }

                        const zoneAPI =
                            document.getElementById(
                                "zonePaiementAPI"
                            );

                        if (zoneAPI) {
                            zoneAPI.style.display =
                                "flex";
                        }

                        if (labelOperateur) {

                            labelOperateur.textContent =
                                mode;
                        }

                        if (numeroMobileInput) {

                            numeroMobileInput.placeholder =
                                "06 XXX XX XX";
                        }

                    } else {

                        if (groupeNumero) {
                            groupeNumero.style.display =
                                "none";
                        }

                        if (groupeRef) {
                            groupeRef.style.display =
                                "none";
                        }

                        const zoneAPI =
                            document.getElementById(
                                "zonePaiementAPI"
                            );

                        if (zoneAPI) {
                            zoneAPI.style.display =
                                "none";
                        }

                        if (labelOperateur) {
                            labelOperateur.textContent =
                                "";
                        }

                        if (numeroMobileInput) {
                            numeroMobileInput.value =
                                "";
                        }

                        if (refTransactionInput) {
                            refTransactionInput.value =
                                "";
                        }
                    }
                }
            );
        }
    );
}


// ========================================
// CHARGEMENT DES COTISATIONS
// ========================================

function chargerCotisations() {

    const cotisationsRef =
        ref(db, "cotisations");

    onValue(
        cotisationsRef,
        (snapshot) => {

            toutesLesCotisations = [];

            const cotisantsPayes =
                new Set();

            let totalMontant = 0;
            let totalParrain = 0;
            let totalCommunaute = 0;

            if (snapshot.exists()) {

                snapshot.forEach(
                    item => {

                        const data =
                            item.val();

                        if (!data) return;

                        data.key =
                            item.key;

                        toutesLesCotisations.push(
                            data
                        );

                        /*
                         * Seules les cotisations PAYÉES
                         * entrent dans les totaux financiers.
                         */

                        if (data.statut === "Payé") {

                            if (data.matricule) {

                                cotisantsPayes.add(
                                    data.matricule
                                );
                            }

                            totalMontant +=
                                Number(
                                    data.montant || 0
                                );

                            totalParrain +=
                                Number(
                                    data.partParrain || 0
                                );

                            totalCommunaute +=
                                Number(
                                    data.partCommunaute || 0
                                );
                        }
                    }
                );
            }

            const nbCotisants =
                document.getElementById(
                    "nbCotisants"
                );

            const totalCotisations =
                document.getElementById(
                    "totalCotisations"
                );

            const totalParrains =
                document.getElementById(
                    "totalParrains"
                );

            const totalCommunauteElement =
                document.getElementById(
                    "totalCommunaute"
                );

            if (nbCotisants) {

                nbCotisants.innerText =
                    cotisantsPayes.size;
            }

            if (totalCotisations) {

                totalCotisations.innerText =
                    totalMontant.toLocaleString(
                        "fr-FR"
                    ) + " FCFA";
            }

            if (totalParrains) {

                totalParrains.innerText =
                    totalParrain.toLocaleString(
                        "fr-FR"
                    ) + " FCFA";
            }

            if (totalCommunauteElement) {

                totalCommunauteElement.innerText =
                    totalCommunaute.toLocaleString(
                        "fr-FR"
                    ) + " FCFA";
            }

            afficherListeFiltree();
        },
        (erreur) => {

            console.error(
                "Erreur chargement cotisations :",
                erreur
            );

            afficherMessage(
                "Impossible de charger les cotisations.",
                "erreur"
            );
        }
    );
}


// ========================================
// VÉRIFICATION DOUBLON
// ========================================

function cotisationExisteDeja(
    matricule,
    mois,
    cleIgnoree = null
) {

    return toutesLesCotisations.some(
        cotis => {

            if (
                cleIgnoree &&
                cotis.key === cleIgnoree
            ) {
                return false;
            }

            return (
                cotis.matricule === matricule &&
                cotis.mois === mois &&
                cotis.statut === "Payé"
            );
        }
    );
}


// ========================================
// AFFICHAGE DE L'HISTORIQUE
// ========================================

function afficherListeFiltree() {

    if (!listeCotisationsContainer) {
        return;
    }

    const recherche =
        rechercheInput
            ? rechercheInput.value
                .toLowerCase()
                .trim()
            : "";

    let cotisationsFiltrees =
        toutesLesCotisations.filter(
            cotis => {

                const correspondanceFiltre =
                    filtreActuel === "tous" ||
                    cotis.statut === filtreActuel;

                const nom =
                    String(
                        cotis.nom || ""
                    ).toLowerCase();

                const matricule =
                    String(
                        cotis.matricule || ""
                    ).toLowerCase();

                const correspondanceRecherche =
                    nom.includes(recherche) ||
                    matricule.includes(recherche);

                return (
                    correspondanceFiltre &&
                    correspondanceRecherche
                );
            }
        );

    if (cotisationsFiltrees.length === 0) {

        listeCotisationsContainer.innerHTML = `
            <p
                style="
                    text-align:center;
                    color:#94a3b8;
                    padding:20px;
                    font-size:0.9rem;
                "
            >
                Aucune cotisation trouvée.
            </p>
        `;

        return;
    }

    /*
     * On ne fait pas reverse() directement sur
     * toutesLesCotisations.
     */

    cotisationsFiltrees =
        [...cotisationsFiltrees].sort(
            (a, b) =>
                Number(
                    b.horodatage || 0
                ) -
                Number(
                    a.horodatage || 0
                )
        );

    let html = `
        <div
            style="
                display:flex;
                flex-direction:column;
                gap:10px;
                margin-top:10px;
            "
        >
    `;

    cotisationsFiltrees.forEach(
        cotis => {

            let badgeBackground =
                "#fee2e2";

            let badgeText =
                "#991b1b";

            if (cotis.statut === "Payé") {

                badgeBackground =
                    "#dcfce7";

                badgeText =
                    "#166534";

            } else if (
                cotis.statut === "En attente"
            ) {

                badgeBackground =
                    "#fef9c3";

                badgeText =
                    "#854d0e";
            }

            html += `
                <div
                    style="
                        background:#fff;
                        border-radius:12px;
                        padding:12px 15px;
                        border:1px solid #e2e8f0;
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        box-shadow:
                            0 1px 3px
                            rgba(0,0,0,0.05);
                        gap:15px;
                    "
                >

                    <div>

                        <strong
                            style="
                                font-size:0.95rem;
                                color:#0f172a;
                            "
                        >
                            ${cotis.nom || "Inconnu"}
                        </strong>

                        <span
                            style="
                                font-size:0.75rem;
                                color:#64748b;
                                margin-left:6px;
                            "
                        >
                            (${cotis.matricule || "-"})
                        </span>

                        <p
                            style="
                                margin:3px 0 0 0;
                                font-size:0.8rem;
                                color:#475569;
                            "
                        >
                            <i
                                class="fa-solid fa-calendar-day"
                            ></i>

                            ${cotis.mois || "-"}

                            -

                            ${cotis.date || "-"}

                            |

                            <strong>Mode :</strong>

                            ${cotis.modePaiement || "-"}
                        </p>

                        ${
                            cotis.refTransaction
                                ? `
                                    <p
 
