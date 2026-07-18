/*==================================================
    PROFIL.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/


import { realtime, storage } from "./firebase-config.js";


import {

ref,
get,
update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


import {

ref as storageRef,
uploadBytes,
getDownloadURL

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";



console.log("PROFIL JS CHARGE");





/*================ ELEMENTS ================*/


const photoProfil =
document.getElementById("photoProfil");


const inputPhoto =
document.getElementById("inputPhoto");


const btnPhoto =
document.getElementById("btnPhoto");


const btnSauver =
document.getElementById("btnSauver");


const message =
document.getElementById("message");





let idMembre = null;

let membreActuel = null;








/*================ MESSAGE ================*/


function afficherMessage(txt,type){


if(!message)

return;


message.textContent = txt;


message.className = type;


setTimeout(()=>{


message.textContent="";


},4000);


}








/*================ CHARGER PROFIL ================*/


async function chargerProfil(){



/*
A adapter avec ton système de connexion
Pour test on prend le président
*/


idMembre = localStorage.getItem("membreId");



if(!idMembre){


afficherMessage(
"Aucun membre connecté",
"error"
);


return;

}





const membreRef = ref(

realtime,

"membres/"+idMembre

);



const snapshot = await get(membreRef);




if(snapshot.exists()){


membreActuel = snapshot.val();



afficherProfil(membreActuel);



}

else{


afficherMessage(
"Profil introuvable",
"error"
);


}


}







/*================ AFFICHAGE ================*/


function afficherProfil(m){



document.getElementById("nom").textContent =
m.nom || "-";


document.getElementById("matricule").textContent =
m.matricule || "-";


document.getElementById("telephone").textContent =
m.telephone || "-";


document.getElementById("parrain").textContent =
m.parrain || "-";


document.getElementById("statut").textContent =
m.statut || "Actif";


document.getElementById("dateAdhesion").textContent =
m.dateAdhesion || "-";



document.getElementById("editNom").value =
m.nom || "";


document.getElementById("editTelephone").value =
m.telephone || "";



if(m.photo)

photoProfil.src = m.photo;


}









/*================ CHOISIR PHOTO ================*/


btnPhoto.addEventListener("click",()=>{


inputPhoto.click();


});







/*================ ENVOYER PHOTO ================*/


inputPhoto.addEventListener("change",async(e)=>{



const fichier = e.target.files[0];



if(!fichier)

return;




try{



afficherMessage(
"Envoi de la photo...",
"info"
);





const chemin =

"photos/"+idMembre;



const imageRef = storageRef(

storage,

chemin

);




await uploadBytes(

imageRef,

fichier

);




const url = await getDownloadURL(imageRef);




await update(

ref(realtime,"membres/"+idMembre),

{

photo:url

}

);




photoProfil.src=url;



afficherMessage(

"Photo mise à jour avec succès",

"success"

);



}


catch(erreur){



console.error(erreur);



afficherMessage(

"Erreur photo : "+erreur.message,

"error"

);



}



});









/*================ MODIFIER INFORMATIONS ================*/


btnSauver.addEventListener("click",async()=>{


try{


await update(

ref(realtime,"membres/"+idMembre),

{


nom:

document.getElementById("editNom").value,


telephone:

document.getElementById("editTelephone").value


}

);



afficherMessage(

"Profil mis à jour",

"success"

);



chargerProfil();



}


catch(erreur){


console.error(erreur);


afficherMessage(

"Erreur modification : "+erreur.message,

"error"

);


}



});







chargerProfil();
