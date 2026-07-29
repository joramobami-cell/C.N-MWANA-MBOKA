/*==================================================
 PRBUREAU.JS
 BUREAU NUMERIQUE DU PRESIDENT
 COMMUNAUTE NUMERIQUE MWANA MBOKA
 VERSION PREMIUM V3
==================================================*/


/*==================================================
 IMPORTS
==================================================*/

import {
    autoriser,
    nom,
    matricule,
    fonction,
    deconnexion
} from "./permissions.js";

import {
    ecouter,
    lire,
    ajouter
} from "./firebase-service.js";


/*==================================================
 SECURITE
==================================================*/

autoriser(["president"]);

console.log("Bureau Président Premium V3");



/*==================================================
 VARIABLES GLOBALES
==================================================*/

let membresCache = {};
let organigrammeCache = {};
let nominationsCache = {};
let journalCache = [];



/*==================================================
 INITIALISATION
==================================================*/

window.addEventListener("load",()=>{

    afficherAnnee();

    horloge();

    initialiserMenu();

    afficherProfil();

    chargerMembres();

    chargerOrganigramme();

    chargerNominations();

    chargerJournal();

    chargerStatistiques();

    messageBienvenue();

});



/*==================================================
 ANNEE
==================================================*/

function afficherAnnee(){

    const annee =
    document.getElementById("annee");

    if(annee){

        annee.textContent =
        new Date().getFullYear();

    }

}



/*==================================================
 HORLOGE
==================================================*/

function horloge(){

    actualiserHorloge();

    setInterval(

        actualiserHorloge,

        1000

    );

}

function actualiserHorloge(){

    const maintenant =
    new Date();

    const date =
    document.getElementById("date");

    const heure =
    document.getElementById("heure");

    if(date){

        date.textContent =
        maintenant.toLocaleDateString("fr-FR");

    }

    if(heure){

        heure.textContent =
        maintenant.toLocaleTimeString("fr-FR");

    }

}



/*==================================================
 MENU MOBILE
==================================================*/

function initialiserMenu(){

    const bouton =
    document.getElementById("mobileMenuBtn");

    const sidebar =
    document.getElementById("presidentSidebar");

    if(!bouton || !sidebar){

        return;

    }

    bouton.onclick=()=>{

        sidebar.classList.toggle("active");

    };

}



/*==================================================
 PROFIL
==================================================*/

function afficherProfil(){

    const nomZone =
    document.getElementById("nomPresident");

    const matriculeZone =
    document.getElementById("matriculePresident");

    if(nomZone){

        nomZone.textContent =
        nom || "Président Fondateur";

    }

    if(matriculeZone){

        matriculeZone.textContent =
        matricule || "";

    }

}



/*==================================================
 MEMBRES
==================================================*/

function chargerMembres(){

    ecouter(

        "membres",

        (data)=>{

            membresCache =
            data || {};

            const total =
            Object.keys(membresCache).length;

            const zone =
            document.getElementById("totalMembres");

            if(zone){

                zone.textContent =
                total;

            }

        }

    );

}

/*==================================================
 GS ORGANIGRAMME
==================================================*/

function chargerOrganigramme(){

    ecouter(

        "organigramme",

        (data)=>{

            organigrammeCache = data || {};

            let total = 0;
            let html = "";

            parcourirOrganigramme(organigrammeCache);

            function parcourirOrganigramme(obj){

                if(!obj) return;

                Object.keys(obj).forEach(cle=>{

                    const element = obj[cle];

                    if(element && typeof element==="object"){

                        if(element.responsableMatricule){

                            total++;

                            html += `

<div class="responsable-item">

<h3>${element.fonction || cle}</h3>

<p><b>Responsable :</b> ${element.nom || "Non renseigné"}</p>

<p><b>Matricule :</b> ${element.responsableMatricule}</p>

<p><b>Domaine :</b> ${element.domaine || "Non défini"}</p>

</div>

`;

                        }

                        parcourirOrganigramme(element);

                    }

                });

            }

            const compteur =
            document.getElementById("responsablesActifs");

            if(compteur){

                compteur.textContent = total;

            }

            const liste =
            document.getElementById("listeResponsables");

            if(liste){

                liste.innerHTML =
                html || "<p>Aucun responsable nommé.</p>";

            }

        }

    );

}



/*==================================================
 NOMINATIONS
==================================================*/

function chargerNominations(){

    ecouter(

        "nominations_attente",

        (data)=>{

            nominationsCache = data || {};

            const zone =
            document.getElementById("nominationsAttente");

            if(!zone) return;

            let html = "";

            Object.values(nominationsCache).forEach(item=>{

                html += `

<div class="nomination-item">

<h3>${item.poste || "Poste"}</h3>

<p><b>Nom :</b> ${item.nom || ""}</p>

<p><b>Matricule :</b> ${item.matricule || ""}</p>

<p style="color:#ff9800;">
En attente de validation présidentielle
</p>

</div>

`;

            });

            zone.innerHTML =
            html || "<p>Aucune nomination en attente.</p>";

        }

    );

}



/*==================================================
 MESSAGE PRESIDENT
==================================================*/

function messageBienvenue(){

    const zone =
    document.getElementById("messagePresident");

    if(!zone) return;

    const heure =
    new Date().getHours();

    let texte = "";

    if(heure<12){

        texte = "Bonjour";

    }else if(heure<18){

        texte = "Bon après-midi";

    }else{

        texte = "Bonsoir";

    }

    zone.innerHTML =

    `${texte} <strong>${nom}</strong>`;

     }

/*==================================================
 STATISTIQUES
==================================================*/

async function chargerStatistiques(){

    try{

        const [
            formations,
            projets,
            finances,
            notifications,
            investissements,
            cotisations
        ] = await Promise.all([

            lire("statistiques/formations"),
            lire("statistiques/projets"),
            lire("statistiques/finances"),
            lire("statistiques/notifications"),
            lire("statistiques/investissements"),
            lire("statistiques/cotisations")

        ]);

        mettreValeur(
            "formationsActives",
            formations?.total || 0
        );

        mettreValeur(
            "projetsAttente",
            projets?.total || 0
        );

        mettreValeur(
            "notifications",
            notifications?.total || 0
        );

        mettreValeur(
            "investissementsActifs",
            investissements?.total || 0
        );

        mettreValeur(
            "cotisationsMois",
            cotisations?.mois || 0
        );

        mettreValeur(
            "soldeGeneral",
            (finances?.solde || 0) + " FCFA"
        );

    }

    catch(erreur){

        console.error(
            "Erreur statistiques :",
            erreur
        );

    }

}

function mettreValeur(id,valeur){

    const element =
    document.getElementById(id);

    if(element){

        element.textContent =
        valeur;

    }

}

setInterval(
    chargerStatistiques,
    30000
);


/*==================================================
 JOURNAL PRESIDENTIEL
==================================================*/

function chargerJournal(){

    ecouter(

        "journal_activites",

        (data)=>{

            journalCache =
            Object.values(data || {})
            .slice()
            .reverse()
            .slice(0,20);

            const zone =
            document.getElementById(
                "journalPresident"
            );

            if(!zone) return;

            let html="";

            journalCache.forEach(item=>{

                html += `

<div class="journal-item">

<h4>
${item.action || "Activité"}
</h4>

<p>
${item.nom || ""}
</p>

<p>
${item.fonction || ""}
</p>

<p>
${item.date || ""}
&nbsp;
${item.heure || ""}
</p>

</div>

`;

            });

            zone.innerHTML =
            html ||
            "<p>Aucune activité enregistrée.</p>";

        }

    );

}


/*==================================================
 VALIDATION PRESIDENTIELLE
==================================================*/

const btnSigner =
document.getElementById(
"btnSigner"
);

if(btnSigner){

    btnSigner.onclick =
    async()=>{

        const code =
        prompt(
        "Entrer le code présidentiel"
        );

        if(!code){

            return;

        }

        const securite =
        await lire(
        "systeme/securite"
        );

        if(
        securite &&
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

                date:new Date()
                .toLocaleDateString("fr-FR"),

                heure:new Date()
                .toLocaleTimeString("fr-FR"),

                nom,

                matricule,

                fonction,

                action:
                "Validation présidentielle"

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

const actionRapide =
document.getElementById(
"actionRapide"
);

if(actionRapide){

    actionRapide.onclick =
    async()=>{

        await ajouter(

            "journal_activites",

            {

                date:new Date()
                .toLocaleDateString("fr-FR"),

                heure:new Date()
                .toLocaleTimeString("fr-FR"),

                nom,

                matricule,

                fonction,

                action:
                "Action rapide exécutée"

            }

        );

        alert(
        "Action enregistrée."
        );

    };

             }


/*==================================================
 RAFRAICHIR TABLEAU DE BORD
==================================================*/

const btnRefresh =
document.getElementById("btnRefresh");

if(btnRefresh){

    btnRefresh.onclick = ()=>{

        chargerStatistiques();

        alert(
        "Tableau de bord actualisé."
        );

    };

}



/*==================================================
 ETAT DU SYSTEME
==================================================*/

ecouter(

    "systeme/etat",

    (etat)=>{

        const zone =
        document.getElementById(
        "etatSysteme"
        );

        if(!zone) return;

        if(!etat){

            zone.innerHTML =
            '<span style="color:green;">● Système opérationnel</span>';

            return;

        }

        const couleur =
        etat.couleur || "green";

        zone.innerHTML =

        `<span style="color:${couleur};">

        ● ${etat.message || "Système opérationnel"}

        </span>`;

    }

);



/*==================================================
 MESSAGE SYSTEME
==================================================*/

const systemStatus =
document.getElementById(
"systemStatus"
);

if(systemStatus){

    systemStatus.innerHTML =

    '<span style="color:green;">● En ligne</span>';

}



/*==================================================
 DECONNEXION
==================================================*/

const logout =
document.getElementById(
"logoutBtn"
);

if(logout){

    logout.onclick = async()=>{

        const quitter = confirm(

        "Voulez-vous vraiment vous déconnecter ?"

        );

        if(!quitter){

            return;

        }

        try{

            await ajouter(

                "journal_activites",

                {

                    date:new Date()
                    .toLocaleDateString("fr-FR"),

                    heure:new Date()
                    .toLocaleTimeString("fr-FR"),

                    nom,

                    matricule,

                    fonction,

                    action:"Déconnexion"

                }

            );

        }

        catch(e){

            console.error(e);

        }

        deconnexion();

    };

}



/*==================================================
 SURVEILLANCE SESSION
==================================================*/

window.addEventListener(

"storage",

()=>{

    if(

    !localStorage.getItem(
    "utilisateurConnecte"
    )

    ){

        location.replace(
        "connexion.html"
        );

    }

}

);



/*==================================================
 SURVEILLANCE NAVIGATEUR
==================================================*/

window.addEventListener(

"focus",

()=>{

    if(

    !localStorage.getItem(
    "utilisateurConnecte"
    )

    ){

        location.replace(
        "connexion.html"
        );

    }

}

);



/*==================================================
 RACCOURCIS CLAVIER
==================================================*/

document.addEventListener(

"keydown",

(e)=>{

    // Actualisation du tableau de bord

    if(e.key==="F5"){

        e.preventDefault();

        chargerStatistiques();

    }

    // Rechargement complet

    if(e.ctrlKey && e.key.toLowerCase()==="r"){

        e.preventDefault();

        location.reload();

    }

    // Déconnexion rapide

    if(e.ctrlKey && e.key.toLowerCase()==="q"){

        e.preventDefault();

        document.getElementById("logoutBtn")?.click();

    }

});



/*==================================================
 INITIALISATION GENERALE
==================================================*/

async function initialiser(){

    console.log("Initialisation du Bureau Président...");

    try{

        await chargerStatistiques();

    }

    catch(e){

        console.error(

            "Erreur d'initialisation :",

            e

        );

    }

}



/*==================================================
 LANCEMENT
==================================================*/

initialiser();



/*==================================================
 CONTROLE PERIODIQUE
==================================================*/

setInterval(()=>{

    chargerStatistiques();

},60000);



/*==================================================
 MESSAGE DE DEMARRAGE
==================================================*/

console.table({

    Application :
    "COMMUNAUTE NUMERIQUE MWANA MBOKA",

    Module :
    "Bureau Numérique Président",

    Version :
    "Premium V3",

    Utilisateur :
    nom,

    Matricule :
    matricule,

    Fonction :
    fonction,

    Statut :
    "Connecté"

});



/*==================================================
 FIN DU FICHIER
==================================================*/

console.log(
"===================================="
);

console.log(
" Bureau Président Premium V3 prêt "
);

console.log(
"===================================="
);
