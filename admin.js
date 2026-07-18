/*==================================================
    ADMIN.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    VERSION REALTIME DATABASE STABLE
==================================================*/


import { realtime } from "./firebase-config.js";

import {

ref,
get,
set,
update,
remove,
onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


console.log("ADMIN JS CHARGÉ");



let utilisateurConnecte=null;

let matriculeAdmin="";

let membres=[];



/*================ ELEMENTS ================*/


const listeMembres=
document.getElementById("listeMembres");

const recherche=
document.getElementById("recherche");

const total=
document.getElementById("statTotal");

const actifs=
document.getElementById("statActifs");

const admins=
document.getElementById("statAdmins");







/*================ VERIFICATION DROITS ================*/


async function verifierAcces(){


matriculeAdmin=
localStorage.getItem("matricule");



if(!matriculeAdmin){


alert("Aucun utilisateur connecté.");

window.location.href="connexion.html";

return false;


}



const snapshot=
await get(
ref(realtime,"membres/"+matriculeAdmin)
);



if(!snapshot.exists()){


alert("Utilisateur introuvable.");

window.location.href="connexion.html";

return false;


}



utilisateurConnecte=
snapshot.val();



const role=
(utilisateurConnecte.role || "")
.toLowerCase();



if(
role!=="admin" &&
role!=="president"
){


alert(
"Accès réservé aux administrateurs."
);


window.location.href="espace.html";


return false;


}



return true;


}








/*================ CHARGEMENT MEMBRES ================*/


function chargerMembres(){


onValue(
ref(realtime,"membres"),
(snapshot)=>{


membres=[];


if(snapshot.exists()){


snapshot.forEach((item)=>{


membres.push({

id:item.key,

...item.val()

});


});


}



afficherMembres(membres);


statistiques(membres);



});


}








/*================ AFFICHAGE ================*/


function afficherMembres(liste){



if(!listeMembres)
return;



listeMembres.innerHTML="";



liste.forEach((m)=>{



listeMembres.innerHTML += `


<div class="carte-membre">


<img src="${m.photo || "logo.png"}"


class="photo-membre-admin">



<h3>${m.nom || "-"}</h3>


<p>
<strong>Matricule :</strong>
${m.matricule || m.id}
</p>



<p>
<strong>Téléphone :</strong>
${m.telephone || "-"}
</p>



<p>
<strong>Rôle :</strong>
${m.role || "membre"}
</p>



<p>
<strong>Statut :</strong>
${m.statut || "Actif"}
</p>



<div>


<button
onclick="modifierMembre('${m.id}')">

<i class="fa-solid fa-pen"></i>

Modifier

</button>



<button
onclick="supprimerMembre('${m.id}')">

<i class="fa-solid fa-trash"></i>

Supprimer

</button>



<button
onclick="changerRole('${m.id}')">

<i class="fa-solid fa-user-shield"></i>

Changer rôle

</button>


</div>



</div>


`;


});


}









/*================ STATISTIQUES ================*/


function statistiques(liste){



if(total)

total.textContent=
liste.length;



if(actifs)

actifs.textContent=

liste.filter(m=>

(m.statut||"")
.toLowerCase()=="actif"

).length;



if(admins)

admins.textContent=

liste.filter(m=>

{

let r=(m.role||"").toLowerCase();

return r=="admin" || r=="president";


}

).length;



}










/*================ SUPPRESSION ================*/


window.supprimerMembre=
async function(id){



const confirmation=
confirm(
"Supprimer ce membre définitivement ?"
);



if(!confirmation)
return;



if(id===matriculeAdmin){


alert(
"Vous ne pouvez pas supprimer votre propre compte."
);


return;


}



try{


await remove(
ref(realtime,"membres/"+id)
);



alert(
"Membre supprimé."
);



}

catch(e){


console.error(e);

alert(
"Erreur suppression."
);


}



};










/*================ CHANGER ROLE ================*/


window.changerRole=
async function(id){



if(id===matriculeAdmin){


alert(
"Vous ne pouvez pas modifier votre propre rôle."
);


return;


}



const membreRef=
ref(realtime,"membres/"+id);



const snapshot=
await get(membreRef);



if(!snapshot.exists())
return;



const membre=
snapshot.val();



const ancien=
(membre.role||"membre")
.toLowerCase();



const nouveau=
ancien==="admin"
?
"membre"
:
"admin";



if(!confirm(
"Changer le rôle de "+membre.nom+" ?"
))
return;



await update(
membreRef,
{
role:nouveau
}
);



alert(
"Rôle modifié."
);



};









/*================ MODIFICATION ================*/


window.modifierMembre=
function(id){


localStorage.setItem(
"modifierMembre",
id
);


window.location.href=
"profil.html";


};








/*================ RECHERCHE ================*/


if(recherche){


recherche.addEventListener(
"input",
(e)=>{


const texte=
e.target.value.toLowerCase();



const resultat=
membres.filter(m=>{


return (

(m.nom||"")
.toLowerCase()
.includes(texte)

||

(m.matricule||"")
.toLowerCase()
.includes(texte)

);


});



afficherMembres(resultat);



});


}








/*================ DEMARRAGE ================*/


async function demarrer(){


const ok=
await verifierAcces();



if(!ok)
return;



chargerMembres();


}



demarrer();


console.log(
"ADMIN MODULE OPERATIONNEL"
);
