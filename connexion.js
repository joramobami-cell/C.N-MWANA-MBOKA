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

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);


/*==================================================
  PARAMETRES DE SESSION
==================================================*/

const DUREE_INACTIVITE =
    10 * 60 * 1000;

const DUREE_MAX_SESSION =
    8 * 60 * 60 * 1000;


/*==================================================
  ELEMENTS HTML
==================================================*/

const connexionForm =
    document.getElementById(
        "connexionForm"
    );

const matriculeInput =
    document.getElementById(
        "matricule"
    );

const motdepasseInput =
    document.getElementById(
        "motdepasse"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const boutonConnexion =
    document.getElementById(
        "boutonConnexion"
    );

const message =
    document.getElementById(
        "message"
    );

const annee =
    document.getElementById(
        "annee"
    );


/*==================================================
  ANNEE AUTOMATIQUE
==================================================*/

if (annee) {

    annee.textContent =
        new Date().getFullYear();

}


/*==================================================
  MESSAGE
==================================================*/

function afficherMessage(
    texte,
    type = "normal"
) {

    if (!message) {
        return;
    }

    message.textContent =
        texte;

    message.className =
        "message " + type;

}


/*==================================================
  MOT DE PASSE
==================================================*/

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const estCache =
                motdepasseInput.type ===
                "password";

            motdepasseInput.type =
                estCache
                    ? "text"
                    : "password";

            const icone =
                togglePassword.querySelector(
                    "i"
                );

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
  NETTOYAGE SESSION
==================================================*/

function nettoyerAncienneSession() {

    const cles = [

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
        "domaine",
        "poste",
        "bureau"

    ];


    cles.forEach(
        (cle) => {

            localStorage.removeItem(
                cle
            );

        }
    );

}


/*==================================================
  OUTIL : PREMIERE VALEUR DISPONIBLE
==================================================*/

function valeurMembre(
    membre,
    cles,
    valeurDefaut = ""
) {

    for (
        const cle of cles
    ) {

        if (
            membre &&
            membre[cle] !== undefined &&
            membre[cle] !== null &&
            String(
                membre[cle]
            ).trim() !== ""
        ) {

            return membre[cle];

        }

    }

    return valeurDefaut;

}


/*==================================================
  CREATION SESSION
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


    /*----------------------------------------------
      NORMALISATION DES INFORMATIONS
    ----------------------------------------------*/

    const id =
        valeurMembre(
            membre,
            [
                "id",
                "membreId",
                "uid"
            ],
            ""
        );


    const nom =
        valeurMembre(
            membre,
            [
                "nom",
                "nomComplet",
                "nom_complet",
                "nomcomplet",
                "fullName",
                "fullname"
            ],
            ""
        );


    const matricule =
        valeurMembre(
            membre,
            [
                "matricule"
            ],
            ""
        );


    const telephone =
        valeurMembre(
            membre,
            [
                "telephone",
                "téléphone",
                "phone",
                "numero",
                "numeroTelephone"
            ],
            ""
        );


    const photo =
        valeurMembre(
            membre,
            [
                "photo",
                "photoUrl",
                "photoURL",
                "image",
                "avatar"
            ],
            ""
        );


    const statut =
        valeurMembre(
            membre,
            [
                "statut",
                "status"
            ],
            "Actif"
        );


    const dateAdhesion =
        valeurMembre(
            membre,
            [
                "dateAdhesion",
                "date_adhesion",
                "dateInscription"
            ],
            ""
        );


    const parrain =
        valeurMembre(
            membre,
            [
                "parrain",
                "codeParrain",
                "matriculeParrain",
                "parrainMatricule"
            ],
            ""
        );


    const role =
        valeurMembre(
            membre,
            [
                "role"
            ],
            "membre"
        );


    /*----------------------------------------------
      OBJET SESSION
    ----------------------------------------------*/

    const utilisateur = {

        id:
            id,

        nom:
            nom,

        matricule:
            matricule,

        telephone:
            telephone,

        photo:
            photo,

        statut:
            statut,

        dateAdhesion:
            dateAdhesion,

        parrain:
            parrain,

        role:
            role,

        fonction:
            informationsBureau.fonction ||
            "",

        domaine:
            informationsBureau.domaine ||
            "",

        poste:
            informationsBureau.poste ||
            "",

        bureau:
            informationsBureau.bureau ||
            "espace.html",

        sessionDebut:
            maintenant,

        derniereActivite:
            maintenant,

        expirationSession:
            expirationAbsolue

    };


    localStorage.setItem(
        "utilisateurConnecte",
        JSON.stringify(
            utilisateur
        )
    );


    /*----------------------------------------------
      COMPATIBILITE ANCIENNES PAGES
    ----------------------------------------------*/

    localStorage.setItem(
        "membreId",
        String(id)
    );

    localStorage.setItem(
        "nom",
        String(nom)
    );

    localStorage.setItem(
        "matricule",
        String(matricule)
    );

    localStorage.setItem(
        "telephone",
        String(telephone)
    );

    localStorage.setItem(
        "statut",
        String(statut)
    );

    localStorage.setItem(
        "dateAdhesion",
        String(dateAdhesion)
    );

    localStorage.setItem(
        "parrain",
        String(parrain)
    );

    localStorage.setItem(
        "photo",
        String(photo)
    );

    localStorage.setItem(
        "role",
        String(role)
    );

    localStorage.setItem(
        "fonction",
        String(
            informationsBureau.fonction ||
            ""
        )
    );

    localStorage.setItem(
        "domaine",
        String(
            informationsBureau.domaine ||
            ""
        )
    );

    localStorage.setItem(
        "poste",
        String(
            informationsBureau.poste ||
            ""
        )
    );

    localStorage.setItem(
        "bureau",
        String(
            informationsBureau.bureau ||
            "espace.html"
        )
    );


    /*----------------------------------------------
      HORODATAGE
    ----------------------------------------------*/

    localStorage.setItem(
        "sessionDebut",
        String(maintenant)
    );

    localStorage.setItem(
        "derniereActivite",
        String(maintenant)
    );

    localStorage.setItem(
        "expirationSession",
        String(expirationAbsolue)
    );

    localStorage.removeItem(
        "sessionExpiree"
    );


    console.log(
        "SESSION CRÉÉE :",
        utilisateur
    );

  }

/*==================================================
  RECHERCHE FONCTION ORGANIGRAMME
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


        /*------------------------------------------
          RESPONSABLE TROUVE
        ------------------------------------------*/

        if (
            element.responsableMatricule &&
            String(
                element.responsableMatricule
            )
            .trim()
            .toUpperCase() ===
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


        /*------------------------------------------
          RECHERCHE RECURSIVE
        ------------------------------------------*/

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


    /*------------------------------------------
      PRESIDENT
    ------------------------------------------*/

    if (
        fonctionNormalisee.includes(
            "president"
        )
    ) {

        return "prbureau.html";

    }


    /*------------------------------------------
      SECRETARIAT / ADMINISTRATION
    ------------------------------------------*/

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


    /*------------------------------------------
      FORMATION
    ------------------------------------------*/

    if (
        fonctionNormalisee.includes(
            "formation"
        )
    ) {

        return "bureau-formation.html";

    }


    /*------------------------------------------
      COMMUNICATION
    ------------------------------------------*/

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


    /*------------------------------------------
      PROJETS
    ------------------------------------------*/

    if (
        fonctionNormalisee.includes(
            "projet"
        )
    ) {

        return "bureau-projets.html";

    }


    /*------------------------------------------
      CONSEIL ADMINISTRATIF
    ------------------------------------------*/

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


    /*------------------------------------------
      FINANCES / ECONOMIE
    ------------------------------------------*/

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


    /*------------------------------------------
      MEMBRE ORDINAIRE
    ------------------------------------------*/

    return "espace.html";

}


/*==================================================
  JOURNALISATION DE LA CONNEXION
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
            push(
                journalRef
            );


        await set(
            nouvelleActivite,
            {

                type:
                    "connexion",

                matricule:
                    membre.matricule ||
                    "",

                nom:
                    membre.nom ||
                    membre.nomComplet ||
                    "",

                date:
                    new Date()
                    .toISOString(),

                timestamp:
                    Date.now()

            }
        );

    }
    catch (erreur) {

        /*
          Le journal ne doit pas
          empêcher la connexion.
        */

        console.warn(
            "Journalisation impossible :",
            erreur
        );

    }

}


/*==================================================
  ETAT DU BOUTON CONNEXION
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
  FORMULAIRE DE CONNEXION
==================================================*/

if (connexionForm) {

    connexionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*--------------------------------------
              DONNEES SAISIES
            --------------------------------------*/

            const matriculeSaisi =
                matriculeInput.value
                    .trim()
                    .toUpperCase();


            const motdepasseSaisi =
                motdepasseInput.value;


            /*--------------------------------------
              VERIFICATION MATRICULE
            --------------------------------------*/

            if (!matriculeSaisi) {

                afficherMessage(
                    "Veuillez saisir votre matricule.",
                    "error"
                );

                matriculeInput.focus();

                return;

            }


            /*--------------------------------------
              VERIFICATION MOT DE PASSE
            --------------------------------------*/

            if (!motdepasseSaisi) {

                afficherMessage(
                    "Veuillez saisir votre mot de passe.",
                    "error"
                );

                motdepasseInput.focus();

                return;

            }


            /*--------------------------------------
              CHARGEMENT
            --------------------------------------*/

            definirEtatConnexion(
                true
            );


            afficherMessage(
                "Vérification de vos informations...",
                "normal"
            );


            try {

                /*==================================
                  RECHERCHE DU MEMBRE
                ==================================*/

                const membreRef =
                    ref(
                        database,
                        "membres/" +
                        matriculeSaisi
                    );


                const snapshot =
                    await get(
                        membreRef
                    );


                /*----------------------------------
                  MEMBRE INTROUVABLE
                ----------------------------------*/

                if (!snapshot.exists()) {

                    definirEtatConnexion(
                        false
                    );


                    afficherMessage(
                        "Matricule ou mot de passe incorrect.",
                        "error"
                    );


                    return;

                }


                /*----------------------------------
                  DONNEES MEMBRE
                ----------------------------------*/

                const membre =
                    snapshot.val();


                /*----------------------------------
                  MATRICULE NORMALISE
                ----------------------------------*/

                membre.matricule =
                    membre.matricule ||
                    matriculeSaisi;


                /*==================================
                  VERIFICATION MOT DE PASSE
                ==================================*/

                const motdepasseEnregistre =
                    String(
                        membre.motdepasse ||
                        membre.password ||
                        ""
                    );


                if (
                    motdepasseEnregistre !==
                    String(
                        motdepasseSaisi
                    )
                ) {

                    definirEtatConnexion(
                        false
                    );


                    afficherMessage(
                        "Matricule ou mot de passe incorrect.",
                        "error"
                    );


                    return;

                }


                /*==================================
                  VERIFICATION STATUT
                ==================================*/

                const statut =
                    String(
                        membre.statut ||
                        "Actif"
                    )
                    .toLowerCase()
                    .trim();


                const statutsBloques = [

                    "bloque",
                    "bloqué",

                    "suspendu",
                    "suspendue",

                    "inactif",
                    "inactive",

                    "radie",
                    "radié",
                    "radiee",
                    "radiée"

                ];


                if (
                    statutsBloques.includes(
                        statut
                    )
                ) {

                    definirEtatConnexion(
                        false
                    );


                    afficherMessage(
                        "Votre compte est actuellement suspendu ou désactivé. Veuillez contacter l'administration.",
                        "error"
                    );


                    return;

                }


                /*==================================
                  RECHERCHE ORGANIGRAMME
                ==================================*/

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
                                matriculeSaisi
                            );


                        if (resultat) {

                            informationsFonction =
                                resultat;

                        }

                    }

                }
                catch (
                    erreurOrganigramme
                ) {

                    console.warn(
                        "Organigramme inaccessible :",
                        erreurOrganigramme
                    );

                }


                /*==================================
                  FIN PARTIE 2
                ==================================*/

                          /*==================================
                  RECONNAISSANCE DU PRESIDENT
                ==================================*/

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

                    roleNormalise ===
                    "president"

                    ||

                    roleNormalise.includes(
                        "president fondateur"
                    )

                    ||

                    membre.fondateur === true;


                if (estPresident) {

                    informationsFonction.fonction =
                        "president";


                    informationsFonction.domaine =
                        "Présidence";


                    informationsFonction.poste =
                        "Président Fondateur";

                }


                /*==================================
                  DETERMINATION DU BUREAU
                ==================================*/

                const bureau =
                    estPresident
                        ? "prbureau.html"
                        : determinerBureau(
                            informationsFonction.fonction
                        );


                /*==================================
                  NETTOYAGE ANCIENNE SESSION
                ==================================*/

                nettoyerAncienneSession();


                /*==================================
                  CREATION NOUVELLE SESSION
                ==================================*/

                const maintenant =
                    Date.now();


                const expiration =
                    maintenant +
                    DUREE_MAX_SESSION;


                /*
                  IMPORTANT :
                  On conserve les mêmes clés
                  utilisées par espace.js.
                */

                localStorage.setItem(
                    "membreId",
                    membre.id ||
                    membre.matricule ||
                    matriculeSaisi
                );


                localStorage.setItem(
                    "nom",
                    membre.nom ||
                    membre.nomComplet ||
                    membre.nomPrenom ||
                    "Membre"
                );


                localStorage.setItem(
                    "matricule",
                    membre.matricule ||
                    matriculeSaisi
                );


                localStorage.setItem(
                    "telephone",
                    membre.telephone ||
                    ""
                );


                localStorage.setItem(
                    "statut",
                    membre.statut ||
                    "Actif"
                );


                localStorage.setItem(
                    "parrain",
                    membre.parrain ||
                    membre.parrainMatricule ||
                    ""
                );


                localStorage.setItem(
                    "dateAdhesion",
                    membre.dateAdhesion ||
                    ""
                );


                localStorage.setItem(
                    "photo",
                    membre.photo ||
                    ""
                );


                localStorage.setItem(
                    "role",
                    membre.role ||
                    ""
                );


                localStorage.setItem(
                    "fonction",
                    informationsFonction.fonction ||
                    "membre"
                );


                localStorage.setItem(
                    "bureau",
                    bureau
                );


                /*==================================
                  SESSION PRINCIPALE
                ==================================*/

                const utilisateurConnecte = {

                    id:
                        membre.id ||
                        membre.matricule ||
                        matriculeSaisi,

                    nom:
                        membre.nom ||
                        membre.nomComplet ||
                        membre.nomPrenom ||
                        "Membre",

                    matricule:
                        membre.matricule ||
                        matriculeSaisi,

                    telephone:
                        membre.telephone ||
                        "",

                    photo:
                        membre.photo ||
                        "",

                    statut:
                        membre.statut ||
                        "Actif",

                    dateAdhesion:
                        membre.dateAdhesion ||
                        "",

                    parrain:
                        membre.parrain ||
                        membre.parrainMatricule ||
                        "",

                    role:
                        membre.role ||
                        "",

                    fonction:
                        informationsFonction.fonction ||
                        "membre",

                    domaine:
                        informationsFonction.domaine ||
                        "",

                    poste:
                        informationsFonction.poste ||
                        "",

                    bureau:
                        bureau

                };


                localStorage.setItem(
                    "utilisateurConnecte",
                    JSON.stringify(
                        utilisateurConnecte
                    )
                );


                /*==================================
                  CONTROLE SESSION
                ==================================*/

                localStorage.setItem(
                    "sessionDebut",
                    String(
                        maintenant
                    )
                );


                localStorage.setItem(
                    "derniereActivite",
                    String(
                        maintenant
                    )
                );


                localStorage.setItem(
                    "expirationSession",
                    String(
                        expiration
                    )
                );


                localStorage.removeItem(
                    "sessionExpiree"
                );


                /*==================================
                  VERIFICATION FINALE
                ==================================*/

                const sessionVerifiee =
                    localStorage.getItem(
                        "utilisateurConnecte"
                    );


                if (!sessionVerifiee) {

                    definirEtatConnexion(
                        false
                    );


                    afficherMessage(
                        "Impossible de créer la session. Veuillez réessayer.",
                        "error"
                    );


                    return;

                }


                /*==================================
                  JOURNAL DE CONNEXION
                ==================================*/

                await enregistrerConnexion(
                    membre
                );


                /*==================================
                  MESSAGE DE SUCCES
                ==================================*/

                afficherMessage(
                    "Connexion réussie. Bienvenue " +
                    (
                        membre.nom ||
                        membre.nomComplet ||
                        "Membre"
                    ) +
                    " !",
                    "success"
                );


                /*==================================
                  REDIRECTION
                ==================================*/

                definirEtatConnexion(
                    true
                );


                setTimeout(
                    () => {

                        /*
                          Tous les membres arrivent
                          dans leur espace.

                          Le bureau autorisé est
                          conservé dans la session.
                        */

                        window.location.href =
                            "espace.html";

                    },
                    700
                );

            }
            catch (erreur) {

                console.error(
                    "ERREUR CONNEXION :",
                    erreur
                );


                definirEtatConnexion(
                    false
                );


                afficherMessage(
                    "Une erreur est survenue lors de la connexion. Vérifiez votre connexion Internet puis réessayez.",
                    "error"
                );

            }

        }
    );

}


/*==================================================
  PROTECTION CONTRE LE RETOUR
==================================================*/

window.addEventListener(
    "pageshow",
    () => {

        /*
          Si une ancienne session expirée
          existe encore, elle est supprimée.
        */

        const expiration =
            Number(
                localStorage.getItem(
                    "expirationSession"
                )
            );


        if (
            expiration &&
            Date.now() >= expiration
        ) {

            nettoyerAncienneSession();

        }

    }
);


/*==================================================
  FIN CONNEXION.JS
==================================================*/

console.log(
    "CONNEXION.JS chargé - session 10 minutes d'inactivité"
);
