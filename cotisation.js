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
// CHARGER LES MEMBRES
// ========================================

const selectMembre = document.getElementById("membre");

function chargerMembres() {

    onValue(ref(db, "membres"), (snapshot) => {

        selectMembre.innerHTML =
        '<option value="">Sélectionner un membre</option>';

        snapshot.forEach((item) => {

            const membre = item.val();

            selectMembre.innerHTML += `
            <option value="${membre.matricule}">
                ${membre.nom} (${membre.matricule})
            </option>
            `;

        });

    });

}

// ========================================
// ENREGISTRER UNE COTISATION
// ========================================

window.enregistrerCotisation = async function () {

    const matricule = selectMembre.value;

    const montant = Number(document.getElementById("montant").value);

    const date = document.getElementById("date").value;

    const statut = document.getElementById("statut").value;

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

    const cotisation = {

        matricule: membre.matricule,
        nom: membre.nom,
        montant: montant,
        parrain: 700,
        communaute: 1300,
        date: date,
        statut: statut,
        mois: new Date().toLocaleString("fr-FR", {
            month: "long",
            year: "numeric"
        })

    };

    await set(
        push(ref(db, "cotisations")),
        cotisation
    );

    alert("✅ Cotisation enregistrée.");

    document.getElementById("montant").value = 2000;

};

// ========================================
// AFFICHER LES COTISATIONS
// ========================================

function chargerCotisations() {

    const liste = document.getElementById("listeCotisations");

    onValue(ref(db, "cotisations"), (snapshot) => {

        liste.innerHTML = "";

        let total = 0;
        let totalParrain = 0;
        let totalCommunaute = 0;
        let nbCotisants = 0;

        snapshot.forEach((item) => {

            const c = item.val();

            total += Number(c.montant);
            totalParrain += Number(c.parrain);
            totalCommunaute += Number(c.communaute);
            nbCotisants++;

            liste.innerHTML += `

            <div class="carte-cotisation">

                <h3>${c.nom}</h3>

                <p><b>Matricule :</b> ${c.matricule}</p>

                <p><b>Montant :</b> ${c.montant} FCFA</p>

                <p><b>Date :</b> ${c.date}</p>

                <p><b>Mois :</b> ${c.mois}</p>

                <p>
                    <span class="${c.statut==="Payé" ? "badge-paye":"badge-attente"}">
                        ${c.statut}
                    </span>
                </p>

            </div>

            `;

        });

        document.getElementById("nbCotisants").innerText = nbCotisants;
        document.getElementById("totalCotisations").innerText = total + " FCFA";
        document.getElementById("totalParrains").innerText = totalParrain + " FCFA";
        document.getElementById("totalCommunaute").innerText = totalCommunaute + " FCFA";

    });

}

// ========================================
// INITIALISATION
// ========================================

chargerMembres();

chargerCotisations();

console.log("✅ Cotisations.js chargé.");
