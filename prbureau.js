/*==================================================
PRBUREAU.JS
BUREAU NUMERIQUE DU PRESIDENT
COMMUNAUTE NUMERIQUE MWANA MBOKA
VERSION PREMIUM V5
==================================================*/


/*==================================================
IMPORTS
==================================================*/

import {
    autoriser,
    nom,
    matricule,
    fonction,
    bureau,
    deconnexion
} from "./permissions.js";

import {
    ecouter,
    lire,
    enregistrer,
    modifier,
    supprimer,
    ajouter,
    lireDocument,
    lireCollection,
    creerDocument,
    ajouterDocument,
    modifierDocument,
    supprimerDocument,
    ecouterCollection
} from "./firebase-service.js";


/*==================================================
SECURITE
==================================================*/

autoriser(["president"]);


/*==================================================
CONFIGURATION
==================================================*/

const APP = {

    nom:
    "COMMUNAUTE NUMERIQUE MWANA MBOKA",

    version:
    "Premium V5",

    auteur:
    "Présidence"

};


/*==================================================
CACHE
==================================================*/

const cache = {

    membres:{},

    organigramme:{},

    nominations:{},

    journal:[],

    statistiques:{},

    systeme:{}

};


/*==================================================
ELEMENTS HTML
==================================================*/

const ui={

    date:
    document.getElementById("date"),

    heure:
    document.getElementById("heure"),

    annee:
    document.getElementById("annee"),

    menu:
    document.getElementById("mobileMenuBtn"),

    sidebar:
    document.getElementById("presidentSidebar"),

    nomPresident:
    document.getElementById("nomPresident"),

    matriculePresident:
    document.getElementById("matriculePresident"),

    messagePresident:
    document.getElementById("messagePresident"),

    totalMembres:
    document.getElementById("totalMembres"),

    responsables:
    document.getElementById("responsablesActifs"),

    listeResponsables:
    document.getElementById("listeResponsables"),

    nominations:
    document.getElementById("nominationsAttente"),

    formations:
    document.getElementById("formationsActives"),

    projets:
    document.getElementById("projetsAttente"),

    notifications:
    document.getElementById("notifications"),

    investissements:
    document.getElementById("investissementsActifs"),

    cotisations:
    document.getElementById("cotisationsMois"),

    finance:
    document.getElementById("soldeGeneral"),

    journal:
    document.getElementById("journalPresident"),

    etat:
    document.getElementById("etatSysteme"),

    systemStatus:
    document.getElementById("systemStatus"),

    signer:
    document.getElementById("btnSigner"),

    refresh:
    document.getElementById("btnRefresh"),

    action:
    document.getElementById("actionRapide"),

    logout:
    document.getElementById("logoutBtn")

};


/*==================================================
FONCTIONS UTILITAIRES
==================================================*/

function valeur(id,valeur){

    if(id){

        id.textContent=valeur;

    }

}

function html(id,valeur){

    if(id){

        id.innerHTML=valeur;

    }

}

function maintenant(){

    return new Date();

}

function dateFR(){

    return maintenant().toLocaleDateString("fr-FR");

}

function heureFR(){

    return maintenant().toLocaleTimeString("fr-FR");

}

function journaliser(action){

    return ajouter(

        "journal_activites",

        {

            nom,

            matricule,

            fonction,

            bureau,

            action,

            date:dateFR(),

            heure:heureFR()

        }

    );

}


/*==================================================
DEMARRAGE
==================================================*/

console.log(APP.nom);

console.log(APP.version);

console.log("Président :",nom);

console.log("Matricule :",matricule);

console.log("Fonction :",fonction);


/*==================================================
INITIALISATION DE L'INTERFACE
==================================================*/

function initialiserInterface(){

    afficherAnnee();

    demarrerHorloge();

    initialiserMenu();

    afficherProfil();

    afficherMessageBienvenue();

}


/*==================================================
ANNEE
==================================================*/

function afficherAnnee(){

    valeur(
        ui.annee,
        new Date().getFullYear()
    );

}


/*==================================================
HORLOGE
==================================================*/

function demarrerHorloge(){

    actualiserHorloge();

    setInterval(
        actualiserHorloge,
        1000
    );

}


function actualiserHorloge(){

    const maintenant = new Date();

    valeur(
        ui.date,
        maintenant.toLocaleDateString("fr-FR")
    );

    valeur(
        ui.heure,
        maintenant.toLocaleTimeString("fr-FR")
    );

}


/*==================================================
MENU MOBILE
==================================================*/

function initialiserMenu(){

    if(!ui.menu || !ui.sidebar){

        return;

    }

    ui.menu.onclick=()=>{

        ui.sidebar.classList.toggle("active");

    };

}


/*==================================================
PROFIL PRESIDENT
==================================================*/

function afficherProfil(){

    valeur(
        ui.nomPresident,
        nom || "Président"
    );

    valeur(
        ui.matriculePresident,
        matricule || "-"
    );

}


/*==================================================
MESSAGE DE BIENVENUE
==================================================*/

function afficherMessageBienvenue(){

    if(!ui.messagePresident){

        return;

    }

    const h =
    new Date().getHours();

    let message="";

    if(h<12){

        message="Bonjour";

    }

    else if(h<18){

        message="Bon après-midi";

    }

    else{

        message="Bonsoir";

    }

    html(

        ui.messagePresident,

        `${message} <strong>${nom}</strong>`

    );

}


/*==================================================
MISE A JOUR DE L'ETAT DU SYSTEME
==================================================*/

function afficherEtatSysteme(

    texte="Système opérationnel",

    couleur="#16a34a"

){

    html(

        ui.systemStatus,

        `<span style="color:${couleur};font-weight:bold;">

        ● ${texte}

        </span>`

    );

}


/*==================================================
INITIALISATION VISUELLE
==================================================*/

initialiserInterface();

afficherEtatSysteme();

console.log(
"Interface Président initialisée."
);


/*==================================================
CHARGEMENT DES MEMBRES
==================================================*/

function chargerMembres(){

    ecouter("membres",(data)=>{

        cache.membres = data || {};

        valeur(

            ui.totalMembres,

            Object.keys(cache.membres).length

        );

    });

}


/*==================================================
CHARGEMENT ORGANIGRAMME
==================================================*/

function chargerOrganigramme(){

    ecouter("organigramme",(data)=>{

        cache.organigramme = data || {};

        let total = 0;

        let htmlResponsables = "";

        parcourir(cache.organigramme);

        function parcourir(obj){

            if(!obj) return;

            Object.keys(obj).forEach(cle=>{

                const item = obj[cle];

                if(item && typeof item==="object"){

                    if(item.responsableMatricule){

                        total++;

                        htmlResponsables += `

<div class="responsable-item">

<h3>${item.fonction || cle}</h3>

<p><b>Nom :</b> ${item.nom || "-"}</p>

<p><b>Matricule :</b> ${item.responsableMatricule}</p>

<p><b>Domaine :</b> ${item.domaine || "-"}</p>

</div>

`;

                    }

                    parcourir(item);

                }

            });

        }

        valeur(

            ui.responsablesActifs,

            total

        );

        html(

            ui.listeResponsables,

            htmlResponsables ||

            "<p>Aucun responsable.</p>"

        );

    });

}


/*==================================================
CHARGEMENT NOMINATIONS
==================================================*/

function chargerNominations(){

    ecouter(

        "nominations_attente",

        (data)=>{

            cache.nominations = data || {};

            let contenu = "";

            Object.values(cache.nominations)

            .forEach(item=>{

                contenu += `

<div class="nomination-item">

<h3>${item.poste || "-"}</h3>

<p>${item.nom || ""}</p>

<p>${item.matricule || ""}</p>

<p style="color:orange">

En attente

</p>

</div>

`;

            });

            html(

                ui.nominationsAttente,

                contenu ||

                "<p>Aucune nomination.</p>"

            );

        }

    );

}


/*==================================================
CHARGEMENT STATISTIQUES
==================================================*/

async function chargerStatistiques(){

    const formations =
    await lire("statistiques/formations");

    const projets =
    await lire("statistiques/projets");

    const finances =
    await lire("statistiques/finances");

    const notifications =
    await lire("statistiques/notifications");

    const investissements =
    await lire("statistiques/investissements");

    const cotisations =
    await lire("statistiques/cotisations");

    valeur(

        ui.formationsActives,

        formations?.total || 0

    );

    valeur(

        ui.projetsAttente,

        projets?.total || 0

    );

    valeur(

        ui.notifications,

        notifications?.total || 0

    );

    valeur(

        ui.investissementsActifs,

        investissements?.total || 0

    );

    valeur(

        ui.cotisationsMois,

        cotisations?.mois || 0

    );

    valeur(

        ui.soldeGeneral,

        (finances?.solde || 0) + " FCFA"

    );

}

setInterval(

    chargerStatistiques,

    30000

);

chargerStatistiques();

/*==================================================
JOURNAL PRESIDENTIEL
==================================================*/

function chargerJournal(){

    ecouter(

        "journal_activites",

        (data)=>{

            cache.journal =

            Object.values(data || {})
            .reverse()
            .slice(0,20);

            let contenu = "";

            cache.journal.forEach(item=>{

                contenu += `

<div class="journal-item">

<h4>${item.action || "Activité"}</h4>

<p>${item.nom || ""}</p>

<p>${item.fonction || ""}</p>

<p>${item.date || ""} ${item.heure || ""}</p>

</div>

`;

            });

            html(

                ui.journalPresident,

                contenu ||

                "<p>Aucune activité.</p>"

            );

        }

    );

}

chargerJournal();


/*==================================================
VALIDATION PRESIDENTIELLE
==================================================*/

if(ui.btnSigner){

    ui.btnSigner.onclick = async()=>{

        const code = prompt(
            "Entrer le code présidentiel"
        );

        if(!code) return;

        const securite =
        await lire("systeme/securite");

        if(
            securite &&
            securite.codePresident &&
            code !== securite.codePresident
        ){

            alert(
                "Code présidentiel incorrect."
            );

            return;

        }

        await ajouter(

            "journal_activites",

            {

                action:"Validation présidentielle",

                nom,

                matricule,

                fonction,

                date:new Date()
                .toLocaleDateString("fr-FR"),

                heure:new Date()
                .toLocaleTimeString("fr-FR")

            }

        );

        alert(
            "Validation enregistrée."
        );

    };

}


/*==================================================
ACTION RAPIDE
==================================================*/

if(ui.actionRapide){

    ui.actionRapide.onclick = async()=>{

        await ajouter(

            "journal_activites",

            {

                action:"Action rapide exécutée",

                nom,

                matricule,

                fonction,

                date:new Date()
                .toLocaleDateString("fr-FR"),

                heure:new Date()
                .toLocaleTimeString("fr-FR")

            }

        );

        alert("Action enregistrée.");

    };

}


/*==================================================
BOUTON RAFRAICHIR
==================================================*/

if(ui.btnRefresh){

    ui.btnRefresh.onclick = ()=>{

        chargerStatistiques();

        alert("Tableau de bord actualisé.");

    };

}


/*==================================================
DECONNEXION
==================================================*/

if(ui.logout){

    ui.logout.onclick = async()=>{

        if(!confirm(
            "Voulez-vous vous déconnecter ?"
        )) return;

        try{

            await ajouter(

                "journal_activites",

                {

                    action:"Déconnexion",

                    nom,

                    matricule,

                    fonction,

                    date:new Date()
                    .toLocaleDateString("fr-FR"),

                    heure:new Date()
                    .toLocaleTimeString("fr-FR")

                }

            );

        }catch(e){

            console.error(e);

        }

        deconnexion();

    };

             }


/*==================================================
ETAT DU SYSTEME
==================================================*/

ecouter(

    "systeme/etat",

    (etat)=>{

        if(!ui.etatSysteme) return;

        if(!etat){

            ui.etatSysteme.innerHTML =
            '<span style="color:green;">● Système opérationnel</span>';

            return;

        }

        ui.etatSysteme.innerHTML =

        `<span style="color:${etat.couleur || "green"};">

        ● ${etat.message || "Système opérationnel"}

        </span>`;

    }

);


/*==================================================
STATUT APPLICATION
==================================================*/

if(ui.systemStatus){

    ui.systemStatus.innerHTML =
    '<span style="color:green;">● En ligne</span>';

}


/*==================================================
SURVEILLANCE SESSION
==================================================*/

window.addEventListener("storage",()=>{

    if(!localStorage.getItem("utilisateurConnecte")){

        location.replace("connexion.html");

    }

});


window.addEventListener("focus",()=>{

    if(!localStorage.getItem("utilisateurConnecte")){

        location.replace("connexion.html");

    }

});


setInterval(()=>{

    if(!localStorage.getItem("utilisateurConnecte")){

        location.replace("connexion.html");

    }

},5000);


/*==================================================
RACCOURCIS CLAVIER
==================================================*/

document.addEventListener(

    "keydown",

    (e)=>{

        if(e.key==="F5"){

            e.preventDefault();

            chargerStatistiques();

        }

        if(e.ctrlKey && e.key.toLowerCase()==="r"){

            e.preventDefault();

            location.reload();

        }

        if(e.ctrlKey && e.key.toLowerCase()==="q"){

            e.preventDefault();

            ui.logout?.click();

        }

    }

);


/*==================================================
INITIALISATION
==================================================*/

async function initialiser(){

    console.log("Initialisation...");

    chargerMembres();

    chargerOrganigramme();

    chargerNominations();

    chargerJournal();

    await chargerStatistiques();

}

initialiser();


/*==================================================
ACTUALISATION PERIODIQUE
==================================================*/

setInterval(

    ()=>{

        chargerStatistiques();

    },

    60000

);


/*==================================================
CONSOLE
==================================================*/

console.table({

    application:"COMMUNAUTE NUMERIQUE MWANA MBOKA",

    module:"Bureau Président",

    version:"Premium V4",

    utilisateur:nom,

    matricule:matricule,

    fonction:fonction,

    statut:"Connecté"

});

console.log("==================================");
console.log(" Bureau Président Premium prêt");
console.log("==================================");
