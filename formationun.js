/*==================================================
    FORMATIONUN.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    GESTION DES FORMATIONS
==================================================*/


import { db } from "./firebase-config.js";


import {

    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



console.log("================================");
console.log("MODULE FORMATIONS MWANA MBOKA");
console.log("Firebase :", db);
console.log("================================");





/*==================================================
        ELEMENTS
==================================================*/


const listeFormations =
document.getElementById("listeFormations");


const totalFormations =
document.getElementById("totalFormations");


const formationsCours =
document.getElementById("formationsCours");


const formationsTerminees =
document.getElementById("formationsTerminees");


const totalSuggestions =
document.getElementById("totalSuggestions");



const message =
document.getElementById("message");






/*==================================================
        MESSAGE
==================================================*/


function afficherMessage(texte,type){


if(!message) return;


message.innerHTML = texte;


message.className = type;



setTimeout(()=>{


message.innerHTML="";


},4000);


}








/*==================================================
        CHARGEMENT FORMATIONS
==================================================*/


function chargerFormations(){


const q = query(

collection(db,"formations"),

orderBy("dateCreation","desc")

);



onSnapshot(q,(snapshot)=>{


let formations=[];


snapshot.forEach((doc)=>{


formations.push({

id:doc.id,

...doc.data()

});


});



afficherFormations(formations);


statistiques(formations);



},(erreur)=>{


console.error(erreur);


afficherMessage(

"Erreur chargement formations : "
+ erreur.message,

"error"

);


});

}





/*==================================================
        AFFICHAGE TABLEAU
==================================================*/


function afficherFormations(formations){



if(!listeFormations)
return;



listeFormations.innerHTML="";



if(formations.length===0){


listeFormations.innerHTML=`

<tr>

<td colspan="6">

Aucune formation disponible.

</td>

</tr>

`;


return;


}





formations.forEach((formation)=>{


listeFormations.innerHTML += `


<tr>


<td>

${formation.titre || "-"}

</td>



<td>

${formation.domaine || "-"}

</td>



<td>

${formation.formateur || "-"}

</td>



<td>

${formation.dateFormation || "-"}

</td>



<td>

<span class="badge badge-actif">

${formation.statut || "Disponible"}

</span>

</td>



<td>


<button class="btn-secondary">

<i class="fa-solid fa-eye"></i>

Voir

</button>



</td>



</tr>


`;



});



}






/*==================================================
        STATISTIQUES
==================================================*/


function statistiques(formations){


if(totalFormations)

totalFormations.textContent =
formations.length;



if(formationsCours)

formationsCours.textContent =

formations.filter(

f=>f.statut==="En cours"

).length;




if(formationsTerminees)

formationsTerminees.textContent =

formations.filter(

f=>f.statut==="Terminée"

).length;



}

  /*==================================================
        MODALES
==================================================*/


const modalFormation =
document.getElementById("modalFormation");


const modalSuggestion =
document.getElementById("modalSuggestion");



const btnAjouter =
document.getElementById("btnAjouterFormation");


const btnSuggestion =
document.getElementById("btnSuggestion");



const fermerFormation =
document.getElementById("fermerFormation");


const fermerSuggestion =
document.getElementById("fermerSuggestion");






if(btnAjouter){


btnAjouter.onclick = ()=>{


modalFormation.style.display="flex";


};


}




if(btnSuggestion){


btnSuggestion.onclick = ()=>{


modalSuggestion.style.display="flex";


};


}





if(fermerFormation){


fermerFormation.onclick=()=>{


modalFormation.style.display="none";


};


}




if(fermerSuggestion){


fermerSuggestion.onclick=()=>{


modalSuggestion.style.display="none";


};


}





window.onclick=(e)=>{


if(e.target===modalFormation){

modalFormation.style.display="none";

}



if(e.target===modalSuggestion){

modalSuggestion.style.display="none";

}


};










/*==================================================
        CREATION FORMATION
==================================================*/


const formFormation =
document.getElementById("formFormation");



if(formFormation){


formFormation.addEventListener("submit",async(e)=>{


e.preventDefault();



try{


await addDoc(

collection(db,"formations"),

{


titre:

document.getElementById("titreFormation").value,


domaine:

document.getElementById("domaineFormation").value,


description:

document.getElementById("descriptionFormation").value,


formateur:

document.getElementById("formateurFormation").value,


duree:

document.getElementById("dureeFormation").value,


dateFormation:

document.getElementById("dateFormation").value,


statut:"Disponible",


dateCreation:new Date()


}

);



afficherMessage(

"Formation créée avec succès.",

"success"

);



formFormation.reset();


modalFormation.style.display="none";



}

catch(erreur){


console.error(

"ERREUR CREATION FORMATION :",

erreur

);



afficherMessage(

"Erreur : "+erreur.message,

"error"

);


}



});


}









/*==================================================
        SUGGESTION FORMATION
==================================================*/


const formSuggestion =
document.getElementById("formSuggestion");



if(formSuggestion){


formSuggestion.addEventListener("submit",async(e)=>{


e.preventDefault();



try{


await addDoc(

collection(db,"suggestions_formations"),

{


titre:

document.getElementById("titreSuggestion").value,


domaine:

document.getElementById("domaineSuggestion").value,


description:

document.getElementById("descriptionSuggestion").value,


utilite:

document.getElementById("utiliteSuggestion").value,


statut:"En attente",


dateCreation:new Date()


}

);



afficherMessage(

"Votre suggestion a été envoyée.",

"success"

);



formSuggestion.reset();



modalSuggestion.style.display="none";



}

catch(erreur){


console.error(

"ERREUR SUGGESTION :",

erreur

);



afficherMessage(

"Erreur : "+erreur.message,

"error"

);


}



});


}









/*==================================================
        COMPTER LES SUGGESTIONS
==================================================*/


function chargerSuggestions(){


const q = collection(

db,

"suggestions_formations"

);



onSnapshot(q,(snapshot)=>{


if(totalSuggestions){


totalSuggestions.textContent =

snapshot.size;


}



});


}










/*==================================================
        DEMARRAGE
==================================================*/


chargerFormations();


chargerSuggestions();



console.log(

"Module formation opérationnel."

);
