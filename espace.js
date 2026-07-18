/* =====================================
   MWANA MBOKA
   ESPACE MEMBRE
   Chargement des informations membre
===================================== */



document.addEventListener("DOMContentLoaded", () => {



    // Récupération des données depuis la connexion Firebase

    const membre = {

       id: localStorage.getItem("membreId")
          
        nom: localStorage.getItem("nom"),

        matricule: localStorage.getItem("matricule"),

        telephone: localStorage.getItem("telephone"),

        statut: localStorage.getItem("statut"),

        parrain: localStorage.getItem("parrain"),

        dateAdhesion: localStorage.getItem("dateAdhesion"),

        photo: localStorage.getItem("photo")


    };



    // Vérification connexion

    if(!membre.nom || !membre.matricule){

        window.location.href="connexion.html";

        return;

    }




    // Affichage informations membre


    const nom = document.getElementById("nom");
    const nomBienvenue = document.getElementById("nomBienvenue");
    const nomMembre = document.getElementById("nomMembre");


    const matricule = document.getElementById("matricule");
    const matriculeCard = document.getElementById("matriculeCard");


    const telephone = document.getElementById("telephone");

    const statut = document.getElementById("statut");

    const parrain = document.getElementById("parrain");

    const dateAdhesion = document.getElementById("dateAdhesion");

    const photo = document.getElementById("photo");




    if(nom)
        nom.textContent = membre.nom;


    if(nomBienvenue)
        nomBienvenue.textContent = membre.nom;


    if(nomMembre)
        nomMembre.textContent = membre.nom;



    if(matricule)
        matricule.textContent = membre.matricule;


    if(matriculeCard)
        matriculeCard.textContent = membre.matricule;



    if(telephone)
        telephone.textContent = membre.telephone || "---";


    if(statut)
        statut.textContent = membre.statut || "Actif";


    if(parrain)
        parrain.textContent = membre.parrain || "---";


    if(dateAdhesion)
        dateAdhesion.textContent = membre.dateAdhesion || "---";


    if(photo && membre.photo)
        photo.src = membre.photo;




});





/* =====================================
   ACCÈS BUREAU PRÉSIDENT
===================================== */


const bureauPresident = document.getElementById("bureauPresident");


const utilisateur = JSON.parse(
    localStorage.getItem("utilisateurConnecte")
);



if(utilisateur && bureauPresident){


    if(
        utilisateur.role === "president" ||
        utilisateur.role === "Président"
    ){

        bureauPresident.style.display="block";

    }


}



/* =====================================
   DECONNEXION
===================================== */


const logout = document.getElementById("logout");


if(logout){


    logout.addEventListener("click",()=>{


        localStorage.clear();

        window.location.href="index.html";


    });


}







/* =====================================
   STATISTIQUES TABLEAU DE BORD
===================================== */


const statistiques = {


    cotisations:"0 F",

    filleuls:0,

    revenus:"0 F",

    projets:0,

    formations:0,

    entraides:0,

    investissements:0,

    notifications:0


};



document.addEventListener("DOMContentLoaded",()=>{


    Object.keys(statistiques).forEach((id)=>{


        const element=document.getElementById(id);


        if(element){

            element.textContent=statistiques[id];

        }


    });


});
