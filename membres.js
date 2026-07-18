/*==================================================
    MEMBRES.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
    VERSION REALTIME DATABASE
==================================================*/


import { realtime } from "./firebase-config.js";


import {

ref,
onValue,
remove,
get

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



console.log("MEMBRES JS CHARGE");



/*================ ELEMENTS ================*/


const listeMembres =
document.getElementById("listeMembres");


const totalMembres =
document.getElementById("totalMembres");


const membresActifs =
document.getElementById("membresActifs");


const nouveauxMembres =
document.getElementById("nouveauxMembres");


const totalParrains =
document.getElementById("totalParrains");


const recherche =
document.getElementById("recherche");



let membresListe = [];






/*================ DATE HEURE ================*/


function horloge(){


const date =
document.getElementById("date");


const heure =
document.getElementById("heure");



const maintenant = new Date();



if(date)

date.textContent =
maintenant.toLocaleDateString("fr-FR");



if(heure)

heure.textContent =
maintenant.toLocaleTimeString("fr-FR");

}



setInterval(horloge,1000);

horloge();







/*================ CHARGEMENT MEMBRES ================*/


function chargerMembres(){



const membresRef =
ref(realtime,"membres");



onValue(membresRef,(snapshot)=>{



membresListe = [];



if(snapshot.exists()){



const data =
snapshot.val();



Object.keys(data).forEach((id)=>{


membresListe.push({

id:id,

...data[id]

});


});


}




afficherMembres(membresListe);


actualiserStatistiques(membresListe);



});



}



chargerMembres();








/*================ AFFICHAGE TABLEAU ================*/


function afficherMembres(liste){



if(!listeMembres)

return;



listeMembres.innerHTML="";



if(liste.length===0){


listeMembres.innerHTML=`

<tr>

<td colspan="8">

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

style="border-radius:50%;object-fit:cover">


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

${membre.statut || "Actif"}

</td>



<td>

${membre.dateAdhesion || "-"}

</td>


<td>

<button 
class="btn-view"
onclick='voirMembre(${JSON.stringify(membre)})'>

<i class="fa-solid fa-eye"></i>

</button>


<button 
class="btn-delete"
onclick="supprimerMembre('${membre.id}')">

<i class="fa-solid fa-trash"></i>

</button>


</td>



</tr>



`;


});



}









/*================ STATISTIQUES ================*/


function actualiserStatistiques(liste){



if(totalMembres)

totalMembres.textContent =
liste.length;



if(membresActifs)

membresActifs.textContent =

liste.filter(m=>

m.statut==="Actif"

).length;




if(nouveauxMembres)

nouveauxMembres.textContent =

liste.slice(-5).length;




if(totalParrains){



let parrains = [];


liste.forEach(m=>{


if(m.parrain && !parrains.includes(m.parrain)){


parrains.push(m.parrain);


}


});



totalParrains.textContent =
parrains.length;


}



}









/*================ RECHERCHE ================*/


if(recherche){



recherche.addEventListener("input",()=>{



const texte =

recherche.value.toLowerCase();



const resultat =

membresListe.filter(m=>{


return (

(m.nom || "")
.toLowerCase()
.includes(texte)


||


(m.matricule || "")
.toLowerCase()
.includes(texte)


||


(m.telephone || "")
.includes(texte)


);


});



afficherMembres(resultat);



});


}










/*================ DETAILS MEMBRE ================*/


window.voirMembre=function(membre){



const modal =
document.getElementById("modalMembre");



if(!modal)

return;



document.getElementById("photoMembre").src =
membre.photo || "logo.png";


document.getElementById("nomDetail").textContent =
membre.nom || "-";


document.getElementById("matriculeDetail").textContent =
membre.matricule || "-";


document.getElementById("telephoneDetail").textContent =
membre.telephone || "-";


document.getElementById("parrainDetail").textContent =
membre.parrain || "-";


document.getElementById("statutDetail").textContent =
membre.statut || "-";


document.getElementById("dateDetail").textContent =
membre.dateAdhesion || "-";



modal.style.display="flex";


};







/*================ FERMETURE MODAL ================*/


const closeBtn =
document.querySelector(".close");


const btnClose =
document.querySelector(".btn-close");



function fermerModal(){


const modal =
document.getElementById("modalMembre");


if(modal)

modal.style.display="none";


}



if(closeBtn)

closeBtn.onclick =
fermerModal;



if(btnClose)

btnClose.onclick =
fermerModal;






/*================ FOOTER ================*/


const annee =
document.getElementById("annee");


if(annee)

annee.textContent =
new Date().getFullYear();

window.supprimerMembre = async function(id){


const confirmation = confirm(
"Suppression définitive de ce membre ?"
);


if(!confirmation)

return;



// Vérification autorisation président

const matriculePresident = localStorage.getItem("matricule");


if(!membreConnecte){


alert("Aucun membre connecté.");


return;


}



const roleRef = ref(
realtime,
"membres/"+matriculePresident+"/role"
);



const snapshot = await get(roleRef);



const role = snapshot.val();



if(!role || role.toLowerCase() !== "president"){


alert(
"Accès refusé : seul le président peut supprimer un membre."
);


return;


    }




try{


await remove(

ref(realtime,"membres/"+id)

);



alert(
"Membre supprimé avec succès."
);



}


catch(erreur){


console.error(erreur);


alert(
"Erreur suppression : "+erreur.message
);


}



};

console.log(
"MODULE MEMBRES OPERATIONNEL"
);
