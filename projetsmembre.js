/*==================================================
 PROJETSMEMBRE.JS
 ESPACE PROJETS DES MEMBRES
 COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

 VERSION CORRIGÉE
 PARTIE 1/3
==================================================*/

"use strict";


/*==================================================
 VARIABLES GLOBALES
==================================================*/

let realtime = null;

let firebaseReady = false;

let firebaseDatabase = null;


/*==================================================
 DONNÉES
==================================================*/

let projets = {};

let financements = {};

let avisProjets = {};


/*==================================================
 SESSION DU MEMBRE
==================================================*/

const membre = {

    id: "",

    nom: "",

    matricule: "",

    role: "",

    telephone: "",

    photo: ""

};


/*==================================================
 DÉMARRAGE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "================================="
        );

        console.log(
            "PROJETSMEMBRE.JS — DÉMARRAGE"
        );

        console.log(
            "================================="
        );


        /*------------------------------------------
         1. CHARGER LA SESSION
        ------------------------------------------*/

        chargerSession();


        /*------------------------------------------
         2. AFFICHER LES INFORMATIONS DISPONIBLES
        ------------------------------------------*/

        afficherInformationsMembre();


        /*------------------------------------------
         3. INITIALISER L'INTERFACE
        ------------------------------------------*/

        initialiserInterface();


        /*------------------------------------------
         4. INITIALISER LES BOUTONS
        ------------------------------------------*/

        initialiserEvenements();


        /*------------------------------------------
         5. CHARGER FIREBASE
        ------------------------------------------*/

        await chargerFirebase();

    }
);


/*==================================================
 CHARGER LA SESSION
==================================================*/

function chargerSession() {

    /*
     IMPORTANT :

     Cette fonction LIT simplement le localStorage.

     Elle ne supprime rien.
     Elle ne déconnecte personne.
     Elle ne redirige pas vers connexion.html.
    */


    membre.id =
        localStorage.getItem(
            "membreId"
        ) || "";


    membre.nom =
        localStorage.getItem(
            "nom"
        ) || "";


    membre.matricule =
        localStorage.getItem(
            "matricule"
        ) || "";


    membre.role =
        localStorage.getItem(
            "role"
        ) || "";


    membre.telephone =
        localStorage.getItem(
            "telephone"
        ) || "";


    membre.photo =
        localStorage.getItem(
            "photo"
        ) || "";


    console.log(
        "SESSION MEMBRE :",
        membre
    );
}


/*==================================================
 AFFICHER INFORMATIONS MEMBRE
==================================================*/

function afficherInformationsMembre() {

    /*
     Cette fonction est volontairement souple.

     Si un élément existe dans le HTML,
     on l'utilise.

     S'il n'existe pas,
     aucune erreur n'est provoquée.
    */


    const nomElements = [

        "nomMembre",

        "nom",

        "nomBienvenue",

        "porteurNom"

    ];


    nomElements.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    membre.nom ||
                    "Membre";
            }

        }
    );


    const matriculeElements = [

        "matriculeMembre",

        "matricule",

        "matriculeCard",

        "porteurMatricule"

    ];


    matriculeElements.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    membre.matricule ||
                    "---";
            }

        }
    );


    /*------------------------------------------
     PHOTO
    ------------------------------------------*/

    const photoElements = [

        "photo",

        "photoMembre",

        "photoProfil"

    ];


    photoElements.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (
                element &&
                membre.photo
            ) {

                element.src =
                    membre.photo;
            }

        }
    );
}


/*==================================================
 INITIALISER L'INTERFACE
==================================================*/

function initialiserInterface() {

    /*
     Les compteurs commencent à zéro.

     Ils seront remplacés lorsque Firebase
     aura chargé les données.
    */


    definirTexte(
        "totalProjets",
        "0"
    );


    definirTexte(
        "projetsAttente",
        "0"
    );


    definirTexte(
        "projetsEnCours",
        "0"
    );


    definirTexte(
        "projetsRealises",
        "0"
    );


    /*------------------------------------------
     CACHER LE FORMULAIRE AU DÉPART
    ------------------------------------------*/

    const formulaire =
        document.getElementById(
            "formulaireProjet"
        );


    if (formulaire) {

        formulaire.style.display =
            "none";
    }
}


/*==================================================
 INITIALISER LES ÉVÉNEMENTS
==================================================*/

function initialiserEvenements() {

    /*------------------------------------------
     BOUTON : SOUMETTRE
    ------------------------------------------*/

    const btnSoumettre =
        document.getElementById(
            "btnSoumettre"
        );


    if (btnSoumettre) {

        btnSoumettre.addEventListener(
            "click",
            function () {

                afficherSection(
                    "formulaireProjet"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON : PROJETS DISPONIBLES
    ------------------------------------------*/

    const btnProjets =
        document.getElementById(
            "btnProjets"
        );


    if (btnProjets) {

        btnProjets.addEventListener(
            "click",
            function () {

                afficherSection(
                    "sectionProjets"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON : MES PROJETS
    ------------------------------------------*/

    const btnMesProjets =
        document.getElementById(
            "btnMesProjets"
        );


    if (btnMesProjets) {

        btnMesProjets.addEventListener(
            "click",
            function () {

                afficherSection(
                    "sectionMesProjets"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON : MES FINANCEMENTS
    ------------------------------------------*/

    const btnFinancements =
        document.getElementById(
            "btnFinancements"
        );


    if (btnFinancements) {

        btnFinancements.addEventListener(
            "click",
            function () {

                afficherSection(
                    "sectionFinancements"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON : FERMER FORMULAIRE
    ------------------------------------------*/

    const btnFermer =
        document.getElementById(
            "btnFermerFormulaire"
        );


    if (btnFermer) {

        btnFermer.addEventListener(
            "click",
            function () {

                cacherSection(
                    "formulaireProjet"
                );

            }
        );
    }


    /*------------------------------------------
     FORMULAIRE
    ------------------------------------------*/

    const formulaire =
        document.getElementById(
            "formProjet"
        );


    if (formulaire) {

        formulaire.addEventListener(
            "submit",
            soumettreProjet
        );
    }


    console.log(
        "ÉVÉNEMENTS PROJETS INITIALISÉS"
    );
}


/*==================================================
 CHARGER FIREBASE
==================================================*/

async function chargerFirebase() {

    try {

        console.log(
            "Connexion à Firebase..."
        );


        /*------------------------------------------
         CONFIGURATION DU PROJET
        ------------------------------------------*/

        const config =
            await import(
                "./firebase-config.js"
            );


        realtime =
            config.realtime;


        if (!realtime) {

            throw new Error(
                "La base Realtime Database n'est pas disponible."
            );
        }


        /*------------------------------------------
         MODULE FIREBASE DATABASE
        ------------------------------------------*/

        firebaseDatabase =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js"
            );


        if (!firebaseDatabase) {

            throw new Error(
                "Le module Firebase Database est introuvable."
            );
        }


        firebaseReady =
            true;


        console.log(
            "Firebase connecté avec succès."
        );


        /*------------------------------------------
         CHARGER LES DONNÉES
        ------------------------------------------*/

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "ERREUR FIREBASE PROJETS :",
            erreur
        );


        firebaseReady =
            false;


        afficherMessage(
            "Les données des projets ne sont pas disponibles pour le moment.",
            "erreur"
        );

    }
}


/*==================================================
 CHARGER LES DONNÉES FIREBASE
==================================================*/

async function chargerDonnees() {

    if (
        !firebaseReady ||
        !realtime ||
        !firebaseDatabase
    ) {

        console.warn(
            "Firebase n'est pas prêt."
        );

        return;
    }


    try {

        const {
            ref,
            get
        } = firebaseDatabase;


        /*------------------------------------------
         PROJETS
        ------------------------------------------*/

        const projetsSnapshot =
            await get(
                ref(
                    realtime,
                    "projets"
                )
            );


        if (
            projetsSnapshot &&
            projetsSnapshot.exists()
        ) {

            projets =
                projetsSnapshot.val() || {};

        } else {

            projets = {};

        }


        /*------------------------------------------
         FINANCEMENTS
        ------------------------------------------*/

        const financementsSnapshot =
            await get(
                ref(
                    realtime,
                    "financements"
                )
            );


        if (
            financementsSnapshot &&
            financementsSnapshot.exists()
        ) {

            financements =
                financementsSnapshot.val() || {};

        } else {

            financements = {};

        }


        /*------------------------------------------
         AVIS
        ------------------------------------------*/

        const avisSnapshot =
            await get(
                ref(
                    realtime,
                    "avisProjets"
                )
            );


        if (
            avisSnapshot &&
            avisSnapshot.exists()
        ) {

            avisProjets =
                avisSnapshot.val() || {};

        } else {

            avisProjets = {};

        }


        console.log(
            "DONNÉES PROJETS CHARGÉES",
            {
                projets,
                financements,
                avisProjets
            }
        );


        /*------------------------------------------
         ACTUALISER L'INTERFACE
        ------------------------------------------*/

        mettreAJourInterface();


    } catch (erreur) {

        console.error(
            "ERREUR CHARGEMENT PROJETS :",
            erreur
        );


        afficherMessage(
            "Une erreur est survenue lors du chargement des projets.",
            "erreur"
        );
    }
}
