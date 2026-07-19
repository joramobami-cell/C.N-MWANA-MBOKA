/*==================================================
    PRBUREAU.JS
    BUREAU NUMERIQUE DU PRESIDENT
    COMMUNAUTE NUMERIQUE MWANA MBOKA
==================================================*/


/*==============================
        IMPORT FIREBASE
==============================*/


import { 
    realtime,
    db,
    auth

} from "./firebase-config.js";



import {

    ref,
    onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



import {

    collection,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



import {

    signOut

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";



console.log("PRBUREAU JS chargé");





/*==============================
        DATE ET HEURE
==============================*/


function actualiserDateHeure(){


const maintenant = new Date();



const date = document.getElementById("date");

const heure = document.getElementById("heure");



if(date){

date.textContent =
maintenant.toLocaleDateString("fr-FR");

}



if(heure){

heure.textContent =
maintenant.toLocaleTimeString("fr-FR");

}



}



setInterval(actualiserDateHeure,1000);

actualiserDateHeure();








/*==============================
        SYSTEME OPERATIONNEL
==============================*/


const systemStatus =
document.querySelector(".system-status");



if(systemStatus){

systemStatus.innerHTML = `

<i class="fa-solid fa-circle"></i>

Système opérationnel

`;

}









/*==============================
        MENU MOBILE
==============================*/


const mobileBtn =
document.getElementById("mobileMenuBtn");



const sidebar =
document.getElementById("presidentSidebar");



if(mobileBtn && sidebar){


mobileBtn.addEventListener(
"click",
()=>{


sidebar.classList.toggle("active");


});


}









/*==============================
        MEMBRES REALTIME DATABASE
==============================*/


function chargerMembres(){


const membresRef =
ref(realtime,"membres");



onValue(

membresRef,

(snapshot)=>{


let total = 0;



if(snapshot.exists()){


total =
Object.keys(snapshot.val()).length;


}



const compteur =
document.getElementById("totalMembres");



if(compteur){

compteur.textContent = total;

}



console.log(
"Membres:",
total
);



},

(error)=>{


console.error(
"Erreur membres:",
error
);


}

);


}



chargerMembres();









/*==============================
        FORMATIONS
==============================*/


function chargerFormations(){


const compteur =
document.getElementById(
"formationsActives"
);



if(!compteur) return;



onSnapshot(

collection(db,"formations"),

(snapshot)=>{


compteur.textContent =
snapshot.size;


},

(error)=>{


console.error(
"Erreur formations:",
error
);


}

);


}



chargerFormations();









/*==============================
        PROJETS
==============================*/


function chargerProjets(){


const compteur =
document.getElementById(
"projetsAttente"
);



if(!compteur) return;



onSnapshot(

collection(db,"projets"),

(snapshot)=>{


compteur.textContent =
snapshot.size;


},

(error)=>{


console.error(
"Erreur projets:",
error
);


}

);



}



chargerProjets();









/*==============================
        NOTIFICATIONS
==============================*/


function chargerNotifications(){


const compteur =
document.getElementById(
"notifications"
);



if(!compteur) return;



onSnapshot(

collection(db,"notifications"),

(snapshot)=>{


compteur.textContent =
snapshot.size;


},

(error)=>{


console.error(
"Erreur notifications:",
error
);


}

);


}



chargerNotifications();









/*==============================
        FINANCE (PREPARATION)
==============================*/


function chargerFinance(){


const zone =
document.getElementById(
"soldeGeneral"
);



if(!zone) return;



zone.textContent =
"0 FCFA";



}



chargerFinance();









/*==============================
        COTISATIONS
==============================*/


function chargerCotisations(){


const zone =
document.getElementById(
"cotisationsMois"
);



if(!zone) return;



zone.textContent =
"0";


}



chargerCotisations();









/*==============================
        INVESTISSEMENTS
==============================*/


function chargerInvestissements(){


const zone =
document.getElementById(
"investissementsActifs"
);



if(!zone) return;



zone.textContent =
"0";


}



chargerInvestissements();







/*==============================
        GS ORGANIGRAMME
        RESPONSABLES ACTIFS
==============================*/


function chargerOrganigramme(){


const organigrammeRef =
ref(realtime,"organigramme");



onValue(

organigrammeRef,

(snapshot)=>{


let responsables = 0;

let liste = "";



if(snapshot.exists()){


const data = snapshot.val();



function parcourir(objet){


Object.keys(objet).forEach(cle=>{


const element = objet[cle];



if(
typeof element === "object"
){

if(element.responsableMatricule){


responsables++;


liste += `

<div class="responsable-item">

<strong>${element.fonction || cle}</strong>

<br>

Matricule :
${element.responsableMatricule}

<br>

Domaine :
${element.domaine || cle}

</div>

`;

}


parcourir(element);


}


});


}



parcourir(data);


}





const compteur =
document.getElementById(
"responsablesActifs"
);



if(compteur){

compteur.textContent =
responsables;

}




const zone =
document.getElementById(
"listeResponsables"
);



if(zone){


zone.innerHTML =
liste || "Aucun responsable nommé.";


}



console.log(
"Responsables actifs :",
responsables
);



},


(error)=>{


console.error(
"Erreur organigramme :",
error
);


}


);


}



chargerOrganigramme();









/*==============================
        NOMINATIONS EN ATTENTE
==============================*/


function chargerNominations(){


const nominationsRef =
ref(
realtime,
"nominations_attente"
);



onValue(

nominationsRef,

(snapshot)=>{


const zone =
document.getElementById(
"nominationsAttente"
);



if(!zone)
return;



if(snapshot.exists()){


let html = "";



Object.values(snapshot.val())
.forEach(nomination=>{


html += `

<div class="nomination-item">

<b>${nomination.poste}</b>

<br>

Matricule :
${nomination.matricule}

<br>

Statut :
En attente validation Président

</div>

`;


});



zone.innerHTML = html;


}

else{


zone.innerHTML =
"Aucune nomination en attente.";


}



},


(error)=>{


console.error(
"Erreur nominations :",
error
);


}


);


}



chargerNominations();









/*==============================
        JOURNAL PRESIDENTIEL
==============================*/


function chargerJournalPresident(){


const journalRef =
ref(
realtime,
"journal"
);



onValue(

journalRef,

(snapshot)=>{


const zone =
document.getElementById(
"journalPresident"
);



if(!zone)
return;



if(snapshot.exists()){


let html="";



Object.values(snapshot.val())
.slice(-5)
.reverse()
.forEach(action=>{


html += `

<p>

<i class="fa-solid fa-clock"></i>

${action.message || "Action enregistrée"}

</p>

`;


});



zone.innerHTML = html;


}



},


(error)=>{


console.error(
"Erreur journal:",
error
);


}


);


}



chargerJournalPresident();

/*==============================
        DECONNEXION
==============================*/


const logoutBtn =
document.getElementById(
"logoutBtn"
);



if(logoutBtn){


logoutBtn.addEventListener(

"click",

async()=>{


const confirmation =
confirm(
"Voulez-vous vous déconnecter ?"
);



if(!confirmation)
return;



try{


await signOut(auth);



window.location.href =
"index.html";



}

catch(error){


console.error(
"Erreur déconnexion:",
error
);



}


}

);


}









/*==============================
        ANNEE FOOTER
==============================*/


const annee =
document.getElementById(
"annee"
);



if(annee){


annee.textContent =
new Date().getFullYear();


}









/*==============================
        FIN
==============================*/


console.log(
"Bureau Président opérationnel"
);
