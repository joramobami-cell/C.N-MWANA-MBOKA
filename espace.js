/*==================================================
    ESPACE.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

    Gestion :
    - Session membre
    - Profil membre
    - Accès Président
    - Statistiques tableau de bord
    - Déconnexion
==================================================*/


//==================================================
// INITIALISATION ESPACE MEMBRE
//==================================================

document.addEventListener("DOMContentLoaded",()=>{


console.log("ESPACE MEMBRE JS CHARGÉ");



//==================================================
// CHARGEMENT SESSION MEMBRE
//==================================================


const membre = {


    id:
    localStorage.getItem("membreId"),


    nom:
    localStorage.getItem("nom"),


    matricule:
    localStorage.getItem("matricule"),


    telephone:
    localStorage.getItem("telephone"),


    statut:
    localStorage.getItem("statut"),


    parrain:
    localStorage.getItem("parrain"),


    dateAdhesion:
    localStorage.getItem("dateAdhesion"),


    photo:
    localStorage.getItem("photo"),


    role:
    localStorage.getItem("role")


};




console.log("SESSION MEMBRE :",membre);





//==================================================
// VERIFICATION CONNEXION
//==================================================


if(!membre.nom || !membre.matricule){


alert("Session expirée. Veuillez vous reconnecter.");


window.location.href="connexion.html";


return;


}





//==================================================
// AFFICHAGE INFORMATIONS MEMBRE
//==================================================


function afficherInformation(id,valeur){


const element =
document.getElementById(id);


if(element){

element.textContent = valeur;

}


}





afficherInformation(
"nom",
membre.nom
);



afficherInformation(
"nomBienvenue",
membre.nom
);



afficherInformation(
"nomMembre",
membre.nom
);




afficherInformation(
"matricule",
membre.matricule
);



afficherInformation(
"matriculeCard",
membre.matricule
);



afficherInformation(
"telephone",
membre.telephone || "---"
);



afficherInformation(
"statut",
membre.statut || "Actif"
);



afficherInformation(
"parrain",
membre.parrain || "---"
);



afficherInformation(
"dateAdhesion",
membre.dateAdhesion || "---"
);






//==================================================
// PHOTO PROFIL
//==================================================


const photo =
document.getElementById("photo");


if(photo){


photo.src =
membre.photo || "logo.png";


}




//==================================================
// ACCES BUREAU PRESIDENT
//==================================================


const bureauPresident =
document.getElementById("bureauPresident");



if(bureauPresident){


if(

membre.role === "president"

||


membre.role === "Président"

){


bureauPresident.style.display="block";


}else{


bureauPresident.style.display="none";


}


}





//==================================================
// STATISTIQUES TABLEAU DE BORD
//==================================================


const statistiques = {


cotisations:"0 FCFA",


filleuls:0,


revenus:"0 FCFA",


projets:0,


formations:0,


entraides:0,


investissements:0,


notifications:0


};




Object.keys(statistiques).forEach((id)=>{


const element =
document.getElementById(id);



if(element){


element.textContent =
statistiques[id];


}


});





//==================================================
// DECONNEXION
//==================================================


const logout =
document.getElementById("logout");



if(logout){


logout.addEventListener("click",()=>{


const confirmation =
confirm(
"Voulez-vous vous déconnecter ?"
);



if(!confirmation)

return;



localStorage.clear();


window.location.href="connexion.html";


});


}





//==================================================
// FIN INITIALISATION
//==================================================


console.log(
"Espace membre opérationnel"
);



});
