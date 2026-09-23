/* =========================================================
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   ESPACE ENTREPRISES
========================================================= */

import { realtime } from "./firebase-config.js";

import {
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


/* =========================================================
   SESSION MEMBRE
========================================================= */

const membre = {

    id: localStorage.getItem("membreId") || "",

    nom: localStorage.getItem("nom") || "",

    matricule: localStorage.getItem("matricule") || "",

    telephone: localStorage.getItem("telephone") || "",

    photo: localStorage.getItem("photo") || "",

    statut: localStorage.getItem("statut") || "",

    role: localStorage.getItem("role") || ""

};


/* =========================================================
   VÉRIFICATION SESSION
========================================================= */

if (!membre.nom || !membre.matricule) {

    alert(
        "Votre session a expiré. Veuillez vous reconnecter."
    );

    window.location.href = "connexion.html";

}


/* =========================================================
   ÉLÉMENTS HTML
========================================================= */

const nomMembre =
    document.getElementById("nomMembre");

const matriculeMembre =
    document.getElementById("matriculeMembre");

const listeEntreprises =
    document.getElementById("listeEntreprises");

const chargementEntreprises =
    document.getElementById("chargementEntreprises");

const aucuneEntreprise =
    document.getElementById("aucuneEntreprise");

const rechercheEntreprise =
    document.getElementById("rechercheEntreprise");

const boutonsFiltres =
    document.querySelectorAll(".filter-btn");

const btnAccueil =
    document.getElementById("btnAccueil");

const btnNotifications =
    document.getElementById("btnNotifications");


/* =========================================================
   INFORMATIONS MEMBRE
========================================================= */

if (nomMembre) {

    nomMembre.textContent =
        membre.nom;

}


if (matriculeMembre) {

    matriculeMembre.textContent =
        membre.matricule;

}


/* =========================================================
   NAVIGATION
========================================================= */

if (btnAccueil) {

    btnAccueil.addEventListener(
        "click",
        () => {

            window.location.href =
                "espace.html";

        }
    );

}


if (btnNotifications) {

    btnNotifications.addEventListener(
        "click",
        () => {

            window.location.href =
                "notifications.html";

        }
    );

}


/* =========================================================
   VARIABLES
========================================================= */

let toutesLesEntreprises = [];

let filtreActuel = "tous";

let rechercheActuelle = "";


/* =========================================================
   SÉCURITÉ HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALISATION
========================================================= */

function normaliser(value) {

    return String(value || "")

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* =========================================================
   CHARGEMENT FIREBASE
========================================================= */

function chargerEntreprises() {

    const entreprisesRef =
        ref(
            realtime,
            "entreprises"
        );


    onValue(

        entreprisesRef,

        (snapshot) => {

            toutesLesEntreprises = [];


            if (snapshot.exists()) {

                snapshot.forEach(
                    (childSnapshot) => {

                        const entreprise =
                            childSnapshot.val();


                        if (!entreprise) {

                            return;

                        }


                        const statut =
                            normaliser(
                                entreprise.statut
                            );


                        /*
                         * Seules les entreprises
                         * publiées sont visibles.
                         */

                        if (
                            statut !== "publie"
                        ) {

                            return;

                        }


                        entreprise.id =
                            childSnapshot.key;


                        toutesLesEntreprises.push(
                            entreprise
                        );

                    }
                );

            }


            /*
             * Les entreprises les plus
             * récemment ajoutées apparaissent
             * en premier.
             */

            toutesLesEntreprises.sort(
                (a, b) => {

                    return (
                        obtenirDateTri(
                            b.dateAjout
                        ) -
                        obtenirDateTri(
                            a.dateAjout
                        )
                    );

                }
            );


            chargementEntreprises
                .classList
                .add("hidden");


            afficherEntreprises();

        },


        (error) => {

            console.error(
                "Erreur entreprises :",
                error
            );


            chargementEntreprises
                .classList
                .add("hidden");


            listeEntreprises.innerHTML =
                "";


            aucuneEntreprise
                .classList
                .remove("hidden");


            aucuneEntreprise
                .querySelector("h3")
                .textContent =
                "Impossible de charger les entreprises";


            aucuneEntreprise
                .querySelector("p")
                .textContent =
                "Une erreur est survenue lors du chargement. Veuillez réessayer.";

        }

    );

}


/* =========================================================
   DATE TRI
========================================================= */

function obtenirDateTri(value) {

    if (!value) {

        return 0;

    }


    if (
        typeof value === "number" ||
        !isNaN(Number(value))
    ) {

        return Number(value);

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return 0;

    }


    return date.getTime();

}


/* =========================================================
   FILTRAGE
========================================================= */

function filtrerEntreprises() {

    return toutesLesEntreprises.filter(
        (entreprise) => {


            const partenaire =
                normaliser(
                    entreprise.partenaire
                );


            const texte =
                normaliser(

                    [

                        entreprise.nom,

                        entreprise.secteur,

                        entreprise.ville,

                        entreprise.description,

                        entreprise.opportunites

                    ].join(" ")

                );


            let correspondType =
                true;


            if (
                filtreActuel ===
                "partenaire"
            ) {

                correspondType =
                    partenaire === "oui" ||
                    partenaire === "true" ||
                    partenaire === "partenaire";

            }


            if (
                filtreActuel ===
                "non-partenaire"
            ) {

                correspondType =
                    !(
                        partenaire === "oui" ||
                        partenaire === "true" ||
                        partenaire === "partenaire"
                    );

            }


            const correspondRecherche =
                !rechercheActuelle ||
                texte.includes(
                    rechercheActuelle
                );


            return (
                correspondType &&
                correspondRecherche
            );

        }
    );

}

/* =========================================================
   AFFICHAGE
========================================================= */

function afficherEntreprises() {

    const entreprises =
        filtrerEntreprises();


    listeEntreprises.innerHTML =
        "";


    if (
        entreprises.length === 0
    ) {

        aucuneEntreprise
            .classList
            .remove("hidden");

        return;

    }


    aucuneEntreprise
        .classList
        .add("hidden");


    entreprises.forEach(
        (entreprise) => {

            listeEntreprises
                .insertAdjacentHTML(

                    "beforeend",

                    creerCarteEntreprise(
                        entreprise
                    )

                );

        }
    );


    /*
     * Activation des boutons
     */

    document
        .querySelectorAll(
            "[data-action='whatsapp']"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const entreprise =
                            toutesLesEntreprises
                                .find(
                                    (item) =>
                                        item.id === id
                                );


                        if (entreprise) {

                            ouvrirWhatsApp(
                                entreprise
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-action='telephone']"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const entreprise =
                            toutesLesEntreprises
                                .find(
                                    (item) =>
                                        item.id === id
                                );


                        if (entreprise) {

                            appelerEntreprise(
                                entreprise
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-action='email']"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const entreprise =
                            toutesLesEntreprises
                                .find(
                                    (item) =>
                                        item.id === id
                                );


                        if (entreprise) {

                            envoyerEmail(
                                entreprise
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-action='site']"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const entreprise =
                            toutesLesEntreprises
                                .find(
                                    (item) =>
                                        item.id === id
                                );


                        if (entreprise) {

                            ouvrirSite(
                                entreprise
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   CARTE ENTREPRISE
========================================================= */

function creerCarteEntreprise(
    entreprise
) {


    const nom =
        escapeHTML(
            entreprise.nom ||
            "Entreprise"
        );


    const secteur =
        escapeHTML(
            entreprise.secteur ||
            "Secteur non précisé"
        );


    const ville =
        escapeHTML(
            entreprise.ville ||
            "Localisation non précisée"
        );


    const description =
        escapeHTML(
            entreprise.description ||
            "Aucune description disponible."
        );


    const telephone =
        escapeHTML(
            entreprise.telephone ||
            ""
        );


    const whatsapp =
        escapeHTML(
            entreprise.whatsapp ||
            ""
        );


    const email =
        escapeHTML(
            entreprise.email ||
            ""
        );


    const site =
        escapeHTML(
            entreprise.site ||
            ""
        );


    const partenaire =
        normaliser(
            entreprise.partenaire
        );


    const estPartenaire =

        partenaire === "oui" ||

        partenaire === "true" ||

        partenaire === "partenaire";


    let logoHTML = `

        <i class="fa-solid fa-building"></i>

    `;


    if (
        entreprise.logo
    ) {

        logoHTML = `

            <img
                src="${escapeHTML(entreprise.logo)}"
                alt="Logo ${nom}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >

            <i
                class="fa-solid fa-building"
                style="display:none;"
            ></i>

        `;

    }


    let opportunitesHTML = "";


    if (
        entreprise.opportunites
    ) {

        const opportunites =
            Array.isArray(
                entreprise.opportunites
            )

                ? entreprise.opportunites

                : String(
                    entreprise.opportunites
                )
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean);


        if (
            opportunites.length
        ) {

            opportunitesHTML = `

                <div class="opportunities">

                    <div class="opportunities-title">

                        <i class="fa-solid fa-star"></i>

                        Opportunités

                    </div>


                    <div class="opportunity-list">

                        ${opportunites
                            .map(
                                item => `

                                    <span
                                        class="opportunity-tag"
                                    >
                                        ${escapeHTML(item)}
                                    </span>

                                `
                            )
                            .join("")
                        }

                    </div>

                </div>

            `;

        }

    }


    let actionsHTML = "";


    if (whatsapp) {

        actionsHTML += `

            <button
                class="company-action whatsapp"
                data-action="whatsapp"
                data-id="${escapeHTML(entreprise.id)}"
            >

                <i class="fa-brands fa-whatsapp"></i>

                WhatsApp

            </button>

        `;

    }


    if (telephone) {

        actionsHTML += `

            <button
                class="company-action phone"
                data-action="telephone"
                data-id="${escapeHTML(entreprise.id)}"
            >

                <i class="fa-solid fa-phone"></i>

                Appeler

            </button>

        `;

    }


    if (email) {

        actionsHTML += `

            <button
                class="company-action email"
                data-action="email"
                data-id="${escapeHTML(entreprise.id)}"
            >

                <i class="fa-solid fa-envelope"></i>

                Email

            </button>

        `;

    }


    if (site) {

        actionsHTML += `

            <button
                class="company-action website"
                data-action="site"
                data-id="${escapeHTML(entreprise.id)}"
            >

                <i class="fa-solid fa-globe"></i>

                Site web

            </button>

        `;

    }


    return `

        <article class="company-card">


            <div class="company-header">


                <div class="company-logo">

                    ${logoHTML}

                </div>


                <div class="company-title">

                    <h3>
                        ${nom}
                    </h3>


                    <div class="company-sector">

                        <i class="fa-solid fa-layer-group"></i>

                        ${secteur}

                    </div>


                    ${
                        estPartenaire

                        ?

                        `

                        <span
                            class="partner-badge"
                        >

                            <i
                                class="fa-solid fa-handshake"
                            ></i>

                            Entreprise partenaire

                        </span>

                        `

                        :

                        `

                        <span
                            class="normal-badge"
                        >

                            <i
                                class="fa-solid fa-building"
                            ></i>

                            Entreprise

                        </span>

                    }

                </div>

            </div>



            <div class="company-body">


                <p class="company-description">

                    ${description}

                </p>



                <div class="company-details">


                    <div class="company-detail">

                        <i
                            class="fa-solid fa-location-dot"
                        ></i>

                        Localisation

                        <strong>

                            ${ville}

                        </strong>

                    </div>


                    ${
                        telephone

                        ?

                        `

                        <div class="company-detail">

                            <i
                                class="fa-solid fa-phone"
                            ></i>

                            Téléphone

                            <strong>

                                ${telephone}

                            </strong>

                        </div>

                        `

                        :

                        ""

                    }


                </div>


                ${opportunitesHTML}


                ${
                    actionsHTML

                    ?

                    `

                    <div class="company-actions">

                        ${actionsHTML}

                    </div>

                    `

                    :

                    ""

                }


            </div>


        </article>

    `;

}

/* =========================================================
   WHATSAPP
========================================================= */

function ouvrirWhatsApp(
    entreprise
) {

    const numero =
        String(
            entreprise.whatsapp || ""
        )
        .replace(/\D/g, "");


    if (!numero) {

        alert(
            "Le numéro WhatsApp de cette entreprise est indisponible."
        );

        return;

    }


    const nom =
        entreprise.nom ||
        "l'entreprise";


    const message =

        `Bonjour ${nom}, ` +

        `je suis ${membre.nom}, ` +

        `membre de la COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA ` +

        `(matricule ${membre.matricule}). ` +

        `Je souhaite obtenir des informations ` +

        `concernant votre entreprise.`;


    const url =

        `https://wa.me/${numero}` +

        `?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank"
    );

}



/* =========================================================
   APPEL TÉLÉPHONIQUE
========================================================= */

function appelerEntreprise(
    entreprise
) {

    const numero =
        String(
            entreprise.telephone || ""
        )
        .replace(
            /[^\d+]/g,
            ""
        );


    if (!numero) {

        alert(
            "Le numéro de téléphone de cette entreprise est indisponible."
        );

        return;

    }


    window.location.href =
        `tel:${numero}`;

}



/* =========================================================
   EMAIL
========================================================= */

function envoyerEmail(
    entreprise
) {

    const email =
        String(
            entreprise.email || ""
        )
        .trim();


    if (!email) {

        alert(
            "L'adresse email de cette entreprise est indisponible."
        );

        return;

    }


    const nom =
        entreprise.nom ||
        "Entreprise";


    const sujet =
        `Prise de contact - ${nom} - MWANA MBOKA`;


    const message =

        `Bonjour,\n\n` +

        `Je suis ${membre.nom}, ` +

        `membre de la COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA ` +

        `(matricule ${membre.matricule}).\n\n` +

        `Je souhaite prendre contact avec votre entreprise.\n\n` +

        `Cordialement.`;


    const url =

        `mailto:${email}` +

        `?subject=${encodeURIComponent(sujet)}` +

        `&body=${encodeURIComponent(message)}`;


    window.location.href =
        url;

}



/* =========================================================
   SITE INTERNET
========================================================= */

function ouvrirSite(
    entreprise
) {

    let url =
        String(
            entreprise.site || ""
        ).trim();


    if (!url) {

        alert(
            "Le site internet de cette entreprise est indisponible."
        );

        return;

    }


    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url =
            "https://" + url;

    }


    window.open(
        url,
        "_blank"
    );

}



/* =========================================================
   RECHERCHE
========================================================= */

if (rechercheEntreprise) {

    rechercheEntreprise.addEventListener(
        "input",
        (event) => {

            rechercheActuelle =
                normaliser(
                    event.target.value.trim()
                );


            afficherEntreprises();

        }
    );

}



/* =========================================================
   FILTRES
========================================================= */

boutonsFiltres.forEach(
    (bouton) => {

        bouton.addEventListener(
            "click",
            () => {


                boutonsFiltres.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                bouton.classList.add(
                    "active"
                );


                filtreActuel =
                    bouton.dataset.filter ||
                    "tous";


                afficherEntreprises();

            }
        );

    }
);



/* =========================================================
   LANCEMENT
========================================================= */

chargerEntreprises();
