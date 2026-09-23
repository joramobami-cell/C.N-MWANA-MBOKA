/* =========================================================
   MWANA MBOKA — BOUTIQUE
   JAVASCRIPT COMPLET — PARTIE 1/4
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

const membreId =
    localStorage.getItem("membreId") ||
    localStorage.getItem("idMembre") ||
    "";

const nomMembre =
    localStorage.getItem("nom") ||
    localStorage.getItem("nomMembre") ||
    "";

const matriculeMembre =
    localStorage.getItem("matricule") ||
    localStorage.getItem("matriculeMembre") ||
    "";

const telephoneMembre =
    localStorage.getItem("telephone") ||
    localStorage.getItem("telephoneMembre") ||
    "";

const photoMembre =
    localStorage.getItem("photo") ||
    "";

const statutMembre =
    localStorage.getItem("statut") ||
    "";

const roleMembre =
    localStorage.getItem("role") ||
    "";


/*
 * On ne bloque PAS la page si membreId est absent.
 * Le nom et le matricule suffisent pour utiliser
 * la boutique dans cette version.
 */

if(!nomMembre || !matriculeMembre){

    console.warn(
        "Informations membre incomplètes."
    );

}


/* =========================================================
   ELEMENTS HTML
========================================================= */

const nomMembreElement =
    document.getElementById("nomMembre");

const matriculeMembreElement =
    document.getElementById("matriculeMembre");

const listeProduits =
    document.getElementById("listeProduits");

const chargementProduits =
    document.getElementById("chargementProduits");

const aucunProduit =
    document.getElementById("aucunProduit");

const nombreProduits =
    document.getElementById("nombreProduits");

const rechercheProduit =
    document.getElementById("rechercheProduit");

const boutonsCategories =
    document.querySelectorAll(".category-btn");

const btnVendre =
    document.getElementById("btnVendre");

const btnVendreVide =
    document.getElementById("btnVendreVide");

const modalProduit =
    document.getElementById("modalProduit");

const btnFermerModal =
    document.getElementById("btnFermerModal");

const btnAnnulerProduit =
    document.getElementById("btnAnnulerProduit");

const formProduit =
    document.getElementById("formProduit");

const messageFormulaire =
    document.getElementById("messageFormulaire");

const btnSoumettreProduit =
    document.getElementById("btnSoumettreProduit");

const btnAccueil =
    document.getElementById("btnAccueil");

const btnNotifications =
    document.getElementById("btnNotifications");


/* =========================================================
   AFFICHAGE IDENTITÉ
========================================================= */

if(nomMembreElement){

    nomMembreElement.textContent =
        nomMembre || "Membre";

}

if(matriculeMembreElement){

    matriculeMembreElement.textContent =
        matriculeMembre || "Matricule non disponible";

}


/* =========================================================
   VARIABLES
========================================================= */

let tousLesProduits = [];

let categorieActive = "tous";

let rechercheActive = "";


/* =========================================================
   OUTILS
========================================================= */

function normaliser(valeur){

    return String(valeur ?? "")
        .trim()
        .toLowerCase();

}


function echapperHTML(valeur){

    return String(valeur ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formaterPrix(
    prix,
    devise = "FCFA"
){

    const nombre = Number(prix);

    if(!Number.isFinite(nombre)){

        return "Prix non précisé";

    }

    try{

        return (
            new Intl.NumberFormat("fr-FR")
                .format(nombre)
            + " "
            + devise
        );

    }catch(error){

        return nombre + " " + devise;

    }

}


function formaterDate(date){

    if(!date){

        return "";

    }

    const valeur =
        new Date(date);

    if(Number.isNaN(valeur.getTime())){

        return "";

    }

    return valeur.toLocaleDateString(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   NORMALISATION CATÉGORIE
========================================================= */

function normaliserCategorie(categorie){

    const valeur =
        normaliser(categorie);

    const correspondances = {

        "alimentaire": "alimentation",

        "alimentation": "alimentation",

        "agriculture": "agriculture",

        "mode": "mode",

        "habillement": "mode",

        "technologie": "technologie",

        "informatique": "technologie",

        "services": "services",

        "service": "services",

        "autres": "autres",

        "autre": "autres"

    };

    return (
        correspondances[valeur] ||
        valeur
    );

}


/* =========================================================
   NORMALISATION DISPONIBILITÉ
========================================================= */

function normaliserDisponibilite(
    disponibilite
){

    const valeur =
        normaliser(disponibilite);

    const correspondances = {

        "disponible": "Disponible",

        "stock_limite": "Stock limité",

        "stock limité": "Stock limité",

        "sur_commande": "Sur commande",

        "sur commande": "Sur commande",

        "indisponible": "Indisponible",

        "vendu": "Vendu"

    };

    return (
        correspondances[valeur] ||
        disponibilite ||
        "Disponible"
    );

}


/* =========================================================
   CHARGEMENT DES PRODUITS
========================================================= */

function chargerProduits(){

    if(!realtime){

        console.error(
            "Firebase Realtime Database indisponible."
        );

        afficherErreurChargement();

        return;

    }

    const produitsRef =
        ref(realtime, "boutique");

    onValue(

        produitsRef,

        snapshot => {

            tousLesProduits = [];

            if(snapshot.exists()){

                snapshot.forEach(enfant => {

                    const produit =
                        enfant.val() || {};

                    produit.id =
                        enfant.key;

                    /*
                     * Seuls les produits publiés
                     * apparaissent dans la boutique.
                     */

                    if(
                        normaliser(
                            produit.statut
                        ) === "publie"
                    ){

                        tousLesProduits.push(
                            produit
                        );

                    }

                });

            }

            tousLesProduits.sort(
                (a, b) => {

                    const dateA =
                        Number(a.dateAjout) || 0;

                    const dateB =
                        Number(b.dateAjout) || 0;

                    return dateB - dateA;

                }
            );


            afficherProduits();


            if(chargementProduits){

                chargementProduits.style.display =
                    "none";

            }

        },

        error => {

            console.error(
                "Erreur chargement boutique :",
                error
            );

            if(chargementProduits){

                chargementProduits.style.display =
                    "none";

            }

            afficherErreurChargement();

        }

    );

}


/* =========================================================
   AFFICHAGE DES PRODUITS
========================================================= */

function afficherProduits(){

    if(!listeProduits){

        return;

    }

    const produitsFiltres =
        filtrerProduits();

    listeProduits.innerHTML = "";


    if(nombreProduits){

        const nombre =
            produitsFiltres.length;

        nombreProduits.textContent =
            nombre +
            (
                nombre > 1
                ? " produits"
                : " produit"
            );

    }


    if(produitsFiltres.length === 0){

        listeProduits.style.display =
            "none";

        if(aucunProduit){

            aucunProduit.style.display =
                "block";

        }

        return;

    }


    listeProduits.style.display =
        "grid";


    if(aucunProduit){

        aucunProduit.style.display =
            "none";

    }


    produitsFiltres.forEach(produit => {

        listeProduits.appendChild(
            creerCarteProduit(produit)
        );

    });

}


/* =========================================================
   FILTRAGE
========================================================= */

function filtrerProduits(){

    const recherche =
        normaliser(rechercheActive);

    return tousLesProduits.filter(
        produit => {

            const categorie =
                normaliserCategorie(
                    produit.categorie
                );


            if(
                categorieActive !== "tous" &&
                categorie !== categorieActive
            ){

                return false;

            }


            if(!recherche){

                return true;

            }


            const texteRecherche = [

                produit.nom,

                produit.description,

                produit.categorie,

                produit.ville,

                produit.vendeur,

                produit.nomVendeur,

                produit.matriculeVendeur,

                produit.disponibilite

            ]
            .join(" ")
            .toLowerCase();


            return texteRecherche.includes(
                recherche
            );

        }
    );

}

/* =========================================================
   CARTE PRODUIT
========================================================= */

function creerCarteProduit(produit){

    const carte =
        document.createElement("article");

    carte.className =
        "product-card";


    const nom =
        produit.nom ||
        "Produit sans nom";


    const categorie =
        normaliserCategorie(
            produit.categorie
        ) || "autres";


    const description =
        produit.description ||
        "Aucune description disponible.";


    const prix =
        formaterPrix(
            produit.prix,
            produit.devise || "FCFA"
        );


    const ville =
        produit.ville ||
        "Localisation non précisée";


    const disponibilite =
        normaliserDisponibilite(
            produit.disponibilite
        );


    const vendeur =
        produit.nomVendeur ||
        produit.vendeur ||
        "Membre MWANA MBOKA";


    const telephone =
        produit.whatsapp ||
        produit.telephone ||
        "";


    const date =
        formaterDate(
            produit.dateAjout
        );


    let imageHTML = `

        <div class="product-image">

            <div class="product-image-placeholder">

                <i class="fa-solid fa-box-open"></i>

            </div>

    `;


    if(produit.photo){

        const photo =
            echapperHTML(
                produit.photo
            );


        imageHTML = `

            <div class="product-image">

                <img
                    src="${photo}"
                    alt="${echapperHTML(nom)}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="product-image-placeholder"
                    style="display:none;"
                >

                    <i class="fa-solid fa-box-open"></i>

                </div>

        `;

    }


    imageHTML += `

            <span class="product-status">

                <i class="fa-solid fa-circle-check"></i>

                ${echapperHTML(disponibilite)}

            </span>

        </div>

    `;


    const whatsappURL =
        creerLienWhatsApp(
            telephone,
            nom
        );


    const telephoneURL =
        creerLienTelephone(
            telephone
        );


    carte.innerHTML = `

        ${imageHTML}

        <div class="product-body">

            <div class="product-category">

                ${echapperHTML(categorie)}

            </div>


            <h3 class="product-name">

                ${echapperHTML(nom)}

            </h3>


            <p class="product-description">

                ${echapperHTML(description)}

            </p>


            <div class="product-price">

                ${echapperHTML(prix)}

            </div>


            <div class="product-details">

                <div class="product-detail">

                    <i class="fa-solid fa-location-dot"></i>

                    <span>
                        ${echapperHTML(ville)}
                    </span>

                </div>


                ${
                    date
                    ? `

                    <div class="product-detail">

                        <i class="fa-solid fa-calendar"></i>

                        <span>
                            Publié le ${echapperHTML(date)}
                        </span>

                    </div>

                    `
                    : ""
                }

            </div>


            <div class="product-seller">

                <div class="product-seller-title">

                    Vendeur

                </div>


                <div class="product-seller-name">

                    ${echapperHTML(vendeur)}

                    <span class="seller-badge">

                        <i class="fa-solid fa-user-check"></i>

                        Membre

                    </span>

                </div>

            </div>


            <div class="product-actions">

                ${
                    whatsappURL
                    ? `

                    <a
                        href="${whatsappURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="product-action whatsapp"
                    >

                        <i class="fa-brands fa-whatsapp"></i>

                        WhatsApp

                    </a>

                    `
                    : ""
                }


                ${
                    telephoneURL
                    ? `

                    <a
                        href="${telephoneURL}"
                        class="product-action phone"
                    >

                        <i class="fa-solid fa-phone"></i>

                        Appeler

                    </a>

                    `
                    : ""
                }

            </div>


            ${
                !whatsappURL &&
                !telephoneURL
                ? `

                <div class="product-actions">

                    <span class="product-action secondary">

                        <i class="fa-solid fa-phone-slash"></i>

                        Contact non renseigné

                    </span>

                </div>

                `
                : ""
            }

        </div>

    `;


    return carte;

}


/* =========================================================
   NETTOYAGE NUMÉRO
========================================================= */

function nettoyerTelephone(numero){

    if(!numero){

        return "";

    }

    return String(numero)
        .replace(/[^\d+]/g, "");

}


/* =========================================================
   LIEN TÉLÉPHONE
========================================================= */

function creerLienTelephone(numero){

    const propre =
        nettoyerTelephone(numero);

    if(!propre){

        return "";

    }

    return "tel:" + propre;

}


/* =========================================================
   LIEN WHATSAPP
========================================================= */

function creerLienWhatsApp(
    numero,
    nomProduit
){

    const propre =
        nettoyerTelephone(numero);

    if(!propre){

        return "";

    }


    let numeroWhatsApp =
        propre.replace(/\+/g, "");


    if(
        numeroWhatsApp.startsWith("0")
    ){

        numeroWhatsApp =
            "242" +
            numeroWhatsApp.substring(1);

    }


    const message =
        `Bonjour, je viens de voir votre produit "${nomProduit}" dans la Boutique MWANA MBOKA. Je souhaite avoir plus d'informations.`;


    return (
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(message)
    );

}


/* =========================================================
   ERREUR CHARGEMENT
========================================================= */

function afficherErreurChargement(){

    if(!listeProduits){

        return;

    }


    listeProduits.innerHTML = `

        <div
            class="empty-state"
            style="grid-column:1/-1;"
        >

            <div class="empty-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <h3>
                Impossible de charger la boutique
            </h3>


            <p>
                Vérifiez votre connexion puis actualisez la page.
            </p>

        </div>

    `;


    listeProduits.style.display =
        "grid";

}


/* =========================================================
   RECHERCHE
========================================================= */

if(rechercheProduit){

    rechercheProduit.addEventListener(
        "input",
        event => {

            rechercheActive =
                event.target.value;

            afficherProduits();

        }
    );

}


/* =========================================================
   CATÉGORIES
========================================================= */

boutonsCategories.forEach(
    bouton => {

        bouton.addEventListener(
            "click",
            () => {

                boutonsCategories.forEach(
                    element => {

                        element.classList.remove(
                            "active"
                        );

                    }
                );


                bouton.classList.add(
                    "active"
                );


                categorieActive =
                    bouton.dataset.category ||
                    "tous";


                afficherProduits();

            }
        );

    }
);

/* =========================================================
   OUVERTURE DU MODAL
========================================================= */

function ouvrirModalProduit(){

    if(!modalProduit){

        console.error(
            "modalProduit introuvable."
        );

        return;

    }


    /*
     * IMPORTANT :
     * le HTML possède style="display:none".
     * On force donc ici display:flex.
     */

    modalProduit.style.display =
        "flex";


    modalProduit.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    /* Téléphone du membre */

    const telephoneChamp =
        document.getElementById(
            "telephoneProduit"
        );


    if(
        telephoneChamp &&
        telephoneMembre
    ){

        telephoneChamp.value =
            telephoneMembre;

    }


    /* Message */

    if(messageFormulaire){

        messageFormulaire.textContent =
            "";

        messageFormulaire.className =
            "form-message";

        messageFormulaire.style.display =
            "none";

    }

}


/* =========================================================
   FERMETURE DU MODAL
========================================================= */

function fermerModalProduit(){

    if(!modalProduit){

        return;

    }


    modalProduit.classList.remove(
        "active"
    );


    /*
     * IMPORTANT :
     * on cache réellement le modal.
     */

    modalProduit.style.display =
        "none";


    document.body.style.overflow =
        "";

}


/* =========================================================
   OUVRIR AVEC LE BOUTON PRINCIPAL
========================================================= */

if(btnVendre){

    btnVendre.addEventListener(
        "click",
        event => {

            event.preventDefault();

            ouvrirModalProduit();

        }
    );

}


/* =========================================================
   OUVRIR DEPUIS L'ÉTAT VIDE
========================================================= */

if(btnVendreVide){

    btnVendreVide.addEventListener(
        "click",
        event => {

            event.preventDefault();

            ouvrirModalProduit();

        }
    );

}


/* =========================================================
   FERMER AVEC X
========================================================= */

if(btnFermerModal){

    btnFermerModal.addEventListener(
        "click",
        event => {

            event.preventDefault();

            fermerModalProduit();

        }
    );

}


/* =========================================================
   FERMER AVEC ANNULER
========================================================= */

if(btnAnnulerProduit){

    btnAnnulerProduit.addEventListener(
        "click",
        event => {

            event.preventDefault();

            fermerModalProduit();

        }
    );

}


/* =========================================================
   MESSAGE FORMULAIRE
========================================================= */

function afficherMessageFormulaire(
    message,
    type = "info"
){

    if(!messageFormulaire){

        return;

    }


    messageFormulaire.textContent =
        message;


    messageFormulaire.className =
        "form-message";


    messageFormulaire.style.display =
        "block";


    if(type === "success"){

        messageFormulaire.classList.add(
            "success"
        );

    }


    if(type === "error"){

        messageFormulaire.classList.add(
            "error"
        );

    }


    if(type === "info"){

        messageFormulaire.classList.add(
            "info"
        );

    }

}


/* =========================================================
   RÉCUPÉRER UNE VALEUR
========================================================= */

function recupererValeurChamp(id){

    const champ =
        document.getElementById(id);


    if(!champ){

        return "";

    }


    return champ.value.trim();

}


/* =========================================================
   VALIDATION
========================================================= */

function validerProduit(){

    const nom =
        recupererValeurChamp(
            "nomProduit"
        );


    const categorie =
        recupererValeurChamp(
            "categorieProduit"
        );


    const description =
        recupererValeurChamp(
            "descriptionProduit"
        );


    const prix =
        recupererValeurChamp(
            "prixProduit"
        );


    const devise =
        recupererValeurChamp(
            "deviseProduit"
        );


    const ville =
        recupererValeurChamp(
            "villeProduit"
        );


    const telephone =
        recupererValeurChamp(
            "telephoneProduit"
        );


    const disponibilite =
        recupererValeurChamp(
            "disponibiliteProduit"
        );


    if(!nom){

        afficherMessageFormulaire(
            "Veuillez renseigner le nom du produit.",
            "error"
        );

        return false;

    }


    if(!categorie){

        afficherMessageFormulaire(
            "Veuillez sélectionner une catégorie.",
            "error"
        );

        return false;

    }


    if(!description){

        afficherMessageFormulaire(
            "Veuillez décrire votre produit.",
            "error"
        );

        return false;

    }


    if(description.length < 10){

        afficherMessageFormulaire(
            "La description doit contenir au moins 10 caractères.",
            "error"
        );

        return false;

    }


    if(!prix){

        afficherMessageFormulaire(
            "Veuillez renseigner le prix.",
            "error"
        );

        return false;

    }


    const nombrePrix =
        Number(prix);


    if(
        !Number.isFinite(nombrePrix) ||
        nombrePrix < 0
    ){

        afficherMessageFormulaire(
            "Veuillez renseigner un prix valide.",
            "error"
        );

        return false;

    }


    if(!devise){

        afficherMessageFormulaire(
            "Veuillez sélectionner la devise.",
            "error"
        );

        return false;

    }


    if(!ville){

        afficherMessageFormulaire(
            "Veuillez renseigner la ville ou la localisation.",
            "error"
        );

        return false;

    }


    if(!telephone){

        afficherMessageFormulaire(
            "Veuillez renseigner un numéro de téléphone ou WhatsApp.",
            "error"
        );

        return false;

    }


    const telephoneNettoye =
        nettoyerTelephone(
            telephone
        );


    if(
        telephoneNettoye.length < 8
    ){

        afficherMessageFormulaire(
            "Veuillez renseigner un numéro de téléphone valide.",
            "error"
        );

        return false;

    }


    if(!disponibilite){

        afficherMessageFormulaire(
            "Veuillez préciser la disponibilité du produit.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   SOUMISSION
========================================================= */

if(formProduit){

    formProduit.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /*
             * IMPORTANT :
             * on ne demande plus membreId.
             *
             * Nom + matricule suffisent.
             */

            if(
                !nomMembre ||
                !matriculeMembre
            ){

                afficherMessageFormulaire(
                    "Les informations de votre compte membre sont incomplètes. Veuillez vous reconnecter.",
                    "error"
                );

                return;

            }


            if(!validerProduit()){

                return;

            }


            const nom =
                recupererValeurChamp(
                    "nomProduit"
                );


            const categorie =
                recupererValeurChamp(
                    "categorieProduit"
                );


            const description =
                recupererValeurChamp(
                    "descriptionProduit"
                );


            const prix =
                recupererValeurChamp(
                    "prixProduit"
                );


            const devise =
                recupererValeurChamp(
                    "deviseProduit"
                ) || "FCFA";


            const ville =
                recupererValeurChamp(
                    "villeProduit"
                );


            const telephone =
                recupererValeurChamp(
                    "telephoneProduit"
                );


            const disponibilite =
                recupererValeurChamp(
                    "disponibiliteProduit"
                );


            const photo =
                recupererValeurChamp(
                    "photoProduit"
                );


            const texteOriginal =
                btnSoumettreProduit
                ? btnSoumettreProduit.innerHTML
                : "";


            if(btnSoumettreProduit){

                btnSoumettreProduit.disabled =
                    true;


                btnSoumettreProduit.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Envoi en cours...

                `;

            }


            try{

                const boutiqueRef =
                    ref(
                        realtime,
                        "boutique"
                    );


                const nouvelleAnnonceRef =
                    push(
                        boutiqueRef
                    );


                const produit = {

                    nom: nom,

                    categorie: categorie,

                    description: description,

                    prix: Number(prix),

                    devise: devise,

                    photo: photo,

                    vendeur: nomMembre,

                    nomVendeur: nomMembre,

                    matriculeVendeur:
                        matriculeMembre,

                    membreId:
                        membreId || "",

                    telephone: telephone,

                    whatsapp: telephone,

                    ville: ville,

                    disponibilite:
                        disponibilite,

                    statut:
                        "en_attente",

                    dateAjout:
                        Date.now()

                };


                await set(
                    nouvelleAnnonceRef,
                    produit
                );


                afficherMessageFormulaire(
                    "Votre produit a bien été envoyé. Il est maintenant en attente de validation par le Président.",
                    "success"
                );


                formProduit.reset();


                const telephoneChamp =
                    document.getElementById(
                        "telephoneProduit"
                    );


                if(
                    telephoneChamp &&
                    telephoneMembre
                ){

                    telephoneChamp.value =
                        telephoneMembre;

                }


                if(btnSoumettreProduit){

                    btnSoumettreProduit.disabled =
                        false;


                    btnSoumettreProduit.innerHTML =
                        texteOriginal;

                }


                setTimeout(
                    () => {

                        fermerModalProduit();

                    },
                    2500
                );


            }catch(error){

                console.error(
                    "Erreur ajout produit :",
                    error
                );


                afficherMessageFormulaire(
                    "Impossible d'envoyer votre produit. Vérifiez votre connexion et réessayez.",
                    "error"
                );


                if(btnSoumettreProduit){

                    btnSoumettreProduit.disabled =
                        false;


                    btnSoumettreProduit.innerHTML =
                        texteOriginal;

                }

            }

        }
    );

}

/* =========================================================
   FERMETURE EN CLIQUANT SUR L'EXTÉRIEUR
========================================================= */

if(modalProduit){

    modalProduit.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                modalProduit
            ){

                fermerModalProduit();

            }

        }
    );

}


/* =========================================================
   TOUCHE ÉCHAP
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            if(
                modalProduit &&
                modalProduit.style.display !== "none"
            ){

                fermerModalProduit();

            }

        }

    }
);


/* =========================================================
   ACCUEIL
========================================================= */

if(btnAccueil){

    btnAccueil.addEventListener(
        "click",
        event => {

            event.preventDefault();

            window.location.href =
                "espace.html";

        }
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

if(btnNotifications){

    btnNotifications.addEventListener(
        "click",
        event => {

            event.preventDefault();

            window.location.href =
                "notifications.html";

        }
    );

}


/* =========================================================
   NAVIGATION BASSE
========================================================= */

const liensNavigation =
    document.querySelectorAll(
        ".bottom-nav a"
    );


liensNavigation.forEach(
    lien => {

        lien.addEventListener(
            "click",
            event => {

                const destination =
                    lien.getAttribute(
                        "href"
                    );


                if(!destination){

                    event.preventDefault();

                    return;

                }


                const pageActuelle =
                    window.location.pathname
                        .split("/")
                        .pop();


                const pageDestination =
                    destination
                        .split("/")
                        .pop();


                if(
                    pageActuelle ===
                    pageDestination
                ){

                    event.preventDefault();

                }

            }
        );

    }
);


/* =========================================================
   TÉLÉPHONE
========================================================= */

const champTelephone =
    document.getElementById(
        "telephoneProduit"
    );


if(champTelephone){

    champTelephone.addEventListener(
        "input",
        () => {

            let valeur =
                champTelephone.value
                    .replace(/[^\d+]/g, "");


            if(
                valeur.includes("+")
            ){

                valeur =
                    "+" +
                    valeur.replace(
                        /\+/g,
                        ""
                    );

            }


            champTelephone.value =
                valeur;

        }
    );

}


/* =========================================================
   PRIX
========================================================= */

const champPrix =
    document.getElementById(
        "prixProduit"
    );


if(champPrix){

    champPrix.addEventListener(
        "input",
        () => {

            if(
                Number(champPrix.value) < 0
            ){

                champPrix.value = "";

            }

        }
    );

}


/* =========================================================
   PHOTO URL
========================================================= */

const champPhoto =
    document.getElementById(
        "photoProduit"
    );


if(champPhoto){

    champPhoto.addEventListener(
        "blur",
        () => {

            const valeur =
                champPhoto.value.trim();


            if(!valeur){

                champPhoto.style.borderColor =
                    "";

                return;

            }


            try{

                new URL(valeur);

                champPhoto.style.borderColor =
                    "";

            }catch(error){

                champPhoto.style.borderColor =
                    "#dc3545";

            }

        }
    );

}


/* =========================================================
   NETTOYAGE AVANT QUITTER
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        document.body.style.overflow =
            "";

    }
);


/* =========================================================
   INITIALISATION
========================================================= */

function initialiserBoutique(){

    /*
     * Affichage de l'identité,
     * même si certaines données secondaires
     * sont absentes.
     */

    if(nomMembreElement){

        nomMembreElement.textContent =
            nomMembre ||
            "Membre";

    }


    if(matriculeMembreElement){

        matriculeMembreElement.textContent =
            matriculeMembre ||
            "Matricule";

    }


    /*
     * Le modal doit être fermé au démarrage.
     */

    if(modalProduit){

        modalProduit.classList.remove(
            "active"
        );

        modalProduit.style.display =
            "none";

    }


    /*
     * Chargement de la boutique.
     */

    chargerProduits();

}


/* =========================================================
   LANCEMENT
========================================================= */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initialiserBoutique
    );

}else{

    initialiserBoutique();

}


/* =========================================================
   FIN DE BOUTIQUE.JS
========================================================= */
