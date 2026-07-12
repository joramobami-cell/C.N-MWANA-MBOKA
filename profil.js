/* ======================================
   MWANA MBOKA
   PROFIL MEMBRE
====================================== */


import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";


import {
getDatabase,
ref,
get,
update
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";


import {
getStorage,
ref as storageRef,
uploadBytes,
getDownloadURL
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";



/* CONFIGURATION FIREBASE */

const firebaseConfig = {

apiKey: "AIzaSyDHMovN3CpVl6fQUDZGRNqFu6mLUUPR8Sc",

authDomain: "c-n-mwana-mboka.firebaseapp.com",

databaseURL:
"https://c-n-mwana-mboka-default-rtdb.europe-west1.firebasedatabase.app/",

projectId:"c-n-mwana-mboka",

storageBucket:
"c-n-mwana-mboka.firebasestorage.app",

messagingSenderId:"757726608581",

appId:"1:757726608581:web:27fa7003ffa955188304ac"

};



const app = initializeApp(firebaseConfig);


const database = getDatabase(app);

const storage = getStorage(app);





/* MEMBRE CONNECTE */


const matricule = localStorage.getItem("matricule");



if(!matricule){

window.location.href="connexion.html";

}





const membreRef = ref(database,"membres/"+matricule);





/* ======================================
   CHARGEMENT PROFIL
====================================== */


async function chargerProfil(){


const snapshot = await get(membreRef);



if(snapshot.exists()){


const membre = snapshot.val();



document.getElementById("nom").textContent =
membre.nom || "---";



document.getElementById("matricule").textContent =
membre.matricule || matricule;



document.getElementById("statut").textContent =
membre.statut || "Actif";



document.getElementById("telephone").textContent =
membre.telephone || "---";



document.getElementById("profession").textContent =
membre.profession || "---";



document.getElementById("adresse").textContent =
membre.adresse || "---";



document.getElementById("parrain").textContent =
membre.parrain || "---";



document.getElementById("dateadhesion").textContent =
membre.dateAdhesion || "---";





/* PHOTO */

const photo = document.getElementById("photo");


if(membre.photo && membre.photo !== ""){


photo.src = membre.photo;


}else{


photo.src="logo.png";


}



}


}



chargerProfil();






/* ======================================
   CHANGER PHOTO
====================================== */


const boutonPhoto = document.getElementById("changerPhoto");

const inputPhoto = document.getElementById("photoInput");



if(boutonPhoto){


boutonPhoto.onclick = ()=>{


inputPhoto.click();


};


}





if(inputPhoto){


inputPhoto.onchange = async()=>{

const fichier = inputPhoto.files[0];


if(!fichier){
    return;
}


// Affichage immédiat avant Firebase
const aperçu = URL.createObjectURL(fichier);

document.getElementById("photo").src = aperçu;


console.log("Photo sélectionnée :", fichier.name);

};


const fichier = inputPhoto.files[0];



if(!fichier){

return;

}





// Vérification format

if(!fichier.type.startsWith("image/")){


alert("Veuillez choisir une image.");

return;


}




// Taille maximum 2 Mo


if(fichier.size > 2 * 1024 * 1024){


alert("Image trop grande. Maximum 2 Mo.");

return;


}






try{


const chemin = 
"photos/membres/"+matricule;



const imageRef =
storageRef(storage,chemin);



await uploadBytes(imageRef,fichier);



const url =
await getDownloadURL(imageRef);






await update(membreRef,{

photo:url

});





document.getElementById("photo").src=url;



localStorage.setItem("photo",url);



alert("Votre photo a été mise à jour.");



}

catch(error){


console.error(error);


alert("Erreur pendant l'envoi de la photo.");


}



};


  }
