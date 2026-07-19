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



console.log("Bureau Président chargé");





/*==============================
        DATE ET HEURE
==============================*/


function actualiserHorloge(){


const maintenant = new Date();


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


setInterval(actualiserHorloge,1000);

actualiserHorloge();









/*==============================
        MENU MOBILE
==============================*/


const menuBtn =
document.getElementById("mobileMenuBtn");


const sidebar =
document.getElementById("presidentSidebar");



if(menuBtn && sidebar){


menuBtn.onclick = ()=>{


sidebar.classList.toggle("active");


};


}









/*==============================
        MEMBRES
==============================*/


function chargerMembres(){


const membres =
ref(realtime,"membres");



onValue(membres,(snapshot)=>{


let total = 0;



if(snapshot.exists()){

total =
Object.keys(snapshot.val()).length;

}



const zone =
document.getElementById("totalMembres");



if(zone){

zone.textContent = total;

}


});


}


chargerMembres();









/*==============================
        GS ORGANIGRAMME
==============================*/


function chargerOrganigramme(){


const organigramme =
ref(realtime,"organigramme");



onValue(organigramme,(snapshot)=>{


let total = 0;

let liste = "";



if(snapshot.exists()){


function parcourir(obj){


Object.keys(obj).forEach(cle=>{


let item=obj[cle];



if(typeof item==="object"){



if(item.responsableMatricule){


total++;


liste += `

<div class="responsable-item">

<b>
${item.fonction || cle}
</b>

<br>

Matricule :
${item.responsableMatricule}

<br>

Domaine :
${item.domaine || "Non défini"}

</div>

`;



}



parcourir(item);


}


});


}



parcourir(snapshot.val());



}



const compteur =
document.getElementById(
"responsablesActifs"
);



if(compteur){

compteur.textContent =
total;

}



const affichage =
document.getElementById(
"listeResponsables"
);



if(affichage){

affichage.innerHTML =
liste || "Aucun responsable nommé.";

}



});


}


chargerOrganigramme();









/*==============================
        NOMINATIONS
==============================*/


function chargerNominations(){


const nominations =
ref(realtime,"nominations_attente");



onValue(nominations,(snapshot)=>{


const zone =
document.getElementById(
"nominationsAttente"
);



if(!zone)
return;



let html="";



if(snapshot.exists()){



Object.values(snapshot.val())
.forEach(n=>{


html += `

<div class="nomination-item">


<b>
${n.poste}
</b>


<br>

Matricule :
${n.matricule}


<br>

Statut :
En attente


</div>


`;


});



}


zone.innerHTML =
html || 
"Aucune nomination en attente.";



});


}


chargerNominations();









/*==============================
        FORMATIONS
==============================*/


function chargerFormations(){


const zone =
document.getElementById(
"formationsActives"
);



if(!zone)
return;



onSnapshot(

collection(db,"formations"),

(snapshot)=>{


zone.textContent =
snapshot.size;


});


}


chargerFormations();









/*==============================
        PROJETS
==============================*/


function chargerProjets(){


const zone =
document.getElementById(
"projetsAttente"
);



if(!zone)
return;



onSnapshot(

collection(db,"projets"),

(snapshot)=>{


zone.textContent =
snapshot.size;


});


}


chargerProjets();









/*==============================
        NOTIFICATIONS
==============================*/


function chargerNotifications(){


const zone =
document.getElementById(
"notifications"
);



if(!zone)
return;



onSnapshot(

collection(db,"notifications"),

(snapshot)=>{


zone.textContent =
snapshot.size;


});


}


chargerNotifications();









/*==============================
        FINANCE
==============================*/


const finance =
document.getElementById(
"soldeGeneral"
);



if(finance){

finance.textContent =
"0 FCFA";

}






/*==============================
        COTISATIONS
==============================*/


const cotisation =
document.getElementById(
"cotisationsMois"
);



if(cotisation){

cotisation.textContent =
"0";

}








/*==============================
        INVESTISSEMENTS
==============================*/


const investissement =
document.getElementById(
"investissementsActifs"
);



if(investissement){

investissement.textContent =
"0";

}









/*==============================
        JOURNAL PRESIDENTIEL
==============================*/


function chargerJournal(){


const journal =
ref(realtime,"journal_activites");



onValue(journal,(snapshot)=>{


const zone =
document.getElementById(
"journalPresident"
);



if(!zone)
return;



let html="";



if(snapshot.exists()){



Object.values(snapshot.val())
.slice(-5)
.reverse()
.forEach(j=>{


html += `

<p>

<i class="fa-solid fa-clock"></i>

${j.message}

</p>

`;


});


}



zone.innerHTML =
html ||
"Aucune activité.";

});


}


chargerJournal();









/*==============================
        SIGNATURE PRESIDENTIELLE
==============================*/


const signer =
document.getElementById(
"btnSigner"
);



if(signer){


signer.onclick=()=>{


let code =
prompt(
"Code présidentiel"
);



if(code){


alert(
"Validation présidentielle enregistrée."
);


}


};


}









/*==============================
        DECONNEXION
==============================*/


const logout =
document.getElementById(
"logoutBtn"
);



if(logout){


logout.onclick=async()=>{


if(confirm("Déconnexion ?")){


await signOut(auth);


window.location.href =
"index.html";


}


};


}









/*==============================
        ANNEE
==============================*/


const annee =
document.getElementById("annee");


if(annee){

annee.textContent =
new Date().getFullYear();

}





console.log(
"Bureau Numérique Président opérationnel"
);
