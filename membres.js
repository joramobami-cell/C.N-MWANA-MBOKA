/*==================================================
    MEMBRES.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    VERSION REALTIME DATABASE
==================================================*/


import { realtime } from "./firebase-config.js";


import {

ref,
onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



console.log("MEMBRES JS CHARGE");





/*==================================================
        ELEMENTS
==================================================*/


const listeMembres = 
document.getElementById("listeMembres");


const totalMembres =
document.getElementById("totalMembres");


const recherche =
document.getElementById("recherche");





let tousLesMembres = [];







/*==================================================
        CHARGEMENT MEMBRES
==================================================*/


function chargerMembres(){



const membresRef = ref(

realtime,

"membres"

);




onValue(membresRef,(snapshot)=>{



tousLesMembres = [];



if(snapshot.exists()){



const donnees = snapshot.val();



Object.keys(donnees).forEach((id)=>{



tousLesMembres.push({

id:id,

...donnees[id]

});


});



}





// tri par matricule

tousLesMembres.sort((a,b)=>{

return a.matricule.localeCompare(b.matricule);

});





afficherMembres(tousLesMembres);







if(totalMembres){


totalMembres.textContent = 

tousLesMembres.length;


}





console.log(

"Membres chargés :",

tousLesMembres.length

);



},(erreur)=>{


console.error(

"Erreur chargement membres :",

erreur

);


});



}







/*==================================================
        AFFICHAGE
==================================================*/


function afficherMembres(liste){



if(!listeMembres)

return;



listeMembres.innerHTML="";





if(liste.length===0){



listeMembres.innerHTML=`

<tr>

<td colspan="6">

Aucun membre enregistré.

</td>

</tr>

`;

return;


}







liste.forEach((membre)=>{



listeMembres.innerHTML += `



<tr>



<td>


<img src="${membre.photo || "logo.png"}"

width="50"

height="50"

style="border-radius:50%;object-fit:cover;">


</td>




<td>

${membre.nom || "-"}

</td>





<td>

${membre.matricule || "-"}

</td>





<td>

${membre.telephone || "-"}

</td>





<td>

${membre.parrain || "-"}

</td>





<td>

<span>

${membre.statut || "Actif"}

</span>

</td>



</tr>



`;



});



}









/*==================================================
        RECHERCHE
==================================================*/


if(recherche){



recherche.addEventListener(

"input",

()=>{



const texte = 

recherche.value.toLowerCase();



const resultat = 

tousLesMembres.filter((m)=>{



return (

m.nom?.toLowerCase().includes(texte)

||

m.matricule?.toLowerCase().includes(texte)

);



});





afficherMembres(resultat);



}



);



}









/*==================================================
        DEMARRAGE
==================================================*/


chargerMembres();


console.log(

"MODULE MEMBRES OPERATIONNEL"

);
