// ===========================
// FIREBASE
// ===========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

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

let membreEnCours = null;
let tousLesMembres = [];

// ===========================
// SECURITE ADMIN
// ===========================

const matriculeAdmin = localStorage.getItem("matricule");

if (!matriculeAdmin) {

    window.location.href = "connexion.html";

}

const adminRef = ref(db, "membres/" + matriculeAdmin);

get(adminRef).then((snapshot) => {

    if (!snapshot.exists()) {

        window.location.href = "connexion.html";
        return;

    }

    const admin = snapshot.val();

    if ((membre.role || "").toLowerCase() !== "admin") {

        alert("Accès réservé à l'administrateur.");

        window.location.href = "espace.html";

        return;

    }

});

// ===========================
// VARIABLES
// ===========================

const liste = document.getElementById("listeMembres");

tousLesMembres = [];

// ===========================
// AJOUTER UN MEMBRE
// ===========================

window.ajouterMembre = async function () {

    const matricule = document.getElementById("matricule").value.trim();
    const nom = document.getElementById("nom").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const motdepasse = document.getElementById("motdepasse").value.trim();
    const statut = document.getElementById("statut").value;

    if (!matricule || !nom || !telephone || !motdepasse) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const donnees = {
        matricule,
        nom,
        telephone,
        motdepasse,
        statut,
        profession: "",
        adresse: "",
        parrain: "",
        dateadhesion: new Date().toLocaleDateString("fr-FR")
    };

    if (membreEnCours) {

        await update(ref(db, "membres/" + membreEnCours), donnees);

        alert("✅ Membre modifié avec succès.");

        membreEnCours = null;

    } else {

        await set(ref(db, "membres/" + matricule), donnees);

        alert("✅ Membre ajouté avec succès.");
    }

    document.getElementById("matricule").value = "";
    document.getElementById("nom").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("motdepasse").value = "";
    document.getElementById("statut").value = "Actif";
};

// ===========================
// CHARGER LA LISTE DES MEMBRES
// ===========================

function chargerMembres() {

    const membresRef = ref(db, "membres");

    onValue(membresRef, (snapshot) => {

        listeMembres.innerHTML = "";

        if (!snapshot.exists()) {

            listeMembres.innerHTML =
            "<p>Aucun membre enregistré.</p>";

            return;

        }

        snapshot.forEach((data) => {

            const membre = data.val();

            const carte = document.createElement("div");

            carte.className = "member-card";

            carte.innerHTML = `

            <div class="member-left">

                <img src="${membre.photo || 'logo.png'}"
                class="member-photo">

            </div>

            <div class="member-right">

                <h3>${membre.nom}</h3>

                <p><strong>Matricule :</strong> ${membre.matricule}</p>

                <p><strong>Téléphone :</strong> ${membre.telephone}</p>

                <p><strong>Statut :</strong> ${membre.statut}</p>

                <div style="margin-top:15px;display:flex;gap:10px;">

                    <button onclick="modifierMembre('${membre.matricule}')">

                        ✏️ Modifier

                    </button>

                    <button
                    style="background:#e53935;color:white;"
                    onclick="supprimerMembre('${membre.matricule}')">

                        🗑️ Supprimer

                    </button>

                </div>

            </div>

            `;

            listeMembres.appendChild(carte);

        });

    });

}

chargerMembres();

// ===========================
// MODIFIER UN MEMBRE
// ===========================

window.modifierMembre = async function(matricule){

    const membreRef = ref(db, "membres/" + matricule);

    const snapshot = await get(membreRef);

    if(!snapshot.exists()){

        alert("Membre introuvable.");

        return;

    }

    const membre = snapshot.val();

    document.getElementById("matricule").value = membre.matricule;
    document.getElementById("nom").value = membre.nom;
    document.getElementById("telephone").value = membre.telephone;
    document.getElementById("motdepasse").value = membre.motdepasse;
    document.getElementById("statut").value = membre.statut;

    const bouton = document.querySelector("button");

    bouton.innerHTML = "💾 Enregistrer les modifications";

    bouton.onclick = async function(){

        await update(ref(db,"membres/" + matricule),{

            nom: document.getElementById("nom").value.trim(),
            telephone: document.getElementById("telephone").value.trim(),
            motdepasse: document.getElementById("motdepasse").value.trim(),
            statut: document.getElementById("statut").value

        });

        alert("✅ Membre modifié avec succès.");

        location.reload();

    };

};
// ===========================
// SUPPRIMER UN MEMBRE
// ===========================

window.supprimerMembre = async function(matricule){

    if(!confirm("Voulez-vous vraiment supprimer ce membre ?")){

        return;

    }

    try{

        await remove(ref(db,"membres/" + matricule));

        alert("✅ Membre supprimé avec succès.");

    }catch(error){

        console.error(error);

        alert("Erreur lors de la suppression.");

    }

};

// ===========================
// AFFICHER LA LISTE DES MEMBRES
// ===========================

const listeRef = ref(db, "membres");

onValue(listeRef, (snapshot) => {

    const liste = document.getElementById("listeMembres");

    liste.innerHTML = "";

    let total = 0;

    snapshot.forEach((item) => {

        total++;

        const membre = item.val();
        
        tousLesMembres.push(membre);
        
        liste.innerHTML += `

        <div class="member-card">

            <h3>${membre.nom}</h3>

            <p><b>Matricule :</b> ${membre.matricule}</p>

            <p><b>Téléphone :</b> ${membre.telephone}</p>

            <p><b>Statut :</b> ${membre.statut}</p>

            <div style="margin-top:15px;display:flex;gap:10px;">

                <button onclick="modifierMembre('${membre.matricule}')">

                    ✏️ Modifier

                </button>

                <button onclick="supprimerMembre('${membre.matricule}')"
                style="background:#d32f2f;">

                    🗑️ Supprimer

                </button>

            </div>

        </div>

        `;

    });

    document.getElementById("nbMembres").innerText = total;
    document.getElementById("statTotal").innerText = total;

});

window.modifierMembre = async function (matricule) {

    const membreRef = ref(db, "membres/" + matricule);

    const snapshot = await get(membreRef);

    if (!snapshot.exists()) {
        alert("Membre introuvable.");
        return;
    }

    const membre = snapshot.val();

    membreEnCours = matricule;

    document.getElementById("matricule").value = membre.matricule || "";
    document.getElementById("nom").value = membre.nom || "";
    document.getElementById("telephone").value = membre.telephone || "";
    document.getElementById("motdepasse").value = membre.motdepasse || "";
    document.getElementById("statut").value = membre.statut || "Actif";

    document.getElementById("nom").scrollIntoView({
        behavior: "smooth"
    });
};

// ===========================
// RECHERCHE MEMBRE
// ===========================

document.getElementById("recherche").addEventListener("input", function () {

    const texte = this.value.toLowerCase();

    const cartes = document.querySelectorAll(".member-card");

    cartes.forEach(carte => {

        if (carte.innerText.toLowerCase().includes(texte)) {

            carte.style.display = "block";

        } else {

            carte.style.display = "none";

        }

    });

});
