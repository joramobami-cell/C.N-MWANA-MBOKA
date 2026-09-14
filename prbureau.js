/*==================================================
 PRBUREAU.JS
 BUREAU NUMERIQUE DU PRESIDENT
 MWANA MBOKA
 VERSION V8 STABLE
==================================================*/

"use strict";

/*==================================================
 CONFIGURATION
==================================================*/

const APP = {
    espaceMembre: "espace.html",
    connexion: "connexion.html"
};

let permissions = null;
let firebaseService = null;


/*==================================================
 ELEMENTS
==================================================*/

const ui = {};

function chargerElements() {

    ui.date =
        document.getElementById("date");

    ui.heure =
        document.getElementById("heure");

    ui.annee =
        document.getElementById("annee");

    ui.menu =
        document.getElementById("mobileMenuBtn");

    ui.sidebar =
        document.getElementById("presidentSidebar") ||
        document.querySelector(".sidebar");

    ui.espace =
        document.getElementById("memberSpaceBtn");

    ui.logout =
        document.getElementById("logoutBtn");

    ui.system =
        document.querySelector(".system-status");

    ui.totalMembres =
        document.getElementById("totalMembres");

    ui.responsables =
        document.getElementById("responsablesActifs");

    ui.nominations =
        document.getElementById("nominationsAttente");

    ui.listeResponsables =
        document.getElementById("listeResponsables");

    ui.journal =
        document.getElementById("journalPresident");
}


/*==================================================
 DATE / HEURE
==================================================*/

function actualiserDateHeure() {

    const maintenant = new Date();

    if (ui.date) {

        ui.date.textContent =
            maintenant.toLocaleDateString(
                "fr-FR",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }

    if (ui.heure) {

        ui.heure.textContent =
            maintenant.toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );
    }
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

    if (ui.annee) {

        ui.annee.textContent =
            new Date().getFullYear();
    }
}


/*==================================================
 SYSTEME
==================================================*/

function systemeOperationnel() {

    if (!ui.system) return;

    ui.system.innerHTML = `
        <i class="fa-solid fa-circle"></i>
        <span>Système opérationnel</span>
    `;

    ui.system.classList.remove(
        "status-warning",
        "status-offline"
    );

    ui.system.classList.add(
        "status-online"
    );
}


/*==================================================
 MENU
==================================================*/

function initialiserMenu() {

    if (ui.menu && ui.sidebar) {

        ui.menu.onclick = function(event) {

            event.preventDefault();
            event.stopPropagation();

            ui.sidebar.classList.toggle(
                "active"
            );
        };
    }

    if (ui.sidebar) {

        const liens =
            ui.sidebar.querySelectorAll("a");

        liens.forEach(lien => {

            lien.addEventListener(
                "click",
                function() {

                    ui.sidebar.classList.remove(
                        "active"
                    );

                }
            );
        });
    }

    document.addEventListener(
        "click",
        function(event) {

            if (!ui.sidebar) return;

            if (
                !ui.sidebar.classList.contains(
                    "active"
                )
            ) {
                return;
            }

            if (
                ui.sidebar.contains(event.target) ||
                (ui.menu &&
                 ui.menu.contains(event.target))
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

    if (!ui.espace) return;

    ui.espace.onclick = function(event) {

        event.preventDefault();

        window.location.href =
            APP.espaceMembre;
    };
}


/*==================================================
 DECONNEXION
==================================================*/

function initialiserDeconnexion() {

    if (!ui.logout) return;

    ui.logout.onclick = async function(event) {

        event.preventDefault();

        if (
            ui.logout.dataset.loading === "true"
        ) {
            return;
        }

        ui.logout.dataset.loading = "true";

        const confirmer = confirm(
            "Voulez-vous vous déconnecter du Bureau Président ?"
        );

        if (!confirmer) {

            ui.logout.dataset.loading =
                "false";

            return;
        }

        /*
        Déconnexion locale immédiate.
        */

        try {

            localStorage.removeItem(
                "mwana_mbok_user"
            );

            localStorage.removeItem(
                "mwana_mbok_session"
            );

            localStorage.removeItem(
                "user"
            );

        } catch (e) {

            console.warn(
                "Nettoyage local impossible",
                e
            );
        }

        /*
        Si Firebase est disponible,
        effectuer aussi sa déconnexion.
        */

        try {

            if (
                firebaseService &&
                typeof firebaseService.deconnexion ===
                "function"
            ) {

                await firebaseService.deconnexion();
            }

        } catch (e) {

            console.warn(
                "Déconnexion Firebase :",
                e
            );
        }

        window.location.replace(
            APP.connexion
        );
    };
}

/*==================================================
 OUTILS
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


function texte(valeur, defaut = "-") {

    if (
        valeur === null ||
        valeur === undefined ||
        valeur === ""
    ) {
        return defaut;
    }

    return String(valeur)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/*==================================================
 CHARGEMENT FIREBASE
==================================================*/

async function chargerFirebase() {

    try {

        permissions =
            await import(
                "./permissions.js"
            );

        firebaseService =
            await import(
                "./firebase-service.js"
            );

        console.log(
            "Firebase et permissions chargés."
        );

        /*
        Vérification du président.
        */

        if (
            permissions &&
            typeof permissions.autoriser ===
            "function"
        ) {

            try {

                permissions.autoriser(
                    ["president"]
                );

            } catch (e) {

                console.warn(
                    "Contrôle autorisation :",
                    e
                );
            }
        }

        chargerDonnees();

    } catch (erreur) {

        console.error(
            "Erreur chargement Firebase :",
            erreur
        );

        /*
        IMPORTANT :
        l'interface reste fonctionnelle
        même si Firebase rencontre un problème.
        */

        afficher(
            ui.totalMembres,
            "—"
        );

        afficher(
            ui.responsables,
            "—"
        );

        afficherHTML(
            ui.nominations,
            `
            <div class="dynamic-content">
                <p>
                    Les données seront disponibles
                    lorsque la connexion sera rétablie.
                </p>
            </div>
            `
        );
    }
}


/*==================================================
 DONNEES FIREBASE
==================================================*/

function chargerDonnees() {

    if (!firebaseService) return;

    const ecouter =
        firebaseService.ecouter;

    if (
        typeof ecouter !== "function"
    ) {
        return;
    }


    /*----------------------------------------------
    MEMBRES
    ----------------------------------------------*/

    try {

        ecouter(
            "membres",
            data => {

                const membres =
                    data || {};

                const total =
                    Object.keys(membres).length;

                afficher(
                    ui.totalMembres,
                    total
                );
            }
        );

    } catch (e) {

        console.error(
            "Erreur membres :",
            e
        );
    }


    /*----------------------------------------------
    ORGANIGRAMME
    ----------------------------------------------*/

    try {

        ecouter(
            "organigramme",
            data => {

                const organigramme =
                    data || {};

                let total = 0;
                let html = "";

                parcourir(
                    organigramme
                );

                function parcourir(obj) {

                    if (
                        !obj ||
                        typeof obj !== "object"
                    ) {
                        return;
                    }

                    Object.keys(obj)
                        .forEach(cle => {

                            const item =
                                obj[cle];

                            if (
                                !item ||
                                typeof item !== "object"
                            ) {
                                return;
                            }

                            if (
                                item.responsableMatricule
                            ) {

                                total++;

                                html += `
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
                                        ${texte(item.nom)}
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

                            parcourir(item);
                        });
                }

                afficher(
                    ui.responsables,
                    total
                );

                afficherHTML(
                    ui.listeResponsables,
                    html ||
                    `
                    <div class="dynamic-content">
                        <p>
                            Aucun responsable nommé
                            actuellement.
                        </p>
                    </div>
                    `
                );
            }
        );

    } catch (e) {

        console.error(
            "Erreur organigramme :",
            e
        );
    }


    /*----------------------------------------------
    NOMINATIONS
    ----------------------------------------------*/

    try {

        ecouter(
            "nominations_attente",
            data => {

                const liste =
                    Object.values(
                        data || {}
                    );

                let html = "";

                liste.forEach(item => {

                    html += `
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

                        <p style="
                            color:orange;
                            font-weight:bold;
                        ">
                            En attente
                        </p>

                    </div>
                    `;
                });

                afficherHTML(
                    ui.nominations,
                    html ||
                    `
                    <div class="dynamic-content">
                        <p>
                            Aucune nomination
                            en attente.
                        </p>
                    </div>
                    `
                );
            }
        );

    } catch (e) {

        console.error(
            "Erreur nominations :",
            e
        );
    }
}


/*==================================================
 JOURNAL
==================================================*/

async function journaliser(action) {

    try {

        if (
            !firebaseService ||
            typeof firebaseService.ajouter !==
            "function"
        ) {
            return;
        }

        const p =
            permissions || {};

        await firebaseService.ajouter(
            "journal_activites",
            {
                nom:
                    p.nom ||
                    "Président",

                matricule:
                    p.matricule ||
                    "",

                fonction:
                    p.fonction ||
                    "Président Fondateur",

                bureau:
                    p.bureau ||
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

    } catch (e) {

        console.warn(
            "Journalisation impossible :",
            e
        );
    }
     }

/*==================================================
 DEMARRAGE DU BUREAU
==================================================*/

function demarrerBureau() {

    /*
    Charger immédiatement les éléments.
    */

    chargerElements();


    /*
    Ces fonctions ne dépendent PAS de Firebase.
    Elles doivent donc fonctionner même si Firebase
    rencontre une erreur.
    */

    demarrerHorloge();

    afficherAnnee();

    systemeOperationnel();

    initialiserMenu();

    initialiserEspaceMembre();

    initialiserDeconnexion();


    /*
    Firebase est chargé ensuite.
    */

    chargerFirebase();


    console.log(
        "Bureau Numérique du Président démarré."
    );
}


/*==================================================
 LANCEMENT
==================================================*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        demarrerBureau
    );

} else {

    demarrerBureau();
}


/*==================================================
 PROTECTION DES ERREURS
==================================================*/

window.addEventListener(
    "error",
    event => {

        console.error(
            "Erreur Bureau Président :",
            event.error || event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Erreur Promise Bureau Président :",
            event.reason
        );
    }
);
