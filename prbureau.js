/*==================================================
PRBUREAU.JS
BUREAU NUMERIQUE DU PRESIDENT
COMMUNAUTE NUMERIQUE MWANA MBOKA
VERSION PREMIUM V7
REALTIME DATABASE
==================================================*/


/*==================================================
 IMPORTS
==================================================*/

import {
    autoriser,
    nom,
    matricule,
    fonction,
    bureau,
    deconnexion
} from "./permissions.js";

import {
    ecouter,
    lire,
    ajouter
} from "./firebase-service.js";


/*==================================================
 SECURITE PRESIDENTIELLE
==================================================*/

autoriser(["president"]);


/*==================================================
 CONFIGURATION
==================================================*/

const APP = {

    nom:
        "COMMUNAUTE NUMERIQUE MWANA MBOKA",

    version:
        "Premium V7",

    stockage:
        "Firebase Realtime Database",

    espaceMembre:
        "espace.html",

    connexion:
        "connexion.html"

};


/*==================================================
 CACHE
==================================================*/

const cache = {

    membres: {},

    organigramme: {},

    nominations: {},

    journal: {}

};


/*==================================================
 ELEMENTS HTML
==================================================*/

const ui = {

    date:
        document.getElementById("date"),

    heure:
        document.getElementById("heure"),

    annee:
        document.getElementById("annee"),

    menu:
        document.getElementById("mobileMenuBtn"),

    sidebar:
        document.getElementById("presidentSidebar"),

    espaceMembre:
        document.getElementById("memberSpaceBtn"),

    logout:
        document.getElementById("logoutBtn"),

    totalMembres:
        document.getElementById("totalMembres"),

    responsables:
        document.getElementById("responsablesActifs"),

    listeResponsables:
        document.getElementById("listeResponsables"),

    nominations:
        document.getElementById("nominationsAttente"),

    journal:
        document.getElementById("journalPresident"),

    systemStatus:
        document.querySelector(".system-status")

};


/*==================================================
 OUTILS GENERAUX
==================================================*/

function afficher(element, valeur) {

    if (!element) return;

    element.textContent =
        valeur ?? "";

}


function afficherHTML(element, contenu) {

    if (!element) return;

    element.innerHTML =
        contenu || "";

}


/*==================================================
 NETTOYAGE DES TEXTES FIREBASE
==================================================*/

function texte(valeur, valeurDefaut = "-") {

    if (
        valeur === null ||
        valeur === undefined ||
        valeur === ""
    ) {

        return valeurDefaut;

    }

    return String(valeur)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*==================================================
 DATE / HEURE
==================================================*/

function actualiserDateHeure() {

    const maintenant =
        new Date();


    afficher(
        ui.date,

        maintenant.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        )
    );


    afficher(
        ui.heure,

        maintenant.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        )
    );

}


function demarrerHorloge() {

    actualiserDateHeure();

    setInterval(
        actualiserDateHeure,
        1000
    );

}


/*==================================================
 ANNEE
==================================================*/

function afficherAnnee() {

    afficher(
        ui.annee,
        new Date().getFullYear()
    );

}


/*==================================================
 MENU PRESIDENT
==================================================*/

function initialiserMenu() {

    if (!ui.menu) {

        console.warn(
            "Bouton menu mobile introuvable."
        );

        return;

    }


    if (!ui.sidebar) {

        console.warn(
            "Sidebar Président introuvable."
        );

        return;

    }


    ui.menu.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            ui.sidebar.classList.toggle(
                "active"
            );

        }
    );


    const liens =
        ui.sidebar.querySelectorAll("a");


    liens.forEach(
        lien => {

            lien.addEventListener(
                "click",
                () => {

                    ui.sidebar.classList.remove(
                        "active"
                    );

                }
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !ui.sidebar.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            if (
                ui.sidebar.contains(event.target) ||
                ui.menu.contains(event.target)
            ) {

                return;

            }


            ui.sidebar.classList.remove(
                "active"
            );

        }
    );

}


/*==================================================
 ESPACE MEMBRE
==================================================*/

function initialiserEspaceMembre() {

    if (!ui.espaceMembre) {

        console.warn(
            "Bouton Espace membre introuvable."
        );

        return;

    }


    ui.espaceMembre.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            await journaliser(
                "Retour vers l'Espace membre"
            );


            window.location.href =
                APP.espaceMembre;

        }
    );

}


/*==================================================
 ETAT DU SYSTEME
==================================================*/

function afficherEtatSysteme() {

    if (!ui.systemStatus) return;


    ui.systemStatus.innerHTML = `

        <i class="fa-solid fa-circle"></i>

        <span>
            Système opérationnel
        </span>

    `;


    ui.systemStatus.classList.add(
        "status-online"
    );

 }

/*==================================================
 JOURNALISATION
==================================================*/

async function journaliser(action) {

    try {

        await ajouter(
            "journal_activites",
            {

                nom:
                    nom || "Président",

                matricule:
                    matricule || "",

                fonction:
                    fonction ||
                    "Président Fondateur",

                bureau:
                    bureau ||
                    "Présidence",

                action:
                    action,

                date:
                    new Date()
                    .toLocaleDateString(
                        "fr-FR"
                    ),

                heure:
                    new Date()
                    .toLocaleTimeString(
                        "fr-FR"
                    ),

                timestamp:
                    Date.now()

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur journalisation :",
            erreur
        );

    }

}


/*==================================================
 CHARGEMENT DES MEMBRES
==================================================*/

function chargerMembres() {

    try {

        ecouter(
            "membres",

            data => {

                cache.membres =
                    data || {};


                const total =
                    Object.keys(
                        cache.membres
                    ).length;


                afficher(
                    ui.totalMembres,
                    total
                );


                console.log(
                    "Membres chargés :",
                    total
                );

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur chargement membres :",
            erreur
        );


        afficher(
            ui.totalMembres,
            "—"
        );

    }

}


/*==================================================
 CHARGEMENT ORGANIGRAMME
==================================================*/

function chargerOrganigramme() {

    try {

        ecouter(
            "organigramme",

            data => {

                cache.organigramme =
                    data || {};


                let total =
                    0;

                let contenu =
                    "";


                parcourir(
                    cache.organigramme
                );


                /*----------------------------------
                PARCOURS RECURSIF
                ----------------------------------*/

                function parcourir(obj) {

                    if (
                        !obj ||
                        typeof obj !== "object"
                    ) {

                        return;

                    }


                    Object.keys(obj)
                    .forEach(
                        cle => {

                            const item =
                                obj[cle];


                            if (
                                !item ||
                                typeof item !== "object"
                            ) {

                                return;

                            }


                            /*
                            RESPONSABLE TROUVE
                            */

                            if (
                                item.responsableMatricule
                            ) {

                                total++;


                                contenu += `

                                <div class="responsable-item">

                                    <h3>
                                        ${texte(
                                            item.fonction ||
                                            cle,
                                            "Fonction"
                                        )}
                                    </h3>

                                    <p>
                                        <b>Nom :</b>
                                        ${texte(
                                            item.nom
                                        )}
                                    </p>

                                    <p>
                                        <b>Matricule :</b>
                                        ${texte(
                                            item.responsableMatricule
                                        )}
                                    </p>

                                    <p>
                                        <b>Domaine :</b>
                                        ${texte(
                                            item.domaine
                                        )}
                                    </p>

                                </div>

                                `;

                            }


                            /*
                            CONTINUER LE PARCOURS
                            */

                            parcourir(item);

                        }
                    );

                }


                afficher(
                    ui.responsables,
                    total
                );


                afficherHTML(

                    ui.listeResponsables,

                    contenu ||

                    `
                    <div class="dynamic-content">

                        <p>
                            Aucun responsable nommé
                            actuellement.
                        </p>

                    </div>
                    `

                );


                console.log(
                    "Responsables actifs :",
                    total
                );

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur organigramme :",
            erreur
        );

    }

}


/*==================================================
 NOMINATIONS EN ATTENTE
==================================================*/

function chargerNominations() {

    try {

        ecouter(
            "nominations_attente",

            data => {

                cache.nominations =
                    data || {};


                let contenu =
                    "";


                const liste =
                    Object.values(
                        cache.nominations
                    );


                liste.forEach(
                    item => {

                        contenu += `

                        <div class="nomination-item">

                            <h3>
                                ${texte(
                                    item.poste,
                                    "Poste"
                                )}
                            </h3>

                            <p>
                                ${texte(
                                    item.nom
                                )}
                            </p>

                            <p>
                                Matricule :
                                ${texte(
                                    item.matricule
                                )}
                            </p>

                            <p
                                style="
                                color:orange;
                                font-weight:bold;
                                "
                            >
                                En attente
                            </p>

                        </div>

                        `;

                    }
                );


                afficherHTML(

                    ui.nominations,

                    contenu ||

                    `
                    <div class="dynamic-content">

                        <p>
                            Aucune nomination
                            en attente.
                        </p>

                    </div>
                    `

                );


                console.log(
                    "Nominations en attente :",
                    liste.length
                );

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur nominations :",
            erreur
        );

    }

}


/*==================================================
 JOURNAL PRESIDENTIEL
==================================================*/

function chargerJournal() {

    try {

        ecouter(
            "journal_activites",

            data => {

                cache.journal =
                    data || {};


                const liste =

                    Object.values(
                        cache.journal
                    )

                    .sort(
                        (a, b) =>

                            (b.timestamp || 0)

                            -

                            (a.timestamp || 0)
                    )

                    .slice(
                        0,
                        20
                    );


                let contenu =
                    "";


                liste.forEach(
                    item => {

                        contenu += `

                        <div class="journal-item">

                            <i
                                class="
                                fa-solid
                                fa-clock
                                "
                            ></i>

                            <div>

                                <strong>
                                    ${texte(
                                        item.action,
                                        "Activité"
                                    )}
                                </strong>

                                <span>
                                    ${texte(
                                        item.nom,
                                        ""
                                    )}
                                </span>

                                <span>
                                    ${texte(
                                        item.fonction,
                                        ""
                                    )}
                                </span>

                                <span>

                                    ${texte(
                                        item.date,
                                        ""
                                    )}

                                    ${texte(
                                        item.heure,
                                        ""
                                    )}

                                </span>

                            </div>

                        </div>

                        `;

                    }
                );


                afficherHTML(

                    ui.journal,

                    contenu ||

                    `
                    <div class="dynamic-content">

                        <p>
                            Aucune activité
                            enregistrée.
                        </p>

                    </div>
                    `

                );

            }
        );

    }

    catch (erreur) {

        console.error(
            "Erreur journal :",
            erreur
        );

    }

}



/*==================================================
 DECONNEXION
==================================================*/

function initialiserDeconnexion() {

    if (!ui.logout) {

        console.warn(
            "Bouton déconnexion introuvable."
        );

        return;

    }


    ui.logout.addEventListener(
        "click",

        async event => {

            event.preventDefault();


            /*
            Empêcher plusieurs clics
            */

            if (
                ui.logout.dataset.loading ===
                "true"
            ) {

                return;

            }


            ui.logout.dataset.loading =
                "true";


            const confirmer =
                confirm(
                    "Voulez-vous vous déconnecter du Bureau Président ?"
                );


            if (!confirmer) {

                ui.logout.dataset.loading =
                    "false";

                return;

            }


            try {

                /*
                Enregistrer l'action
                */

                await journaliser(
                    "Déconnexion du Bureau Président"
                );

            }

            catch (erreur) {

                console.error(
                    "Erreur journal déconnexion :",
                    erreur
                );

            }


            try {

                /*
                Déconnexion Firebase
                */

                await deconnexion();

            }

            catch (erreur) {

                console.error(
                    "Erreur déconnexion :",
                    erreur
                );

            }


            /*
            Nettoyage de la session locale
            */

            localStorage.removeItem(
                "utilisateurConnecte"
            );

            localStorage.removeItem(
                "bureauUtilisateur"
            );


            /*
            Retour à la connexion
            */

            window.location.replace(
                APP.connexion
            );

        }
    );

}


/*==================================================
 SURVEILLANCE DE SESSION
==================================================*/

function surveillerSession() {

    setInterval(

        () => {

            const session =
                localStorage.getItem(
                    "utilisateurConnecte"
                );


            /*
            Si la session n'existe plus,
            retour automatique à connexion.html
            */

            if (!session) {

                window.location.replace(
                    APP.connexion
                );

            }

        },

        5000

    );

}


/*==================================================
 VERIFICATION DE L'INTERFACE
==================================================*/

function verifierInterface() {

    const elements = {

        date:
            ui.date,

        heure:
            ui.heure,

        annee:
            ui.annee,

        menu:
            ui.menu,

        sidebar:
            ui.sidebar,

        espaceMembre:
            ui.espaceMembre,

        logout:
            ui.logout,

        totalMembres:
            ui.totalMembres,

        responsables:
            ui.responsables,

        nominations:
            ui.nominations,

        journal:
            ui.journal

    };


    Object.entries(elements)
    .forEach(

        ([nomElement, element]) => {

            if (!element) {

                console.warn(
                    "Element HTML absent :",
                    nomElement
                );

            }

        }

    );

}


/*==================================================
 INITIALISATION GENERALE
==================================================*/

async function initialiser() {

    console.log(
        "======================================"
    );

    console.log(
        APP.nom
    );

    console.log(
        "Version :",
        APP.version
    );

    console.log(
        "Stockage :",
        APP.stockage
    );

    console.log(
        "Président :",
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
        "======================================"
    );


    /*----------------------------------------------
    VERIFICATION HTML
    ----------------------------------------------*/

    verifierInterface();


    /*----------------------------------------------
    INTERFACE
    ----------------------------------------------*/

    afficherAnnee();

    demarrerHorloge();

    initialiserMenu();

    initialiserEspaceMembre();

    afficherEtatSysteme();

    initialiserDeconnexion();


    /*----------------------------------------------
    FIREBASE REALTIME DATABASE
    ----------------------------------------------*/

    chargerMembres();

    chargerOrganigramme();

    chargerNominations();

    chargerJournal();


    /*----------------------------------------------
    SURVEILLANCE SESSION
    ----------------------------------------------*/

    surveillerSession();


    /*----------------------------------------------
    JOURNAL D'OUVERTURE
    ----------------------------------------------*/

    await journaliser(
        "Ouverture du Bureau Numérique du Président"
    );


    console.log(
        "Bureau Président initialisé avec succès."
    );

}


/*==================================================
 DEMARRAGE
==================================================*/

initialiser();
