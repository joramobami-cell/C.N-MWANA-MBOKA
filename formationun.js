/*==================================================
    FORMATIONUN.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    MODULE GESTION DES FORMATIONS
==================================================*/


import { db } from "./firebase-config.js";


import {

    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";





console.log("==================================");
console.log("FORMATIONUN.JS CHARGE");
console.log("MWANA MBOKA");
console.log("==================================");





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


function afficherMessage(texte,type="success"){


if(!message) return;


message.innerHTML = texte;


message.className = "message "+type;



setTimeout(()=>{


message.innerHTML="";


message.className="";


},4000);



}







/*==================================================
        MODALES
==================================================*/


const btnAjouterFormation =
document.getElementById("btnAjouterFormation");


const modalFormation =
document.getElementById("modalFormation");


const fermerFormation =
document.getElementById("fermerFormation");




if(btnAjouterFormation && modalFormation){


btnAjouterFormation.addEventListener("click",()=>{


modalFormation.style.display="flex";


});


}



if(fermerFormation){


fermerFormation.addEventListener("click",()=>{


modalFormation.style.display="none";


});


}







const btnSuggestion =
document.getElementById("btnSuggestion");


const modalSuggestion =
document.getElementById("modalSuggestion");


const fermerSuggestion =
document.getElementById("fermerSuggestion");




if(btnSuggestion && modalSuggestion){


btnSuggestion.addEventListener("click",()=>{


modalSuggestion.style.display="flex";


});


}




if(fermerSuggestion){


fermerSuggestion.addEventListener("click",()=>{


modalSuggestion.style.display="none";


});


}





window.addEventListener("click",(e)=>{


if(e.target===modalFormation){


modalFormation.style.display="none";


}



if(e.target===modalSuggestion){


modalSuggestion.style.display="none";


}



});







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




snapshot.forEach((item)=>{


formations.push({

id:item.id,

...item.data()

});


});





afficherFormations(formations);


mettreAJourStatistiques(formations);



},(erreur)=>{


console.error(erreur);


afficherMessage(

"Erreur chargement : "+erreur.message,

"error"

);


});



}







/*==================================================
        AFFICHAGE TABLEAU
==================================================*/


function afficherFormations(formations){


if(!listeFormations) return;



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


<td>${formation.titre || "-"}</td>


<td>${formation.domaine || "-"}</td>


<td>${formation.formateur || "-"}</td>


<td>${formation.dateFormation || "-"}</td>



<td>

<span class="badge badge-actif">

${formation.statut || "Disponible"}

</span>


</td>



<td>


<button class="btn-secondary"

onclick="participerFormation('${formation.id}')">


<i class="fa-solid fa-user-plus"></i>

Participer


</button>




<button class="btn-delete"

onclick="supprimerFormation('${formation.id}')">


<i class="fa-solid fa-trash"></i>


</button>


</td>


</tr>


`;



});



}

/*==================================================
        STATISTIQUES
==================================================*/


function mettreAJourStatistiques(formations){



if(totalFormations){

    totalFormations.textContent =
    formations.length;

}



if(formationsCours){


    formationsCours.textContent =

    formations.filter((f)=>


        f.statut==="En cours"


    ).length;


}



if(formationsTerminees){


    formationsTerminees.textContent =

    formations.filter((f)=>


        f.statut==="Terminée"


    ).length;


}



}








/*==================================================
        CREATION FORMATION
==================================================*/


const formFormation =

document.getElementById("formFormation");




if(formFormation){



formFormation.addEventListener("submit",async(e)=>{



e.preventDefault();



const bouton =
formFormation.querySelector("button");



try{


if(bouton){


bouton.disabled=true;


bouton.innerHTML=

`

<i class="fa-solid fa-spinner fa-spin"></i>

Enregistrement...

`;

}


console.log("Tentative création formation...");

await addDoc(

collection(db,"formations"),

{


titre:

document.getElementById("titreFormation").value.trim(),



domaine:

document.getElementById("domaineFormation").value,



description:

document.getElementById("descriptionFormation").value.trim(),



formateur:

document.getElementById("formateurFormation").value.trim(),



duree:

document.getElementById("dureeFormation").value.trim(),



dateFormation:

document.getElementById("dateFormation").value,



statut:

"Disponible",



dateCreation:

serverTimestamp()


}

);





afficherMessage(

"Formation créée avec succès.",

"success"

);




formFormation.reset();



if(modalFormation){

modalFormation.style.display="none";

}



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



finally{


if(bouton){


bouton.disabled=false;


bouton.innerHTML=

`

<i class="fa-solid fa-save"></i>

Enregistrer la formation

`;



}



}



});


}









/*==================================================
        SUPPRESSION
==================================================*/


window.supprimerFormation = async function(id){



const confirmation = confirm(

"Voulez-vous supprimer cette formation ?"

);



if(!confirmation) return;



try{


await deleteDoc(

doc(db,"formations",id)

);



afficherMessage(

"Formation supprimée.",

"success"

);



}



catch(erreur){



console.error(erreur);



afficherMessage(

"Erreur suppression : "+erreur.message,

"error"

);



}



};









/*==================================================
        PARTICIPATION
==================================================*/


window.participerFormation=function(id){


alert(

"Votre demande de participation a été enregistrée."

);



};









/*==================================================
        SUGGESTIONS
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

document.getElementById("titreSuggestion").value.trim(),



domaine:

document.getElementById("domaineSuggestion").value,



description:

document.getElementById("descriptionSuggestion").value.trim(),



utilite:

document.getElementById("utiliteSuggestion").value.trim(),



statut:

"En attente",



dateCreation:

serverTimestamp()


}

);





afficherMessage(

"Suggestion envoyée avec succès.",

"success"

);



formSuggestion.reset();



if(modalSuggestion){

modalSuggestion.style.display="none";

}



}



catch(erreur){



console.error(erreur);



afficherMessage(

"Erreur suggestion : "+erreur.message,

"error"

);



}



});



}









/*==================================================
        COMPTEUR SUGGESTIONS
==================================================*/


function chargerSuggestions(){



onSnapshot(

collection(db,"suggestions_formations"),

(snapshot)=>{



if(totalSuggestions){


totalSuggestions.textContent =

snapshot.size;


}



}



);



}









/*==================================================
        DEMARRAGE
==================================================*/


chargerFormations();


chargerSuggestions();



console.log(

"FORMATIONUN.JS OPERATIONNEL"

);
