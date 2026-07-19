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
