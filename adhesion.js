/*==================================================
    ADHESION.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    VERSION REALTIME DATABASE
==================================================*/


import { realtime } from "./firebase-config.js";


import {

    ref,
    set,
    get,
    child

}

from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";





console.log("================================");
console.log("ADHESION JS CHARGE");
console.log("REALTIME DATABASE CONNECTEE");
console.log("================================");






/*==================================================
        ELEMENTS
==================================================*/


const formulaire = 
document.getElementById("formAdhesion");


const photoInput =
document.getElementById("photo");


const previewPhoto =
document.getElementById("previewPhoto");


const message =
document.getElementById("message");







/*==================================================
        APERCU PHOTO
==================================================*/


if(photoInput){


photoInput.addEventListener("change",(e)=>{


const fichier =
e.target.files[0];


if(fichier){


const lecteur =
new FileReader();



lecteur.onload = ()=>{


previewPhoto.src =
lecteur.result;


};



lecteur.readAsDataURL(fichier);



}


});


}







/*==================================================
        MESSAGE
==================================================*/


function afficherMessage(texte,type){


if(!message) return;


message.innerHTML = texte;


message.className = type;



setTimeout(()=>{


message.innerHTML="";


message.className="";


},5000);



}







/*==================================================
        GENERATION MATRICULE
==================================================*/


async function genererMatricule(){



const snapshot = await get(

ref(realtime,"membres")

);



let nombre = 1;



if(snapshot.exists()){


nombre = Object.keys(snapshot.val()).length + 1;


}



return "MMB-" +

String(nombre).padStart(4,"0");



}








/*==================================================
        ENREGISTREMENT
==================================================*/


if(formulaire){



formulaire.addEventListener("submit",async(e)=>{



e.preventDefault();





const bouton =

formulaire.querySelector("button");



const parrain =

document.getElementById("parrain")
.value
.trim();





if(parrain===""){


afficherMessage(

"Le matricule du parrain est obligatoire.",

"error"

);


return;


}






bouton.disabled=true;



bouton.innerHTML=

`

<i class="fa-solid fa-spinner fa-spin"></i>

Enregistrement...

`;





try{



const matricule =

await genererMatricule();





let photo = "logo.png";





if(photoInput.files.length>0){



const fichier =
photoInput.files[0];



photo = await new Promise((resolve)=>{



const lecteur =
new FileReader();



lecteur.onload=()=>{

resolve(lecteur.result);

};



lecteur.readAsDataURL(fichier);



});


           }


    /*==================================================
        DONNEES MEMBRE
==================================================*/


const membre = {


matricule: matricule,


nom:

document.getElementById("nom")
.value
.trim(),



dateNaissance:

document.getElementById("dateNaissance")
.value,



lieuNaissance:

document.getElementById("lieuNaissance")
.value
.trim(),



nationalite:

document.getElementById("nationalite")
.value
.trim(),



sexe:

document.getElementById("sexe")
.value,



telephone:

document.getElementById("telephone")
.value
.trim(),



profession:

document.getElementById("profession")
.value
.trim(),



parrain:



parrain,



motivation:

document.getElementById("motivation")
.value
.trim(),



photo: photo,



statut:

"Actif",



role:

"Membre",



dateAdhesion:

new Date()
.toLocaleDateString("fr-FR"),



dateCreation:

Date.now()


};








/*==================================================
        VERIFICATION PARRAIN
==================================================*/


const parrainExiste = await get(

ref(realtime,"membres/"+parrain)

);



if(!parrainExiste.exists()){


afficherMessage(

"Le matricule du parrain n'existe pas.",

"error"

);



bouton.disabled=false;


bouton.innerHTML=

`

<i class="fa-solid fa-check"></i>

Enregistrer l'adhésion

`;



return;


}









/*==================================================
        ENREGISTREMENT REALTIME DATABASE
==================================================*/


await set(

ref(

realtime,

"membres/"+matricule

),

membre

);








afficherMessage(

`

<i class="fa-solid fa-circle-check"></i>

Adhésion enregistrée avec succès.

<br><br>

Votre matricule :

<strong>${matricule}</strong>

`,

"success"

);








/* RESET FORMULAIRE */


formulaire.reset();



if(previewPhoto){

previewPhoto.src="logo.png";

}








/* REDIRECTION */

setTimeout(()=>{


window.location.href="membres.html";


},3000);







}

catch(erreur){



console.error(

"ERREUR REALTIME DATABASE :",

erreur

);



afficherMessage(

"Erreur : "+erreur.message,

"error"

);



}







finally{


bouton.disabled=false;



bouton.innerHTML=

`

<i class="fa-solid fa-check"></i>

Enregistrer l'adhésion

`;



}





});


    }
