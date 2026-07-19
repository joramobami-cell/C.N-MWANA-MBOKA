/*==================================================
    FORMATIONUN.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

    Gestion :
    - Propositions membres
    - Formations publiées
    - Statistiques
    - Validation présidentielle
==================================================*/


import { realtime } from "./firebase-config.js";


import {

ref,
push,
set,
onValue,
remove,
update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



console.log("FORMATION JS CHARGÉ");




//==================================================
// ELEMENTS HTML
//==================================================


const formulaire =
document.getElementById("formFormation");


const listeFormations =
document.getElementById("listeFormations");


const totalFormations =
document.getElementById("totalFormations");


const formationsActives =
document.getElementById("formationsActives");


const propositions =
document.getElementById("propositions");




//==================================================
// SESSION MEMBRE
//==================================================


const utilisateur = {


nom:
localStorage.getItem("nom"),


matricule:
localStorage.getItem("matricule"),


role:
localStorage.getItem("role")


};




//==================================================
// DATE
//==================================================


function dateActuelle(){

return new Date()
.toLocaleDateString("fr-FR");

}




//==================================================
// ENVOYER UNE PROPOSITION
//==================================================


if(formulaire){


formulaire.addEventListener("submit",async(e)=>{


e.preventDefault();



const titre =
document.getElementById("titreFormation").value.trim();


const domaine =
document.getElementById("domaineFormation").value.trim();


const description =
document.getElementById("descriptionFormation").value.trim();


const duree =
document.getElementById("dureeFormation").value.trim();



if(!titre || !domaine || !description){


alert("Veuillez remplir les champs obligatoires.");


return;

}




const nouvelleFormation =
push(
ref(realtime,"suggestionsFormations")
);



await set(
nouvelleFormation,
{


titre,


domaine,


description,


duree,


auteur:
utilisateur.nom || "Membre",


matriculeAuteur:
utilisateur.matricule || "",


date:
dateActuelle(),


statut:
"En attente"


}

);



alert(
"Votre proposition a été envoyée au Président pour validation."
);



formulaire.reset();



});


}






//==================================================
// AFFICHAGE FORMATIONS PUBLIÉES
//==================================================


function chargerFormations(){



const formationsRef =
ref(realtime,"formations");



onValue(formationsRef,(snapshot)=>{


if(!listeFormations)

return;



listeFormations.innerHTML="";


let compteur=0;



if(snapshot.exists()){



snapshot.forEach((item)=>{


const formation =
item.val();



compteur++;



listeFormations.innerHTML += `

<div class="formation-card">


<h3>
${formation.titre}
</h3>


<p>
<strong>Domaine :</strong>
${formation.domaine}
</p>


<p>
${formation.description}
</p>


<p>
<strong>Durée :</strong>
${formation.duree || "-"}
</p>


<span class="badge">

${formation.statut}

</span>


</div>

`;



});



}else{


listeFormations.innerHTML =
"<p>Aucune formation publiée.</p>";



}



if(totalFormations)

totalFormations.textContent =
compteur;



if(formationsActives)

formationsActives.textContent =
compteur;



});



}



chargerFormations();






//==================================================
// PRESIDENT : VALIDATION
//==================================================


function chargerPropositionsPresident(){



const refPropositions =
ref(
realtime,
"suggestionsFormations"
);



onValue(refPropositions,(snapshot)=>{


if(!propositions)

return;



propositions.innerHTML="";



if(snapshot.exists()){



snapshot.forEach((item)=>{


const id =
item.key;


const formation =
item.val();



propositions.innerHTML += `

<div class="validation-card">


<h3>
${formation.titre}
</h3>


<p>
${formation.description}
</p>


<p>
Proposé par :
${formation.auteur}
</p>


<button onclick="accepterFormation('${id}')">

✅ Accepter

</button>



<button onclick="refuserFormation('${id}')">

❌ Refuser

</button>


</div>

`;



});


}else{


propositions.innerHTML =
"<p>Aucune proposition en attente.</p>";


}



});


}



if(

utilisateur.role === "president"

|| utilisateur.role === "Président"

){


chargerPropositionsPresident();


}







//==================================================
// ACCEPTATION PRESIDENT
//==================================================


window.accepterFormation =
async function(id){



const source =
ref(
realtime,
"suggestionsFormations/"+id
);



const nouvelle =
ref(
realtime,
"formations/"+id
);



onValue(source,async(snapshot)=>{


if(snapshot.exists()){



const formation =
snapshot.val();



await set(
nouvelle,
{


...formation,


statut:
"Publié",


validePar:
"Président"


}

);



await remove(source);



alert(
"Formation publiée avec succès."
);



}



},{onlyOnce:true});



};







//==================================================
// REFUS PRESIDENT
//==================================================


window.refuserFormation =
async function(id){



const confirmation =
confirm(
"Supprimer cette proposition ?"
);



if(!confirmation)

return;



await remove(

ref(
realtime,
"suggestionsFormations/"+id

)

);



alert(
"Proposition refusée et supprimée."
);



};







//==================================================
// FOOTER
//==================================================


const annee =
document.getElementById("annee");


if(annee)

annee.textContent =
new Date().getFullYear();



console.log(
"MODULE FORMATION OPÉRATIONNEL"
);
