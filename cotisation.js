// ========================================
// COTISATIONS.JS
// COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    push,
    remove,
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
let listeMembres = [];
let filtreActuel = "tous";
let cotisationEnModification = null;

// ==========================
// ÉLÉMENTS DU DOM
// ==========================
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

// ==========================
// SÉCURITÉ ADMINISTRATEUR
// ==========================
async function verifierAdmin() {
    const matriculeAdmin = localStorage.getItem("matricule");

    if (!matriculeAdmin) {
        window.location.href = "connexion.html";
        return;
    }

    try {
        const adminSnap = await get(ref(db, "membres/" + matriculeAdmin));
        if (!adminSnap.exists()) {
            window.location.href = "connexion.html";
            return;
        }

        const admin = adminSnap.val();
        if ((admin.role || "").toLowerCase() !== "admin") {
            alert("Accès réservé à l'administrateur.");
            window.location.href = "espace.html";
        }
    } catch (e) {
        console.error("Erreur de vérification admin:", e);
    }
}

// ========================================
// CHARGEMENT DES MEMBRES
// ========================================
function chargerMembres() {
    const membresRef = ref(db, "membres");

    onValue(membresRef, (snapshot) => {
        selectMembre.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
        listeMembres = [];

        if (!snapshot.exists()) return;

        snapshot.forEach((item) => {
            const membre = item.val();
            listeMembres.push(membre);

            const option = document.createElement("option");
            option.value = membre.matricule;
            option.textContent = `${membre.nom} (${membre.matricule})`;
            selectMembre.appendChild(option);
        });
    });
}

// Informations sur le membre sélectionné
if (selectMembre) {
    selectMembre.addEventListener("change", () => {
        const matricule = selectMembre.value;
        if (!matricule) {
            infoMembre.innerHTML = "";
            return;
        }

        const membre = listeMembres.find(m => m.matricule === matricule);
        if (!membre) return;

        infoMembre.innerHTML = `
            <div class="carte-info" style="padding:10px; background:#f8fafc; border-radius:10px; margin-top:10px; border:1px solid #e2e8f0; display:flex; gap:12px; align-items:center;">
                <img src="${membre.photo || 'logo.png'}" style="width:45px; height:45px; border-radius:50%; object-fit:cover;" onerror="this.src='logo.png'">
                <div style="font-size:0.85rem;">
                    <h4 style="margin:0; font-weight:bold;">${membre.nom}</h4>
                    <p style="margin:2px 0;"><strong>Matricule :</strong> ${membre.matricule} | <strong>Tél :</strong> ${membre.telephone || '-'}</p>
                    <p style="margin:0; color:#055c3a;"><strong>Parrain :</strong> ${membre.parrain || 'Aucun'}</p>
                </div>
            </div>
        `;
    });
}

// ========================================
// GESTION DES MODES DE PAIEMENT
// ========================================
function ecouterModesPaiement() {
    const radiosMode = document.querySelectorAll('input[name="modePaiement"]');
    radiosMode.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === "Airtel Money" || mode === "MTN Mobile Money") {
                groupeNumero.style.display = "block";
                groupeRef.style.display = "block";
                labelOperateur.textContent = mode;
            } else {
                groupeNumero.style.display = "none";
                groupeRef.style.display = "none";
            }
        });
    });
}

// ========================================
// AFFICHAGE & FILTRAGE DES COTISATIONS
// ========================================
function chargerCotisations() {
    const cotisationsRef = ref(db, "cotisations");

    onValue(cotisationsRef, (snapshot) => {
        toutesLesCotisations = [];

        let totalCotisantsUniques = new Set();
        let totalMontant = 0;
        let totalParrain = 0;
        let totalCommunaute = 0;

        if (snapshot.exists()) {
            snapshot.forEach((item) => {
                const data = item.val();
                data.key = item.key;
                toutesLesCotisations.push(data);

                if (data.statut === "Payé") {
                    totalCotisantsUniques.add(data.matricule);
                    totalMontant += Number(data.montant || 0);
                    totalParrain += Number(data.partParrain || 0);
                    totalCommunaute += Number(data.partCommunaute || 0);
                }
            });
        }

        // Mettre à jour le tableau de bord
        document.getElementById("nbCotisants").innerText = totalCotisantsUniques.size;
        document.getElementById("totalCotisations").innerText = totalMontant.toLocaleString("fr-FR") + " FCFA";
        document.getElementById("totalParrains").innerText = totalParrain.toLocaleString("fr-FR") + " FCFA";
        document.getElementById("totalCommunaute").innerText = totalCommunaute.toLocaleString("fr-FR") + " FCFA";

        afficherListeFiltree();
    });
}

function afficherListeFiltree() {
    const recherche = (rechercheInput ? rechercheInput.value.toLowerCase().trim() : "");
    
    let cotisationsFiltrees = toutesLesCotisations.filter(c => {
        const correspondanceFiltre = (filtreActuel === "tous") || (c.statut === filtreActuel);
        const correspondanceRecherche = (c.nom || "").toLowerCase().includes(recherche) ||
                                         (c.matricule || "").toLowerCase().includes(recherche);
        return correspondanceFiltre && correspondanceRecherche;
    });

    if (cotisationsFiltrees.length === 0) {
        listeCotisationsContainer.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:20px; font-size:0.9rem;">Aucune cotisation trouvée.</p>`;
        return;
    }

    let html = `<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">`;

    cotisationsFiltrees.reverse().forEach(cotis => {
        const badgeColor = cotis.statut === "Payé" ? "#dcfce7; color:#166534;" : 
                           cotis.statut === "En attente" ? "#fef9c3; color:#854d0e;" : "#fee2e2; color:#991b1b;";

        html += `
            <div style="background:#fff; border-radius:12px; padding:12px 15px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div>
                    <strong style="font-size:0.95rem; color:#0f172a;">${cotis.nom || 'Inconnu'}</strong>
                    <span style="font-size:0.75rem; color:#64748b; margin-left:6px;">(${cotis.matricule})</span>
                    <p style="margin:3px 0 0 0; font-size:0.8rem; color:#475569;">
                        <i class="fa-solid fa-calendar-day"></i> ${cotis.mois} - ${cotis.date} | <strong>Mode:</strong> ${cotis.modePaiement}
                    </p>
                    ${cotis.refTransaction ? `<p style="margin:2px 0 0 0; font-size:0.75rem; color:#055c3a;"><strong>Réf:</strong> ${cotis.refTransaction}</p>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1rem; font-weight:bold; color:#055c3a;">${Number(cotis.montant).toLocaleString('fr-FR')} FCFA</div>
                    <span style="display:inline-block; font-size:0.7rem; font-weight:bold; padding:2px 8px; border-radius:20px; background:${badgeColor} margin-top:4px;">${cotis.statut}</span>
                    <div style="margin-top:6px;">
                        <button onclick="window.supprimerCotisation('${cotis.key}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem;" title="Supprimer">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    listeCotisationsContainer.innerHTML = html;
}

// Initialisation des filtres par boutons
document.querySelectorAll(".filtre-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filtre-btn").forEach(b => b.classList.remove("actif"));
        e.target.classList.add("actif");
        filtreActuel = e.target.getAttribute("data-filtre");
        afficherListeFiltree();
    });
});

if (rechercheInput) {
    rechercheInput.addEventListener("input", afficherListeFiltree);
}

// ========================================
// ENREGISTRER UNE COTISATION
// ========================================
window.enregistrerCotisation = async function () {
    const matricule = selectMembre.value;

    if (!matricule) {
        afficherMessage("Veuillez sélectionner un membre.", "erreur");
        return;
    }

    const membre = listeMembres.find(m => m.matricule === matricule);
    if (!membre) {
        afficherMessage("Membre introuvable.", "erreur");
        return;
    }

    const montant = Number(montantInput.value || 2000);
    const mois = moisSelect.value;
    const statut = statutSelect.value;
    const observation = observationInput.value.trim();

    const modePaiementEl = document.querySelector('input[name="modePaiement"]:checked');
    const modePaiement = modePaiementEl ? modePaiementEl.value : "Espèces";

    const numeroMobile = numeroMobileInput.value.trim();
    const refTransaction = refTransactionInput.value.trim();

    // Calcul de la répartition (65% communauté / 35% parrain si applicable)
    let partParrain = 0;
    let partCommunaute = montant;

    if (membre.parrain && montant >= 2000) {
        partParrain = 700;
        partCommunaute = montant - partParrain;
    }

    const dateFormatee = new Date().toLocaleDateString("fr-FR");
    const heureFormatee = new Date().toLocaleTimeString("fr-FR");

    const nouvelleCotisation = {
        matricule: membre.matricule,
        nom: membre.nom,
        parrain: membre.parrain || "",
        montant,
        partParrain,
        partCommunaute,
        mois,
        statut,
        modePaiement,
        numeroMobile,
        refTransaction,
        observation,
        date: dateFormatee,
        heure: heureFormatee,
        horodatage: Date.now()
    };

    try {
        if (cotisationEnModification) {
            await update(ref(db, `cotisations/${cotisationEnModification}`), nouvelleCotisation);
            cotisationEnModification = null;
            btnEnregistrer.innerHTML = `<i class="fa-solid fa-money-bill-wave"></i> Enregistrer`;
            afficherMessage("✅ Cotisation modifiée avec succès !", "succes");
        } else {
            await push(ref(db, "cotisations"), nouvelleCotisation);

            // Mettre à jour la fiche du membre
            const membreRef = ref(db, "membres/" + membre.matricule);
            await update(membreRef, {
                nombreCotisations: (membre.nombreCotisations || 0) + 1,
                derniereCotisation: dateFormatee
            });

            // Créditer le parrain si applicable
            if (membre.parrain && partParrain > 0 && statut === "Payé") {
                const parrainRef = ref(db, "membres/" + membre.parrain);
                const parrainSnap = await get(parrainRef);
                if (parrainSnap.exists()) {
                    const bonusActuel = Number(parrainSnap.val().bonus || 0);
                    await update(parrainRef, { bonus: bonusActuel + partParrain });
                }
            }

            afficherMessage("✅ Cotisation enregistrée avec succès !", "succes");
        }

        reinitialiserFormulaire();
    } catch (e) {
        console.error("Erreur enregistrement:", e);
        afficherMessage("Erreur lors de l'enregistrement.", "erreur");
    }
};

// ========================================
// SUPPRESSION D'UNE COTISATION
// ========================================
window.supprimerCotisation = async function (key) {
    if (!confirm("Voulez-vous vraiment supprimer cette cotisation ?")) return;

    try {
        await remove(ref(db, "cotisations/" + key));
        afficherMessage("✅ Cotisation supprimée.", "succes");
    } catch (erreur) {
        console.error("Erreur suppression:", erreur);
        afficherMessage("Erreur lors de la suppression.", "erreur");
    }
};

// ========================================
// FONCTIONS UTILITAIRES & REINITIALISATION
// ========================================
function reinitialiserFormulaire() {
    selectMembre.value = "";
    infoMembre.innerHTML = "";
    montantInput.value = "2000";
    observationInput.value = "";
    numeroMobileInput.value = "";
    refTransactionInput.value = "";
    groupeNumero.style.display = "none";
    groupeRef.style.display = "none";
    
    const radioEsp = document.querySelector('input[name="modePaiement"][value="Espèces"]');
    if (radioEsp) radioEsp.checked = true;

    cotisationEnModification = null;
    btnEnregistrer.innerHTML = `<i class="fa-solid fa-money-bill-wave"></i> Enregistrer`;
}

if (btnAnnuler) {
    btnAnnuler.addEventListener("click", reinitialiserFormulaire);
}

if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", () => {
        localStorage.removeItem("matricule");
        window.location.href = "connexion.html";
    });
}

function afficherMessage(texte, type) {
    if (!msgRetour) return;
    msgRetour.innerText = texte;
    msgRetour.style.display = "block";
    msgRetour.style.padding = "10px";
    msgRetour.style.borderRadius = "8px";
    msgRetour.style.marginTop = "10px";
    msgRetour.style.fontWeight = "bold";
    msgRetour.style.textAlign = "center";

    if (type === "succes") {
        msgRetour.style.background = "#dcfce7";
        msgRetour.style.color = "#15803d";
    } else {
        msgRetour.style.background = "#fee2e2";
        msgRetour.style.color = "#b91c1c";
    }

    setTimeout(() => {
        msgRetour.style.display = "none";
    }, 4000);
}

// ========================================
// INITIALISATION AU CHARGEMENT
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    verifierAdmin();
    chargerMembres();
    chargerCotisations();
    ecouterModesPaiement();
});
    
