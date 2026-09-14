/*==================================================
  PROFIL.JS
  COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
  PROFIL NUMÉRIQUE DU MEMBRE
==================================================*/

"use strict";


/*==================================================
  FIREBASE
==================================================*/

import { realtime, storage } from "./firebase-config.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


console.log("PROFIL JS CHARGÉ");



/*==================================================
  ELEMENTS
==================================================*/

const photoProfil = document.getElementById("photoProfil");
const inputPhoto = document.getElementById("inputPhoto");
const btnPhoto = document.getElementById("btnPhoto");
const btnSauver = document.getElementById("btnSauver");
const message = document.getElementById("message");


let idMembre = null;
let membreActuel = null;



/*==================================================
  MESSAGE
==================================================*/

function afficherMessage(txt, type){

    if(!message) return;

    message.textContent = txt;
    message.className = type;

    setTimeout(() => {

        message.textContent = "";
        message.className = "";

    }, 4000);
}



/*==================================================
  AFFICHER UNE VALEUR
==================================================*/

function afficher(id, valeur, defaut = "---"){

    const element = document.getElementById(id);

    if(!element) return;

    if(
        valeur === undefined ||
        valeur === null ||
        valeur === ""
    ){

        element.textContent = defaut;

    }else{

        element.textContent = valeur;

    }

}



/*==================================================
  CHARGER LE PROFIL
==================================================*/

async function chargerProfil(){

    try{

        idMembre = localStorage.getItem("membreId");

        /*
         * Sécurité supplémentaire :
         * si membreId n'existe pas, on essaie
         * de retrouver le membre avec son matricule.
         */

        if(!idMembre){

            const matriculeSession =
                localStorage.getItem("matricule");

            if(!matriculeSession){

                afficherMessage(
                    "Aucun membre connecté.",
                    "error"
                );

                return;
            }

            const membresRef = ref(
                realtime,
                "membres"
            );

            const snapshot = await get(membresRef);

            if(snapshot.exists()){

                const membres = snapshot.val();

                for(const id in membres){

                    if(
                        membres[id].matricule ===
                        matriculeSession
                    ){

                        idMembre = id;

                        break;

                    }

                }

            }

        }


        if(!idMembre){

            afficherMessage(
                "Impossible d'identifier le membre connecté.",
                "error"
            );

            return;

        }


        /*------------------------------------------
          LECTURE DU MEMBRE
        ------------------------------------------*/

        const membreRef = ref(
            realtime,
            "membres/" + idMembre
        );


        const snapshot = await get(membreRef);


        if(!snapshot.exists()){

            afficherMessage(
                "Profil introuvable.",
                "error"
            );

            return;

        }


        membreActuel = snapshot.val();


        afficherProfil(membreActuel);


        console.log(
            "PROFIL MEMBRE CHARGÉ :",
            membreActuel
        );


    }catch(erreur){

        console.error(
            "Erreur chargement profil :",
            erreur
        );

        afficherMessage(
            "Erreur lors du chargement du profil.",
            "error"
        );

    }

}



/*==================================================
  AFFICHER LE PROFIL
==================================================*/

function afficherProfil(m){

    if(!m) return;



    /*==============================================
      IDENTITÉ PRINCIPALE
    ==============================================*/

    afficher(
        "nom",
        m.nom
    );

    afficher(
        "matricule",
        m.matricule
    );

    afficher(
        "statut",
        m.statut,
        "Actif"
    );

    afficher(
        "dateAdhesion",
        m.dateAdhesion
    );



    /*==============================================
      IDENTITÉ COMPLETE
    ==============================================*/

    afficher(
        "identiteNom",
        m.nom
    );

    afficher(
        "identiteMatricule",
        m.matricule
    );

    afficher(
        "dateNaissance",
        m.dateNaissance
    );

    afficher(
        "lieuNaissance",
        m.lieuNaissance
    );

    afficher(
        "nationalite",
        m.nationalite
    );

    afficher(
        "sexe",
        m.sexe
    );

    afficher(
        "telephone",
        m.telephone
    );

    afficher(
        "email",
        m.email
    );

    afficher(
        "adresse",
        m.adresse
    );

    afficher(
        "identiteDateAdhesion",
        m.dateAdhesion
    );



    /*==============================================
      PARRAINAGE
    ==============================================*/

    afficher(
        "parrain",
        m.parrain
    );

    afficher(
        "matriculeParrain",
        m.matriculeParrain ||
        m.parrainMatricule ||
        m.codeParrain
    );

    afficher(
        "dateParrainage",
        m.dateParrainage
    );



    /*==============================================
      PROFESSION
    ==============================================*/

    afficher(
        "emploi",
        m.emploi ||
        m.profession
    );

    afficher(
        "fonction",
        m.fonction
    );

    afficher(
        "domaineActivite",
        m.domaineActivite ||
        m.domaine
    );

    afficher(
        "entreprise",
        m.entreprise ||
        m.structure
    );

    afficher(
        "competences",
        m.competences
    );



    /*==============================================
      VISION
    ==============================================*/

    afficher(
        "vision",
        m.vision,
        "Aucune vision renseignée."
    );

    afficher(
        "objectifs",
        m.objectifs,
        "Aucun objectif renseigné."
    );

    afficher(
        "ambitions",
        m.ambitions,
        "Aucune ambition renseignée."
    );



    /*==============================================
      FORMATIONS
    ==============================================*/

    afficher(
        "formationsTotal",
        m.formationsTotal || 0,
        "0"
    );

    afficher(
        "formationsEnCours",
        m.formationsEnCours || 0,
        "0"
    );

    afficher(
        "formationsTerminees",
        m.formationsTerminees || 0,
        "0"
    );



    /*==============================================
      PROJETS
    ==============================================*/

    afficher(
        "projetsTotal",
        m.projetsTotal || 0,
        "0"
    );

    afficher(
        "projetsEnCours",
        m.projetsEnCours || 0,
        "0"
    );

    afficher(
        "projetsRealises",
        m.projetsRealises || 0,
        "0"
    );



    /*==============================================
      FORMULAIRE DE MODIFICATION
    ==============================================*/

    remplirChamp(
        "editNom",
        m.nom
    );

    remplirChamp(
        "editTelephone",
        m.telephone
    );

    remplirChamp(
        "editEmail",
        m.email
    );

    remplirChamp(
        "editAdresse",
        m.adresse
    );

    remplirChamp(
        "editEmploi",
        m.emploi ||
        m.profession
    );

    remplirChamp(
        "editFonction",
        m.fonction
    );

    remplirChamp(
        "editDomaine",
        m.domaineActivite ||
        m.domaine
    );

    remplirChamp(
        "editEntreprise",
        m.entreprise ||
        m.structure
    );

    remplirChamp(
        "editCompetences",
        m.competences
    );

    remplirChamp(
        "editVision",
        m.vision
    );

    remplirChamp(
        "editObjectifs",
        m.objectifs
    );

    remplirChamp(
        "editAmbitions",
        m.ambitions
    );



    /*==============================================
      PHOTO
    ==============================================*/

    if(
        m.photo &&
        photoProfil
    ){

        photoProfil.src = m.photo;

    }

}



/*==================================================
  REMPLIR UN CHAMP
==================================================*/

function remplirChamp(id, valeur){

    const element =
        document.getElementById(id);

    if(!element) return;

    element.value =
        valeur === undefined ||
        valeur === null
            ? ""
            : valeur;

}



/*==================================================
  CHOISIR UNE PHOTO
==================================================*/

if(btnPhoto && inputPhoto){

    btnPhoto.addEventListener(
        "click",
        () => {

            inputPhoto.click();

        }
    );

}



/*==================================================
  ENVOYER LA PHOTO
==================================================*/

if(inputPhoto){

    inputPhoto.addEventListener(
        "change",
        async (e) => {

            const fichier =
                e.target.files[0];


            if(!fichier) return;


            if(!idMembre){

                afficherMessage(
                    "Membre non identifié.",
                    "error"
                );

                return;

            }


            try{

                afficherMessage(
                    "Envoi de la photo...",
                    "info"
                );


                const chemin =
                    "photos/" + idMembre;


                const imageRef =
                    storageRef(
                        storage,
                        chemin
                    );


                await uploadBytes(
                    imageRef,
                    fichier
                );


                const url =
                    await getDownloadURL(
                        imageRef
                    );


                await update(
                    ref(
                        realtime,
                        "membres/" + idMembre
                    ),
                    {
                        photo: url
                    }
                );


                if(photoProfil){

                    photoProfil.src = url;

                }


                if(membreActuel){

                    membreActuel.photo = url;

                }


                /*
                 * Synchronisation avec la session locale
                 */

                localStorage.setItem(
                    "photo",
                    url
                );


                afficherMessage(
                    "Photo mise à jour avec succès.",
                    "success"
                );


            }catch(erreur){

                console.error(
                    "Erreur photo :",
                    erreur
                );


                afficherMessage(
                    "Erreur photo : " +
                    erreur.message,
                    "error"
                );

            }

        }
    );

}



/*==================================================
  SAUVEGARDER LES INFORMATIONS
==================================================*/

if(btnSauver){

    btnSauver.addEventListener(
        "click",
        async () => {

            if(!idMembre){

                afficherMessage(
                    "Membre non identifié.",
                    "error"
                );

                return;

            }


            try{

                afficherMessage(
                    "Enregistrement en cours...",
                    "info"
                );


                /*----------------------------------
                  DONNÉES MODIFIABLES
                ----------------------------------*/

                const donnees = {

                    nom:
                        valeurChamp("editNom"),

                    telephone:
                        valeurChamp("editTelephone"),

                    email:
                        valeurChamp("editEmail"),

                    adresse:
                        valeurChamp("editAdresse"),

                    emploi:
                        valeurChamp("editEmploi"),

                    fonction:
                        valeurChamp("editFonction"),

                    domaineActivite:
                        valeurChamp("editDomaine"),

                    entreprise:
                        valeurChamp("editEntreprise"),

                    competences:
                        valeurChamp("editCompetences"),

                    vision:
                        valeurChamp("editVision"),

                    objectifs:
                        valeurChamp("editObjectifs"),

                    ambitions:
                        valeurChamp("editAmbitions")

                };


                await update(

                    ref(
                        realtime,
                        "membres/" + idMembre
                    ),

                    donnees

                );


                /*
                 * Mise à jour de la session
                 */

                localStorage.setItem(
                    "nom",
                    donnees.nom
                );

                localStorage.setItem(
                    "telephone",
                    donnees.telephone
                );


                afficherMessage(
                    "Profil mis à jour avec succès.",
                    "success"
                );


                await chargerProfil();


            }catch(erreur){

                console.error(
                    "Erreur modification :",
                    erreur
                );


                afficherMessage(
                    "Erreur modification : " +
                    erreur.message,
                    "error"
                );

            }

        }
    );

}



/*==================================================
  LIRE LA VALEUR D'UN CHAMP
==================================================*/

function valeurChamp(id){

    const element =
        document.getElementById(id);

    if(!element) return "";

    return element.value.trim();

}



/*==================================================
  INITIALISATION
==================================================*/

chargerProfil();
