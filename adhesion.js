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
