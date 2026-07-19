/*==================================================
   FORMATIONUN.JS
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

   PARTIE 1/4
   Initialisation - Sécurité - Utilisateur
==================================================*/


// ==========================
// IMPORT FIREBASE
// ==========================

import { 
    realtime 
} from "./firebase-config.js";


import {

    ref,
    get,
    onValue,
    push,
    set,
    remove,
    update

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



console.log("FORMATION JS CONNECTÉ");




// ==========================
// VARIABLES GLOBALES
// ==========================


let utilisateurConnecte = null;

let roleUtilisateur = "membre";

let toutesLesFormations = [];

let toutesLesSuggestions = [];




// ==========================
// ELEMENTS HTML
// ==========================


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





// ==========================
// RECUPERATION UTILISATEUR
// ==========================


function chargerUtilisateur(){


    const data = 
    localStorage.getItem("utilisateurConnecte");


    if(!data){

        console.log("Aucun utilisateur connecté");

        return false;

    }



    utilisateurConnecte =
    JSON.parse(data);



    roleUtilisateur =
    (utilisateurConnecte.role || "membre")
    .toLowerCase();



    return true;


}





// ==========================
// CONTROLE DES DROITS
// ==========================


function estPresident(){


return roleUtilisateur === "president";


}




function estAdmin(){


return roleUtilisateur === "admin";


}





// ==========================
// AFFICHAGE DES BOUTONS
// ==========================


function gererAutorisations(){



const btnAjouter =
document.getElementById("btnAjouterFormation");



if(btnAjouter){


    if(
        estPresident() ||
        estAdmin()
    ){

        btnAjouter.style.display="block";


    }else{


        btnAjouter.style.display="none";


    }


}





const btnSuggestion =
document.getElementById("btnSuggestion");


if(btnSuggestion){

    btnSuggestion.style.display="block";

}



}




// ==========================
// DATE ET HEURE
// ==========================


function horloge(){


const date =
document.getElementById("date");


const heure =
document.getElementById("heure");



const maintenant =
new Date();



if(date)

date.textContent =
maintenant.toLocaleDateString("fr-FR");



if(heure)

heure.textContent =
maintenant.toLocaleTimeString("fr-FR");


}



setInterval(horloge,1000);

horloge();






// ==========================
// MESSAGE SYSTEME
// ==========================


function afficherMessage(texte,type="success"){



if(!message)

return;



message.textContent = texte;



message.className =
"message "+type;



setTimeout(()=>{


message.textContent="";


message.className="";


},4000);



}




// ==========================
// INITIALISATION
// ==========================


function initialiserFormation(){


const connecte =
chargerUtilisateur();



if(!connecte){


alert(
"Vous devez être connecté pour accéder aux formations."
);


window.location.href="connexion.html";


return;


}




gererAutorisations();



console.log(
"Utilisateur :",
utilisateurConnecte.nom,
"| rôle :",
roleUtilisateur
);



}




initialiserFormation();

/*==================================================
   PARTIE 2/4
   CHARGEMENT ET AFFICHAGE DES FORMATIONS
==================================================*/



// ==========================
// CHARGER LES FORMATIONS
// ==========================


function chargerFormations(){


const formationsRef =
ref(realtime,"formations");



onValue(formationsRef,(snapshot)=>{



toutesLesFormations = [];



if(snapshot.exists()){



const data =
snapshot.val();



Object.keys(data).forEach((id)=>{



toutesLesFormations.push({


id:id,

...data[id]


});



});



}




afficherFormations(
toutesLesFormations
);



mettreAJourStatistiques();



});



}







// ==========================
// AFFICHAGE TABLEAU
// ==========================


function afficherFormations(liste){



if(!listeFormations)

return;



listeFormations.innerHTML="";



if(liste.length===0){


listeFormations.innerHTML=`

<tr>

<td colspan="6">

Aucune formation disponible.

</td>

</tr>

`;

return;


}





liste.forEach((formation)=>{



listeFormations.innerHTML += `


<tr>


<td>

${formation.titre || "-"}

</td>



<td>

${formation.domaine || "-"}

</td>



<td>

${formation.formateur || "À définir"}

</td>



<td>

${formation.date || "-"}

</td>



<td>


<span class="badge">


${formation.statut || "Publié"}


</span>


</td>



<td>


<button 
class="btn-view"
onclick="voirFormation('${formation.id}')">


<i class="fa-solid fa-eye"></i>


</button>


</td>



</tr>


`;



});



}







// ==========================
// STATISTIQUES
// ==========================


function mettreAJourStatistiques(){



if(totalFormations)


totalFormations.textContent =
toutesLesFormations.length;





if(formationsCours){



formationsCours.textContent =

toutesLesFormations.filter(f=>

(f.statut || "").toLowerCase()
==="en cours"


).length;


}





if(formationsTerminees){



formationsTerminees.textContent =

toutesLesFormations.filter(f=>

(f.statut || "").toLowerCase()
==="terminée"

||


(f.statut || "").toLowerCase()
==="terminee"


).length;


}





}





// ==========================
// DETAILS FORMATION
// ==========================


window.voirFormation=function(id){



const formation =

toutesLesFormations.find(f=>

f.id===id

);



if(!formation)

return;



alert(

"Formation : "
+formation.titre
+"\n\nDomaine : "
+formation.domaine
+"\n\nDescription : "
+formation.description

);



};






// ==========================
// RECHERCHE FORMATIONS
// ==========================


function rechercherFormation(texte){



texte =
texte.toLowerCase();



const resultat =

toutesLesFormations.filter(f=>{


return (

(f.titre || "")
.toLowerCase()
.includes(texte)



||



(f.domaine || "")
.toLowerCase()
.includes(texte)



||



(f.formateur || "")
.toLowerCase()
.includes(texte)



);


});



afficherFormations(resultat);



}






// ==========================
// DEMARRAGE CHARGEMENT
// ==========================


chargerFormations();


/*==================================================
   PARTIE 3/4
   CREATION FORMATION
   PROPOSITIONS MEMBRES
==================================================*/



// ==========================
// ELEMENTS MODALES
// ==========================


const modalFormation =
document.getElementById("modalFormation");


const modalSuggestion =
document.getElementById("modalSuggestion");



const btnAjouterFormation =
document.getElementById("btnAjouterFormation");



const btnSuggestion =
document.getElementById("btnSuggestion");



const fermerFormation =
document.getElementById("fermerFormation");



const fermerSuggestion =
document.getElementById("fermerSuggestion");





// ==========================
// OUVERTURE MODALES
// ==========================


if(btnAjouterFormation){


btnAjouterFormation.onclick=()=>{


    if(
        estPresident() ||
        estAdmin()
    ){

        modalFormation.style.display="flex";


    }else{


        afficherMessage(
        "Seul le Président peut créer une formation.",
        "error"
        );


    }


};



}





if(btnSuggestion){


btnSuggestion.onclick=()=>{


modalSuggestion.style.display="flex";


};



}






// ==========================
// FERMETURE MODALES
// ==========================


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






// ==========================
// CREATION FORMATION
// PRESIDENT / ADMIN
// ==========================


const formFormation =
document.getElementById("formFormation");




if(formFormation){



formFormation.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



if(
!estPresident()
&&
!estAdmin()
){

afficherMessage(
"Autorisation refusée.",
"error"
);

return;

}




const nouvelleFormation = {



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



date:
document.getElementById("dateFormation").value,



statut:
"Publié",



auteur:
utilisateurConnecte.nom,



dateCreation:
new Date().toLocaleDateString("fr-FR")



};





const nouvelleRef =
push(ref(realtime,"formations"));




await set(
nouvelleRef,
nouvelleFormation
);




afficherMessage(
"Formation publiée avec succès."
);



formFormation.reset();



modalFormation.style.display="none";



});


}







// ==========================
// ENVOYER UNE SUGGESTION
// MEMBRE
// ==========================


const formSuggestion =
document.getElementById("formSuggestion");




if(formSuggestion){



formSuggestion.addEventListener(
"submit",
async(e)=>{


e.preventDefault();





const suggestion = {



titre:

document.getElementById("titreSuggestion").value,



domaine:

document.getElementById("domaineSuggestion").value,



description:

document.getElementById("descriptionSuggestion").value,



utilite:

document.getElementById("utiliteSuggestion").value,



auteur:

utilisateurConnecte.nom,



matricule:

utilisateurConnecte.matricule,



statut:

"En attente",



date:

new Date().toLocaleDateString("fr-FR")



};






const suggestionRef =
push(
ref(realtime,"suggestionsFormations")
);




await set(
suggestionRef,
suggestion
);




afficherMessage(
"Votre proposition a été envoyée au Président."
);




formSuggestion.reset();



modalSuggestion.style.display="none";



});


    }

/*==================================================
   PARTIE 4/4
   DECISION PRESIDENTIELLE
   ACCEPTATION / REFUS
==================================================*/


// ==========================
// CHARGER LES SUGGESTIONS
// ==========================


function chargerSuggestions(){


const suggestionsRef =
ref(realtime,"suggestionsFormations");



onValue(suggestionsRef,(snapshot)=>{



toutesLesSuggestions=[];



if(snapshot.exists()){



const data =
snapshot.val();



Object.keys(data).forEach((id)=>{


toutesLesSuggestions.push({


id:id,

...data[id]


});


});


}



afficherSuggestions();



if(totalSuggestions)

totalSuggestions.textContent =
toutesLesSuggestions.length;



});


}







// ==========================
// AFFICHAGE DES SUGGESTIONS
// (VISIBLE SUR BUREAU PRESIDENT)
// ==========================


function afficherSuggestions(){



const zone =
document.getElementById("listeSuggestions");



if(!zone)

return;



zone.innerHTML="";



if(toutesLesSuggestions.length===0){


zone.innerHTML=`

<p>
Aucune proposition en attente.
</p>

`;

return;

}





toutesLesSuggestions.forEach((s)=>{



zone.innerHTML += `


<div class="suggestion-card">


<h3>

${s.titre}

</h3>



<p>

<strong>Domaine :</strong>

${s.domaine}

</p>



<p>

<strong>Proposé par :</strong>

${s.auteur}

</p>



<p>

${s.description}

</p>



<p>

<strong>Utilité :</strong>

${s.utilite || "-"}

</p>





<button

class="btn-success"

onclick="accepterSuggestion('${s.id}')">

<i class="fa-solid fa-check"></i>

Accepter

</button>





<button

class="btn-danger"

onclick="refuserSuggestion('${s.id}')">

<i class="fa-solid fa-xmark"></i>

Refuser

</button>



</div>


`;



});


}







// ==========================
// ACCEPTER UNE PROPOSITION
// ==========================


window.accepterSuggestion = async function(id){



if(!estPresident()){


alert(
"Seul le Président peut valider une proposition."
);


return;


}





const suggestion =

toutesLesSuggestions.find(s=>

s.id===id

);



if(!suggestion)

return;






// Création automatique formation


const formationRef =
push(ref(realtime,"formations"));





await set(

formationRef,

{


titre:suggestion.titre,


domaine:suggestion.domaine,


description:suggestion.description,


formateur:"À définir",


duree:"À définir",


date:
new Date().toLocaleDateString("fr-FR"),


statut:"Publié",


auteur:
suggestion.auteur,


validation:
"Président",


datePublication:
new Date().toLocaleDateString("fr-FR")


}


);







// Suppression proposition


await remove(

ref(
realtime,
"suggestionsFormations/"+id

)

);






afficherMessage(
"Formation acceptée et publiée."
);



};









// ==========================
// REFUSER UNE PROPOSITION
// ==========================


window.refuserSuggestion = async function(id){



if(!estPresident()){


alert(
"Seul le Président peut refuser une proposition."
);


return;


}





const confirmation =
confirm(
"Refuser et supprimer cette proposition ?"
);



if(!confirmation)

return;






await remove(

ref(
realtime,
"suggestionsFormations/"+id

)

);






afficherMessage(
"Proposition refusée et supprimée."
);



};








// ==========================
// DEMARRAGE SUGGESTIONS
// ==========================


chargerSuggestions();




console.log(
"Module Formation MWANA MBOKA opérationnel."
);
