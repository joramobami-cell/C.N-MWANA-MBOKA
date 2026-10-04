/*==================================================
  MWANA MBOKA
  CONNEXION MEMBRE
  JAVASCRIPT
==================================================*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    push,
    set
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


/*==================================================
  CONFIGURATION FIREBASE
==================================================*/

const firebaseConfig = {

    apiKey:
        "AIzaSyDHMovN3CpVl6fQUDZGRNqFu6mLUUPR8Sc",

    authDomain:
        "c-n-mwana-mboka.firebaseapp.com",

    databaseURL:
        "https://c-n-mwana-mboka-default-rtdb.europe-west1.firebasedatabase.app",

    projectId:
        "c-n-mwana-mboka",

    storageBucket:
        "c-n-mwana-mboka.firebasestorage.app",

    messagingSenderId:
        "757726608581",

    appId:
        "1:757726608581:web:27fa7003ffa955188304ac"

};


/*==================================================
  INITIALISATION FIREBASE
==================================================*/

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


/*==================================================
  PARAMETRES DE SESSION
==================================================*/

/*
  Fermeture automatique après
  10 minutes sans activité.
*/

const DUREE_INACTIVITE =
    10 * 60 * 1000;


/*
  Durée maximale absolue d'une session.

  Cette limite sera également contrôlée
  dans les pages protégées.
*/

const DUREE_MAX_SESSION =
    8 * 60 * 60 * 1000;


/*==================================================
  ELEMENTS HTML
==================================================*/

const connexionForm =
    document.getElementById("connexionForm");

const matriculeInput =
    document.getElementById("matricule");

const motdepasseInput =
    document.getElementById("motdepasse");

const togglePassword =
    document.getElementById("togglePassword");

const boutonConnexion =
    document.getElementById("boutonConnexion");

const message =
    document.getElementById("message");

const annee =
    document.getElementById("annee");


/*==================================================
  ANNEE AUTOMATIQUE
==================================================*/

if (annee) {

    annee.textContent =
        new Date().getFullYear();

}


/*==================================================
  VERIFICATION DES ELEMENTS
==================================================*/

if (
    !connexionForm ||
    !matriculeInput ||
    !motdepasseInput ||
    !boutonConnexion
) {

    console.error(
        "Erreur : éléments de connexion introuvables."
    );

}

/*==================================================
  AFFICHAGE DES MESSAGES
==================================================*/

function afficherMessage(
    texte,
    type = "normal"
) {

    if (!message) {
        return;
    }

    message.textContent = texte;

    message.className =
        "message " + type;

}


/*==================================================
  AFFICHER / MASQUER LE MOT DE PASSE
==================================================*/

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const estCache =
                motdepasseInput.type === "password";

            motdepasseInput.type =
                estCache
                    ? "text"
                    : "password";


            const icone =
                togglePassword.querySelector("i");

            if (icone) {

                icone.className =
                    estCache
                        ? "fa-solid fa-eye-slash"
                        : "fa-solid fa-eye";

            }


            togglePassword.setAttribute(
                "aria-label",
                estCache
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
            );

        }
    );

}


/*==================================================
  NETTOYAGE DE L'ANCIENNE SESSION
==================================================*/

function nettoyerAncienneSession() {

    /*
      On évite localStorage.clear()
      afin de ne pas supprimer d'autres
      paramètres éventuellement utilisés
      par la plateforme.
    */

    const clesSession = [

        "utilisateurConnecte",

        "sessionDebut",

        "derniereActivite",

        "expirationSession",

        "sessionExpiree",

        "membreId",

        "nom",

        "matricule",

        "telephone",

        "statut",

        "dateAdhesion",

        "parrain",

        "photo",

        "role",

        "fonction",

        "bureau"

    ];


    clesSession.forEach(
        (cle) => {

            localStorage.removeItem(cle);

        }
    );

}


/*==================================================
  CREATION DE LA SESSION
==================================================*/

function creerSession(
    membre,
    informationsBureau
) {

    const maintenant =
        Date.now();


    const expirationAbsolue =
        maintenant +
        DUREE_MAX_SESSION;


    /*
      Informations conservées
      pour les autres pages de la plateforme.
    */

    const utilisateur = {

        nom:
            membre.nom || "",

        matricule:
            membre.matricule || "",

        telephone:
            membre.telephone || "",

        photo:
            membre.photo || "",

        statut:
            membre.statut || "",

        dateAdhesion:
            membre.dateAdhesion || "",

        parrain:
            membre.parrain || "",

        role:
            membre.role || "",

        fonction:
            informationsBureau.fonction || "",

        bureau:
            informationsBureau.bureau || "espace.html"

    };


    /*
      Session principale.
    */

    localStorage.setItem(
        "utilisateurConnecte",
        JSON.stringify(utilisateur)
    );


    /*
      Horodatage du début de session.
    */

    localStorage.setItem(
        "sessionDebut",
        String(maintenant)
    );


    /*
      Dernière activité.
    */

    localStorage.setItem(
        "derniereActivite",
        String(maintenant)
    );


    /*
      Expiration maximale.
    */

    localStorage.setItem(
        "expirationSession",
        String(expirationAbsolue)
    );


    /*
      Indique qu'une nouvelle session
      vient d'être créée.
    */

    localStorage.removeItem(
        "sessionExpiree"
    );

}

/*==================================================
  RECHERCHE DE LA FONCTION DANS L'ORGANIGRAMME
==================================================*/

function rechercherFonction(
    objet,
    matriculeRecherche
) {

    if (
        !objet ||
        typeof objet !== "object"
    ) {

        return null;

    }


    for (
        const cle in objet
    ) {

        const element =
            objet[cle];


        if (
            !element ||
            typeof element !== "object"
        ) {

            continue;

        }


        /*
          Vérification du matricule
          du responsable nommé.
        */

        if (
            element.responsableMatricule &&
            String(
                element.responsableMatricule
            ).toUpperCase() ===
            matriculeRecherche
        ) {

            return {

                fonction:
                    element.fonction ||
                    cle,

                domaine:
                    element.domaine ||
                    "",

                poste:
                    element.poste ||
                    ""

            };

        }


        /*
          Recherche récursive dans
          les sous-domaines.
        */

        const resultat =
            rechercherFonction(
                element,
                matriculeRecherche
            );


        if (resultat) {

            return resultat;

        }

    }


    return null;

}


/*==================================================
  DETERMINATION DU BUREAU
==================================================*/

function determinerBureau(
    fonction
) {

    const fonctionNormalisee =
        String(
            fonction || ""
        )
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );


    /*
      PRESIDENT
    */

    if (
        fonctionNormalisee === "president" ||
        fonctionNormalisee.includes("president")
    ) {

        return "prbureau.html";

    }


    /*
      SECRETARIAT GENERAL /
      ADMINISTRATION
    */

    if (
        fonctionNormalisee.includes(
            "secretariat"
        ) ||
        fonctionNormalisee.includes(
            "administration"
        )
    ) {

        return "bureau-secretariat.html";

    }


    /*
      FORMATION
    */

    if (
        fonctionNormalisee.includes(
            "formation"
        )
    ) {

        return "bureau-formation.html";

    }


    /*
      COMMUNICATION
    */

    if (
        fonctionNormalisee.includes(
            "communication"
        ) ||
        fonctionNormalisee.includes(
            "marketing"
        )
    ) {

        return "bureau-communication.html";

    }


    /*
      PROJETS
    */

    if (
        fonctionNormalisee.includes(
            "projet"
        )
    ) {

        return "bureau-projets.html";

    }


    /*
      CONSEIL ADMINISTRATIF
    */

    if (
        fonctionNormalisee.includes(
            "conseiller"
        ) ||
        fonctionNormalisee.includes(
            "conseil"
        ) ||
        fonctionNormalisee.includes(
            "juridique"
        ) ||
        fonctionNormalisee.includes(
            "technique"
        )
    ) {

        return "bureau-conseil.html";

    }


    /*
      FINANCES ET ECONOMIE
    */

    if (
        fonctionNormalisee.includes(
            "finance"
        ) ||
        fonctionNormalisee.includes(
            "tresor"
        ) ||
        fonctionNormalisee.includes(
            "comptabil"
        ) ||
        fonctionNormalisee.includes(
            "economie"
        ) ||
        fonctionNormalisee.includes(
            "investissement"
        )
    ) {

        return "bureau-finance.html";

    }


    /*
      MEMBRE ORDINAIRE
    */

    return "espace.html";

}


/*==================================================
  ENREGISTREMENT DE L'ACTIVITE
==================================================*/

async function enregistrerConnexion(
    membre
) {

    try {

        const journalRef =
            ref(
                database,
                "journal_activites"
            );


        const nouvelleActivite =
            push(journalRef);


        await set(
            nouvelleActivite,
            {

                type:
                    "connexion",

                matricule:
                    membre.matricule || "",

                nom:
                    membre.nom || "",

                date:
                    new Date().toISOString(),

                timestamp:
                    Date.now()

            }
        );

    }
    catch (erreur) {

        /*
          Une erreur de journalisation
          ne doit pas empêcher la connexion.
        */

        console.warn(
            "Journalisation impossible :",
            erreur
        );

    }

}


/*==================================================
  PREPARATION DU BOUTON
==================================================*/

function definirEtatConnexion(
    chargement
) {

    if (!boutonConnexion) {
        return;
    }


    boutonConnexion.disabled =
        chargement;


    if (chargement) {

        boutonConnexion.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';

    }
    else {

        boutonConnexion.innerHTML =
            '<i class="fa-solid fa-right-to-bracket"></i> Se connecter';

    }

}

/*==================================================
  CONNEXION
==================================================*/

if (connexionForm) {

    connexionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*------------------------------------------
              RECUPERATION DES DONNEES
            ------------------------------------------*/

            const matricule =
                matriculeInput.value
                    .trim()
                    .toUpperCase();

            const motdepasse =
                motdepasseInput.value;


            /*------------------------------------------
              VERIFICATION DES CHAMPS
            ------------------------------------------*/

            if (!matricule) {

                afficherMessage(
                    "Veuillez saisir votre matricule.",
                    "error"
                );

                matriculeInput.focus();

                return;

            }


            if (!motdepasse) {

                afficherMessage(
                    "Veuillez saisir votre mot de passe.",
                    "error"
                );

                motdepasseInput.focus();

                return;

            }


            /*------------------------------------------
              ETAT CHARGEMENT
            ------------------------------------------*/

            definirEtatConnexion(true);

            afficherMessage(
                "Vérification de vos informations...",
                "normal"
            );


            try {

                /*--------------------------------------
                  RECHERCHE DU MEMBRE
                --------------------------------------*/

                const membreRef =
                    ref(
                        database,
                        "membres/" + matricule
                    );


                const snapshot =
                    await get(membreRef);


                if (!snapshot.exists()) {

                    definirEtatConnexion(false);

                    afficherMessage(
                        "Matricule ou mot de passe incorrect.",
                        "error"
                    );

                    return;

                }


                const membre =
                    snapshot.val();


                /*--------------------------------------
                  VERIFICATION DU MOT DE PASSE
                --------------------------------------*/

                const motdepasseEnregistre =
                    String(
                        membre.motdepasse || ""
                    );


                if (
                    motdepasseEnregistre !==
                    String(motdepasse)
                ) {

                    definirEtatConnexion(false);

                    afficherMessage(
                        "Matricule ou mot de passe incorrect.",
                        "error"
                    );

                    return;

                }


                /*--------------------------------------
                  VERIFICATION DU STATUT
                --------------------------------------*/

                const statut =
                    String(
                        membre.statut || ""
                    )
                    .toLowerCase()
                    .trim();


                const statutsBloques = [

                    "bloqué",
                    "bloque",
                    "suspendu",
                    "suspendue",
                    "inactif",
                    "inactive",
                    "radié",
                    "radie",
                    "radiée",
                    "radiee"

                ];


                if (
                    statutsBloques.includes(statut)
                ) {

                    definirEtatConnexion(false);

                    afficherMessage(
                        "Votre compte est actuellement suspendu ou désactivé. Veuillez contacter l'administration.",
                        "error"
                    );

                    return;

                }


                /*--------------------------------------
                  RECHERCHE DE LA FONCTION
                --------------------------------------*/

                let informationsFonction = {

                    fonction:
                        "",

                    domaine:
                        "",

                    poste:
                        ""

                };


                try {

                    const organigrammeRef =
                        ref(
                            database,
                            "organigramme"
                        );


                    const organigrammeSnapshot =
                        await get(
                            organigrammeRef
                        );


                    if (
                        organigrammeSnapshot.exists()
                    ) {

                        const organigramme =
                            organigrammeSnapshot.val();


                        const resultat =
                            rechercherFonction(
                                organigramme,
                                matricule
                            );


                        if (resultat) {

                            informationsFonction =
                                resultat;

                        }

                    }

                }
                catch (erreurOrganigramme) {

                    console.warn(
                        "Lecture de l'organigramme impossible :",
                        erreurOrganigramme
                    );

                }


                /*--------------------------------------
                  RECONNAISSANCE DU PRESIDENT FONDATEUR
                --------------------------------------*/

                const roleNormalise =
                    String(
                        membre.role || ""
                    )
                    .toLowerCase()
                    .trim()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    );


                const estPresident =

                    roleNormalise === "president" ||

                    roleNormalise.includes(
                        "president fondateur"
                    ) ||

                    membre.fondateur === true;


                if (estPresident) {

                    informationsFonction.fonction =
                        "president";

                    informationsFonction.domaine =
                        "Présidence";

                    informationsFonction.poste =
                        "Président Fondateur";

                }


                /*--------------------------------------
                  DETERMINATION DU BUREAU
                --------------------------------------*/

                const bureau =
                    estPresident
                        ? "prbureau.html"
                        : determinerBureau(
                            informationsFonction.fonction
                        );


                /*--------------------------------------
                  NETTOYAGE DE L'ANCIENNE SESSION
                --------------------------------------*/

                nettoyerAncienneSession();


                /*--------------------------------------
                  CREATION DE LA NOUVELLE SESSION
                --------------------------------------*/

                creerSession(

                    {
                        ...membre,

                        matricule:
                            membre.matricule ||
                            matricule

                    },

                    {

                        ...informationsFonction,

                        bureau:
                            bureau

                    }

                );


                /*--------------------------------------
                  JOURNAL DE CONNEXION
                --------------------------------------*/

                await enregistrerConnexion(

                    {

                        ...membre,

                        matricule:
                            membre.matricule ||
                            matricule

                    }

                );


                /*--------------------------------------
                  MESSAGE DE SUCCES
                --------------------------------------*/

                definirEtatConnexion(false);

                afficherMessage(
                    "Connexion réussie. Ouverture de votre espace...",
                    "success"
                );


                /*--------------------------------------
                  REDIRECTION
                --------------------------------------*/

                setTimeout(
                    () => {

                        /*
                          Tous les membres arrivent
                          d'abord dans l'espace membre.

                          Le bureau autorisé est conservé
                          dans la session.
                        */

                        window.location.href =
                            "espace.html";

                    },
                    700
                );

            }
            catch (erreur) {

                console.error(
                    "Erreur de connexion :",
                    erreur
                );


                definirEtatConnexion(false);


                afficherMessage(
                    "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
                    "error"
                );

            }

        }
    );

}


/*==================================================
  PROTECTION CONTRE UN DOUBLE CLIC
==================================================*/

if (connexionForm) {

    connexionForm.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                boutonConnexion &&
                boutonConnexion.disabled
            ) {

                event.preventDefault();

            }

        }
    );

}


/*==================================================
  FIN CONNEXION.JS
==================================================*/

console.log(
    "MWANA MBOKA - connexion.js chargé."
);

console.log(
    "Session : 10 minutes d'inactivité."
);

console.log(
    "Durée maximale : 8 heures."
);
