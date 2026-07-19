let posteSelectionne = "";


// OUVRIR LA FENETRE DE NOMINATION

function ouvrirNomination(poste){

    posteSelectionne = poste;

    document.getElementById("modalNomination").style.display = "flex";

    document.getElementById("posteChoisi").innerHTML =
    "Poste à pourvoir : <b>" + poste + "</b>";

    document.getElementById("profilMembre").innerHTML = "";

    document.getElementById("matricule").value = "";

}



// FERMER LA FENETRE

function fermerNomination(){

    document.getElementById("modalNomination").style.display = "none";

}



// RECHERCHE MEMBRE PAR MATRICULE

function rechercherMembre(){


    let matricule = document.getElementById("matricule").value.trim();



    if(matricule === ""){

        alert("Veuillez entrer un matricule");

        return;

    }



    /*
    Cette partie sera remplacée par Firebase :

    firebase.database()
    .ref("membres/"+matricule)
    .once("value")
    */


    // Exemple temporaire

    let membreExemple = {

        nom:"OBAMI",
        prenom:"Amour Joram",
        matricule:matricule,
        statut:"Membre actif"

    };



    afficherProfil(membreExemple);



}



// AFFICHAGE DU PROFIL

function afficherProfil(membre){


    document.getElementById("profilMembre").innerHTML = `

    <div class="profil-resultat">

        <h3>Profil trouvé</h3>

        <p>
        Nom :
        ${membre.nom}
        </p>


        <p>
        Prénom :
        ${membre.prenom}
        </p>


        <p>
        Matricule :
        ${membre.matricule}
        </p>


        <p>
        Statut :
        ${membre.statut}
        </p>


    </div>

    `;


}



// VALIDATION NOMINATION

function validerNomination(){


    let matricule =
    document.getElementById("matricule").value;



    if(matricule === ""){

        alert("Aucun membre sélectionné");

        return;

    }



    let confirmation =
    confirm(
    "Confirmer la nomination de ce membre avec la signature présidentielle ?"
    );



    if(confirmation){


        /*
        Enregistrement Firebase prévu :

        organigramme/
          poste/
             responsableMatricule
             dateNomination
             validePar

        */


        alert(
        "Nomination enregistrée avec succès"
        );


        fermerNomination();


    }



    }
