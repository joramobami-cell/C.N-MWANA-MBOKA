/*==================================================
PRBUREAU.JS
BUREAU NUMERIQUE DU PRESIDENT
COMMUNAUTE NUMERIQUE MWANA MBOKA
VERSION PREMIUM V6
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
 SECURITE
==================================================*/

autoriser(["president"]);


/*==================================================
 CONFIGURATION
==================================================*/

const APP = {
    nom: "COMMUNAUTE NUMERIQUE MWANA MBOKA",
    version: "Premium V6",
    stockage: "Firebase Realtime Database"
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

    logout:
        document.getElementById("logoutBtn"),

    systemStatus:
        document.querySelector(".system-status")

};


/*==================================================
 OUTILS
==================================================*/

function afficher(element, valeur) {

    if (!element) return;

    element.textContent = valeur;

}


function afficherHTML(element, contenu) {

    if (!element) return;

    element.innerHTML = contenu;

}


/*==================================================
 DATE / HEURE
==================================================*/

function actualiserDateHeure() {

    const maintenant = new Date();

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

        console.error(
            "Bouton menu introuvable."
        );

        return;

    }


    if (!ui.sidebar) {

        console.error(
            "Sidebar Président introuvable."
        );

        return;

    }


    ui.menu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            ui.sidebar.classList.toggle(
                "active"
            );

            console.log(
                "Menu Président :",
                ui.sidebar.classList.contains("active")
                    ? "OUVERT"
                    : "FERME"
            );

        }
    );


    /*
    Fermer le menu lorsqu'on clique
    sur un lien.
    */

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

}


/*==================================================
 ETAT DU SYSTEME
==================================================*/

function afficherEtatSysteme() {

    if (!ui.systemStatus) return;


    ui.systemStatus.innerHTML = `

        <i class="fa-solid fa-circle"></i>

        Système opérationnel

    `;

}


/*==================================================
 JOURNAL
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
                    fonction || "Président Fondateur",

                bureau:
                    bureau || "Présidence",

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
            "Erreur journal :",
            erreur
        );

    }

}


/*==================================================
 CHARGEMENT DES MEMBRES
==================================================*/

function chargerMembres() {

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


/*==================================================
 CHARGEMENT ORGANIGRAMME
==================================================*/

function chargerOrganigramme() {

    ecouter(
        "organigramme",
        data => {

            cache.organigramme =
                data || {};


            let total = 0;

            let contenu = "";


            parcourir(
                cache.organigramme
            );


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
                            item &&
                            typeof item === "object"
                        ) {


                            if (
                                item.responsableMatricule
                            ) {

                                total++;


                                contenu += `

                                <div class="responsable-item">

                                    <h3>
                                        ${
                                            item.fonction ||
                                            cle
                                        }
                                    </h3>

                                    <p>
                                        <b>Nom :</b>
                                        ${
                                            item.nom ||
                                            "-"
                                        }
                                    </p>

                                    <p>
                                        <b>Matricule :</b>
                                        ${
                                            item.responsableMatricule
                                        }
                                    </p>

                                    <p>
                                        <b>Domaine :</b>
                                        ${
                                            item.domaine ||
                                            "-"
                                        }
                                    </p>

                                </div>

                                `;

                            }


                            parcourir(item);

                        }

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

                "<p>Aucun responsable nommé.</p>"
            );


            console.log(
                "Responsables actifs :",
                total
            );

        }
    );

}


/*==================================================
 NOMINATIONS EN ATTENTE
==================================================*/

function chargerNominations() {

    ecouter(
        "nominations_attente",
        data => {

            cache.nominations =
                data || {};


            let contenu = "";


            Object.values(
                cache.nominations
            )
            .forEach(
                item => {

                    contenu += `

                    <div class="nomination-item">

                        <h3>
                            ${
                                item.poste ||
                                "Poste"
                            }
                        </h3>

                        <p>
                            ${
                                item.nom ||
                                "-"
                            }
                        </p>

                        <p>
                            Matricule :
                            ${
                                item.matricule ||
                                "-"
                            }
                        </p>

                        <p style="color:orange;font-weight:bold;">
                            En attente
                        </p>

                    </div>

                    `;

                }
            );


            afficherHTML(
                ui.nominations,

                contenu ||

                "<p>Aucune nomination en attente.</p>"
            );

        }
    );

}


/*==================================================
 JOURNAL PRESIDENTIEL
==================================================*/

function chargerJournal() {

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
                    (a,b) =>
                        (b.timestamp || 0)
                        -
                        (a.timestamp || 0)
                )
                .slice(0,20);


            let contenu = "";


            liste.forEach(
                item => {

                    contenu += `

                    <div class="journal-item">

                        <h4>
                            ${
                                item.action ||
                                "Activité"
                            }
                        </h4>

                        <p>
                            ${
                                item.nom ||
                                ""
                            }
                        </p>

                        <p>
                            ${
                                item.fonction ||
                                ""
                            }
                        </p>

                        <p>
                            ${
                                item.date ||
                                ""
                            }

                            ${
                                item.heure ||
                                ""
                            }
                        </p>

                    </div>

                    `;

                }
            );


            afficherHTML(
                ui.journal,

                contenu ||

                "<p>Aucune activité enregistrée.</p>"
            );

        }
    );

}


/*==================================================
 DECONNEXION
==================================================*/

function initialiserDeconnexion() {

    if (!ui.logout) return;


    ui.logout.addEventListener(
        "click",
        async () => {

            const confirmer =
                confirm(
                    "Voulez-vous vous déconnecter ?"
                );


            if (!confirmer) return;


            await journaliser(
                "Déconnexion du Bureau Président"
            );


            deconnexion();

        }
    );

}


/*==================================================
 SURVEILLANCE SESSION
==================================================*/

function surveillerSession() {

    setInterval(
        () => {

            const session =
                localStorage.getItem(
                    "utilisateurConnecte"
                );


            if (!session) {

                window.location.replace(
                    "connexion.html"
                );

            }

        },
        5000
    );

}


/*==================================================
 INITIALISATION GENERALE
==================================================*/

async function initialiser() {

    console.log(
        "===================================="
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
        "===================================="
    );


    /*
    Interface
    */

    afficherAnnee();

    demarrerHorloge();

    initialiserMenu();

    afficherEtatSysteme();

    initialiserDeconnexion();


    /*
    Firebase Realtime Database
    */

    chargerMembres();

    chargerOrganigramme();

    chargerNominations();

    chargerJournal();


    /*
    Surveillance
    */

    surveillerSession();


    /*
    Journal
    */

    await journaliser(
        "Ouverture du Bureau Numérique du Président"
    );


    console.log(
        "Bureau Président initialisé."
    );

}


/*==================================================
 DEMARRAGE
==================================================*/

initialiser();
