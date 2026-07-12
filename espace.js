/* =================================
   MWANA MBOKA
   ESPACE MEMBRE JAVASCRIPT
================================= */


/* ================================
   DONNEES MEMBRE (TEMPORAIRE)
   Remplacées plus tard par Firebase
================================ */


const membre = {

    nom: localStorage.getItem("nom") || "Membre",

    matricule: localStorage.getItem("matricule") || "MMB-0000",

    parrain: localStorage.getItem("parrain") || "---",

    statut: localStorage.getItem("statut") || "Actif",

    dateAdhesion: localStorage.getItem("dateAdhesion") || "--/--/----",

    telephone: localStorage.getItem("telephone") || "---------",

    photo: localStorage.getItem("photo") || "logo.png"

};




/* ================================
   AFFICHAGE PROFIL MEMBRE
================================ */


document.addEventListener("DOMContentLoaded",()=>{


    const elements = {


        nom: document.getElementById("nom"),
        nomBienvenue: document.getElementById("nomBienvenue"),
        nomMembre: document.getElementById("nomMembre"),

        matricule: document.getElementById("matricule"),
        matriculeCard: document.getElementById("matriculeCard"),

        parrain: document.getElementById("parrain"),

        statut: document.getElementById("statut"),

        dateAdhesion: document.getElementById("dateAdhesion"),

        telephone: document.getElementById("telephone"),

        photo: document.getElementById("photo")

    };




    if(elements.nom)
        elements.nom.textContent = membre.nom;


    if(elements.nomBienvenue)
        elements.nomBienvenue.textContent = membre.nom;


    if(elements.nomMembre)
        elements.nomMembre.textContent = membre.nom;



    if(elements.matricule)
        elements.matricule.textContent = membre.matricule;


    if(elements.matriculeCard)
        elements.matriculeCard.textContent = membre.matricule;



    if(elements.parrain)
        elements.parrain.textContent = membre.parrain;



    if(elements.statut)
        elements.statut.textContent = membre.statut;



    if(elements.dateAdhesion)
        elements.dateAdhesion.textContent = membre.dateAdhesion;



    if(elements.telephone)
        elements.telephone.textContent = membre.telephone;



    if(elements.photo)
        elements.photo.src = membre.photo;



});






/* ================================
   COMPTEURS TABLEAU DE BORD
================================ */


const statistiques = {

    cotisations:0,
    filleuls:0,
    revenus:"0 F",
    projets:0,
    formations:0,
    entraides:0,
    investissements:0,
    notifications:0

};




document.addEventListener("DOMContentLoaded",()=>{


    Object.keys(statistiques).forEach(id=>{


        const element=document.getElementById(id);


        if(element){

            element.textContent=statistiques[id];

        }


    });


});







/* ================================
   NOTIFICATIONS
================================ */


function afficherNotification(message){


    alert(message);


}




/* ================================
   DECONNEXION
================================ */


function deconnexion(){

    localStorage.removeItem("membreConnecte");

    window.location.href="index.html";

                                      }





/* ================================
   PREPARATION FIREBASE
================================ */


/*

Plus tard :

- récupération membre connecté
- affichage matricule automatique
- historique cotisations
- gestion parrainage
- revenus de parrainage
- projets
- formations

Firebase remplacera les données temporaires.

*/


const logout = document.getElementById("logout");

if(logout){

    logout.addEventListener("click", ()=>{

        localStorage.removeItem("membreConnecte");

    });

           }
