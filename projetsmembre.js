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


/*==================================================
 AFFICHER / CACHER LES SECTIONS
==================================================*/

function afficherSection(id) {

    const sections = [

        "sectionProjets",

        "sectionMesProjets",

        "sectionFinancements",

        "formulaireProjet"

    ];


    sections.forEach(function (sectionId) {

        const section =
            document.getElementById(sectionId);

        if (section) {

            section.style.display =
                "none";
        }

    });


    const sectionActive =
        document.getElementById(id);


    if (sectionActive) {

        sectionActive.style.display =
            id === "formulaireProjet"
                ? "block"
                : "block";


        sectionActive.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /*------------------------------------------
     ACTUALISER LA LISTE SELON LA SECTION
    ------------------------------------------*/

    if (id === "sectionProjets") {

        afficherProjetsDisponibles();

    }


    if (id === "sectionMesProjets") {

        afficherMesProjets();

    }


    if (id === "sectionFinancements") {

        afficherMesFinancements();

    }

}


/*==================================================
 CACHER UNE SECTION
==================================================*/

function cacherSection(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.display =
            "none";
    }

}


/*==================================================
 METTRE À JOUR L'INTERFACE
==================================================*/

function mettreAJourInterface() {

    mettreAJourCompteurs();

    afficherProjetsDisponibles();

    afficherMesProjets();

    afficherMesFinancements();

}


/*==================================================
 COMPTEURS
==================================================*/

function mettreAJourCompteurs() {

    const liste =
        Object.values(projets || {});


    let total = 0;

    let attente = 0;

    let enCours = 0;

    let realises = 0;


    liste.forEach(function (projet) {

        if (!projet) return;


        total++;


        const statut =
            normaliserStatut(
                projet.statut
            );


        if (
            statut === "en_attente" ||
            statut === "attente" ||
            statut === "pending"
        ) {

            attente++;

        }


        if (
            statut === "en_cours" ||
            statut === "encours" ||
            statut === "approved" ||
            statut === "valide" ||
            statut === "valide"
        ) {

            enCours++;

        }


        if (
            statut === "realise" ||
            statut === "réalisé" ||
            statut === "termine" ||
            statut === "terminé"
        ) {

            realises++;

        }

    });


    definirTexte(
        "totalProjets",
        total
    );


    definirTexte(
        "projetsAttente",
        attente
    );


    definirTexte(
        "projetsEnCours",
        enCours
    );


    definirTexte(
        "projetsRealises",
        realises
    );

}


/*==================================================
 PROJETS DISPONIBLES
==================================================*/

function afficherProjetsDisponibles() {

    const container =
        document.getElementById(
            "listeProjets"
        );


    if (!container) return;


    container.innerHTML = "";


    const projetsListe =
        Object.entries(
            projets || {}
        );


    /*
     Un projet en attente ne doit PAS être
     présenté aux autres membres.

     Seuls les projets validés, en cours
     ou réalisés sont visibles ici.
    */


    const projetsVisibles =
        projetsListe.filter(
            function ([id, projet]) {

                if (!projet) return false;


                const statut =
                    normaliserStatut(
                        projet.statut
                    );


                return (
                    statut === "valide" ||
                    statut === "validé" ||
                    statut === "en_cours" ||
                    statut === "encours" ||
                    statut === "approved" ||
                    statut === "realise" ||
                    statut === "réalisé" ||
                    statut === "termine" ||
                    statut === "terminé"
                );

            }
        );


    if (projetsVisibles.length === 0) {

        afficherEtatVide(
            "etatVideProjets",
            container
        );

        return;

    }


    cacherEtatVide(
        "etatVideProjets"
    );


    /*
     Les projets les plus récents
     apparaissent en premier.
    */

    projetsVisibles.sort(
        function (a, b) {

            const dateA =
                convertirDate(
                    a[1].dateSoumission ||
                    a[1].date ||
                    0
                );


            const dateB =
                convertirDate(
                    b[1].dateSoumission ||
                    b[1].date ||
                    0
                );


            return dateB - dateA;

        }
    );


    projetsVisibles.forEach(
        function ([id, projet]) {

            container.appendChild(
                creerCarteProjet(
                    id,
                    projet,
                    false
                )
            );

        }
    );

}


/*==================================================
 MES PROJETS
==================================================*/

function afficherMesProjets() {

    const container =
        document.getElementById(
            "listeMesProjets"
        );


    if (!container) return;


    container.innerHTML = "";


    const mesProjets =
        Object.entries(
            projets || {}
        ).filter(
            function ([id, projet]) {

                if (!projet) return false;


                return estMonProjet(
                    projet
                );

            }
        );


    if (mesProjets.length === 0) {

        afficherEtatVide(
            "etatVideMesProjets",
            container
        );

        return;

    }


    cacherEtatVide(
        "etatVideMesProjets"
    );


    mesProjets.sort(
        function (a, b) {

            const dateA =
                convertirDate(
                    a[1].dateSoumission ||
                    a[1].date ||
                    0
                );


            const dateB =
                convertirDate(
                    b[1].dateSoumission ||
                    b[1].date ||
                    0
                );


            return dateB - dateA;

        }
    );


    mesProjets.forEach(
        function ([id, projet]) {

            container.appendChild(
                creerCarteProjet(
                    id,
                    projet,
                    true
                )
            );

        }
    );

}


/*==================================================
 CRÉER UNE CARTE PROJET
==================================================*/

function creerCarteProjet(
    id,
    projet,
    estPersonnel
) {

    const carte =
        document.createElement(
            "article"
        );


    carte.className =
        "projet-card";


    /*------------------------------------------
     NOM DU PROJET
    ------------------------------------------*/

    const titre =
        document.createElement(
            "h3"
        );


    titre.textContent =
        projet.nomProjet ||
        projet.nom ||
        "Projet sans nom";


    carte.appendChild(
        titre
    );


    /*------------------------------------------
     CATÉGORIE
    ------------------------------------------*/

    if (
        projet.categorie ||
        projet.categorieProjet
    ) {

        const categorie =
            document.createElement(
                "span"
            );


        categorie.className =
            "categorie";


        categorie.textContent =
            projet.categorie ||
            projet.categorieProjet;


        carte.appendChild(
            categorie
        );

    }


    /*------------------------------------------
     STATUT
    ------------------------------------------*/

    const statut =
        normaliserStatut(
            projet.statut ||
            "en_attente"
        );


    const statutElement =
        document.createElement(
            "span"
        );


    statutElement.className =
        "statut " +
        classeStatut(statut);


    statutElement.textContent =
        libelleStatut(statut);


    carte.appendChild(
        statutElement
    );


    /*------------------------------------------
     PORTEUR
    ------------------------------------------*/

    if (
        !estPersonnel &&
        (
            projet.nom ||
            projet.porteurNom
        )
    ) {

        const porteur =
            document.createElement(
                "p"
            );


        porteur.innerHTML =
            "<strong>Porteur :</strong> " +
            echapperHTML(
                projet.nom ||
                projet.porteurNom
            );


        carte.appendChild(
            porteur
        );

    }


    /*------------------------------------------
     DESCRIPTION
    ------------------------------------------*/

    if (
        projet.description ||
        projet.descriptionProjet
    ) {

        const description =
            document.createElement(
                "p"
            );


        description.textContent =
            projet.description ||
            projet.descriptionProjet;


        carte.appendChild(
            description
        );

    }


    /*------------------------------------------
     BUDGET
    ------------------------------------------*/

    const budget =
        projet.budget ||
        projet.budgetProjet;


    const recherche =
        projet.montantRecherche;


    if (budget || recherche) {

        const blocMontants =
            document.createElement(
                "div"
            );


        blocMontants.className =
            "montants-projet";


        if (budget) {

            const ligneBudget =
                document.createElement(
                    "p"
                );


            ligneBudget.innerHTML =
                "<strong>Budget :</strong> " +
                formatMontant(budget);


            blocMontants.appendChild(
                ligneBudget
            );

        }


        if (recherche) {

            const ligneRecherche =
                document.createElement(
                    "p"
                );


            ligneRecherche.innerHTML =
                "<strong>Financement recherché :</strong> " +
                formatMontant(recherche);


            blocMontants.appendChild(
                ligneRecherche
            );

        }


        carte.appendChild(
            blocMontants
        );

    }


    /*------------------------------------------
     DATE
    ------------------------------------------*/

    if (
        projet.dateSoumission ||
        projet.date
    ) {

        const date =
            document.createElement(
                "small"
            );


        date.textContent =
            "Soumis le " +
            formaterDate(
                projet.dateSoumission ||
                projet.date
            );


        carte.appendChild(
            date
        );

    }


    /*------------------------------------------
     ACTIONS
    ------------------------------------------*/

    if (
        !estPersonnel &&
        (
            statut === "valide" ||
            statut === "validé" ||
            statut === "en_cours" ||
            statut === "encours" ||
            statut === "approved"
        )
    ) {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "projet-actions";


        /*--------------------------------------
         AVIS
        --------------------------------------*/

        const btnAvis =
            document.createElement(
                "button"
            );


        btnAvis.type =
            "button";


        btnAvis.textContent =
            "Donner mon avis";


        btnAvis.addEventListener(
            "click",
            function () {

                donnerAvis(
                    id,
                    projet
                );

            }
        );


        actions.appendChild(
            btnAvis
        );


        /*--------------------------------------
         FINANCEMENT
        --------------------------------------*/

        const btnFinancer =
            document.createElement(
                "button"
            );


        btnFinancer.type =
            "button";


        btnFinancer.textContent =
            "Proposer un financement";


        btnFinancer.addEventListener(
            "click",
            function () {

                proposerFinancement(
                    id,
                    projet
                );

            }
        );


        actions.appendChild(
            btnFinancer
        );


        carte.appendChild(
            actions
        );

    }


    return carte;
}


/*==================================================
 SOUMETTRE UN PROJET
==================================================*/

async function soumettreProjet(
    evenement
) {

    evenement.preventDefault();


    if (!firebaseReady) {

        afficherMessage(
            "La connexion à la base de données n'est pas disponible.",
            "erreur"
        );

        return;

    }


    const formulaire =
        evenement.target;


    const nomProjet =
        valeur("nomProjet");


    const categorie =
        valeur("categorieProjet");


    const localisation =
        valeur("localisationProjet");


    const description =
        valeur("descriptionProjet");


    const objectifs =
        valeur("objectifsProjet");


    const budget =
        valeur("budgetProjet");


    const montantRecherche =
        valeur("montantRecherche");


    const besoins =
        valeur("besoinsProjet");


    /*------------------------------------------
     VALIDATION
    ------------------------------------------*/

    if (!nomProjet) {

        afficherMessage(
            "Veuillez renseigner le nom du projet.",
            "erreur"
        );

        return;

    }


    if (!categorie) {

        afficherMessage(
            "Veuillez choisir une catégorie.",
            "erreur"
        );

        return;

    }


    if (!description) {

        afficherMessage(
            "Veuillez décrire votre projet.",
            "erreur"
        );

        return;

    }


    try {

        const {
            ref,
            push,
            set
        } = firebaseDatabase;


        const projetsRef =
            ref(
                realtime,
                "projets"
            );


        const nouveauProjetRef =
            push(
                projetsRef
            );


        const projet = {

            porteurId:
                membre.id || "",

            porteurMatricule:
                membre.matricule || "",

            nom:
                membre.nom || "",

            nomProjet:
                nomProjet,

            categorie:
                categorie,

            localisation:
                localisation,

            description:
                description,

            objectifs:
                objectifs,

            budget:
                budget,

            montantRecherche:
                montantRecherche,

            besoins:
                besoins,

            montantFinance:
                0,

            statut:
                "en_attente",

            dateSoumission:
                new Date().toISOString()

        };


        await set(
            nouveauProjetRef,
            projet
        );


        console.log(
            "PROJET SOUMIS :",
            nouveauProjetRef.key,
            projet
        );


        afficherMessage(
            "Votre projet a été transmis au Président pour étude et validation.",
            "succes"
        );


        formulaire.reset();


        cacherSection(
            "formulaireProjet"
        );


        /*
         On recharge les données afin que
         "Mes projets" affiche immédiatement
         le nouveau projet.
        */

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "ERREUR SOUMISSION PROJET :",
            erreur
        );


        afficherMessage(
            "Impossible d'envoyer le projet pour le moment.",
            "erreur"
        );

    }

}


/*==================================================
 PROPOSER UN FINANCEMENT
==================================================*/

async function proposerFinancement(
    projetId,
    projet
) {

    if (!firebaseReady) {

        afficherMessage(
            "La connexion à la base de données n'est pas disponible.",
            "erreur"
        );

        return;
    }


    /*
     Le membre ne finance pas directement le projet.

     Il propose un montant.
     La demande est ensuite envoyée au Président
     pour étude et décision.
    */

    const montant =
        prompt(
            "Quel montant souhaitez-vous proposer pour ce projet ?"
        );


    if (montant === null) {
        return;
    }


    const montantNettoye =
        montant
            .replace(/\s/g, "")
            .replace(/,/g, ".")
            .trim();


    const montantNombre =
        Number(
            montantNettoye
        );


    if (
        !montantNettoye ||
        !Number.isFinite(montantNombre) ||
        montantNombre <= 0
    ) {

        afficherMessage(
            "Veuillez saisir un montant valide.",
            "erreur"
        );

        return;
    }


    try {

        const {
            ref,
            push,
            set
        } = firebaseDatabase;


        const financementsRef =
            ref(
                realtime,
                "financements"
            );


        const nouveauFinancementRef =
            push(
                financementsRef
            );


        const financement = {

            projetId:
                projetId,

            projetNom:
                projet.nomProjet ||
                projet.nom ||
                "Projet",

            membreId:
                membre.id || "",

            matricule:
                membre.matricule || "",

            nomMembre:
                membre.nom || "",

            montant:
                montantNombre,

            statut:
                "en_attente",

            date:
                new Date().toISOString()

        };


        await set(
            nouveauFinancementRef,
            financement
        );


        console.log(
            "DEMANDE DE FINANCEMENT ENVOYÉE :",
            financement
        );


        afficherMessage(
            "Votre proposition de financement a été transmise au Président pour étude.",
            "succes"
        );


        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "ERREUR FINANCEMENT :",
            erreur
        );


        afficherMessage(
            "Impossible d'envoyer la proposition de financement.",
            "erreur"
        );

    }

}


/*==================================================
 DONNER UN AVIS SUR UN PROJET
==================================================*/

async function donnerAvis(
    projetId,
    projet
) {

    if (!firebaseReady) {

        afficherMessage(
            "La connexion à la base de données n'est pas disponible.",
            "erreur"
        );

        return;
    }


    const avis =
        prompt(
            "Votre avis sur ce projet :"
        );


    if (avis === null) {
        return;
    }


    const avisNettoye =
        avis.trim();


    if (!avisNettoye) {

        afficherMessage(
            "Veuillez saisir votre avis.",
            "erreur"
        );

        return;
    }


    try {

        const {
            ref,
            push,
            set
        } = firebaseDatabase;


        const avisRef =
            ref(
                realtime,
                "avisProjets"
            );


        const nouvelAvisRef =
            push(
                avisRef
            );


        const nouvelAvis = {

            projetId:
                projetId,

            projetNom:
                projet.nomProjet ||
                projet.nom ||
                "Projet",

            membreId:
                membre.id || "",

            matricule:
                membre.matricule || "",

            nomMembre:
                membre.nom || "",

            avis:
                avisNettoye,

            date:
                new Date().toISOString()

        };


        await set(
            nouvelAvisRef,
            nouvelAvis
        );


        console.log(
            "AVIS ENREGISTRÉ :",
            nouvelAvis
        );


        afficherMessage(
            "Votre avis a été enregistré avec succès.",
            "succes"
        );


        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "ERREUR AVIS :",
            erreur
        );


        afficherMessage(
            "Impossible d'enregistrer votre avis.",
            "erreur"
        );

    }

}


/*==================================================
 AFFICHER MES FINANCEMENTS
==================================================*/

function afficherMesFinancements() {

    const container =
        document.getElementById(
            "listeFinancements"
        );


    if (!container) return;


    container.innerHTML = "";


    const mesFinancements =
        Object.entries(
            financements || {}
        ).filter(
            function ([id, financement]) {

                if (!financement) {
                    return false;
                }


                return estMonFinancement(
                    financement
                );

            }
        );


    if (
        mesFinancements.length === 0
    ) {

        afficherEtatVide(
            "etatVideFinancements",
            container
        );

        return;

    }


    cacherEtatVide(
        "etatVideFinancements"
    );


    mesFinancements.sort(
        function (a, b) {

            const dateA =
                convertirDate(
                    a[1].date ||
                    a[1].dateDemande ||
                    0
                );


            const dateB =
                convertirDate(
                    b[1].date ||
                    b[1].dateDemande ||
                    0
                );


            return dateB - dateA;

        }
    );


    mesFinancements.forEach(
        function ([id, financement]) {

            container.appendChild(
                creerCarteFinancement(
                    id,
                    financement
                )
            );

        }
    );

}


/*==================================================
 CARTE FINANCEMENT
==================================================*/

function creerCarteFinancement(
    id,
    financement
) {

    const carte =
        document.createElement(
            "article"
        );


    carte.className =
        "financement-card";


    /*------------------------------------------
     PROJET
    ------------------------------------------*/

    const titre =
        document.createElement(
            "h3"
        );


    titre.textContent =
        financement.projetNom ||
        "Projet";


    carte.appendChild(
        titre
    );


    /*------------------------------------------
     MONTANT
    ------------------------------------------*/

    const montant =
        document.createElement(
            "div"
        );


    montant.className =
        "montant";


    montant.textContent =
        formatMontant(
            financement.montant
        );


    carte.appendChild(
        montant
    );


    /*------------------------------------------
     STATUT
    ------------------------------------------*/

    const statut =
        normaliserStatut(
            financement.statut ||
            "en_attente"
        );


    const statutElement =
        document.createElement(
            "span"
        );


    statutElement.className =
        "statut " +
        classeStatutFinancement(
            statut
        );


    statutElement.textContent =
        libelleStatutFinancement(
            statut
        );


    carte.appendChild(
        statutElement
    );


    /*------------------------------------------
     DATE
    ------------------------------------------*/

    if (
        financement.date ||
        financement.dateDemande
    ) {

        const date =
            document.createElement(
                "small"
            );


        date.textContent =
            "Demande du " +
            formaterDate(
                financement.date ||
                financement.dateDemande
            );


        carte.appendChild(
            date
        );

    }


    return carte;
}


/*==================================================
 VÉRIFIER SI LE PROJET APPARTIENT AU MEMBRE
==================================================*/

function estMonProjet(
    projet
) {

    if (!projet) {
        return false;
    }


    if (
        membre.id &&
        String(
            projet.porteurId || ""
        ) === String(
            membre.id
        )
    ) {

        return true;

    }


    if (
        membre.matricule &&
        String(
            projet.porteurMatricule || ""
        ) === String(
            membre.matricule
        )
    ) {

        return true;

    }


    return false;
}


/*==================================================
 VÉRIFIER SI LE FINANCEMENT APPARTIENT AU MEMBRE
==================================================*/

function estMonFinancement(
    financement
) {

    if (!financement) {
        return false;
    }


    if (
        membre.id &&
        String(
            financement.membreId || ""
        ) === String(
            membre.id
        )
    ) {

        return true;

    }


    if (
        membre.matricule &&
        String(
            financement.matricule || ""
        ) === String(
            membre.matricule
        )
    ) {

        return true;

    }


    return false;
}


/*==================================================
 NORMALISER UN STATUT
==================================================*/

function normaliserStatut(
    statut
) {

    return String(
        statut || ""
    )
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, "_");

}


/*==================================================
 CLASSE CSS DU STATUT
==================================================*/

function classeStatut(
    statut
) {

    switch (
        normaliserStatut(statut)
    ) {

        case "en_attente":
        case "attente":
        case "pending":

            return "attente";


        case "valide":
        case "validé":
        case "approved":

            return "valide";


        case "en_cours":
        case "encours":

            return "encours";


        case "realise":
        case "réalisé":
        case "termine":
        case "terminé":

            return "realise";


        case "refuse":
        case "refusé":
        case "rejected":

            return "refuse";


        default:

            return "attente";

    }

}


/*==================================================
 LIBELLÉ DU STATUT PROJET
==================================================*/

function libelleStatut(
    statut
) {

    switch (
        normaliserStatut(statut)
    ) {

        case "valide":
        case "validé":
        case "approved":

            return "Projet validé";


        case "en_cours":
        case "encours":

            return "En cours";


        case "realise":
        case "réalisé":
        case "termine":
        case "terminé":

            return "Projet réalisé";


        case "refuse":
        case "refusé":
        case "rejected":

            return "Projet refusé";


        case "en_attente":
        case "attente":
        case "pending":

            return "En attente de validation";


        default:

            return "En attente";

    }

}


/*==================================================
 CLASSE CSS FINANCEMENT
==================================================*/

function classeStatutFinancement(
    statut
) {

    switch (
        normaliserStatut(statut)
    ) {

        case "valide":
        case "approved":
        case "approuve":
        case "approuvé":

            return "valide";


        case "refuse":
        case "refusé":
        case "rejected":

            return "refuse";


        case "en_attente":
        case "attente":
        case "pending":

            return "attente";


        default:

            return "attente";

    }

}


/*==================================================
 LIBELLÉ FINANCEMENT
==================================================*/

function libelleStatutFinancement(
    statut
) {

    switch (
        normaliserStatut(statut)
    ) {

        case "valide":
        case "approved":
        case "approuve":
        case "approuvé":

            return "Financement approuvé";


        case "refuse":
        case "refusé":
        case "rejected":

            return "Financement refusé";


        case "en_attente":
        case "attente":
        case "pending":

            return "En attente de décision";


        default:

            return "En attente de décision";

    }

}


/*==================================================
 AFFICHER ÉTAT VIDE
==================================================*/

function afficherEtatVide(
    id,
    container
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.display =
            "block";

        /*
         L'élément d'état vide est déplacé
         dans son conteneur uniquement s'il
         n'y est pas déjà.
        */

        if (
            container &&
            element.parentElement !== container
        ) {

            container.appendChild(
                element
            );

        }

    }

}


/*==================================================
 CACHER ÉTAT VIDE
==================================================*/

function cacherEtatVide(
    id
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.style.display =
            "none";

    }

}


/*==================================================
 DÉFINIR UN TEXTE
==================================================*/

function definirTexte(
    id,
    valeur
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            valeur;

    }

}


/*==================================================
 RÉCUPÉRER LA VALEUR D'UN CHAMP
==================================================*/

function valeur(
    id
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return String(
        element.value || ""
    ).trim();

}


/*==================================================
 AFFICHER UN MESSAGE
==================================================*/

function afficherMessage(
    texte,
    type
) {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) {

        console.log(
            texte
        );

        return;

    }


    element.textContent =
        texte;


    element.className =
        "message " +
        (
            type ||
            "info"
        );


    element.style.display =
        "block";


    clearTimeout(
        afficherMessage.timer
    );


    afficherMessage.timer =
        setTimeout(
            function () {

                element.style.display =
                    "none";

            },
            6000
        );

}


/*==================================================
 FORMATAGE DES MONTANTS
==================================================*/

function formatMontant(
    montant
) {

    const nombre =
        Number(
            String(
                montant || 0
            )
                .replace(/\s/g, "")
                .replace(/,/g, ".")
        );


    if (
        !Number.isFinite(nombre)
    ) {

        return "0 FCFA";

    }


    return (
        new Intl.NumberFormat(
            "fr-FR"
        ).format(
            nombre
        ) +
        " FCFA"
    );

}


/*==================================================
 CONVERTIR UNE DATE
==================================================*/

function convertirDate(
    date
) {

    if (!date) {
        return 0;
    }


    const resultat =
        new Date(date).getTime();


    if (
        Number.isNaN(
            resultat
        )
    ) {

        return 0;

    }


    return resultat;

}


/*==================================================
 FORMATER UNE DATE
==================================================*/

function formaterDate(
    date
) {

    const valeurDate =
        new Date(date);


    if (
        Number.isNaN(
            valeurDate.getTime()
        )
    ) {

        return "---";

    }


    return valeurDate.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/*==================================================
 ÉCHAPPER LE HTML
==================================================*/

function echapperHTML(
    texte
) {

    return String(
        texte || ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*==================================================
 FIN DU FICHIER
==================================================*/

console.log(
    "PROJETSMEMBRE.JS — VERSION COMPLÈTE CHARGÉE"
);
