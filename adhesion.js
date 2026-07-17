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

console.log("ADHESION.JS chargé");

/*=========================
    ÉLÉMENTS HTML
=========================*/

const formulaire = document.getElementById("formAdhesion");
const photoInput = document.getElementById("photo");
const previewPhoto = document.getElementById("previewPhoto");
const message = document.getElementById("message");

/*=========================
    APERÇU PHOTO
=========================*/

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

/*=========================
    GÉNÉRATION MATRICULE
=========================*/

async function genererMatricule() {

    const snapshot = await getDocs(collection(db, "membres"));

    const numero = snapshot.size + 1;

    return "MMB-" + String(numero).padStart(4, "0");

}

/*=========================
    MESSAGE
=========================*/

function afficherMessage(texte, type) {

    if (!message) return;

    message.className = type;
    message.innerHTML = texte;

}

/*=========================
    PHOTO BASE64
=========================*/

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
        ENREGISTREMENT FIREBASE
==================================================*/

        await addDoc(
            collection(db, "membres"),
            membre
        );

        console.log("Membre enregistré avec succès.");

        afficherMessage(
            `
            <i class="fa-solid fa-circle-check"></i>
            Adhésion réussie.<br>
            Votre matricule :
            <strong>${matricule}</strong>
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

    } catch (erreur) {

        console.error("ERREUR FIREBASE :", erreur);

        afficherMessage(
            erreur.message,
            "error"
        );

    } finally {

        bouton.disabled = false;

        bouton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Enregistrer l'adhésion
        `;

    }

});

}

console.log("Adhesion.js opérationnel");
