/*==================================================
 PRBUREAU.JS
 BUREAU NUMERIQUE DU PRESIDENT
 COMMUNAUTE NUMERIQUE MWANA MBOKA
 VERSION PREMIUM V2
==================================================*/


/*==================================================
 SECURITE PRESIDENTIELLE
==================================================*/

import {

autoriser,
nom,
matricule,
fonction,
deconnexion 
} from "./permissions.js";


autoriser([
"president"
]);



/*==================================================
 SERVICES FIREBASE
==================================================*/


import {

ecouter,
lire,
ajouter

} from "./firebase-service.js";



console.log(
"Bureau Président sécurisé chargé"
);





/*==================================================
 ANNEE
==================================================*/


const annee =
document.getElementById("annee");


if(annee){

annee.textContent =
new Date().getFullYear();

}







/*==================================================
 HORLOGE PRESIDENTIELLE
==================================================*/


function horloge(){


const maintenant =
new Date();


const date =
document.getElementById("date");


const heure =
document.getElementById("heure");



if(date){

date.textContent =
maintenant.toLocaleDateString(
"fr-FR"
);

}



if(heure){

heure.textContent =
maintenant.toLocaleTimeString(
"fr-FR"
);

}


}



setInterval(
horloge,
1000
);


horloge();







/*==================================================
 MENU MOBILE
==================================================*/


const menuBtn =
document.getElementById(
"mobileMenuBtn"
);


const sidebar =
document.getElementById(
"presidentSidebar"
);



if(menuBtn && sidebar){


menuBtn.onclick=()=>{


sidebar.classList.toggle(
"active"
);


};


}








/*==================================================
 PROFIL PRESIDENT
==================================================*/


const nomPresident =
document.getElementById(
"nomPresident"
);



if(nomPresident){

nomPresident.textContent =
nom ||
"Président Fondateur";

}




const matriculePresident =
document.getElementById(
"matriculePresident"
);



if(matriculePresident){

matriculePresident.textContent =
matricule ||
"";

}





/*==================================================
 CHARGEMENT MEMBRES
==================================================*/


function chargerMembres(){


ecouter(

"membres",

(data)=>{


let total=0;



if(data){

total =
Object.keys(data).length;

}



const zone =
document.getElementById(
"totalMembres"
);



if(zone){

zone.textContent =
total;

}


}


);


}



chargerMembres();








/*==================================================
 GS ORGANIGRAMME
==================================================*/


function chargerOrganigramme(){


ecouter(

"organigramme",

(data)=>{


let total=0;

let html="";




function parcourir(obj){


if(!obj)
return;



Object.keys(obj)
.forEach(cle=>{


const element =
obj[cle];



if(element && typeof element==="object"){



if(element.responsableMatricule){


total++;



html +=`

<div class="responsable-item">


<h3>

${element.fonction || cle}

</h3>


<p>

Matricule :
<b>
${element.responsableMatricule}
</b>

</p>


<p>

Domaine :

${element.domaine || "Non défini"}

</p>


</div>

`;


}



parcourir(element);



}



});


}



parcourir(data);



const compteur =
document.getElementById(
"responsablesActifs"
);



if(compteur){

compteur.textContent =
total;

}



const zone =
document.getElementById(
"listeResponsables"
);



if(zone){

zone.innerHTML =
html ||
"Aucun responsable.";

}


}


);


}



chargerOrganigramme();

/*==================================================
 NOMINATIONS EN ATTENTE
==================================================*/

function chargerNominations(){

ecouter(

"nominations_attente",

(data)=>{

const zone=
document.getElementById(
"nominationsAttente"
);

if(!zone) return;

let html="";

if(data){

Object.values(data).forEach(n=>{

html+=`

<div class="nomination-item">

<h3>${n.poste || "Poste"}</h3>

<p>
<b>Matricule :</b>
${n.matricule || ""}
</p>

<p>
<b>Nom :</b>
${n.nom || ""}
</p>

<p style="color:orange;">
En attente de validation
</p>

</div>

`;

});

}

zone.innerHTML=
html || "Aucune nomination.";

}

);

}

chargerNominations();





/*==================================================
 STATISTIQUES FIRESTORE
==================================================*/

async function chargerStatistiques(){

try{

const formations=
await lire("statistiques/formations");

const projets=
await lire("statistiques/projets");

const finances=
await lire("statistiques/finances");

const notifications=
await lire("statistiques/notifications");

const investissements=
await lire("statistiques/investissements");

const cotisations=
await lire("statistiques/cotisations");

const formationsActives=
document.getElementById("formationsActives");

const projetsAttente=
document.getElementById("projetsAttente");

const soldeGeneral=
document.getElementById("soldeGeneral");

const notificationsZone=
document.getElementById("notifications");

const investissementsZone=
document.getElementById("investissementsActifs");

const cotisationsZone=
document.getElementById("cotisationsMois");

if(formationsActives){

formationsActives.textContent=
formations?.total || 0;

}

if(projetsAttente){

projetsAttente.textContent=
projets?.total || 0;

}

if(soldeGeneral){

soldeGeneral.textContent=
(finances?.solde || 0)+" FCFA";

}

if(notificationsZone){

notificationsZone.textContent=
notifications?.total || 0;

}

if(investissementsZone){

investissementsZone.textContent=
investissements?.total || 0;

}

if(cotisationsZone){

cotisationsZone.textContent=
cotisations?.mois || 0;

}

}

catch(e){

console.error(e);

}

}

chargerStatistiques();





/*==================================================
 ACTUALISATION AUTOMATIQUE
==================================================*/

setInterval(

chargerStatistiques,

30000

);





/*==================================================
 MESSAGE PRESIDENTIEL
==================================================*/

const bienvenue=
document.getElementById(
"messagePresident"
);

if(bienvenue){

const heure=
new Date().getHours();

let texte="";

if(heure<12){

texte="Bonjour ";

}else if(heure<18){

texte="Bon après-midi ";

}else{

texte="Bonsoir ";

}

bienvenue.innerHTML=

texte+

"<strong>"+nom+"</strong>";

}

/*==================================================
 JOURNAL PRESIDENTIEL
==================================================*/

function chargerJournal(){

ecouter(

"journal_activites",

(data)=>{

const zone=
document.getElementById(
"journalPresident"
);

if(!zone) return;

let html="";

if(data){

const journal=
Object.values(data)
.reverse()
.slice(0,20);

journal.forEach(item=>{

html+=`

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

}

zone.innerHTML=

html ||

"Aucune activité enregistrée.";

}

);

}

chargerJournal();



/*==================================================
 VALIDATION PRESIDENTIELLE
==================================================*/

const btnSigner=
document.getElementById(
"btnSigner"
);

if(btnSigner){

btnSigner.onclick=async()=>{

const code=
prompt(
"Entrer le code présidentiel"
);

if(!code){

return;

}

await ajouter(

"journal_activites",

{

date:new Date()
.toLocaleDateString("fr-FR"),

heure:new Date()
.toLocaleTimeString("fr-FR"),

nom:nom,

matricule:matricule,

fonction:"president",

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
 RAFRAICHIR LE TABLEAU DE BORD
==================================================*/

const btnRefresh=
document.getElementById(
"btnRefresh"
);

if(btnRefresh){

btnRefresh.onclick=()=>{

chargerMembres();

chargerOrganigramme();

chargerNominations();

chargerJournal();

chargerStatistiques();

};

}



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

date:new Date()
.toLocaleDateString("fr-FR"),

heure:new Date()
.toLocaleTimeString("fr-FR"),

nom:nom,

matricule:matricule,

fonction:"president",

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
 MESSAGE SYSTEME
==================================================*/

const statut=
document.getElementById(
"systemStatus"
);

if(statut){

statut.innerHTML=

'<i class="fa-solid fa-circle"></i> Système opérationnel';

}


/*==================================================
 DECONNEXION SECURISEE
==================================================*/


const logout =
document.getElementById("logoutBtn");

if(logout){

logout.onclick=()=>{

const quitter=confirm(
"Voulez-vous vraiment vous déconnecter ?"
);

if(quitter){

ajouter(
"journal_activites",
{

date:new Date().toLocaleDateString("fr-FR"),

heure:new Date().toLocaleTimeString("fr-FR"),

nom:nom,

matricule:matricule,

fonction:"president",

action:"Déconnexion"

}

).finally(()=>{

deconnexion();

});

}

};

}



/*==================================================
 CONTROLE DE LA SESSION
==================================================*/

setInterval(()=>{

const utilisateur=
localStorage.getItem(
"utilisateurConnecte"
);

if(!utilisateur){

window.location.replace(
"connexion.html"
);

}

},5000);




/*==================================================
 SURVEILLANCE TEMPS REEL
==================================================*/

ecouter(
"systeme/etat",

(etat)=>{

const zone=
document.getElementById(
"etatSysteme"
);

if(!zone) return;

if(!etat){

zone.innerHTML=
"Système opérationnel";

return;

}

zone.innerHTML=

etat.message ||

"Système opérationnel";

}

);




/*==================================================
 RACCOURCIS CLAVIER
==================================================*/

document.addEventListener(

"keydown",

(e)=>{

if(e.key==="F5"){

e.preventDefault();

chargerMembres();

chargerOrganigramme();

chargerNominations();

chargerJournal();

chargerStatistiques();

}

if(e.ctrlKey && e.key==="l"){

e.preventDefault();

location.reload();

}

}

);




/*==================================================
 INITIALISATION
==================================================*/

async function initialiser(){

console.log(
"Initialisation Bureau Président..."
);

chargerMembres();

chargerOrganigramme();

chargerNominations();

chargerJournal();

await chargerStatistiques();

}

initialiser();




/*==================================================
 BUREAU PRET
==================================================*/

console.log(
"====================================="
);

console.log(
"BUREAU NUMERIQUE DU PRESIDENT"
);

console.log(
"COMMUNAUTE NUMERIQUE MWANA MBOKA"
);

console.log(
"Utilisateur :",nom
);

console.log(
"Matricule :",matricule
);

console.log(
"Fonction :",fonction
);

console.log(
"Système : OPERATIONNEL"
);

console.log(
"====================================="
);
