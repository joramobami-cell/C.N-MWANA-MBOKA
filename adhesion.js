/*==================================================
    ADHESION.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/


import { db } from "./firebase-config.js";


import {

    collection,

    addDoc,

    getDocs,

    query,

    orderBy,

    limit

}

from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";





/*==================================================
        INITIALISATION
==================================================*/


console.log("================================");

console.log("FORMULAIRE ADHESION");

console.log("MWANA MBOKA");

console.log("================================");






/*==================================================
        ELEMENTS
==================================================*/


const formulaire = document.getElementById("formAdhesion");

const photoInput = document.getElementById("photo");

const previewPhoto = document.getElementById("previewPhoto");

const message = document.getElementById("message");







/*==================================================
        APERCU PHOTO
==================================================*/


if(photoInput){


photoInput.addEventListener("change",(e)=>{


const fichier = e.target.files[0];


if(fichier){


const lecteur = new FileReader();


lecteur.onload=function(){


previewPhoto.src = lecteur.result;


};


lecteur.readAsDataURL(fichier);



}


});


}








/*==================================================
        GENERATION MATRICULE
==================================================*/


async function genererMatricule(){


let dernierNumero = 0;



try{


const q = query(

collection(db,"membres"),

orderBy("matricule","desc"),

limit(1)

);



const resultat = await getDocs(q);



if(!resultat.empty){


const dernier = resultat.docs[0].data().matricule;


const numero = dernier.split("-")[1];


dernierNumero = parseInt(numero);


}



}


catch(erreur){


console.error(

"Erreur génération matricule",

erreur

);


}





dernierNumero++;


return "MMB-" + String(dernierNumero).padStart(4,"0");



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


},5000);



}

/*==================================================
        ENREGISTREMENT ADHESION
==================================================*/


if(formulaire){


formulaire.addEventListener("submit", async(e)=>{


e.preventDefault();




const bouton = formulaire.querySelector("button");


bouton.disabled = true;


bouton.innerHTML = `

<i class="fa-solid fa-spinner fa-spin"></i>

Enregistrement...

`;





try{



/* Génération matricule */


const matricule = await genererMatricule();






/* Récupération photo */


let photoURL = "logo.png";



if(photoInput.files.length > 0){


const fichier = photoInput.files[0];


const lecteur = new FileReader();



photoURL = await new Promise((resolve)=>{


lecteur.onload=()=>{


resolve(lecteur.result);


};



lecteur.readAsDataURL(fichier);



});


}








/* Données membre */


const membre = {


nom:

document.getElementById("nom").value.trim(),



dateNaissance:

document.getElementById("dateNaissance").value,



lieuNaissance:

document.getElementById("lieuNaissance").value.trim(),



nationalite:

document.getElementById("nationalite").value.trim(),



sexe:

document.getElementById("sexe").value,



telephone:

document.getElementById("telephone").value.trim(),



profession:

document.getElementById("profession").value.trim(),



parrain:

document.getElementById("parrain").value.trim(),



motivation:

document.getElementById("motivation").value.trim(),



photo:

photoURL,



matricule: matricule,



statut:"Actif",



dateAdhesion:

new Date().toLocaleDateString("fr-FR"),



dateCreation:

new Date()

};








/* Envoi Firebase */


await addDoc(

collection(db,"membres"),

membre

);






afficherMessage(

`

<i class="fa-solid fa-circle-check"></i>

Adhésion enregistrée avec succès.

<br>

Votre matricule :

<strong>${matricule}</strong>

`,

"success"

);






formulaire.reset();


previewPhoto.src="logo.png";






setTimeout(()=>{


window.location.href="membres.html";


},3000);





}





catch(erreur){


console.error(erreur);



afficherMessage(

`

<i class="fa-solid fa-triangle-exclamation"></i>

Erreur lors de l'enregistrement.

`,

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






/*==================================================
        FIN
==================================================*/


console.log(

"Module adhésion chargé."

);
