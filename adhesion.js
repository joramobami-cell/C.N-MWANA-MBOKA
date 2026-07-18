/*==================================================
    ADHESION.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/*==================================================
    INITIALISATION
==================================================*/

console.clear();
console.log("==================================");
console.log("MODULE ADHÉSION MWANA MBOKA");
console.log("==================================");

/*==================================================
    ÉLÉMENTS HTML
==================================================*/

const formulaire = document.getElementById("formAdhesion");
const photoInput = document.getElementById("photo");
const previewPhoto = document.getElementById("previewPhoto");
const message = document.getElementById("message");

/*==================================================
    APERÇU PHOTO
==================================================*/

if (photoInput && previewPhoto) {

    photoInput.addEventListener("change", (e) => {

        const fichier = e.target.files[0];

        if (!fichier) return;

        const lecteur = new FileReader();

        lecteur.onload = () => {
            previewPhoto.src = lecteur.result;
        };

        lecteur.readAsDataURL(fichier);

    });

}

/*==================================================
    MESSAGE
==================================================*/

function afficherMessage(texte, type) {

    if (!message) return;

    message.className = type;
    message.innerHTML = texte;

}

/*==================================================
    GÉNÉRATION DU MATRICULE
==================================================*/

async function genererMatricule() {

    const snapshot = await getDocs(collection(db, "membres"));

    const numero = snapshot.size + 1;

    return "MMB-" + String(numero).padStart(4, "0");

}

/*==================================================
    CONVERSION PHOTO BASE64
==================================================*/

async function convertirPhoto() {

    if (!photoInput.files.length) {

        return "logo.png";

    }

    return new Promise((resolve) => {

        const lecteur = new FileReader();

        lecteur.onload = () => {

            resolve(lecteur.result);

        };

        lecteur.readAsDataURL(photoInput.files[0]);

    });

}

/*==================================================
    SOUMISSION DU FORMULAIRE
==================================================*/

if (formulaire) {

formulaire.addEventListener("submit", async (e) => {

    e.preventDefault();

    const bouton = formulaire.querySelector("button");

    bouton.disabled = true;

    bouton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Enregistrement...
    `;

    try {

        const matricule = await genererMatricule();

        const photo = await convertirPhoto();

        const membre = {

            matricule,

            nom: document.getElementById("nom").value.trim(),

            dateNaissance: document.getElementById("dateNaissance").value,

            lieuNaissance: document.getElementById("lieuNaissance").value.trim(),

            nationalite: document.getElementById("nationalite").value.trim(),

            sexe: document.getElementById("sexe").value,

            telephone: document.getElementById("telephone").value.trim(),

            profession: document.getElementById("profession").value.trim(),

            parrain: document.getElementById("parrain").value.trim(),

            motivation: document.getElementById("motivation").value.trim(),

            photo,

            statut: "Actif",

            dateAdhesion: new Date().toLocaleDateString("fr-FR"),

            dateCreation: new Date().toISOString()

        };

        console.log("Membre à enregistrer :", membre);

        /*==========================================
            ENREGISTREMENT FIRESTORE
        ==========================================*/

        const docRef = await addDoc(
            collection(db, "membres"),
            membre
        );
        console.log("Tentative d'écriture dans Firestore...");
        console.log(db);
        console.log("Document créé :", docRef.id);
        console.log("Membre enregistré :", docRef.id);

        afficherMessage(
            `
            <i class="fa-solid fa-circle-check"></i><br><br>

            Adhésion enregistrée avec succès.<br><br>

            <strong>Matricule : ${matricule}</strong>
            `,
            "success"
        );

        formulaire.reset();

        if (previewPhoto) {

            previewPhoto.src = "logo.png";

        }

        setTimeout(() => {

            window.location.href = "membres.html";

        }, 2000);

    }

    catch (erreur) {

        console.error("ERREUR FIREBASE :", erreur);

        afficherMessage(
            `
            <i class="fa-solid fa-circle-xmark"></i><br><br>

            ${erreur.message}
            `,
            "error"
        );

    }

    finally {

        bouton.disabled = false;

        bouton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Enregistrer l'adhésion
        `;

    }

});

}

console.log("==================================");
console.log("ADHESION.JS OPÉRATIONNEL");
console.log("==================================");
