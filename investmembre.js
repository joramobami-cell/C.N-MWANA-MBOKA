"use strict";

/* =========================================================
   INVESTMEMBRE.JS
   ESPACE INVESTISSEMENTS MEMBRE
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   ========================================================= */

let realtime = null;

let opportunites = [];
let propositions = [];
let participations = [];

let membre = {
    id: "",
    nom: "",
    matricule: "",
    photo: ""
};

/* =========================================================
   DÉMARRAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("INVESTMEMBRE JS CHARGÉ");

    chargerSession();

    afficherInformationsMembre();

    initialiserInterface();

    initialiserEvenements();

    chargerFirebase();

});


/* =========================================================
   SESSION MEMBRE
   ========================================================= */

function chargerSession(){

    membre.id =
        localStorage.getItem("membreId") ||
        localStorage.getItem("idMembre") ||
        "";

    membre.nom =
        localStorage.getItem("nom") ||
        localStorage.getItem("nomMembre") ||
        "Membre";

    membre.matricule =
        localStorage.getItem("matricule") ||
        localStorage.getItem("matriculeMembre") ||
        "";

    membre.photo =
        localStorage.getItem("photo") ||
        "";

    console.log("SESSION INVESTISSEMENT :", membre);
}


/* =========================================================
   INFORMATIONS DU MEMBRE
   ========================================================= */

function afficherInformationsMembre(){

    const nom = document.getElementById("nomMembre");

    if(nom){
        nom.textContent = membre.nom;
    }


    const matricule = document.getElementById("matriculeMembre");

    if(matricule){
        matricule.textContent =
            membre.matricule || "Matricule non disponible";
    }


    const photo = document.getElementById("photoMembre");

    if(photo){

        photo.src =
            membre.photo ||
            "logo.png";

        photo.onerror = () => {
            photo.src = "logo.png";
        };

    }

}


/* =========================================================
   INITIALISATION DE L'INTERFACE
   ========================================================= */

function initialiserInterface(){

    const sections = [
        "sectionOpportunites",
        "sectionMesPropositions",
        "sectionParticipations",
        "formulaireInvestissement"
    ];

    sections.forEach(id => {

        const element = document.getElementById(id);

        if(element){
            element.style.display = "none";
        }

    });


    afficherSection("sectionOpportunites");


    mettreAJourCompteurs();

}


/* =========================================================
   ÉVÉNEMENTS DES 4 BOUTONS
   ========================================================= */

function initialiserEvenements(){

    /* -----------------------------------------------------
       BOUTON 1 : OPPORTUNITÉS
       ----------------------------------------------------- */

    const btnOpportunites =
        document.getElementById("btnOpportunites");

    if(btnOpportunites){

        btnOpportunites.addEventListener("click", function(event){

            event.preventDefault();

            console.log("Bouton Opportunités");

            afficherSection("sectionOpportunites");

            chargerOpportunites();

        });

    }


    /* -----------------------------------------------------
       BOUTON 2 : MES PROPOSITIONS
       ----------------------------------------------------- */

    const btnMesPropositions =
        document.getElementById("btnMesPropositions");

    if(btnMesPropositions){

        btnMesPropositions.addEventListener("click", function(event){

            event.preventDefault();

            console.log("Bouton Mes propositions");

            afficherSection("sectionMesPropositions");

            chargerMesPropositions();

        });

    }


    /* -----------------------------------------------------
       BOUTON 3 : MES PARTICIPATIONS
       ----------------------------------------------------- */

    const btnParticipations =
        document.getElementById("btnParticipations");

    if(btnParticipations){

        btnParticipations.addEventListener("click", function(event){

            event.preventDefault();

            console.log("Bouton Mes participations");

            afficherSection("sectionParticipations");

            chargerMesParticipations();

        });

    }


    /* -----------------------------------------------------
       BOUTON 4 : PROPOSER UNE OPPORTUNITÉ
       ----------------------------------------------------- */

    const btnSoumettre =
        document.getElementById("btnSoumettre");

    if(btnSoumettre){

        btnSoumettre.addEventListener("click", function(event){

            event.preventDefault();

            console.log("Bouton Proposer une opportunité");

            afficherFormulaire();

        });

    }


    /* -----------------------------------------------------
       FERMER LE FORMULAIRE
       ----------------------------------------------------- */

    const btnFermer =
        document.getElementById("btnFermerFormulaire");

    if(btnFermer){

        btnFermer.addEventListener("click", function(event){

            event.preventDefault();

            fermerFormulaire();

        });

    }


    /* -----------------------------------------------------
       RETOUR ESPACE MEMBRE
       ----------------------------------------------------- */

    const btnRetour =
        document.getElementById("btnRetour");

    if(btnRetour){

        btnRetour.addEventListener("click", function(event){

            event.preventDefault();

            window.location.href = "espace.html";

        });

    }


    const btnRetourEspace =
        document.getElementById("btnRetourEspace");

    if(btnRetourEspace){

        btnRetourEspace.addEventListener("click", function(event){

            event.preventDefault();

            window.location.href = "espace.html";

        });

    }


    /* -----------------------------------------------------
       FORMULAIRE
       ----------------------------------------------------- */

    const form =
        document.getElementById("formInvestissement");

    if(form){

        form.addEventListener("submit", function(event){

            event.preventDefault();

            soumettreOpportunite();

        });

    }

}


/* =========================================================
   AFFICHER UNE SECTION
   ========================================================= */

function afficherSection(idSection){

    const sections = [
        "sectionOpportunites",
        "sectionMesPropositions",
        "sectionParticipations",
        "formulaireInvestissement"
    ];

    sections.forEach(id => {

        const element = document.getElementById(id);

        if(element){
            element.style.display = "none";
        }

    });


    const section =
        document.getElementById(idSection);

    if(section){

        section.style.display = "block";

        setTimeout(() => {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 50);

    }

}


/* =========================================================
   AFFICHER LE FORMULAIRE
   ========================================================= */

function afficherFormulaire(){

    afficherSection("formulaireInvestissement");

}


/* =========================================================
   FERMER LE FORMULAIRE
   ========================================================= */

function fermerFormulaire(){

    const formulaire =
        document.getElementById("formulaireInvestissement");

    if(formulaire){

        formulaire.style.display = "none";

    }


    afficherSection("sectionOpportunites");

  }

/* =========================================================
   FIREBASE
   ========================================================= */

async function chargerFirebase(){

    try{

        console.log("Connexion Firebase...");

        const config =
            await import("./firebase-config.js");

        realtime = config.realtime;

        if(!realtime){

            console.error(
                "La base Realtime Database est introuvable."
            );

            afficherMessage(
                "La connexion à la base de données n'est pas disponible.",
                "error"
            );

            return;
        }

        console.log("Firebase connecté.");

        await chargerDonnees();

    }catch(erreur){

        console.error(
            "Erreur Firebase :",
            erreur
        );

        afficherMessage(
            "Impossible de charger les données pour le moment.",
            "error"
        );

    }

}


/* =========================================================
   CHARGEMENT DES DONNÉES
   ========================================================= */

async function chargerDonnees(){

    if(!realtime){

        console.warn(
            "Firebase n'est pas disponible."
        );

        return;
    }


    try{

        const firebaseDatabase =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js"
            );


        const {
            ref,
            get
        } = firebaseDatabase;


        /* -------------------------------------------------
           OPPORTUNITÉS
           ------------------------------------------------- */

        const opportunitesRef =
            ref(realtime, "investissements");

        const opportunitesSnapshot =
            await get(opportunitesRef);


        if(opportunitesSnapshot.exists()){

            const donnees =
                opportunitesSnapshot.val();

            opportunites =
                transformerDonneesEnTableau(donnees);

        }else{

            opportunites = [];

        }


        /* -------------------------------------------------
           PROPOSITIONS
           ------------------------------------------------- */

        const propositionsRef =
            ref(
                realtime,
                "propositionsInvestissements"
            );

        const propositionsSnapshot =
            await get(propositionsRef);


        if(propositionsSnapshot.exists()){

            const donnees =
                propositionsSnapshot.val();

            propositions =
                transformerDonneesEnTableau(donnees);

        }else{

            propositions = [];

        }


        /* -------------------------------------------------
           PARTICIPATIONS
           ------------------------------------------------- */

        const participationsRef =
            ref(
                realtime,
                "participationsInvestissements"
            );

        const participationsSnapshot =
            await get(participationsRef);


        if(participationsSnapshot.exists()){

            const donnees =
                participationsSnapshot.val();

            participations =
                transformerDonneesEnTableau(donnees);

        }else{

            participations = [];

        }


        console.log(
            "Opportunités :",
            opportunites
        );

        console.log(
            "Propositions :",
            propositions
        );

        console.log(
            "Participations :",
            participations
        );


        mettreAJourCompteurs();

        afficherOpportunites();

    }catch(erreur){

        console.error(
            "Erreur lors du chargement des données :",
            erreur
        );

        afficherMessage(
            "Les données d'investissement ne peuvent pas être chargées.",
            "error"
        );

    }

}


/* =========================================================
   TRANSFORMER UN OBJET FIREBASE EN TABLEAU
   ========================================================= */

function transformerDonneesEnTableau(donnees){

    if(!donnees){

        return [];

    }


    return Object.keys(donnees).map(id => {

        return {

            id:id,

            ...donnees[id]

        };

    });

}


/* =========================================================
   AFFICHER LES OPPORTUNITÉS DISPONIBLES
   ========================================================= */

function chargerOpportunites(){

    afficherOpportunites();

}


function afficherOpportunites(){

    const liste =
        document.getElementById("listeOpportunites");

    const etatVide =
        document.getElementById(
            "etatVideOpportunites"
        );


    if(!liste){

        return;

    }


    liste.innerHTML = "";


    /* -----------------------------------------------------
       SEULEMENT LES OPPORTUNITÉS VALIDÉES
       ----------------------------------------------------- */

    const disponibles =
        opportunites.filter(opportunite => {

            const statut =
                String(
                    opportunite.statut ||
                    opportunite.etat ||
                    ""
                ).toLowerCase();


            return (
                statut === "valide" ||
                statut === "validé" ||
                statut === "en_cours" ||
                statut === "encours" ||
                statut === "realise" ||
                statut === "réalisé"
            );

        });


    if(disponibles.length === 0){

        if(etatVide){

            etatVide.style.display = "block";

        }

        return;

    }


    if(etatVide){

        etatVide.style.display = "none";

    }


    disponibles.forEach(opportunite => {

        liste.appendChild(
            creerCarteOpportunite(opportunite)
        );

    });

}


/* =========================================================
   CARTE D'UNE OPPORTUNITÉ
   ========================================================= */

function creerCarteOpportunite(opportunite){

    const carte =
        document.createElement("div");

    carte.className =
        "opportunite-card";


    const nom =
        opportunite.nom ||
        opportunite.nomOpportunite ||
        opportunite.nomInvestissement ||
        "Opportunité d'investissement";


    const categorie =
        opportunite.categorie ||
        opportunite.categorieInvestissement ||
        "Investissement";


    const localisation =
        opportunite.localisation ||
        opportunite.lieu ||
        "";


    const description =
        opportunite.description ||
        "Aucune description disponible.";


    const objectifs =
        opportunite.objectifs ||
        "";


    const montantTotal =
        opportunite.montantTotal ||
        opportunite.budget ||
        0;


    const montantRecherche =
        opportunite.montantRecherche ||
        opportunite.montantRechercheInvestissement ||
        0;


    const statut =
        opportunite.statut ||
        "valide";


    carte.innerHTML = `

        <span class="categorie">
            ${echapperHTML(categorie)}
        </span>

        <h3>
            ${echapperHTML(nom)}
        </h3>

        ${
            localisation
            ? `
                <p>
                    <strong>Localisation :</strong>
                    ${echapperHTML(localisation)}
                </p>
              `
            : ""
        }

        <p>
            ${echapperHTML(description)}
        </p>

        ${
            objectifs
            ? `
                <p>
                    <strong>Objectifs :</strong>
                    ${echapperHTML(objectifs)}
                </p>
              `
            : ""
        }

        <div class="montants-investissement">

            <div class="montant">

                <span>
                    Montant total
                </span>

                <strong>
                    ${formaterMontant(montantTotal)}
                </strong>

            </div>


            <div class="montant">

                <span>
                    Montant recherché
                </span>

                <strong>
                    ${formaterMontant(montantRecherche)}
                </strong>

            </div>

        </div>


        <span class="statut valide">

            ${traduireStatut(statut)}

        </span>


        <div class="investissement-actions">

            <button
                type="button"
                class="btn-primary"
                onclick="proposerParticipation('${opportunite.id}')"
            >
                <i class="fa-solid fa-hand-holding-dollar"></i>
                Proposer une participation
            </button>

        </div>

    `;


    return carte;

}


/* =========================================================
   MES PROPOSITIONS
   ========================================================= */

function chargerMesPropositions(){

    const liste =
        document.getElementById(
            "listePropositions"
        );

    const etatVide =
        document.getElementById(
            "etatVidePropositions"
        );


    if(!liste){

        return;

    }


    liste.innerHTML = "";


    const mesPropositions =
        propositions.filter(proposition => {

            const membreId =
                proposition.membreId ||
                proposition.porteurId ||
                proposition.idMembre ||
                "";


            const matricule =
                proposition.matricule ||
                proposition.porteurMatricule ||
                "";


            return (
                (
                    membre.id &&
                    String(membreId) ===
                    String(membre.id)
                )
                ||
                (
                    membre.matricule &&
                    String(matricule) ===
                    String(membre.matricule)
                )
            );

        });


    if(mesPropositions.length === 0){

        if(etatVide){

            etatVide.style.display = "block";

        }

        return;

    }


    if(etatVide){

        etatVide.style.display = "none";

    }


    mesPropositions.forEach(proposition => {

        liste.appendChild(
            creerCarteProposition(proposition)
        );

    });

}


/* =========================================================
   CARTE PROPOSITION
   ========================================================= */

function creerCarteProposition(proposition){

    const carte =
        document.createElement("div");

    carte.className =
        "proposition-card";


    const nom =
        proposition.nom ||
        proposition.nomOpportunite ||
        proposition.nomInvestissement ||
        "Proposition d'investissement";


    const categorie =
        proposition.categorie ||
        proposition.categorieInvestissement ||
        "Investissement";


    const statut =
        proposition.statut ||
        "en_attente";


    const description =
        proposition.description ||
        "";


    const montant =
        proposition.montantRecherche ||
        proposition.montantTotal ||
        0;


    carte.innerHTML = `

        <span class="categorie">
            ${echapperHTML(categorie)}
        </span>

        <h3>
            ${echapperHTML(nom)}
        </h3>

        ${
            description
            ? `
                <p>
                    ${echapperHTML(description)}
                </p>
              `
            : ""
        }

        <div class="montants-investissement">

            <div class="montant">

                <span>
                    Montant demandé
                </span>

                <strong>
                    ${formaterMontant(montant)}
                </strong>

            </div>

        </div>

        <span class="statut ${classeStatut(statut)}">

            ${traduireStatut(statut)}

        </span>

    `;


    return carte;

}


/* =========================================================
   MES PARTICIPATIONS
   ========================================================= */

function chargerMesParticipations(){

    const liste =
        document.getElementById(
            "listeParticipations"
        );

    const etatVide =
        document.getElementById(
            "etatVideParticipations"
        );


    if(!liste){

        return;

    }


    liste.innerHTML = "";


    const mesParticipations =
        participations.filter(participation => {

            const membreId =
                participation.membreId ||
                participation.idMembre ||
                "";


            const matricule =
                participation.matricule ||
                participation.matriculeMembre ||
                "";


            return (
                (
                    membre.id &&
                    String(membreId) ===
                    String(membre.id)
                )
                ||
                (
                    membre.matricule &&
                    String(matricule) ===
                    String(membre.matricule)
                )
            );

        });


    if(mesParticipations.length === 0){

        if(etatVide){

            etatVide.style.display = "block";

        }

        return;

    }


    if(etatVide){

        etatVide.style.display = "none";

    }


    mesParticipations.forEach(participation => {

        liste.appendChild(
            creerCarteParticipation(
                participation
            )
        );

    });

}


/* =========================================================
   CARTE PARTICIPATION
   ========================================================= */

function creerCarteParticipation(participation){

    const carte =
        document.createElement("div");

    carte.className =
        "participation-card";


    const nom =
        participation.nomOpportunite ||
        participation.nomInvestissement ||
        participation.projetNom ||
        "Participation";


    const montant =
        participation.montant ||
        participation.montantInvesti ||
        participation.montantParticipation ||
        0;


    const statut =
        participation.statut ||
        "en_attente";


    carte.innerHTML = `

        <h3>
            ${echapperHTML(nom)}
        </h3>

        <div class="montants-investissement">

            <div class="montant">

                <span>
                    Montant engagé
                </span>

                <strong>
                    ${formaterMontant(montant)}
                </strong>

            </div>

        </div>

        <span class="statut ${classeStatut(statut)}">

            ${traduireStatut(statut)}

        </span>

    `;


    return carte;

}


/* =========================================================
   COMPTEURS
   ========================================================= */

function mettreAJourCompteurs(){

    const totalOpportunites =
        document.getElementById(
            "totalOpportunites"
        );

    const totalPropositions =
        document.getElementById(
            "totalPropositions"
        );

    const totalParticipations =
        document.getElementById(
            "totalParticipations"
        );

    const montantInvesti =
        document.getElementById(
            "montantInvesti"
        );


    const opportunitesValides =
        opportunites.filter(opportunite => {

            const statut =
                String(
                    opportunite.statut ||
                    ""
                ).toLowerCase();

            return (
                statut === "valide" ||
                statut === "validé" ||
                statut === "en_cours" ||
                statut === "encours" ||
                statut === "realise" ||
                statut === "réalisé"
            );

        });


    const mesPropositions =
        propositions.filter(proposition => {

            return (
                (
                    membre.id &&
                    String(
                        proposition.membreId ||
                        proposition.porteurId ||
                        ""
                    ) === String(membre.id)
                )
                ||
                (
                    membre.matricule &&
                    String(
                        proposition.matricule ||
                        proposition.porteurMatricule ||
                        ""
                    ) === String(membre.matricule)
                )
            );

        });


    const mesParticipations =
        participations.filter(participation => {

            return (
                (
                    membre.id &&
                    String(
                        participation.membreId ||
                        participation.idMembre ||
                        ""
                    ) === String(membre.id)
                )
                ||
                (
                    membre.matricule &&
                    String(
                        participation.matricule ||
                        participation.matriculeMembre ||
                        ""
                    ) === String(membre.matricule)
                )
            );

        });


    let totalInvesti = 0;


    mesParticipations.forEach(participation => {

        totalInvesti += Number(
            participation.montant ||
            participation.montantInvesti ||
            participation.montantParticipation ||
            0
        );

    });


    if(totalOpportunites){

        totalOpportunites.textContent =
            opportunitesValides.length;

    }


    if(totalPropositions){

        totalPropositions.textContent =
            mesPropositions.length;

    }


    if(totalParticipations){

        totalParticipations.textContent =
            mesParticipations.length;

    }


    if(montantInvesti){

        montantInvesti.textContent =
            formaterMontant(totalInvesti);

    }

}

/* =========================================================
   SOUMETTRE UNE OPPORTUNITÉ
   ========================================================= */

async function soumettreOpportunite(){

    if(!realtime){

        afficherMessage(
            "La connexion à la base de données n'est pas disponible.",
            "error"
        );

        return;
    }


    const form =
        document.getElementById("formInvestissement");


    if(!form){
        return;
    }


    const nom =
        document.getElementById(
            "nomOpportunite"
        )?.value.trim();


    const categorie =
        document.getElementById(
            "categorieInvestissement"
        )?.value.trim();


    const localisation =
        document.getElementById(
            "localisationInvestissement"
        )?.value.trim();


    const description =
        document.getElementById(
            "descriptionInvestissement"
        )?.value.trim();


    const objectifs =
        document.getElementById(
            "objectifsInvestissement"
        )?.value.trim();


    const montantTotal =
        document.getElementById(
            "montantTotal"
        )?.value;


    const montantRecherche =
        document.getElementById(
            "montantRechercheInvestissement"
        )?.value;


    const besoins =
        document.getElementById(
            "besoinsInvestissement"
        )?.value.trim();


    /* -----------------------------------------------------
       VÉRIFICATION
       ----------------------------------------------------- */

    if(!nom){

        afficherMessage(
            "Veuillez renseigner le nom de l'opportunité.",
            "error"
        );

        return;
    }


    if(!categorie){

        afficherMessage(
            "Veuillez sélectionner une catégorie.",
            "error"
        );

        return;
    }


    if(!description){

        afficherMessage(
            "Veuillez décrire l'opportunité.",
            "error"
        );

        return;
    }


    if(!montantTotal){

        afficherMessage(
            "Veuillez renseigner le montant total.",
            "error"
        );

        return;
    }


    if(!montantRecherche){

        afficherMessage(
            "Veuillez renseigner le montant recherché.",
            "error"
        );

        return;
    }


    const bouton =
        document.getElementById(
            "btnEnvoyerInvestissement"
        );


    try{

        if(bouton){

            bouton.disabled = true;

            bouton.innerHTML =
                `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Envoi en cours...
                `;

        }


        const firebaseDatabase =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js"
            );


        const {
            ref,
            push,
            set
        } = firebaseDatabase;


        const nouvelleReference =
            push(
                ref(
                    realtime,
                    "propositionsInvestissements"
                )
            );


        const donnees = {

            membreId:
                membre.id || "",

            matricule:
                membre.matricule || "",

            nomMembre:
                membre.nom || "",

            nom:
                nom,

            nomOpportunite:
                nom,

            categorie:
                categorie,

            categorieInvestissement:
                categorie,

            localisation:
                localisation,

            description:
                description,

            objectifs:
                objectifs,

            montantTotal:
                Number(montantTotal),

            montantRecherche:
                Number(montantRecherche),

            besoins:
                besoins,

            statut:
                "en_attente",

            dateSoumission:
                new Date().toISOString()

        };


        await set(
            nouvelleReference,
            donnees
        );


        afficherMessage(
            "Votre opportunité a bien été soumise au Président pour étude et validation.",
            "success"
        );


        form.reset();


        setTimeout(() => {

            fermerFormulaire();

            chargerDonnees();

        }, 1500);


    }catch(erreur){

        console.error(
            "Erreur soumission opportunité :",
            erreur
        );


        afficherMessage(
            "Impossible d'envoyer votre opportunité. Veuillez réessayer.",
            "error"
        );


    }finally{

        if(bouton){

            bouton.disabled = false;

            bouton.innerHTML =
                `
                <i class="fa-solid fa-paper-plane"></i>
                Soumettre l'opportunité
                `;

        }

    }

}


/* =========================================================
   PROPOSER UNE PARTICIPATION
   ========================================================= */

async function proposerParticipation(idOpportunite){

    const opportunite =
        opportunites.find(
            element =>
                String(element.id) ===
                String(idOpportunite)
        );


    if(!opportunite){

        afficherMessage(
            "Cette opportunité est introuvable.",
            "error"
        );

        return;
    }


    const nom =
        opportunite.nom ||
        opportunite.nomOpportunite ||
        opportunite.nomInvestissement ||
        "cette opportunité";


    const montant =
        prompt(
            "Indiquez le montant que vous souhaitez proposer pour participer à :\n\n" +
            nom +
            "\n\nMontant en FCFA :"
        );


    if(montant === null){

        return;

    }


    const montantNumerique =
        Number(
            String(montant)
                .replace(/\s/g,"")
                .replace(",",".")
        );


    if(
        !montantNumerique ||
        montantNumerique <= 0
    ){

        afficherMessage(
            "Veuillez saisir un montant valide.",
            "error"
        );

        return;
    }


    if(!realtime){

        afficherMessage(
            "La connexion à la base de données n'est pas disponible.",
            "error"
        );

        return;
    }


    try{

        const firebaseDatabase =
            await import(
                "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js"
            );


        const {
            ref,
            push,
            set
        } = firebaseDatabase;


        const nouvelleReference =
            push(
                ref(
                    realtime,
                    "participationsInvestissements"
                )
            );


        const participation = {

            opportuniteId:
                opportunite.id,

            nomOpportunite:
                nom,

            membreId:
                membre.id || "",

            matricule:
                membre.matricule || "",

            nomMembre:
                membre.nom || "",

            montant:
                montantNumerique,

            statut:
                "en_attente",

            date:
                new Date().toISOString()

        };


        await set(
            nouvelleReference,
            participation
        );


        afficherMessage(
            "Votre proposition de participation a été envoyée au Président pour étude. Aucun paiement n'a été effectué.",
            "success"
        );


        await chargerDonnees();


        afficherSection(
            "sectionParticipations"
        );


        chargerMesParticipations();


    }catch(erreur){

        console.error(
            "Erreur participation :",
            erreur
        );


        afficherMessage(
            "Impossible d'envoyer votre proposition de participation.",
            "error"
        );

    }

}


/* =========================================================
   AFFICHER UN MESSAGE
   ========================================================= */

function afficherMessage(
    texte,
    type = "info"
){

    const message =
        document.getElementById("message");


    if(!message){

        return;
    }


    message.textContent =
        texte;


    message.className =
        "message " + type;


    message.style.display =
        "block";


    message.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });


    clearTimeout(
        window.timerMessageInvestissement
    );


    window.timerMessageInvestissement =
        setTimeout(() => {

            message.style.display =
                "none";

        },6000);

}


/* =========================================================
   FORMATAGE DES MONTANTS
   ========================================================= */

function formaterMontant(montant){

    const valeur =
        Number(montant) || 0;


    return (
        valeur.toLocaleString(
            "fr-FR"
        ) +
        " FCFA"
    );

}


/* =========================================================
   TRADUCTION DES STATUTS
   ========================================================= */

function traduireStatut(statut){

    const valeur =
        String(
            statut || ""
        )
        .toLowerCase()
        .trim();


    const statuts = {

        "en_attente":
            "En attente",

        "attente":
            "En attente",

        "pending":
            "En attente",

        "valide":
            "Validé",

        "validé":
            "Validé",

        "approved":
            "Validé",

        "en_cours":
            "En cours",

        "encours":
            "En cours",

        "realise":
            "Réalisé",

        "réalisé":
            "Réalisé",

        "refuse":
            "Refusé",

        "refusé":
            "Refusé",

        "rejected":
            "Refusé"

    };


    return (
        statuts[valeur] ||
        statut ||
        "En attente"
    );

}


/* =========================================================
   CLASSE CSS DU STATUT
   ========================================================= */

function classeStatut(statut){

    const valeur =
        String(
            statut || ""
        )
        .toLowerCase()
        .trim();


    if(
        valeur === "valide" ||
        valeur === "validé" ||
        valeur === "approved"
    ){

        return "valide";

    }


    if(
        valeur === "en_cours" ||
        valeur === "encours"
    ){

        return "encours";

    }


    if(
        valeur === "realise" ||
        valeur === "réalisé"
    ){

        return "realise";

    }


    if(
        valeur === "refuse" ||
        valeur === "refusé" ||
        valeur === "rejected"
    ){

        return "refuse";

    }


    return "attente";

}


/* =========================================================
   PROTECTION DU HTML
   ========================================================= */

function echapperHTML(valeur){

    if(
        valeur === null ||
        valeur === undefined
    ){

        return "";

    }


    return String(valeur)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =========================================================
   ANNÉE DU FOOTER
   ========================================================= */

const annee =
    document.getElementById("annee");


if(annee){

    annee.textContent =
        new Date().getFullYear();

}


/* =========================================================
   FIN DU FICHIER
   ========================================================= */

console.log(
    "INVESTMEMBRE.JS — VERSION COMPLÈTE CHARGÉE"
);
