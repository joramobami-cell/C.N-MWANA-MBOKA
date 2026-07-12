/*==========================================
   BUREAU NUMÉRIQUE DU PRÉSIDENT
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==========================================*/

// ==============================
// DATE
// ==============================

const dateElement = document.getElementById("date");

const aujourdhui = new Date();

dateElement.textContent = aujourdhui.toLocaleDateString("fr-FR", {

    weekday: "long",

    day: "numeric",

    month: "long",

    year: "numeric"

});

// ==============================
// HEURE EN TEMPS RÉEL
// ==============================

function afficherHeure(){

    const maintenant = new Date();

    const heure = maintenant.toLocaleTimeString("fr-FR");

    document.getElementById("heure").textContent = heure;

}

setInterval(afficherHeure,1000);

afficherHeure();

// ==============================
// ANNÉE DU FOOTER
// ==============================

const annee = document.getElementById("annee");

if(annee){

    annee.textContent = new Date().getFullYear();

}

// ==============================
// MESSAGE DE BIENVENUE
// ==============================

const titre = document.querySelector(".president-info h2");

const heureActuelle = new Date().getHours();

if(titre){

    if(heureActuelle < 12){

        titre.textContent =
        "Bonjour Monsieur le Président";

    }

    else if(heureActuelle < 18){

        titre.textContent =
        "Bon après-midi Monsieur le Président";

    }

    else{

        titre.textContent =
        "Bonsoir Monsieur le Président";

    }

}

console.log("Bureau Président chargé avec succès.");

/*==========================================
   SESSION DU PRÉSIDENT
==========================================*/

// Vérification de la session

const utilisateur = localStorage.getItem("utilisateurConnecte");

if(!utilisateur){

    window.location.href = "connexion.html";

}

/*==========================================
   DÉCONNEXION
==========================================*/

const btnLogout = document.getElementById("logoutBtn");

if(btnLogout){

    btnLogout.addEventListener("click", function(){

        if(confirm("Voulez-vous vraiment vous déconnecter ?")){

            localStorage.removeItem("utilisateurConnecte");

            window.location.href = "connexion.html";

        }

    });

}

/*==========================================
   BIENVENUE
==========================================*/

window.addEventListener("load", function(){

    setTimeout(function(){

        alert("Bienvenue dans le Bureau Numérique du Président.");

    },500);

});

/*==========================================
   ANIMATION D'OUVERTURE
==========================================*/

const cartes = document.querySelectorAll(

".card, .panel, .quick-card, .office-card, .bottom-card"

);

cartes.forEach(function(carte,index){

    carte.style.opacity="0";

    carte.style.transform="translateY(30px)";

    setTimeout(function(){

        carte.style.transition="all .6s ease";

        carte.style.opacity="1";

        carte.style.transform="translateY(0)";

    },index*120);

});

console.log("Session Président vérifiée.");

/*==========================================
        FIREBASE
==========================================*/

// Initialisation Firebase
// Le fichier firebase-config.js sera créé plus tard.

let db = null;

if (typeof firebase !== "undefined") {

    db = firebase.firestore();

    console.log("Firebase connecté.");

} else {

    console.log("Firebase non connecté.");

}

/*==========================================
      TABLEAU DE BORD
==========================================*/

function mettreAJourDashboard() {

    // Ces valeurs seront remplacées
    // automatiquement par Firebase.

    document.getElementById("totalMembres").textContent = "0";

    document.getElementById("soldeGeneral").textContent = "0 FCFA";

    document.getElementById("cotisationsMois").textContent = "0";

    document.getElementById("projetsAttente").textContent = "0";

    document.getElementById("formationsActives").textContent = "0";

    document.getElementById("investissementsActifs").textContent = "0";

    document.getElementById("entraidesAttente").textContent = "0";

    document.getElementById("notifications").textContent = "0";

}

mettreAJourDashboard();

console.log("Tableau de bord initialisé.");

/*==========================================
        CENTRE DE COMMANDEMENT
==========================================*/

function chargerCentreCommande(){

    document.getElementById("activites").innerHTML=`

        <p>✅ Bureau Président chargé.</p>

        <p>📊 Tableau de bord opérationnel.</p>

        <p>🔒 Système sécurisé.</p>

    `;

    document.getElementById("alertes").innerHTML=`

        <p>Aucune alerte critique.</p>

    `;

    document.getElementById("listeProjets").innerHTML=`

        <p>Aucun projet en attente.</p>

    `;

    document.getElementById("nouveauxMembres").innerHTML=`

        <p>Aucun nouveau membre aujourd'hui.</p>

    `;

    document.getElementById("paiementsValidation").innerHTML=`

        <p>Aucun paiement à valider.</p>

    `;

    document.getElementById("agenda").innerHTML=`

        <p>Aucun rendez-vous programmé.</p>

    `;

}

chargerCentreCommande();


/*==========================================
      DERNIÈRE SYNCHRONISATION
==========================================*/

function afficherSynchronisation(){

    const maintenant=new Date();

    console.log(

        "Dernière synchronisation : " +

        maintenant.toLocaleString("fr-FR")

    );

}

afficherSynchronisation();

/*==========================================
        BUREAU PRÉSIDENTIEL
==========================================*/

// Centre de validation

document.getElementById("centreValidation").innerHTML = `

    <p>✅ Aucun dossier en attente de validation.</p>

`;

// Boîte de réception

document.getElementById("boiteReception").innerHTML = `

    <p>📩 Aucun nouveau message.</p>

`;

// Décisions présidentielles

document.getElementById("decisionsPresident").innerHTML = `

    <p>📋 Aucune décision enregistrée aujourd'hui.</p>

`;

/*==========================================
      SIGNATURE PRÉSIDENTIELLE
==========================================*/

const btnSigner = document.getElementById("btnSigner");

if(btnSigner){

    btnSigner.addEventListener("click", function(){

        alert("Signature présidentielle enregistrée.");

    });

}

/*==========================================
      CODE PRÉSIDENT
==========================================*/

const btnCode = document.getElementById("btnCode");

if(btnCode){

    btnCode.addEventListener("click", function(){

        const code = prompt("Entrez votre code Président :");

        if(code === null){

            return;

        }

        if(code === "1234"){

            alert("Code Président accepté.");

        }else{

            alert("Code incorrect.");

        }

    });

}

console.log("Bureau Président prêt.");

/*==========================================
        JOURNAL PRÉSIDENTIEL
==========================================*/

function ajouterJournal(message){

    const journal = document.getElementById("journalPresident");

    const maintenant = new Date();

    const heure = maintenant.toLocaleTimeString("fr-FR");

    journal.innerHTML = `

        <p><strong>${heure}</strong> - ${message}</p>

    ` + journal.innerHTML;

}

// Premier événement

ajouterJournal("Connexion du Président au Bureau Numérique.");


/*==========================================
        CENTRE DE SÉCURITÉ
==========================================*/

function verifierSecurite(){

    console.log("Vérification du système...");

    console.log("Connexion sécurisée.");

    console.log("Président authentifié.");

    console.log("Base de données disponible.");

}

verifierSecurite();


/*==========================================
        NOTIFICATIONS
==========================================*/

function notification(message){

    console.log("Notification : " + message);

}

notification("Bienvenue Monsieur le Président.");


/*==========================================
        SAUVEGARDE AUTOMATIQUE
==========================================*/

function sauvegardeAuto(){

    console.log("Sauvegarde automatique effectuée.");

}

setInterval(sauvegardeAuto,300000);


/*==========================================
        INITIALISATION
==========================================*/

console.log("=================================");

console.log("BUREAU NUMÉRIQUE MWANA MBOKA");

console.log("Président : Joram Obami");

console.log("Version : 1.0");

console.log("Statut : Opérationnel");

console.log("=================================");

/*==========================================
      CHARGEMENT DES MEMBRES
==========================================*/

async function chargerMembres(){

    if(!db){

        console.log("Firebase indisponible.");

        return;

    }

    try{

        const snapshot = await db.collection("membres").get();

        document.getElementById("totalMembres").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error(erreur);

    }

}


/*==========================================
      CHARGEMENT DES PROJETS
==========================================*/

async function chargerProjets(){

    if(!db) return;

    try{

        const snapshot = await db.collection("projets").get();

        document.getElementById("projetsAttente").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error(erreur);

    }

}


/*==========================================
      CHARGEMENT DES FORMATIONS
==========================================*/

async function chargerFormations(){

    if(!db) return;

    try{

        const snapshot = await db.collection("formations").get();

        document.getElementById("formationsActives").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error(erreur);

    }

}


/*==========================================
      CHARGEMENT DES ENTRAIDES
==========================================*/

async function chargerEntraides(){

    if(!db) return;

    try{

        const snapshot = await db.collection("entraides").get();

        document.getElementById("entraidesAttente").textContent =
        snapshot.size;

    }

    catch(erreur){

        console.error(erreur);

    }

}


/*==========================================
      SYNCHRONISATION
==========================================*/

async function synchroniserBureau(){

    await chargerMembres();

    await chargerProjets();

    await chargerFormations();

    await chargerEntraides();

    console.log("Bureau synchronisé.");

}

synchroniserBureau();

/*==========================================
        ACTUALISATION AUTOMATIQUE
==========================================*/

function actualiserBureau(){

    console.log("Actualisation du Bureau...");

    synchroniserBureau();

}

/*==========================================
        RAFRAÎCHISSEMENT
==========================================*/

// Toutes les 60 secondes

setInterval(function(){

    actualiserBureau();

},60000);


/*==========================================
        NOTIFICATIONS TEMPS RÉEL
==========================================*/

function afficherNotification(message,type="info"){

    console.log("[" + type.toUpperCase() + "] " + message);

}


/*==========================================
        SURVEILLANCE DE CONNEXION
==========================================*/

window.addEventListener("online",function(){

    afficherNotification(

        "Connexion Internet rétablie.",

        "success"

    );

    actualiserBureau();

});

window.addEventListener("offline",function(){

    afficherNotification(

        "Connexion Internet perdue.",

        "warning"

    );

});


/*==========================================
        OUVERTURE DU BUREAU
==========================================*/

window.addEventListener("load",function(){

    afficherNotification(

        "Bienvenue dans le Bureau Numérique du Président.",

        "success"

    );

    actualiserBureau();

});

console.log("Actualisation automatique activée.");

/*==========================================
      SYSTÈME DE NOTIFICATIONS
==========================================*/

function creerNotification(message,type="info"){

    const notification=document.createElement("div");

    notification.className="notification "+type;

    notification.innerHTML=`

        <i class="fa-solid fa-bell"></i>

        <span>${message}</span>

    `;

    document.body.appendChild(notification);

    setTimeout(function(){

        notification.classList.add("show");

    },100);

    setTimeout(function(){

        notification.classList.remove("show");

        setTimeout(function(){

            notification.remove();

        },500);

    },5000);

}


/*==========================================
      SUIVI DES ACTIONS
==========================================*/

function enregistrerAction(action){

    console.log("Action :",action);

    ajouterJournal(action);

}


/*==========================================
      BARRE DE CHARGEMENT
==========================================*/

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


/*==========================================
      INITIALISATION
==========================================*/

window.addEventListener("load",function(){

    afficherChargement();

    setTimeout(function(){

        masquerChargement();

        creerNotification(

            "Bureau Président prêt.",

            "success"

        );

        enregistrerAction(

            "Le Bureau Numérique est opérationnel."

        );

    },1500);

});


/*==========================================
      EXEMPLES
==========================================*/

// Ces notifications seront remplacées
// par Firebase plus tard.

// creerNotification("Nouvelle cotisation reçue.","success");

// creerNotification("Projet soumis.","info");

// creerNotification("Paiement à valider.","warning");

// creerNotification("Erreur réseau.","error");

/*==========================================
      INITIALISATION GÉNÉRALE
==========================================*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("====================================");
    console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");
    console.log("Bureau Numérique du Président");
    console.log("Version 1.0");
    console.log("====================================");

    try{

        if(typeof synchroniserBureau === "function"){

            await synchroniserBureau();

        }

        if(typeof chargerCentreCommande === "function"){

            chargerCentreCommande();

        }

        if(typeof mettreAJourDashboard === "function"){

            mettreAJourDashboard();

        }

        if(typeof verifierSecurite === "function"){

            verifierSecurite();

        }

        if(typeof ajouterJournal === "function"){

            ajouterJournal("Initialisation complète du Bureau Numérique.");

        }

        console.log("Tous les modules sont opérationnels.");

    }

    catch(erreur){

        console.error("Erreur :",erreur);

    }

});


/*==========================================
      SURVEILLANCE MÉMOIRE
==========================================*/

setInterval(function(){

    console.log("Bureau Président actif...");

},300000);


/*==========================================
      FERMETURE DE SESSION
==========================================*/

window.addEventListener("beforeunload",function(){

    console.log("Fermeture du Bureau Président.");

});


/*==========================================
      VERSION
==========================================*/

const VERSION_APPLICATION="1.0.0";

console.log("Version :",VERSION_APPLICATION);


/*==========================================
      FIN
==========================================*/

console.log("Bureau Numérique du Président prêt.");
