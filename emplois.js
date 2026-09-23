/* =========================================================
   COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
   ESPACE EMPLOI
========================================================= */

import { realtime } from "./firebase-config.js";

import {
    ref,
    onValue,
    push,
    set
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
    parrain: localStorage.getItem("parrain") || "",
    role: localStorage.getItem("role") || ""
};


/* =========================================================
   VÉRIFICATION SESSION
========================================================= */

if (!membre.nom || !membre.matricule) {

    alert("Votre session a expiré. Veuillez vous reconnecter.");

    window.location.href = "connexion.html";

}


/* =========================================================
   ÉLÉMENTS HTML
========================================================= */

const nomMembre = document.getElementById("nomMembre");
const matriculeMembre = document.getElementById("matriculeMembre");

const listeEmplois = document.getElementById("listeEmplois");
const chargementEmplois = document.getElementById("chargementEmplois");
const aucuneOffre = document.getElementById("aucuneOffre");

const rechercheEmploi = document.getElementById("rechercheEmploi");

const boutonsFiltres = document.querySelectorAll(".filter-btn");

const btnAccueil = document.getElementById("btnAccueil");
const btnNotifications = document.getElementById("btnNotifications");


/* =========================================================
   INFORMATIONS MEMBRE
========================================================= */

if (nomMembre) {
    nomMembre.textContent = membre.nom;
}

if (matriculeMembre) {
    matriculeMembre.textContent = membre.matricule;
}


/* =========================================================
   NAVIGATION
========================================================= */

if (btnAccueil) {

    btnAccueil.addEventListener("click", () => {
        window.location.href = "espace.html";
    });

}

if (btnNotifications) {

    btnNotifications.addEventListener("click", () => {
        window.location.href = "notifications.html";
    });

}


/* =========================================================
   VARIABLES
========================================================= */

let toutesLesOffres = [];

let filtreActuel = "tous";

let rechercheActuelle = "";


/* =========================================================
   SÉCURITÉ HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
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
        .replace(/[\u0300-\u036f]/g, "");
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formaterDate(dateValue) {

    if (!dateValue) {
        return "Non précisée";
    }

    try {

        let date;

        if (
            typeof dateValue === "number" ||
            !isNaN(Number(dateValue))
        ) {

            date = new Date(Number(dateValue));

        } else {

            date = new Date(dateValue);

        }

        if (isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("fr-FR", {

            day: "2-digit",
            month: "2-digit",
            year: "numeric"

        });

    } catch (error) {

        return String(dateValue);

    }
}


/* =========================================================
   TYPE D'EMPLOI
========================================================= */

function typeEmploi(type) {

    const typeNormalise = normaliser(type);

    if (typeNormalise === "interne") {

        return {

            classe: "interne",
            texte: "Emploi interne",
            icone: "fa-building-user"

        };

    }

    return {

        classe: "externe",
        texte: "Emploi externe",
        icone: "fa-building"

    };
}


/* =========================================================
   CHARGEMENT DES OFFRES FIREBASE
========================================================= */

function chargerEmplois() {

    const emploisRef = ref(realtime, "emplois");

    onValue(

        emploisRef,

        (snapshot) => {

            toutesLesOffres = [];

            if (snapshot.exists()) {

                snapshot.forEach((childSnapshot) => {

                    const offre = childSnapshot.val();

                    if (!offre) {
                        return;
                    }

                    const statut = normaliser(offre.statut);

                    if (statut !== "publie") {
                        return;
                    }

                    offre.id = childSnapshot.key;

                    toutesLesOffres.push(offre);

                });

            }

            toutesLesOffres.sort((a, b) => {

                const dateA = obtenirDateTri(a.datePublication);
                const dateB = obtenirDateTri(b.datePublication);

                return dateB - dateA;

            });

            chargementEmplois.classList.add("hidden");

            afficherEmplois();

        },

        (error) => {

            console.error(
                "Erreur lors du chargement des emplois :",
                error
            );

            chargementEmplois.classList.add("hidden");

            listeEmplois.innerHTML = "";

            aucuneOffre.classList.remove("hidden");

            aucuneOffre.querySelector("h3").textContent =
                "Impossible de charger les offres";

            aucuneOffre.querySelector("p").textContent =
                "Une erreur est survenue lors du chargement. Veuillez réessayer.";

        }

    );

}


/* =========================================================
   DATE POUR TRI
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

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return 0;
    }

    return date.getTime();
}


/* =========================================================
   FILTRAGE
========================================================= */

function filtrerEmplois() {

    return toutesLesOffres.filter((offre) => {

        const type = normaliser(offre.type);

        const texteRecherche = normaliser(
            [
                offre.titre,
                offre.entreprise,
                offre.secteur,
                offre.lieu,
                offre.description,
                offre.exigences,
                offre.contrat
            ].join(" ")
        );

        const correspondType =
            filtreActuel === "tous" ||
            type === filtreActuel;

        const correspondRecherche =
            !rechercheActuelle ||
            texteRecherche.includes(rechercheActuelle);

        return correspondType && correspondRecherche;

    });

}

/* =========================================================
   AFFICHAGE DES EMPLOIS
========================================================= */

function afficherEmplois() {

    const offres = filtrerEmplois();

    listeEmplois.innerHTML = "";

    if (offres.length === 0) {

        aucuneOffre.classList.remove("hidden");

        return;

    }

    aucuneOffre.classList.add("hidden");

    offres.forEach((offre) => {

        listeEmplois.insertAdjacentHTML(
            "beforeend",
            creerCarteEmploi(offre)
        );

    });


    document
        .querySelectorAll("[data-action='postuler-interne']")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                const offre = toutesLesOffres.find(
                    (item) => item.id === id
                );

                if (offre) {
                    postulerInterne(offre);
                }

            });

        });


    document
        .querySelectorAll("[data-action='postuler-externe']")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                const offre = toutesLesOffres.find(
                    (item) => item.id === id
                );

                if (offre) {
                    postulerExterne(offre);
                }

            });

        });

}


/* =========================================================
   CRÉATION CARTE EMPLOI
========================================================= */

function creerCarteEmploi(offre) {

    const type = typeEmploi(offre.type);

    const titre =
        escapeHTML(offre.titre || "Offre d'emploi");

    const entreprise =
        escapeHTML(offre.entreprise || "Non précisée");

    const secteur =
        escapeHTML(offre.secteur || "Non précisé");

    const lieu =
        escapeHTML(offre.lieu || "Non précisé");

    const contrat =
        escapeHTML(offre.contrat || "Non précisé");

    const experience =
        escapeHTML(offre.experience || "Non précisée");

    const description =
        escapeHTML(
            offre.description ||
            "Aucune description disponible."
        );

    const exigences =
        escapeHTML(
            offre.exigences ||
            "Aucune exigence particulière précisée."
        );

    const dateLimite =
        formaterDate(offre.dateLimite);

    let bouton;


    if (type.classe === "interne") {

        bouton = `
            <button
                class="apply-btn internal"
                data-action="postuler-interne"
                data-id="${escapeHTML(offre.id)}"
            >
                <i class="fa-solid fa-paper-plane"></i>
                Postuler à cette offre
            </button>
        `;

    } else {

        bouton = `
            <button
                class="apply-btn external"
                data-action="postuler-externe"
                data-id="${escapeHTML(offre.id)}"
            >
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                Postuler auprès de l'employeur
            </button>
        `;

    }


    return `

        <article class="job-card">

            <div class="job-card-header">

                <span class="job-type ${type.classe}">

                    <i class="fa-solid ${type.icone}"></i>

                    ${type.texte}

                </span>


                <h3>
                    ${titre}
                </h3>


                <div class="job-company">

                    <i class="fa-solid fa-building"></i>

                    ${entreprise}

                </div>

            </div>


            <div class="job-card-body">

                <div class="job-details">

                    <div class="job-detail">

                        <i class="fa-solid fa-location-dot"></i>

                        Lieu

                        <strong>
                            ${lieu}
                        </strong>

                    </div>


                    <div class="job-detail">

                        <i class="fa-solid fa-file-contract"></i>

                        Contrat

                        <strong>
                            ${contrat}
                        </strong>

                    </div>


                    <div class="job-detail">

                        <i class="fa-solid fa-layer-group"></i>

                        Secteur

                        <strong>
                            ${secteur}
                        </strong>

                    </div>


                    <div class="job-detail">

                        <i class="fa-solid fa-user-tie"></i>

                        Expérience

                        <strong>
                            ${experience}
                        </strong>

                    </div>

                </div>


                <p class="job-description">

                    ${description}

                </p>


                <div class="job-exigences">

                    <strong>
                        <i class="fa-solid fa-list-check"></i>
                        Exigences
                    </strong>

                    <p>
                        ${exigences}
                    </p>

                </div>


                <div class="job-deadline">

                    <i class="fa-solid fa-calendar-days"></i>

                    Date limite :

                    <strong>
                        ${dateLimite}
                    </strong>

                </div>


                ${bouton}

            </div>

        </article>

    `;

}


/* =========================================================
   CANDIDATURE EMPLOI INTERNE
========================================================= */

async function postulerInterne(offre) {

    if (!membre.id) {

        alert(
            "Votre identifiant membre est introuvable. Veuillez vous reconnecter."
        );

        return;

    }


    const confirmation = confirm(

        `Voulez-vous envoyer votre candidature pour le poste :\n\n` +

        `${offre.titre || "Offre d'emploi"}\n\n` +

        `Votre candidature sera transmise au Président ` +
        `pour traitement.`

    );


    if (!confirmation) {
        return;
    }


    try {

        const candidaturesRef =
            ref(realtime, "candidaturesEmploi");

        const nouvelleCandidature =
            push(candidaturesRef);


        const candidature = {

            offreId: offre.id || "",

            typeEmploi: "interne",

            poste: offre.titre || "",

            entreprise: offre.entreprise || "MWANA MBOKA",

            candidatId: membre.id,

            candidatNom: membre.nom,

            candidatMatricule: membre.matricule,

            candidatTelephone: membre.telephone,

            candidatPhoto: membre.photo || "",

            dateCandidature: Date.now(),

            statut: "nouvelle",

            source: "emplois.html",

            recommandation:
                offre.recommandation ||
                "Candidature via la COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA"

        };


        await set(
            nouvelleCandidature,
            candidature
        );


        alert(
            "Votre candidature a été envoyée avec succès.\n\n" +
            "Elle sera examinée par le Président."
        );


    } catch (error) {

        console.error(
            "Erreur candidature interne :",
            error
        );

        alert(
            "Impossible d'envoyer votre candidature pour le moment."
        );

    }

}


/* =========================================================
   CANDIDATURE EMPLOI EXTERNE
========================================================= */

function postulerExterne(offre) {

    const contact =
        String(offre.contactEmployeur || "").trim();

    const canal =
        normaliser(offre.canalContact || "");

    if (!contact) {

        alert(
            "Les coordonnées de l'employeur ne sont pas encore disponibles."
        );

        return;

    }


    const titre =
        offre.titre ||
        "une offre d'emploi";

    const entreprise =
        offre.entreprise ||
        "l'employeur";


    const message =

        `Bonjour, je suis ${membre.nom}, ` +

        `membre de la COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA ` +

        `(matricule ${membre.matricule}).\n\n` +

        `J'ai vu votre offre "${titre}" ` +

        `publiée sur la plateforme MWANA MBOKA ` +

        `et je souhaite postuler auprès de ${entreprise}.\n\n` +

        `Je vous contacte avec la recommandation ` +

        `de la COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA.`;


    /* ==============================
       WHATSAPP
    ============================== */

    if (
        canal === "whatsapp" ||
        canal === "wa"
    ) {

        const numero =
            contact.replace(/\D/g, "");


        if (!numero) {

            alert(
                "Le numéro WhatsApp de l'employeur est invalide."
            );

            return;

        }


        const url =
            `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;


        window.open(url, "_blank");

        return;

    }


    /* ==============================
       TÉLÉPHONE
    ============================== */

    if (
        canal === "telephone" ||
        canal === "tel" ||
        canal === "phone"
    ) {

        const numero =
            contact.replace(/[^\d+]/g, "");


        window.location.href =
            `tel:${numero}`;

        return;

    }


    /* ==============================
       EMAIL
    ============================== */

    if (
        canal === "email" ||
        canal === "mail"
    ) {

        const sujet =
            `Candidature - ${titre} - MWANA MBOKA`;


        const url =

            `mailto:${contact}` +

            `?subject=${encodeURIComponent(sujet)}` +

            `&body=${encodeURIComponent(message)}`;


        window.location.href = url;

        return;

    }

    /* ==============================
       LIEN EXTERNE
    ============================== */

    if (
        canal === "lien" ||
        canal === "url" ||
        canal === "site"
    ) {

        try {

            let url = contact;

            if (
                !url.startsWith("http://") &&
                !url.startsWith("https://")
            ) {

                url = "https://" + url;

            }

            window.open(url, "_blank");

        } catch (error) {

            alert(
                "Le lien de candidature est invalide."
            );

        }

        return;

    }


    /*
     * Si le canal n'est pas reconnu,
     * on affiche simplement les coordonnées.
     */

    alert(

        `Pour postuler à cette offre, contactez directement l'employeur :\n\n` +

        `${contact}`

    );

}


/* =========================================================
   RECHERCHE
========================================================= */

if (rechercheEmploi) {

    rechercheEmploi.addEventListener(
        "input",
        (event) => {

            rechercheActuelle =
                normaliser(event.target.value.trim());

            afficherEmplois();

        }
    );

}


/* =========================================================
   FILTRES
========================================================= */

boutonsFiltres.forEach((bouton) => {

    bouton.addEventListener("click", () => {

        boutonsFiltres.forEach((item) => {

            item.classList.remove("active");

        });


        bouton.classList.add("active");


        filtreActuel =
            bouton.dataset.filter || "tous";


        afficherEmplois();

    });

});


/* =========================================================
   LANCEMENT
========================================================= */

chargerEmplois();
