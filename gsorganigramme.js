/*==================================================
 GSORGANIGRAMME.JS
 GESTION STRATEGIQUE ORGANIGRAMME
 COMMUNAUTE NUMERIQUE MWANA MBOKA
==================================================*/


/*==============================
        FIREBASE
==============================*/

import {

realtime

} from "./firebase-config.js";


import {

ref,
get,
set,
update,
onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



console.log("GS Organigramme chargé");







/*==============================
        VARIABLES
==============================*/


let membreSelectionne = null;









/*==============================
        RECHERCHE MEMBRE
        PAR MATRICULE
==============================*/


const btnRecherche =
document.getElementById("btnRecherche");



if(btnRecherche){


btnRecherche.onclick = async()=>{


const matricule =
document
.getElementById("matriculeRecherche")
.value
.trim();



if(!matricule){

alert(
"Veuillez entrer un matricule."
);

return;

}




const membreRef =
ref(
realtime,
"membres/"+matricule
);



const snapshot =
await get(membreRef);





const zone =
document.getElementById(
"profilMembre"
);





if(snapshot.exists()){


const membre =
snapshot.val();



membreSelectionne = {

matricule:matricule,

...membre

};





zone.innerHTML = `

<div class="profil-box">


<h3>

${membre.nom || "Nom inconnu"}

</h3>


<p>

Matricule :
<strong>${matricule}</strong>

</p>


<p>

Téléphone :
${membre.telephone || "-"}

</p>


<p>

Statut :
Membre actif

</p>


</div>


`;



}

else{


membreSelectionne=null;


zone.innerHTML = `

<p>

Aucun membre trouvé.

</p>

`;



}


};


}









/*==============================
        NOMINATION
==============================*/



const btnNommer =
document.getElementById(
"btnNommer"
);





if(btnNommer){


btnNommer.onclick = async()=>{



if(!membreSelectionne){


alert(
"Veuillez rechercher un membre avant la nomination."
);


return;


}




const domaine =
document
.getElementById(
"domaineNomination"
)
.value;





const poste =
document
.getElementById(
"posteNomination"
)
.value;





if(!domaine || !poste){


alert(
"Choisissez un domaine et un poste."
);


return;


}






const confirmation =
confirm(

"Confirmer la nomination de "
+
membreSelectionne.nom
+
" ?"

);



if(!confirmation)
return;






const code =
prompt(
"Entrer le code présidentiel"
);





if(!code){

alert(
"Validation annulée."
);

return;

}








/*==============================
    CREATION ORGANIGRAMME
==============================*/


const nomination = {


nom:

membreSelectionne.nom,


matricule:

membreSelectionne.matricule,


fonction:

poste,


domaine:

domaine,


dateNomination:

new Date()
.toISOString(),



statut:

"Actif",




permissions:{


gestion:true,


validation:false,


suppression:false,


rapport:true


}



};










await set(

ref(

realtime,

"organigramme/"+domaine

),

nomination

);









/*==============================
 CREATION BUREAU DIRECTEUR
==============================*/


await set(

ref(

realtime,

"bureaux/"+membreSelectionne.matricule

),

{


nom:

membreSelectionne.nom,


matricule:

membreSelectionne.matricule,


domaine:

domaine,


fonction:

poste,


autorisation:

"Directeur",


statut:

"Actif"



}

);










/*==============================
 JOURNAL
==============================*/


await set(

ref(

realtime,

"journal_activites/"+Date.now()

),

{


message:

"Nomination de "
+
membreSelectionne.nom
+
" comme "
+
poste
+
" dans "
+
domaine,


date:

new Date()
.toISOString()



}

);







alert(
"Nomination enregistrée avec succès."
);



};


}









/*==============================
 RESPONSABLES ACTUELS
==============================*/


const listeResponsables =
document.getElementById(
"listeResponsables"
);




if(listeResponsables){



onValue(

ref(
realtime,
"organigramme"

),

(snapshot)=>{



let html="";



if(snapshot.exists()){



Object.values(snapshot.val())
.forEach(res=>{


html += `

<div class="responsable-card">


<h3>

${res.fonction}

</h3>


<p>

${res.nom}

</p>


<p>

Matricule :
${res.matricule}

</p>


<p>

Domaine :
${res.domaine}

</p>



</div>

`;



});


}



listeResponsables.innerHTML =

html ||

"Aucun responsable nommé.";



}

);



}








console.log(

"GS Organigramme opérationnel"

);
