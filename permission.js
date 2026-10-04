/*==================================================
  PERMISSIONS.JS
  COMMUNAUTE NUMERIQUE MWANA MBOKA
  GESTION SECURISEE DE SESSION
==================================================*/


//=========================================
// PARAMETRES DE SESSION
//=========================================

const DUREE_INACTIVITE =
    10 * 60 * 1000; // 10 minutes


const DUREE_MAX_SESSION =
    8 * 60 * 60 * 1000; // 8 heures


//=========================================
// UTILISATEUR CONNECTE
//=========================================

const donneesUtilisateur =
    localStorage.getItem(
        "utilisateurConnecte"
    );


//=========================================
// VERIFICATION DES DONNEES
//=========================================

let utilisateur = null;

try {

    utilisateur =
        donneesUtilisateur
            ? JSON.parse(donneesUtilisateur)
            : null;

}
catch (erreur) {

    console.error(
        "Session utilisateur corrompue :",
        erreur
    );

    utilisateur = null;

}


//=========================================
// FONCTION DE REDIRECTION
//=========================================

function redirigerConnexion() {

    window.location.replace(
        "connexion.html"
    );

}


//=========================================
// VERIFICATION DE L'EXISTENCE DE SESSION
//=========================================

if (!utilisateur) {

    redirigerConnexion();

    throw new Error(
        "Aucune session membre active."
    );

}


//=========================================
// HORODATAGES DE SESSION
//=========================================

const sessionDebut =
    Number(
        localStorage.getItem(
            "sessionDebut"
        )
    ) || 0;


const derniereActivite =
    Number(
        localStorage.getItem(
            "derniereActivite"
        )
    ) || 0;


const expirationSession =
    Number(
        localStorage.getItem(
            "expirationSession"
        )
    ) || 0;


//=========================================
// VERIFICATION IMMEDIATE
//=========================================

const maintenant =
    Date.now();


const sessionInvalide =

    !sessionDebut ||

    !derniereActivite ||

    !expirationSession ||

    (
        maintenant -
        derniereActivite
        >=
        DUREE_INACTIVITE
    ) ||

    (
        maintenant >=
        expirationSession
    );


if (sessionInvalide) {

    localStorage.setItem(
        "sessionExpiree",
        "true"
    );

    redirigerConnexion();

    throw new Error(
        "Session expirée."
    );

      }

//=========================================
// ACTIVITE UTILISATEUR
//=========================================

let dernierEnregistrementActivite = 0;


function enregistrerActivite() {

    const maintenant =
        Date.now();


    /*
      Evite d'écrire dans localStorage
      à chaque mouvement de souris.
    */

    if (
        maintenant -
        dernierEnregistrementActivite
        < 1000
    ) {

        return;

    }


    dernierEnregistrementActivite =
        maintenant;


    localStorage.setItem(
        "derniereActivite",
        String(maintenant)
    );

}


//=========================================
// EVENEMENTS CONSIDERES COMME ACTIVITE
//=========================================

const evenementsActivite = [

    "click",
    "keydown",
    "touchstart",
    "mousemove",
    "scroll"

];


evenementsActivite.forEach(
    (evenement) => {

        document.addEventListener(
            evenement,
            enregistrerActivite,
            {
                passive: true
            }
        );

    }
);


//=========================================
// VERIFICATION PERIODIQUE DE LA SESSION
//=========================================

const verifierSession =
    () => {

        const maintenant =
            Date.now();


        const derniereActiviteActuelle =
            Number(
                localStorage.getItem(
                    "derniereActivite"
                )
            ) || 0;


        const expirationActuelle =
            Number(
                localStorage.getItem(
                    "expirationSession"
                )
            ) || 0;


        /*
          Vérification de l'inactivité.
        */

        if (
            !derniereActiviteActuelle ||
            (
                maintenant -
                derniereActiviteActuelle
                >=
                DUREE_INACTIVITE
            )
        ) {

            localStorage.setItem(
                "sessionExpiree",
                "true"
            );

            deconnexion(
                "inactivite"
            );

            return;

        }


        /*
          Vérification de la durée maximale.
        */

        if (
            !expirationActuelle ||
            maintenant >= expirationActuelle
        ) {

            localStorage.setItem(
                "sessionExpiree",
                "true"
            );

            deconnexion(
                "duree_maximale"
            );

            return;

        }

    };


//=========================================
// CONTROLE TOUTES LES 10 SECONDES
//=========================================

const intervalleSession =
    setInterval(
        verifierSession,
        10000
    );


//=========================================
// VERIFICATION AU RETOUR SUR LA PAGE
//=========================================

window.addEventListener(
    "focus",
    verifierSession
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            verifierSession();

        }

    }
);

//=========================================
// VARIABLES EXPORTEES
//=========================================

export const fonction =
    String(
        utilisateur.fonction ||
        "membre"
    )
    .toLowerCase()
    .trim();


export const bureau =
    utilisateur.bureau ||
    "";


export const matricule =
    utilisateur.matricule ||
    "";


export const nom =
    utilisateur.nom ||
    "";


//=========================================
// AUTORISATION
//=========================================

export function autoriser(
    liste = []
) {

    /*
      Le président possède toutes
      les autorisations.
    */

    if (
        fonction === "president"
    ) {

        return true;

    }


    /*
      Vérification du domaine autorisé.
    */

    if (
        liste.includes(
            fonction
        )
    ) {

        return true;

    }


    /*
      Accès refusé.
    */

    document.body.innerHTML = `

        <div
            style="
                min-height:100vh;
                display:flex;
                justify-content:center;
                align-items:center;
                background:#111;
                color:white;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:30px;
            "
        >

            <div>

                <h1
                    style="
                        color:#d4af37;
                        margin-bottom:15px;
                    "
                >
                    Accès refusé
                </h1>


                <p>
                    Vous n'avez pas les
                    autorisations nécessaires.
                </p>


                <br>


                <a
                    href="espace.html"
                    style="
                        display:inline-block;
                        background:#009245;
                        padding:15px 25px;
                        color:white;
                        text-decoration:none;
                        border-radius:10px;
                        font-weight:bold;
                    "
                >
                    Retour
                </a>

            </div>

        </div>

    `;


    throw new Error(
        "Accès refusé."
    );

}


//=========================================
// DECONNEXION
//=========================================

export function deconnexion(
    raison = "manuelle"
) {

    /*
      Arrêt du contrôle automatique.
    */

    if (
        typeof intervalleSession !==
        "undefined"
    ) {

        clearInterval(
            intervalleSession
        );

    }


    /*
      Conservation éventuelle de
      l'information d'expiration.
    */

    if (
        raison === "inactivite" ||
        raison === "duree_maximale"
    ) {

        localStorage.setItem(
            "sessionExpiree",
            raison
        );

    }


    /*
      Suppression uniquement des
      données liées à la session.
    */

    const clesSession = [

        "utilisateurConnecte",

        "sessionDebut",

        "derniereActivite",

        "expirationSession",

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

            localStorage.removeItem(
                cle
            );

        }
    );


    /*
      Retour à la page de connexion.
    */

    window.location.replace(
        "connexion.html"
    );

}


//=========================================
// FIN PERMISSIONS.JS
//=========================================

console.log(
    "MWANA MBOKA - permissions.js chargé."
);

console.log(
    "Inactivité maximale : 10 minutes."
);

console.log(
    "Durée maximale de session : 8 heures."
);
