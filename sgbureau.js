/*==================================================
SGBUREAU.JS
BUREAU NUMERIQUE DU SECRETAIRE GENERAL
COMMUNAUTE NUMERIQUE MWANA MBOKA
VERSION PREMIUM V1
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
ajouter
} from "./firebase-service.js";


/*==================================================
SECURITE
==================================================*/

autoriser([
"secretaire_general",
"president"
]);

console.log("Bureau Secrétaire Général chargé");


/*==================================================
VARIABLES
==================================================*/

let membresCache={};
let nominationsCache={};
let documentsCache={};
let projetsCache={};
let formationsCache={};
let notificationsCache={};


/*==================================================
INITIALISATION
==================================================*/

window.addEventListener("load",()=>{

afficherAnnee();

demarrerHorloge();

initialiserMenu();

afficherProfil();

messageBienvenue();

chargerEtatSysteme();

});


/*==================================================
ANNEE
==================================================*/

function afficherAnnee(){

const annee=
document.getElementById("annee");

if(annee){

annee.textContent=
new Date().getFullYear();

}

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

const maintenant=
new Date();

const date=
document.getElementById("date");

const heure=
document.getElementById("heure");

if(date){

date.textContent=
maintenant.toLocaleDateString("fr-FR");

}

if(heure){

heure.textContent=
maintenant.toLocaleTimeString("fr-FR");

}

}


/*==================================================
MENU MOBILE
==================================================*/

function initialiserMenu(){

const bouton=
document.getElementById("mobileMenuBtn");

const sidebar=
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

const nomZone=
document.getElementById("nomPresident");

const matriculeZone=
document.getElementById("matriculePresident");

if(nomZone){

nomZone.textContent=
nom;

}

if(matriculeZone){

matriculeZone.textContent=
matricule;

}

}


/*==================================================
MESSAGE DE BIENVENUE
==================================================*/

function messageBienvenue(){

const zone=
document.getElementById("messagePresident");

if(!zone){

return;

}

const h=
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

zone.innerHTML=

`${message} <strong>${nom}</strong><br>

Bienvenue dans le Bureau Numérique du Secrétaire Général.`;

}


/*==================================================
ETAT DU SYSTEME
==================================================*/

function chargerEtatSysteme(){

ecouter(

"systeme/etat",

(data)=>{

const zone=
document.getElementById("etatSysteme");

if(!zone){

return;

}

if(!data){

zone.innerHTML=
"● Système opérationnel";

return;

}

zone.innerHTML=

data.message ||

"● Système opérationnel";

}

);

  }

  /*==================================================
MEMBRES
==================================================*/

function chargerMembres(){

ecouter(

"membres",

(data)=>{

membresCache=data || {};

const total=
Object.keys(membresCache).length;

const zone=
document.getElementById("totalMembres");

if(zone){

zone.textContent=total;

}

}

);

}

chargerMembres();


/*==================================================
NOUVELLES ADHESIONS
==================================================*/

function chargerAdhesions(){

ecouter(

"adhesions",

(data)=>{

const zone=
document.getElementById("nouvellesAdhesions");

if(!zone) return;

const liste=
Object.values(data || {})
.reverse()
.slice(0,10);

zone.innerHTML="";

if(liste.length===0){

zone.innerHTML=
"<p>Aucune nouvelle adhésion.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.nom || "Sans nom"}</h3>

<p><b>Matricule :</b> ${item.matricule || "-"}</p>

<p><b>Date :</b> ${item.date || "-"}</p>

</div>

`;

});

}

);

}

chargerAdhesions();


/*==================================================
NOMINATIONS
==================================================*/

function chargerNominations(){

ecouter(

"nominations_attente",

(data)=>{

nominationsCache=data || {};

const zone=
document.getElementById("listeNominations");

const compteur=
document.getElementById("totalNominations");

if(!zone) return;

const liste=
Object.values(nominationsCache);

if(compteur){

compteur.textContent=
liste.length;

}

zone.innerHTML="";

if(liste.length===0){

zone.innerHTML=
"<p>Aucune nomination en attente.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.poste || ""}</h3>

<p><b>Nom :</b> ${item.nom || ""}</p>

<p><b>Matricule :</b> ${item.matricule || ""}</p>

<p class="badge orange">
En attente
</p>

</div>

`;

});

}

);

}

chargerNominations();


/*==================================================
STATISTIQUES ADMINISTRATIVES
==================================================*/

async function chargerStatistiques(){

try{

const membres=
await lire("statistiques/membres");

const dossiers=
await lire("statistiques/dossiers");

const archives=
await lire("statistiques/archives");

const formations=
await lire("statistiques/formations");

mettreValeur(

"statMembres",

membres?.total || 0

);

mettreValeur(

"statDossiers",

dossiers?.total || 0

);

mettreValeur(

"statArchives",

archives?.total || 0

);

mettreValeur(

"statFormations",

formations?.total || 0

);

}

catch(e){

console.error(e);

}

}

function mettreValeur(id,valeur){

const element=
document.getElementById(id);

if(element){

element.textContent=
valeur;

}

}

chargerStatistiques();

setInterval(

chargerStatistiques,

30000

);

/*==================================================
DOCUMENTS ADMINISTRATIFS
==================================================*/

function chargerDocuments(){

ecouter(

"documents",

(data)=>{

documentsCache=data || {};

const zone=
document.getElementById("listeDocuments");

if(!zone) return;

zone.innerHTML="";

const liste=
Object.values(documentsCache)
.reverse()
.slice(0,20);

if(liste.length===0){

zone.innerHTML=
"<p>Aucun document disponible.</p>";

return;

}

liste.forEach(doc=>{

zone.innerHTML+=`

<div class="item">

<h3>${doc.titre || "Document"}</h3>

<p><b>Catégorie :</b> ${doc.categorie || "-"}</p>

<p><b>Date :</b> ${doc.date || "-"}</p>

<p><b>Auteur :</b> ${doc.auteur || "-"}</p>

</div>

`;

});

}

);

}

chargerDocuments();


/*==================================================
ARCHIVES
==================================================*/

function chargerArchives(){

ecouter(

"archives",

(data)=>{

const zone=
document.getElementById("listeArchives");

if(!zone) return;

zone.innerHTML="";

const liste=
Object.values(data || {})
.reverse()
.slice(0,15);

if(liste.length===0){

zone.innerHTML=
"<p>Aucune archive.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.titre || "Archive"}</h3>

<p>${item.description || ""}</p>

<p><b>Date :</b> ${item.date || "-"}</p>

</div>

`;

});

}

);

}

chargerArchives();


/*==================================================
FORMATIONS
==================================================*/

function chargerFormations(){

ecouter(

"formations",

(data)=>{

formationsCache=data || {};

const zone=
document.getElementById("listeFormations");

if(!zone) return;

zone.innerHTML="";

const liste=
Object.values(formationsCache);

if(liste.length===0){

zone.innerHTML=
"<p>Aucune formation enregistrée.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.titre || "Formation"}</h3>

<p><b>Responsable :</b> ${item.responsable || "-"}</p>

<p><b>Date :</b> ${item.date || "-"}</p>

</div>

`;

});

}

);

}

chargerFormations();


/*==================================================
PROJETS
==================================================*/

function chargerProjets(){

ecouter(

"projets",

(data)=>{

projetsCache=data || {};

const zone=
document.getElementById("listeProjets");

if(!zone) return;

zone.innerHTML="";

const liste=
Object.values(projetsCache)
.reverse()
.slice(0,20);

if(liste.length===0){

zone.innerHTML=
"<p>Aucun projet enregistré.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.nom || "Projet"}</h3>

<p><b>Responsable :</b> ${item.responsable || "-"}</p>

<p><b>Statut :</b> ${item.statut || "-"}</p>

</div>

`;

});

}

);

}

chargerProjets();

/*==================================================
JOURNAL ADMINISTRATIF
==================================================*/

function chargerJournal(){

ecouter(

"journal_activites",

(data)=>{

const zone=
document.getElementById(
"journalAdministratif"
);

if(!zone) return;

zone.innerHTML="";

const liste=
Object.values(data || {})
.reverse()
.slice(0,25);

if(liste.length===0){

zone.innerHTML=
"<p>Aucune activité enregistrée.</p>";

return;

}

liste.forEach(item=>{

zone.innerHTML+=`

<div class="journal-item">

<h4>${item.action || "Activité"}</h4>

<p><b>Nom :</b> ${item.nom || ""}</p>

<p><b>Fonction :</b> ${item.fonction || ""}</p>

<p>${item.date || ""} ${item.heure || ""}</p>

</div>

`;

});

}

);

}

chargerJournal();


/*==================================================
NOTIFICATIONS
==================================================*/

function chargerNotifications(){

ecouter(

"notifications",

(data)=>{

notificationsCache=data || {};

const zone=
document.getElementById(
"listeNotifications"
);

const compteur=
document.getElementById(
"totalNotifications"
);

if(!zone) return;

const liste=
Object.values(notificationsCache)
.reverse();

if(compteur){

compteur.textContent=
liste.length;

}

zone.innerHTML="";

if(liste.length===0){

zone.innerHTML=
"<p>Aucune notification.</p>";

return;

}

liste.slice(0,15).forEach(item=>{

zone.innerHTML+=`

<div class="item">

<h3>${item.titre || "Notification"}</h3>

<p>${item.message || ""}</p>

<p><b>Date :</b> ${item.date || ""}</p>

</div>

`;

});

}

);

}

chargerNotifications();


/*==================================================
ACTION RAPIDE
==================================================*/

const actionRapide=
document.getElementById(
"actionRapide"
);

if(actionRapide){

actionRapide.onclick=async()=>{

await ajouter(

"journal_activites",

{

date:new Date().toLocaleDateString("fr-FR"),

heure:new Date().toLocaleTimeString("fr-FR"),

nom,

matricule,

fonction,

action:
"Action rapide du Secrétaire Général"

}

);

alert("Action enregistrée.");

};

}


/*==================================================
RAFRAICHIR LE TABLEAU DE BORD
==================================================*/

const btnRefresh=
document.getElementById(
"btnRefresh"
);

if(btnRefresh){

btnRefresh.onclick=()=>{

chargerMembres();

chargerAdhesions();

chargerNominations();

chargerDocuments();

chargerArchives();

chargerFormations();

chargerProjets();

chargerJournal();

chargerNotifications();

chargerStatistiques();

};

}


/*==================================================
STATUT DU SYSTEME
==================================================*/

const systemStatus=
document.getElementById(
"systemStatus"
);

if(systemStatus){

systemStatus.innerHTML=
'<span style="color:green;">● En ligne</span>';

}

/*==================================================
DECONNEXION SECURISEE
==================================================*/

const logout =
document.getElementById("logoutBtn");

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

date:new Date().toLocaleDateString("fr-FR"),

heure:new Date().toLocaleTimeString("fr-FR"),

nom,

matricule,

fonction,

action:"Déconnexion Secrétaire Général"

}

);

}catch(e){

console.error(e);

}

deconnexion();

};

}


/*==================================================
SURVEILLANCE DE SESSION
==================================================*/

window.addEventListener(

"storage",

()=>{

if(!localStorage.getItem("utilisateurConnecte")){

location.replace("connexion.html");

}

}

);

window.addEventListener(

"focus",

()=>{

if(!localStorage.getItem("utilisateurConnecte")){

location.replace("connexion.html");

}

}

);


/*==================================================
RACCOURCIS CLAVIER
==================================================*/

document.addEventListener(

"keydown",

(e)=>{

// Actualiser les statistiques

if(e.key==="F5"){

e.preventDefault();

chargerStatistiques();

}

// Recharger la page

if(e.ctrlKey && e.key.toLowerCase()==="r"){

e.preventDefault();

location.reload();

}

// Déconnexion rapide

if(e.ctrlKey && e.key.toLowerCase()==="q"){

e.preventDefault();

logout?.click();

}

}

);


/*==================================================
INITIALISATION GENERALE
==================================================*/

async function initialiser(){

console.log(
"Initialisation du Bureau du Secrétaire Général..."
);

try{

await chargerStatistiques();

}catch(e){

console.error(
"Erreur d'initialisation :",
e
);

}

}

initialiser();


/*==================================================
ACTUALISATION AUTOMATIQUE
==================================================*/

setInterval(()=>{

chargerStatistiques();

},60000);


/*==================================================
TABLEAU DE CONTROLE
==================================================*/

console.table({

Application:
"COMMUNAUTE NUMERIQUE MWANA MBOKA",

Module:
"Bureau du Secrétaire Général",

Version:
"Premium V1",

Utilisateur:
nom,

Matricule:
matricule,

Fonction:
fonction,

Bureau:
bureau,

Statut:
"Connecté"

});


/*==================================================
FIN
==================================================*/

console.log("====================================");
console.log(" Bureau du Secrétaire Général prêt ");
console.log("====================================");
