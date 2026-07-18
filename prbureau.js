/*==================================================
    PRBUREAU.JS
    BUREAU NUMERIQUE DU PRESIDENT
    MWANA MBOKA
==================================================*/


import { realtime, auth } from "./firebase-config.js";


import {

    ref,
    get,
    onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


import {

    signOut

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";



console.log("PRBUREAU JS CHARGE");






/*==================================================
        DATE ET HEURE
==================================================*/


function actualiserDateHeure(){


const maintenant = new Date();



const date = document.getElementById("date");

const heure = document.getElementById("heure");



if(date){

date.textContent = maintenant.toLocaleDateString("fr-FR");

}



if(heure){

heure.textContent = maintenant.toLocaleTimeString("fr-FR");

}



}



setInterval(actualiserDateHeure,1000);

actualiserDateHeure();







/*==================================================
        COMPTEUR MEMBRES REALTIME DATABASE
==================================================*/


function chargerNombreMembres(){



const membresRef = ref(

realtime,

"membres"

);



onValue(membresRef,(snapshot)=>{



let total = 0;



if(snapshot.exists()){



total = Object.keys(snapshot.val()).length;



}



const compteur = document.getElementById("totalMembres");



if(compteur){


compteur.textContent = total;


}



console.log(

"Nombre membres :",

total

);



},(erreur)=>{


console.error(

"Erreur lecture membres :",

erreur

);



});



}



chargerNombreMembres();







/*==================================================
        NOUVEAUX MEMBRES
==================================================*/


function chargerNouveauxMembres(){


const membresRef = ref(

realtime,

"membres"

);



onValue(membresRef,(snapshot)=>{



const zone = document.getElementById(
"nouveauxMembres"
);



if(!zone) return;



zone.innerHTML="";



if(!snapshot.exists()){


zone.innerHTML="<p>Aucun nouveau membre.</p>";

return;


}



const membres = snapshot.val();



const liste = Object.values(membres);



liste.reverse().slice(0,5).forEach((membre)=>{



zone.innerHTML += `

<p>

<i class="fa-solid fa-user"></i>

${membre.nom || "Membre"}

<br>

<small>

${membre.matricule || ""}

</small>

</p>

`;



});



});



}



chargerNouveauxMembres();


/*==================================================
        COMPTEURS MODULES FIRESTORE
        (formations, projets, notifications...)
==================================================*/


import {

collection,
onSnapshot

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


import { db } from "./firebase-config.js";







/* FORMATIONS */

function chargerFormations(){


const zone = document.getElementById(
"formationsActives"
);



if(!zone) return;



onSnapshot(

collection(db,"formations"),

(snapshot)=>{


zone.textContent = snapshot.size;



},

(erreur)=>{


console.error(
"Erreur formations :",
erreur
);


}

);



}


chargerFormations();







/* PROJETS */

function chargerProjets(){


const zone = document.getElementById(
"projetsAttente"
);



if(!zone) return;



onSnapshot(

collection(db,"projets"),

(snapshot)=>{


zone.textContent = snapshot.size;



},

(erreur)=>{


console.error(
"Erreur projets :",
erreur
);


}

);



}


chargerProjets();








/* NOTIFICATIONS */


function chargerNotifications(){


const zone = document.getElementById(
"notifications"
);



if(!zone) return;



onSnapshot(

collection(db,"notifications"),

(snapshot)=>{


zone.textContent = snapshot.size;



},

(erreur)=>{


console.error(
"Erreur notifications :",
erreur
);


}

);



}



chargerNotifications();










/*==================================================
        DECONNEXION
==================================================*/


const logoutBtn = document.getElementById(
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



window.location.href="index.html";



}

catch(erreur){


console.error(
"Erreur déconnexion :",
erreur
);



}



}

);


}










/*==================================================
        ANNEE FOOTER
==================================================*/


const annee =
document.getElementById("annee");



if(annee){


annee.textContent =
new Date().getFullYear();


}








/*==================================================
        TEST CONNEXION
==================================================*/


console.log(
"Bureau président opérationnel"
);
