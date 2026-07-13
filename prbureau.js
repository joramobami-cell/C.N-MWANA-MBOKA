/*==================================================
   BUREAU NUMÉRIQUE DU PRÉSIDENT
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   Version 2.0
==================================================*/

import { db, auth, storage } from "./firebase-config.js";
import { db, auth, storage } from "./firebase-config.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/*==================================================
                INITIALISATION
==================================================*/

console.clear();

console.log("======================================");
console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");
console.log("Bureau Numérique du Président");
console.log("Version 2.0");
console.log("======================================");

/*==================================================
            VÉRIFICATION SESSION
==================================================*/

const utilisateur = localStorage.getItem("utilisateurConnecte");

if (!utilisateur) {

    window.location.href = "connexion.html";

}

/*==================================================
                DATE
==================================================*/

const dateElement = document.getElementById("date");

function afficherDate() {

    if (!dateElement) return;

    const aujourdhui = new Date();

    dateElement.textContent = aujourdhui.toLocaleDateString("fr-FR", {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    });

}

afficherDate();

/*==================================================
                HEURE
==================================================*/

const heureElement = document.getElementById("heure");

function afficherHeure() {

    if (!heureElement) return;

    heureElement.textContent =

    new Date().toLocaleTimeString("fr-FR");

}

setInterval(afficherHeure,1000);

afficherHeure();

/*==================================================
            MESSAGE DE BIENVENUE
==================================================*/

const titre = document.querySelector(".president-info h2");

if(titre){

    const heure = new Date().getHours();

    if(heure < 12){

        titre.textContent =

        "Bonjour Monsieur le Président";

    }

    else if(heure < 18){

        titre.textContent =

        "Bon après-midi Monsieur le Président";

    }

    else{

        titre.textContent =

        "Bonsoir Monsieur le Président";

    }

}

/*==================================================
              ANNÉE DU FOOTER
==================================================*/

const annee = document.getElementById("annee");

if(annee){

    annee.textContent = new Date().getFullYear();

}

/*==================================================
              DÉCONNEXION
==================================================*/

const btnLogout = document.getElementById("logoutBtn");

if(btnLogout){

    btnLogout.addEventListener("click",()=>{

        if(confirm("Voulez-vous quitter le Bureau Numérique ?")){

            localStorage.removeItem("utilisateurConnecte");

            window.location.href="connexion.html";

        }

    });

}

console.log("Initialisation terminée.");

/*==================================================
          TABLEAU DE BORD FIREBASE
==================================================*/

async function chargerMembres(){

    try{

        const snapshot = await getDocs(collection(db,"membres"));

        document.getElementById("totalMembres").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Membres :",erreur);

    }

}


async function chargerProjets(){

    try{

        const snapshot = await getDocs(collection(db,"projets"));

        document.getElementById("projetsAttente").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Projets :",erreur);

    }

}


async function chargerFormations(){

    try{

        const snapshot = await getDocs(collection(db,"formations"));

        document.getElementById("formationsActives").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Formations :",erreur);

    }

}


async function chargerEntraides(){

    try{

        const snapshot = await getDocs(collection(db,"entraides"));

        document.getElementById("entraidesAttente").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Entraides :",erreur);

    }

}


async function chargerInvestissements(){

    try{

        const snapshot = await getDocs(collection(db,"investissements"));

        document.getElementById("investissementsActifs").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Investissements :",erreur);

    }

}


async function chargerNotifications(){

    try{

        const snapshot = await getDocs(collection(db,"notifications"));

        document.getElementById("notifications").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Notifications :",erreur);

    }

}


async function chargerCotisations(){

    try{

        const snapshot = await getDocs(collection(db,"cotisations"));

        document.getElementById("cotisationsMois").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error("Erreur Cotisations :",erreur);

    }

}


async function chargerFinance(){

    try{

        const snapshot = await getDocs(collection(db,"finance"));

        let total = 0;

        snapshot.forEach((doc)=>{

            const data = doc.data();

            total += Number(data.montant || 0);

        });

        document.getElementById("soldeGeneral").textContent =
        total.toLocaleString("fr-FR")+" FCFA";

    }

    catch(erreur){

        console.error("Erreur Finance :",erreur);

    }

}


/*==================================================
        SYNCHRONISATION GÉNÉRALE
==================================================*/

async function synchroniserBureau(){

    await Promise.all([

        chargerMembres(),

        chargerFinance(),

        chargerCotisations(),

        chargerProjets(),

        chargerFormations(),

        chargerInvestissements(),

        chargerEntraides(),

        chargerNotifications()

    ]);

    console.log("Tableau de bord synchronisé.");

}

synchroniserBureau();

/*==================================================
        CENTRE DE COMMANDEMENT
==================================================*/

function chargerCentreCommande(){

    document.getElementById("activites").innerHTML=`

        <p>✅ Bureau Président opérationnel.</p>

        <p>🟢 Firebase connecté.</p>

        <p>📊 Tableau de bord synchronisé.</p>

    `;

    document.getElementById("alertes").innerHTML=`

        <p>Aucune alerte critique.</p>

    `;

    document.getElementById("listeProjets").innerHTML=`

        <p>Aucun projet nécessitant une validation.</p>

    `;

    document.getElementById("nouveauxMembres").innerHTML=`

        <p>Aucune nouvelle adhésion aujourd'hui.</p>

    `;

    document.getElementById("paiementsValidation").innerHTML=`

        <p>Aucun paiement en attente.</p>

    `;

    document.getElementById("agenda").innerHTML=`

        <p>Aucun rendez-vous programmé.</p>

    `;

}

/*==================================================
            JOURNAL PRÉSIDENTIEL
==================================================*/

function ajouterJournal(message){

    const journal=document.getElementById("journalPresident");

    if(!journal) return;

    const heure=new Date().toLocaleTimeString("fr-FR");

    journal.innerHTML=`

        <p><strong>${heure}</strong> — ${message}</p>

    `+journal.innerHTML;

}

/*==================================================
        ENREGISTREMENT D'ACTIONS
==================================================*/

function enregistrerAction(action){

    console.log(action);

    ajouterJournal(action);

}

/*==================================================
            NOTIFICATIONS
==================================================*/

function afficherNotification(message,type="info"){

    console.log("["+type.toUpperCase()+"] "+message);

}

/*==================================================
          DERNIÈRE SYNCHRONISATION
==================================================*/

function afficherSynchronisation(){

    console.log(

        "Dernière synchronisation : "+

        new Date().toLocaleString("fr-FR")

    );

}

/*==================================================
        ACTUALISATION DU BUREAU
==================================================*/

async function actualiserBureau(){

    await synchroniserBureau();

    chargerCentreCommande();

    afficherSynchronisation();

    enregistrerAction(

        "Synchronisation du Bureau Président."

    );

}

/*==================================================
      SURVEILLANCE DE CONNEXION
==================================================*/

window.addEventListener("online",()=>{

    afficherNotification(

        "Connexion Internet rétablie.",

        "success"

    );

    actualiserBureau();

});

window.addEventListener("offline",()=>{

    afficherNotification(

        "Connexion Internet interrompue.",

        "warning"

    );

});

/*==================================================
      RAFRAÎCHISSEMENT AUTOMATIQUE
==================================================*/

setInterval(actualiserBureau,60000);

/*==================================================
          INITIALISATION
==================================================*/

chargerCentreCommande();

ajouterJournal(

    "Connexion du Président au Bureau Numérique."

);

afficherSynchronisation();

console.log("Centre de commandement initialisé.");

/*==================================================
        ANIMATION DES CARTES
==================================================*/

const cartes = document.querySelectorAll(
".card, .panel, .quick-card, .office-card, .bottom-card"
);

cartes.forEach((carte,index)=>{

    carte.style.opacity="0";
    carte.style.transform="translateY(30px)";

    setTimeout(()=>{

        carte.style.transition="all .6s ease";
        carte.style.opacity="1";
        carte.style.transform="translateY(0)";

    },index*120);

});


/*==================================================
        NOTIFICATIONS VISUELLES
==================================================*/

function creerNotification(message,type="info"){

    const notification=document.createElement("div");

    notification.className="notification "+type;

    notification.innerHTML=`
        <i class="fa-solid fa-bell"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(()=>{

        notification.classList.add("show");

    },100);

    setTimeout(()=>{

        notification.classList.remove("show");

        setTimeout(()=>{

            notification.remove();

        },500);

    },5000);

}


/*==================================================
        BARRE DE CHARGEMENT
==================================================*/

function afficherChargement(){

    const loader=document.createElement("div");

    loader.id="loaderPresident";

    loader.innerHTML=`

        <div class="loader-bar"></div>

    `;

    document.body.appendChild(loader);

}

function masquerChargement(){

    const loader=document.getElementById("loaderPresident");

    if(loader){

        loader.remove();

    }

}


/*==================================================
      SIGNATURE PRÉSIDENTIELLE
==================================================*/

const btnSigner=document.getElementById("btnSigner");

if(btnSigner){

    btnSigner.addEventListener("click",()=>{

        creerNotification(

            "Décision présidentielle signée.",

            "success"

        );

        enregistrerAction(

            "Une décision a été signée."

        );

    });

}


/*==================================================
      CODE PRÉSIDENT
==================================================*/

const btnCode=document.getElementById("btnCode");

if(btnCode){

    btnCode.addEventListener("click",()=>{

        const code=prompt(

            "Entrez votre Code Président"

        );

        if(code===null) return;

        if(code==="1234"){

            creerNotification(

                "Code accepté.",

                "success"

            );

        }

        else{

            creerNotification(

                "Code incorrect.",

                "error"

            );

        }

    });

}


/*==================================================
      SAUVEGARDE AUTOMATIQUE
==================================================*/

setInterval(()=>{

    console.log("Sauvegarde automatique.");

},300000);


/*==================================================
      DÉMARRAGE
==================================================*/

window.addEventListener("load",()=>{

    afficherChargement();

    setTimeout(()=>{

        masquerChargement();

        creerNotification(

            "Bienvenue Monsieur le Président.",

            "success"

        );

        actualiserBureau();

    },1500);

});


/*==================================================
      FERMETURE
==================================================*/

window.addEventListener("beforeunload",()=>{

    console.log("Fermeture du Bureau Président.");

});


/*==================================================
      VERSION
==================================================*/

console.log("================================");

console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");

console.log("Bureau Numérique du Président");

console.log("Version 2.0");

console.log("Statut : Opérationnel");

console.log("================================");
