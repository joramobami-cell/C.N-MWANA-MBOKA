/*==================================================
  PERMISSIONS.JS
  COMMUNAUTE NUMERIQUE MWANA MBOKA
  VERSION PREMIUM SECURISEE
==================================================*/


//==================================================
// DUREE DE SESSION
//==================================================

// 10 minutes sans activité
const DUREE_INACTIVITE =
    10 * 60 * 1000;


// 8 heures maximum
const DUREE_MAX_SESSION =
    8 * 60 * 60 * 1000;


//==================================================
// RECUPERATION DE LA SESSION
//==================================================

const sessionStockee =
    localStorage.getItem(
        "utilisateurConnecte"
    );


//==================================================
// UTILISATEUR
//==================================================

export let utilisateur = null;


//==================================================
// LECTURE SECURISEE DE LA SESSION
//==================================================

try {

    utilisateur =
        sessionStockee
            ? JSON.parse(sessionStockee)
            : null;

}
catch (erreur) {

    console.error(
        "Session utilisateur corrompue :",
        erreur
    );

    utilisateur = null;

}


//==================================================
// FONCTION RETOUR CONNEXION
//==================================================

function redirigerConnexion() {

    window.location.replace(
        "connexion.html"
    );

}


//==================================================
// VERIFICATION SESSION EXISTANTE
//==================================================

if (!utilisateur) {

    localStorage.setItem(
        "sessionExpiree",
        "session_invalide"
    );

    redirigerConnexion();

}


//==================================================
// INFORMATIONS UTILISATEUR
//==================================================

export const matricule =
    utilisateur?.matricule || "";


export const nom =
    utilisateur?.nom || "";


export const fonction =
    String(
        utilisateur?.fonction ||
        "membre"
    )
    .toLowerCase()
    .trim();


export const bureau =
    utilisateur?.bureau || "";


//==================================================
// ROLE
//==================================================

export const role =
    String(
        utilisateur?.role ||
        ""
    )
    .toLowerCase()
    .trim();


//==================================================
// PRESIDENT
//==================================================

export const estPresident =

    fonction === "president" ||

    fonction === "président" ||

    role === "president" ||

    role === "président";


//==================================================
// SESSION : DONNEES TEMPORELLES
//==================================================

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


//==================================================
// VERIFICATION INITIALE DE LA SESSION
//==================================================

const maintenant =
    Date.now();


const sessionInvalide =

    !sessionDebut ||

    !derniereActivite ||

    !expirationSession ||

    (
        maintenant -
        derniereActivite >=
        DUREE_INACTIVITE
    ) ||

    (
        maintenant >=
        expirationSession
    );


//==================================================
// SESSION EXPIREE
//==================================================

if (sessionInvalide) {

    localStorage.setItem(
        "sessionExpiree",
        "true"
    );

    redirigerConnexion();

}


//==================================================
// DERNIERE ACTIVITE ENREGISTREE
//==================================================

let dernierEnregistrementActivite = 0;


//==================================================
// ENREGISTRER L'ACTIVITE
//==================================================

function enregistrerActivite() {

    const maintenant =
        Date.now();


    // Evite d'écrire trop souvent
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


    // Mise à jour également
    // dans l'objet utilisateur

    if (utilisateur) {

        utilisateur.derniereActivite =
            maintenant;


        localStorage.setItem(
            "utilisateurConnecte",
            JSON.stringify(
                utilisateur
            )
        );

    }

}


//==================================================
// EVENEMENTS D'ACTIVITE
//==================================================

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


//==================================================
// VERIFICATION AUTOMATIQUE
//==================================================

function verifierSession() {

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


    //==========================================
    // INACTIVITE
    //==========================================

    if (

        !derniereActiviteActuelle ||

        (
            maintenant -
            derniereActiviteActuelle >=
            DUREE_INACTIVITE
        )

    ) {

        localStorage.setItem(
            "sessionExpiree",
            "inactivite"
        );


        deconnexion(
            "inactivite"
        );


        return;

    }


    //==========================================
    // DUREE MAXIMALE
    //==========================================

    if (

        !expirationActuelle ||

        maintenant >=
        expirationActuelle

    ) {

        localStorage.setItem(
            "sessionExpiree",
            "duree_maximale"
        );


        deconnexion(
            "duree_maximale"
        );


        return;

    }

}


//==================================================
// CONTROLE TOUTES LES 10 SECONDES
//==================================================

const intervalleSession =

    setInterval(
        verifierSession,
        10000
    );


//==================================================
// VERIFICATION LORSQUE LA PAGE REVIENT
//==================================================

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


//==================================================
// AUTORISER UNE OU PLUSIEURS FONCTIONS
//==================================================

export function autoriser(
    fonctionsAutorisees = []
) {

    //==========================================
    // PRESIDENT
    //==========================================

    if (estPresident) {

        return true;

    }


    //==========================================
    // FONCTION AUTORISEE
    //==========================================

    if (
        fonctionsAutorisees.includes(
            fonction
        )
    ) {

        return true;

    }


    //==========================================
    // ACCES REFUSE
    //==========================================

    document.body.innerHTML = `

        <div style="
            min-height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            background:#07130d;
            color:white;
            font-family:Arial,sans-serif;
            padding:20px;
            box-sizing:border-box;
        ">

            <div style="
                background:#101010;
                padding:40px;
                border-radius:25px;
                text-align:center;
                border:2px solid #D4AF37;
                max-width:500px;
                width:100%;
                box-sizing:border-box;
            ">

                <h1 style="
                    color:#D4AF37;
                    margin-top:0;
                ">
                    Accès refusé
                </h1>

                <p style="
                    margin:20px 0;
                    line-height:1.6;
                ">

                    Vous ne possédez pas
                    les autorisations nécessaires
                    pour accéder à ce bureau.

                </p>

                <button
                    id="btnRetour"
                    style="
                        padding:15px 30px;
                        background:#009245;
                        border:none;
                        border-radius:12px;
                        color:white;
                        font-size:16px;
                        cursor:pointer;
                    "
                >

                    Retour à l'espace membre

                </button>

            </div>

        </div>

    `;


    const btnRetour =
        document.getElementById(
            "btnRetour"
        );


    if (btnRetour) {

        btnRetour.onclick = () => {

            window.location.href =
                "espace.html";

        };

    }


    throw new Error(
        "Accès refusé."
    );

}


//==================================================
// TEST D'UNE FONCTION
//==================================================

export function possedeFonction(
    f
) {

    if (!f) {

        return false;

    }


    return (

        fonction ===

        String(f)
            .toLowerCase()
            .trim()

    );

}


//==================================================
// TEST DE PLUSIEURS FONCTIONS
//==================================================

export function possedeUneFonction(
    liste = []
) {

    if (!Array.isArray(liste)) {

        return false;

    }


    return liste.some(
        (f) => {

            return (

                fonction ===

                String(f)
                    .toLowerCase()
                    .trim()

            );

        }
    );

}


//==================================================
// DECONNEXION
//==================================================

export function deconnexion(
    raison = "manuelle"
) {


    //==========================================
    // ARRET DU CONTROLE
    //==========================================

    clearInterval(
        intervalleSession
    );


    //==========================================
    // MEMORISER LA RAISON
    //==========================================

    if (
        raison === "inactivite"
    ) {

        localStorage.setItem(
            "sessionExpiree",
            "inactivite"
        );

    }


    if (
        raison === "duree_maximale"
    ) {

        localStorage.setItem(
            "sessionExpiree",
            "duree_maximale"
        );

    }


    if (
        raison === "session_invalide"
    ) {

        localStorage.setItem(
            "sessionExpiree",
            "session_invalide"
        );

    }


    //==========================================
    // DONNEES DE SESSION A SUPPRIMER
    //==========================================

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

        "domaine",

        "poste",

        "bureau"

    ];


    //==========================================
    // SUPPRESSION
    //==========================================

    clesSession.forEach(
        (cle) => {

            localStorage.removeItem(
                cle
            );

        }
    );


    //==========================================
    // RETOUR CONNEXION
    //==========================================

    window.location.replace(
        "connexion.html"
    );

}


//==================================================
// INFORMATIONS CONSOLE
//==================================================

console.log(
    "===================================="
);

console.log(
    "MWANA MBOKA - PERMISSIONS.JS"
);

console.log(
    "Utilisateur :",
    nom
);

console.log(
    "Matricule :",
    matricule
);

console.log(
    "Fonction :",
    fonction
);

console.log(
    "Bureau :",
    bureau
);

console.log(
    "Président :",
    estPresident
);

console.log(
    "Session : 10 minutes d'inactivité"
);

console.log(
    "Session maximale : 8 heures"
);

console.log(
    "===================================="
);
