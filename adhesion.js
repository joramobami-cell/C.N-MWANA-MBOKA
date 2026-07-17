/*==================================================
    ADHESION.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/


import { db } from "./firebase-config.js";

import {

    collection,
    addDoc,
    getDocs

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



console.log("=================================");
console.log("MODULE ADHÉSION MWANA MBOKA");
console.log("Firebase chargé :", db);
console.log("=================================");





/*==================================================
        ELEMENTS HTML
==================================================*/


const formulaire = document.getElementById("formAdhesion");

const photoInput = document.getElementById("photo");

const previewPhoto = document.getElementById("previewPhoto");

const message = document.getElementById("message");







/*==================================================
        APERCU PHOTO
==================================================*/


if(photoInput && previewPhoto){


    photoInput.addEventListener("change",(e)=>{


        const fichier = e.target.files[0];


        if(fichier){


            const lecteur = new FileReader();


            lecteur.onload = ()=>{


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


    const resultat = await getDocs(

        collection(db,"membres")

    );


    let numero = resultat.size + 1;


    return "MMB-" + String(numero).padStart(4,"0");


}







/*==================================================
        MESSAGE
==================================================*/


function afficherMessage(texte,type){


    if(!message) return;


    message.innerHTML = texte;


    message.className = type;



}








/*==================================================
        ENREGISTREMENT
==================================================*/


if(formulaire){


formulaire.addEventListener("submit", async(e)=>{


e.preventDefault();



const parrain = document
.getElementById("parrain")
.value
.trim();




if(parrain === ""){


    afficherMessage(

        "Le matricule du parrain est obligatoire.",

        "error"

    );


    return;


}






const bouton = formulaire.querySelector("button");



bouton.disabled = true;



bouton.innerHTML =

`
<i class="fa-solid fa-spinner fa-spin"></i>

Enregistrement...
`;




try{


const matricule = await genererMatricule();



console.log("Matricule créé :", matricule);





let photo = "logo.png";



if(photoInput.files.length > 0){


const fichier = photoInput.files[0];

const lecteur = new FileReader();



photo = await new Promise((resolve)=>{


lecteur.onload = ()=> resolve(lecteur.result);


lecteur.readAsDataURL(fichier);



});


                }

    /*==================================================
        DONNEES DU MEMBRE
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



    statut:"Actif",



    dateAdhesion:

    new Date()
    .toLocaleDateString("fr-FR"),



    dateCreation:

    new Date()
    .toISOString()


};






console.log(
"MEMBRE A ENREGISTRER :",
membre
);







/*==================================================
        ENVOI FIREBASE
==================================================*/


await addDoc(

    collection(db,"membres"),

    membre

);





console.log(
"MEMBRE ENREGISTRE AVEC SUCCES"
);





afficherMessage(

`
<i class="fa-solid fa-circle-check"></i>

Adhésion réussie.

<br>

Votre matricule :

<strong>${matricule}</strong>

`,

"success"

);





formulaire.reset();



if(previewPhoto){

    previewPhoto.src="logo.png";

}





setTimeout(()=>{


window.location.href="membres.html";


},3000);





}






catch(erreur){



console.error(

"ERREUR FIREBASE :",

erreur

);



afficherMessage(

"Erreur : " + erreur.message,

"error"

);



}







finally{


bouton.disabled=false;



bouton.innerHTML =

`
<i class="fa-solid fa-check"></i>

Enregistrer l'adhésion

`;



}




});



}







console.log(

"Adhesion.js opérationnel"

);
