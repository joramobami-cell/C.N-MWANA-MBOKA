/*==================================================
 PROJETSMEMBRE.JS
 ESPACE PROJETS DES MEMBRES
 COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/

"use strict";


/*==================================================
 VARIABLES GLOBALES
==================================================*/

let realtime = null;
let firebaseReady = false;

let projets = {};
let financements = {};
let avisProjets = {};

let membre = {
    id: null,
    nom: "",
    matricule: "",
    role: ""
};


/*==================================================
 INITIALISATION DE LA PAGE
==================================================*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("PROJETSMEMBRE.JS CHARGÉ");

    /*----------------------------------------------
     CHARGER LA SESSION DU MEMBRE
    ----------------------------------------------*/

    chargerSession();


    /*----------------------------------------------
     VÉRIFICATION DE SESSION
    ----------------------------------------------*/

    if (!membre.id || !membre.matricule) {

        alert(
            "Session expirée. Veuillez vous reconnecter."
        );

        window.location.href = "connexion.html";

        return;
    }


    /*----------------------------------------------
     INITIALISER L'INTERFACE
    ----------------------------------------------*/

    initialiserInterface();


    /*----------------------------------------------
     INITIALISER LES BOUTONS
    ----------------------------------------------*/

    initialiserEvenements();


    /*----------------------------------------------
     CONNECTER FIREBASE
    ----------------------------------------------*/

    await chargerFirebase();

});


/*==================================================
 CHARGEMENT DE LA SESSION
==================================================*/

function chargerSession() {

    membre.id =
        localStorage.getItem("membreId");

    membre.nom =
        localStorage.getItem("nom") || "";

    membre.matricule =
        localStorage.getItem("matricule") || "";

    membre.role =
        localStorage.getItem("role") || "";


    console.log(
        "SESSION MEMBRE PROJETS :",
        membre
    );
}


/*==================================================
 CONNEXION FIREBASE
==================================================*/

async function chargerFirebase() {

    try {

        /*------------------------------------------
         CHARGEMENT DE LA CONFIGURATION FIREBASE
        ------------------------------------------*/

        const config =
            await import("./firebase-config.js");


        realtime =
            config.realtime;


        if (!realtime) {

            throw new Error(
                "Base Realtime Database introuvable."
            );
        }


        /*------------------------------------------
         CHARGEMENT FIREBASE DATABASE
        ------------------------------------------*/

        const database =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js"
            );


        window.firebaseDatabase =
            database;


        firebaseReady = true;


        console.log(
            "Firebase projets connecté."
        );


        /*------------------------------------------
         CHARGER LES DONNÉES
        ------------------------------------------*/

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "Erreur connexion Firebase projets :",
            erreur
        );


        afficherMessage(
            "Impossible de charger les données des projets pour le moment.",
            "erreur"
        );
    }
}


/*==================================================
 CHARGEMENT DES DONNÉES FIREBASE
==================================================*/

async function chargerDonnees() {

    if (!firebaseReady) {
        return;
    }


    try {

        const {
            ref,
            get
        } = window.firebaseDatabase;


        /*------------------------------------------
         PROJETS
        ------------------------------------------*/

        const snapshotProjets =
            await get(
                ref(
                    realtime,
                    "projets"
                )
            );


        if (snapshotProjets.exists()) {

            projets =
                snapshotProjets.val() || {};

        } else {

            projets = {};
        }


        /*------------------------------------------
         FINANCEMENTS
        ------------------------------------------*/

        const snapshotFinancements =
            await get(
                ref(
                    realtime,
                    "financements"
                )
            );


        if (snapshotFinancements.exists()) {

            financements =
                snapshotFinancements.val() || {};

        } else {

            financements = {};
        }


        /*------------------------------------------
         AVIS
        ------------------------------------------*/

        const snapshotAvis =
            await get(
                ref(
                    realtime,
                    "avisProjets"
                )
            );


        if (snapshotAvis.exists()) {

            avisProjets =
                snapshotAvis.val() || {};

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
         METTRE À JOUR L'INTERFACE
        ------------------------------------------*/

        mettreAJourInterface();


    } catch (erreur) {

        console.error(
            "Erreur chargement données projets :",
            erreur
        );


        afficherMessage(
            "Erreur lors du chargement des projets.",
            "erreur"
        );
    }
}


/*==================================================
 INITIALISATION DE L'INTERFACE
==================================================*/

function initialiserInterface() {

    afficherElement(
        "totalProjets",
        "0"
    );


    afficherElement(
        "projetsAttente",
        "0"
    );


    afficherElement(
        "projetsEnCours",
        "0"
    );


    afficherElement(
        "projetsRealises",
        "0"
    );
}


/*==================================================
 MISE À JOUR DE L'INTERFACE
==================================================*/

function mettreAJourInterface() {

    afficherCompteurs();

    afficherProjetsDisponibles();

    afficherMesProjets();

    afficherMesFinancements();
}


/*==================================================
 INITIALISATION DES ÉVÉNEMENTS
==================================================*/

function initialiserEvenements() {

    const btnSoumettre =
        document.getElementById(
            "btnSoumettre"
        );


    const btnProjets =
        document.getElementById(
            "btnProjets"
        );


    const btnMesProjets =
        document.getElementById(
            "btnMesProjets"
        );


    const btnFinancements =
        document.getElementById(
            "btnFinancements"
        );


    const btnFermer =
        document.getElementById(
            "btnFermerFormulaire"
        );


    const formulaire =
        document.getElementById(
            "formProjet"
        );


    /*------------------------------------------
     BOUTON SOUMETTRE UN PROJET
    ------------------------------------------*/

    if (btnSoumettre) {

        btnSoumettre.addEventListener(
            "click",
            () => {

                afficherSection(
                    "formulaireProjet"
                );


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );
    }


    /*------------------------------------------
     BOUTON PROJETS DISPONIBLES
    ------------------------------------------*/

    if (btnProjets) {

        btnProjets.addEventListener(
            "click",
            () => {

                afficherSection(
                    "sectionProjets"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON MES PROJETS
    ------------------------------------------*/

    if (btnMesProjets) {

        btnMesProjets.addEventListener(
            "click",
            () => {

                afficherSection(
                    "sectionMesProjets"
                );

            }
        );
    }


    /*------------------------------------------
     BOUTON MES FINANCEMENTS
    ------------------------------------------*/

    if (btnFinancements) {

        btnFinancements.addEventListener(
            "click",
            () => {

                afficherSection(
                    "sectionFinancements"
                );

            }
        );
    }


    /*------------------------------------------
     FERMER LE FORMULAIRE
    ------------------------------------------*/

    if (btnFermer) {

        btnFermer.addEventListener(
            "click",
            () => {

                cacherSection(
                    "formulaireProjet"
                );

            }
        );
    }


    /*------------------------------------------
     FORMULAIRE PROJET
    ------------------------------------------*/

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
 SOUMISSION D'UN PROJET
==================================================*/

async function soumettreProjet(event) {

    event.preventDefault();


    /*----------------------------------------------
     VÉRIFIER FIREBASE
    ----------------------------------------------*/

    if (!firebaseReady) {

        afficherMessage(
            "Connexion à la base de données indisponible.",
            "erreur"
        );

        return;
    }


    /*----------------------------------------------
     RÉCUPÉRER LES CHAMPS
    ----------------------------------------------*/

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


    /*----------------------------------------------
     VÉRIFICATION DES CHAMPS
    ----------------------------------------------*/

    if (
        !nomProjet ||
        !categorie ||
        !localisation ||
        !description ||
        !objectifs ||
        !budget ||
        !montantRecherche ||
        !besoins
    ) {

        afficherMessage(
            "Veuillez remplir tous les champs obligatoires.",
            "erreur"
        );

        return;
    }


    /*----------------------------------------------
     BOUTON ENVOI
    ----------------------------------------------*/

    const bouton =
        document.getElementById(
            "btnEnvoyerProjet"
        );


    if (bouton) {

        bouton.disabled = true;

        bouton.textContent =
            "Envoi en cours...";
    }


    try {

        const {
            ref,
            push,
            set
        } = window.firebaseDatabase;


        /*------------------------------------------
         CRÉER LA RÉFÉRENCE DU PROJET
        ------------------------------------------*/

        const projetsRef =
            ref(
                realtime,
                "projets"
            );


        const nouveauProjet =
            push(projetsRef);


        const idProjet =
            nouveauProjet.key;


        const date =
            new Date().toISOString();


        /*------------------------------------------
         DONNÉES DU PROJET
        ------------------------------------------*/

        const projet = {

            id:
                idProjet,


            /*--------------------------------------
             IDENTITÉ DU PORTEUR
            --------------------------------------*/

            porteurId:
                membre.id,

            porteurMatricule:
                membre.matricule,

            porteurNom:
                membre.nom,


            /*--------------------------------------
             INFORMATIONS DU PROJET
            --------------------------------------*/

            nom:
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
                Number(budget) || 0,

            montantRecherche:
                Number(montantRecherche) || 0,

            montantFinance:
                0,

            besoins:
                besoins,


            /*--------------------------------------
             VALIDATION PRÉSIDENTIELLE
            --------------------------------------*/

            statut:
                "en_attente",

            dateSoumission:
                date,

            dateModification:
                date,

            commentairePresident:
                "",

            validePar:
                "",

            dateValidation:
                ""
        };


        /*------------------------------------------
         ENREGISTRER DANS FIREBASE
        ------------------------------------------*/

        await set(
            nouveauProjet,
            projet
        );


        /*------------------------------------------
         MESSAGE DE CONFIRMATION
        ------------------------------------------*/

        afficherMessage(
            "Votre projet a été transmis au Président pour étude et validation.",
            "succes"
        );


        /*------------------------------------------
         VIDER LE FORMULAIRE
        ------------------------------------------*/

        formulaireReset();


        /*------------------------------------------
         FERMER LE FORMULAIRE
        ------------------------------------------*/

        cacherSection(
            "formulaireProjet"
        );


        /*------------------------------------------
         RECHARGER LES DONNÉES
        ------------------------------------------*/

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "Erreur soumission projet :",
            erreur
        );


        afficherMessage(
            "Impossible d'envoyer le projet. Veuillez réessayer.",
            "erreur"
        );


    } finally {

        if (bouton) {

            bouton.disabled = false;

            bouton.textContent =
                "Envoyer le projet";
        }
    }
}


/*==================================================
 AFFICHAGE DES COMPTEURS
==================================================*/

function afficherCompteurs() {

    const liste =
        Object.values(
            projets || {}
        );


    let attente = 0;

    let enCours = 0;

    let realises = 0;


    liste.forEach(projet => {

        const statut =
            normaliserStatut(
                projet.statut
            );


        /*------------------------------------------
         PROJETS EN ATTENTE
        ------------------------------------------*/

        if (
            statut === "en_attente"
        ) {

            attente++;
        }


        /*------------------------------------------
         PROJETS EN COURS
        ------------------------------------------*/

        if (
            statut === "en_cours" ||
            statut === "valide"
        ) {

            enCours++;
        }


        /*------------------------------------------
         PROJETS RÉALISÉS
        ------------------------------------------*/

        if (
            statut === "realise" ||
            statut === "réalisé"
        ) {

            realises++;
        }

    });


    afficherElement(
        "totalProjets",
        liste.length
    );


    afficherElement(
        "projetsAttente",
        attente
    );


    afficherElement(
        "projetsEnCours",
        enCours
    );


    afficherElement(
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


    if (!container) {
        return;
    }


    container.innerHTML = "";


    /*----------------------------------------------
     SEULS LES PROJETS VALIDÉS SONT PUBLICS
    ----------------------------------------------*/

    const liste =
        Object.values(
            projets || {}
        )
        .filter(projet => {

            const statut =
                normaliserStatut(
                    projet.statut
                );


            return (
                statut === "valide" ||
                statut === "en_cours" ||
                statut === "realise"
            );
        });


    /*----------------------------------------------
     AUCUN PROJET
    ----------------------------------------------*/

    if (liste.length === 0) {

        afficherElement(
            "etatVideProjets",
            true
        );

        return;
    }


    afficherElement(
        "etatVideProjets",
        false
    );


    /*----------------------------------------------
     CRÉER LES CARTES
    ----------------------------------------------*/

    liste.forEach(projet => {

        container.appendChild(
            creerCarteProjet(
                projet,
                false
            )
        );

    });
}


/*==================================================
 MES PROJETS
==================================================*/

function afficherMesProjets() {

    const container =
        document.getElementById(
            "listeMesProjets"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    /*----------------------------------------------
     FILTRER LES PROJETS DU MEMBRE
    ----------------------------------------------*/

    const liste =
        Object.values(
            projets || {}
        )
        .filter(projet => {

            return (
                String(projet.porteurId) ===
                String(membre.id)
            );
        });


    /*----------------------------------------------
     AUCUN PROJET
    ----------------------------------------------*/

    if (liste.length === 0) {

        afficherElement(
            "etatVideMesProjets",
            true
        );

        return;
    }


    afficherElement(
        "etatVideMesProjets",
        false
    );


    /*----------------------------------------------
     AFFICHER LES PROJETS
    ----------------------------------------------*/

    liste.forEach(projet => {

        container.appendChild(
            creerCarteProjet(
                projet,
                true
            )
        );

    });
}


/*==================================================
 CRÉATION D'UNE CARTE PROJET
==================================================*/

function creerCarteProjet(
    projet,
    estMonProjet
) {

    const carte =
        document.createElement(
            "div"
        );


    carte.className =
        "projet-card";


    const statut =
        normaliserStatut(
            projet.statut
        );


    const texteStatut =
        afficherStatut(
            statut
        );


    const categorie =
        escapeHTML(
            projet.categorie ||
            "Projet"
        );


    const nom =
        escapeHTML(
            projet.nom ||
            "Projet sans nom"
        );


    const description =
        escapeHTML(
            projet.description ||
            "Aucune description."
        );


    const porteur =
        escapeHTML(
            projet.porteurNom ||
            projet.porteurMatricule ||
            "---"
        );


    const budget =
        formaterMontant(
            projet.budget
        );


    const recherche =
        formaterMontant(
            projet.montantRecherche
        );


    /*----------------------------------------------
     CONTENU DE LA CARTE
    ----------------------------------------------*/

    carte.innerHTML = `

        <div class="categorie">
            ${categorie}
        </div>

        <h3>
            ${nom}
        </h3>

        <span class="statut ${classeStatut(statut)}">
            ${texteStatut}
        </span>

        <p>
            ${description}
        </p>

        <p>
            <strong>Porteur :</strong>
            ${porteur}
        </p>

        <p>
            <strong>Budget :</strong>
            ${budget}
        </p>

        <p>
            <strong>Montant recherché :</strong>
            ${recherche}
        </p>

        <div class="projet-actions"></div>
    `;


    const actions =
        carte.querySelector(
            ".projet-actions"
        );


    /*----------------------------------------------
     SI C'EST LE PROJET DU MEMBRE
    ----------------------------------------------*/

    if (estMonProjet) {

        const bouton =
            document.createElement(
                "button"
            );


        bouton.type =
            "button";


        bouton.textContent =
            "Consulter";


        bouton.addEventListener(
            "click",
            () => {

                afficherDetailsProjet(
                    projet
                );

            }
        );


        actions.appendChild(
            bouton
        );


        return carte;
    }


    /*----------------------------------------------
     DONNER UN AVIS
    ----------------------------------------------*/

    const boutonAvis =
        document.createElement(
            "button"
        );


    boutonAvis.type =
        "button";


    boutonAvis.textContent =
        "Donner mon avis";


    boutonAvis.addEventListener(
        "click",
        () => {

            ouvrirAvis(
                projet
            );

        }
    );


    /*----------------------------------------------
     PROPOSER UN FINANCEMENT
    ----------------------------------------------*/

    const boutonFinancement =
        document.createElement(
            "button"
        );


    boutonFinancement.type =
        "button";


    boutonFinancement.textContent =
        "Proposer un financement";


    boutonFinancement.addEventListener(
        "click",
        () => {

            ouvrirFinancement(
                projet
            );

        }
    );


    actions.appendChild(
        boutonAvis
    );


    actions.appendChild(
        boutonFinancement
    );


    return carte;
}

/*==================================================
 DÉTAILS D'UN PROJET
==================================================*/

function afficherDetailsProjet(projet) {

    const nom =
        projet.nom || "---";

    const categorie =
        projet.categorie || "---";

    const localisation =
        projet.localisation || "---";

    const description =
        projet.description || "---";

    const objectifs =
        projet.objectifs || "---";

    const budget =
        formaterMontant(
            projet.budget
        );

    const recherche =
        formaterMontant(
            projet.montantRecherche
        );

    const finance =
        formaterMontant(
            projet.montantFinance
        );

    const statut =
        afficherStatut(
            normaliserStatut(
                projet.statut
            )
        );


    const message =

`PROJET : ${nom}

Catégorie : ${categorie}

Localisation : ${localisation}

Description :
${description}

Objectifs :
${objectifs}

Budget :
${budget}

Montant recherché :
${recherche}

Montant déjà financé :
${finance}

Statut :
${statut}`;


    alert(message);
}


/*==================================================
 OUVRIR DEMANDE DE FINANCEMENT
==================================================*/

function ouvrirFinancement(projet) {

    const montant =
        prompt(

`Projet : ${projet.nom || "---"}

Montant recherché :
${formaterMontant(
    projet.montantRecherche
)}

Indiquez le montant que vous souhaitez proposer en financement :`

        );


    /*----------------------------------------------
     ANNULATION
    ----------------------------------------------*/

    if (montant === null) {
        return;
    }


    /*----------------------------------------------
     CONVERSION DU MONTANT
    ----------------------------------------------*/

    const montantNombre =
        Number(
            String(montant)
                .replace(/\s/g, "")
                .replace(",", ".")
        );


    /*----------------------------------------------
     VÉRIFICATION
    ----------------------------------------------*/

    if (
        !montantNombre ||
        montantNombre <= 0
    ) {

        alert(
            "Veuillez indiquer un montant valide."
        );

        return;
    }


    /*----------------------------------------------
     ENVOI
    ----------------------------------------------*/

    envoyerDemandeFinancement(
        projet,
        montantNombre
    );
}


/*==================================================
 ENVOYER UNE DEMANDE DE FINANCEMENT
==================================================*/

async function envoyerDemandeFinancement(
    projet,
    montant
) {

    if (!firebaseReady) {

        alert(
            "Connexion Firebase indisponible."
        );

        return;
    }


    try {

        const {
            ref,
            push,
            set
        } = window.firebaseDatabase;


        /*------------------------------------------
         CRÉER LA DEMANDE
        ------------------------------------------*/

        const financementRef =
            push(
                ref(
                    realtime,
                    "financements"
                )
            );


        /*------------------------------------------
         DONNÉES DE LA DEMANDE
        ------------------------------------------*/

        const financement = {

            id:
                financementRef.key,

            projetId:
                projet.id,

            projetNom:
                projet.nom || "",

            membreId:
                membre.id,

            matricule:
                membre.matricule,

            membreNom:
                membre.nom,

            montant:
                montant,

            statut:
                "en_attente",

            date:
                new Date().toISOString(),

            commentairePresident:
                ""
        };


        /*------------------------------------------
         ENREGISTRER
        ------------------------------------------*/

        await set(
            financementRef,
            financement
        );


        /*------------------------------------------
         CONFIRMATION
        ------------------------------------------*/

        alert(
            "Votre proposition de financement a été envoyée au Président pour examen."
        );


        /*------------------------------------------
         ACTUALISER
        ------------------------------------------*/

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "Erreur financement :",
            erreur
        );


        alert(
            "Impossible d'envoyer la demande de financement."
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


    if (!container) {
        return;
    }


    container.innerHTML = "";


    /*----------------------------------------------
     FILTRER LES DEMANDES DU MEMBRE
    ----------------------------------------------*/

    const liste =
        Object.values(
            financements || {}
        )
        .filter(financement => {

            return (
                String(
                    financement.membreId
                ) ===
                String(
                    membre.id
                )
            );

        });


    /*----------------------------------------------
     AUCUNE DEMANDE
    ----------------------------------------------*/

    if (liste.length === 0) {

        afficherElement(
            "etatVideFinancements",
            true
        );

        return;
    }


    afficherElement(
        "etatVideFinancements",
        false
    );


    /*----------------------------------------------
     AFFICHER LES DEMANDES
    ----------------------------------------------*/

    liste.forEach(
        financement => {

            const carte =
                document.createElement(
                    "div"
                );


            carte.className =
                "financement-card";


            const statut =
                normaliserStatut(
                    financement.statut
                );


            carte.innerHTML = `

                <h3>
                    ${escapeHTML(
                        financement.projetNom ||
                        "Projet"
                    )}
                </h3>

                <p>
                    <strong>
                        Montant proposé :
                    </strong>
                </p>

                <div class="montant">
                    ${formaterMontant(
                        financement.montant
                    )}
                </div>

                <span class="statut ${classeStatut(statut)}">
                    ${afficherStatut(statut)}
                </span>

                ${
                    financement.commentairePresident
                    ?
                    `
                    <p>
                        <strong>
                            Réponse du Président :
                        </strong>
                        <br>
                        ${escapeHTML(
                            financement.commentairePresident
                        )}
                    </p>
                    `
                    :
                    ""
                }

            `;


            container.appendChild(
                carte
            );

        }
    );
}


/*==================================================
 OUVRIR AVIS
==================================================*/

function ouvrirAvis(projet) {

    const avis =
        prompt(

`Votre avis sur le projet :

"${projet.nom || "---"}"

Écrivez votre avis :`

        );


    /*----------------------------------------------
     ANNULATION / VIDE
    ----------------------------------------------*/

    if (
        avis === null ||
        !avis.trim()
    ) {

        return;
    }


    /*----------------------------------------------
     ENREGISTRER
    ----------------------------------------------*/

    envoyerAvis(
        projet,
        avis.trim()
    );
}


/*==================================================
 ENREGISTRER UN AVIS
==================================================*/

async function envoyerAvis(
    projet,
    avis
) {

    if (!firebaseReady) {

        alert(
            "Connexion Firebase indisponible."
        );

        return;
    }


    try {

        const {
            ref,
            push,
            set
        } = window.firebaseDatabase;


        /*------------------------------------------
         CRÉER LA RÉFÉRENCE
        ------------------------------------------*/

        const avisRef =
            push(
                ref(
                    realtime,
                    "avisProjets"
                )
            );


        /*------------------------------------------
         DONNÉES DE L'AVIS
        ------------------------------------------*/

        const nouvelAvis = {

            id:
                avisRef.key,

            projetId:
                projet.id,

            projetNom:
                projet.nom || "",

            membreId:
                membre.id,

            matricule:
                membre.matricule,

            membreNom:
                membre.nom,

            avis:
                avis,

            date:
                new Date().toISOString()
        };


        /*------------------------------------------
         ENREGISTRER
        ------------------------------------------*/

        await set(
            avisRef,
            nouvelAvis
        );


        /*------------------------------------------
         CONFIRMATION
        ------------------------------------------*/

        alert(
            "Votre avis a été enregistré."
        );


        /*------------------------------------------
         ACTUALISER
        ------------------------------------------*/

        await chargerDonnees();


    } catch (erreur) {

        console.error(
            "Erreur avis :",
            erreur
        );


        alert(
            "Impossible d'enregistrer votre avis."
        );
    }
}


/*==================================================
 AFFICHER / MASQUER UN ÉLÉMENT
==================================================*/

function afficherElement(
    id,
    valeur
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    /*----------------------------------------------
     CAS BOOLEAN
    ----------------------------------------------*/

    if (
        typeof valeur === "boolean"
    ) {

        element.style.display =
            valeur
            ? ""
            : "none";

        return;
    }


    /*----------------------------------------------
     CAS TEXTE
    ----------------------------------------------*/

    element.textContent =
        valeur;
}


/*==================================================
 AFFICHER UNE SECTION
==================================================*/

function afficherSection(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.style.display =
        "";
}


/*==================================================
 CACHER UNE SECTION
==================================================*/

function cacherSection(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.style.display =
        "none";
}


/*==================================================
 RÉCUPÉRER LA VALEUR D'UN CHAMP
==================================================*/

function valeur(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();
}


/*==================================================
 RÉINITIALISER LE FORMULAIRE
==================================================*/

function formulaireReset() {

    const formulaire =
        document.getElementById(
            "formProjet"
        );


    if (formulaire) {

        formulaire.reset();
    }
}


/*==================================================
 NORMALISER UN STATUT
==================================================*/

function normaliserStatut(statut) {

    if (!statut) {

        return "en_attente";
    }


    return String(statut)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_");
}


/*==================================================
 TEXTE DU STATUT
==================================================*/

function afficherStatut(statut) {

    switch (statut) {

        case "en_attente":
            return "En attente de validation";


        case "valide":
        case "validé":
            return "Validé";


        case "en_cours":
            return "En cours";


        case "realise":
        case "réalisé":
            return "Réalisé";


        case "refuse":
        case "refusé":
            return "Refusé";


        default:
            return "En attente";
    }
}


/*==================================================
 CLASSE CSS DU STATUT
==================================================*/

function classeStatut(statut) {

    switch (statut) {

        case "valide":
        case "validé":
            return "valide";


        case "en_cours":
            return "encours";


        case "realise":
        case "réalisé":
            return "realise";


        case "refuse":
        case "refusé":
            return "refuse";


        default:
            return "attente";
    }
}


/*==================================================
 FORMATAGE DES MONTANTS
==================================================*/

function formaterMontant(montant) {

    const nombre =
        Number(montant) || 0;


    return (
        nombre.toLocaleString(
            "fr-FR"
        )
        + " FCFA"
    );
}


/*==================================================
 PROTECTION CONTRE HTML
==================================================*/

function escapeHTML(texte) {

    return String(texte)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/*==================================================
 MESSAGE SYSTÈME
==================================================*/

function afficherMessage(
    texte,
    type = "info"
) {

    const element =
        document.getElementById(
            "message"
        );


    /*----------------------------------------------
     SI L'ÉLÉMENT N'EXISTE PAS
    ----------------------------------------------*/

    if (!element) {

        console.log(
            `[${type}] ${texte}`
        );

        return;
    }


    /*----------------------------------------------
     AFFICHER
    ----------------------------------------------*/

    element.textContent =
        texte;


    element.className =
        `message ${type}`;


    element.style.display =
        "block";


    /*----------------------------------------------
     MASQUER APRÈS QUELQUES SECONDES
    ----------------------------------------------*/

    setTimeout(
        () => {

            element.style.display =
                "none";

        },
        6000
    );
}


/*==================================================
 FIN DU FICHIER
==================================================*/

console.log(
    "PROJETSMEMBRE.JS — VERSION COMPLÈTE CHARGÉE"
);
