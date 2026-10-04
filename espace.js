/*==================================================
    ESPACE.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

    Gestion :
    - Session membre sécurisée
    - Profil membre
    - Accès Président
    - Tableau de bord
    - Déconnexion
==================================================*/


/*==================================================
  SYSTEME DE SESSION
==================================================*/

import {
    deconnexion
} from "./permissions.js";


/*==================================================
  INITIALISATION
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "ESPACE MEMBRE JS CHARGÉ"
        );


        /*==========================================
          RECUPERATION DIRECTE DE LA SESSION
        ==========================================*/

        const sessionStockee =
            localStorage.getItem(
                "utilisateurConnecte"
            );


        if (!sessionStockee) {

            console.warn(
                "Aucune session membre trouvée."
            );

            deconnexion(
                "session_invalide"
            );

            return;

        }


        /*==========================================
          LECTURE DE LA SESSION
        ==========================================*/

        let membre = null;


        try {

            membre =
                JSON.parse(
                    sessionStockee
                );

        }
        catch (erreur) {

            console.error(
                "Session invalide :",
                erreur
            );

            deconnexion(
                "session_invalide"
            );

            return;

        }


        /*==========================================
          VERIFICATION DES INFORMATIONS
        ==========================================*/

        if (
            !membre ||
            !membre.nom ||
            !membre.matricule
        ) {

            console.warn(
                "Données membre incomplètes."
            );

            deconnexion(
                "session_invalide"
            );

            return;

        }


        console.log(
            "MEMBRE CONNECTÉ :",
            membre
        );


        /*==========================================
          FONCTION AFFICHAGE
        ==========================================*/

        function afficher(
            id,
            valeur,
            valeurDefaut = "---"
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            element.textContent =
                valeur !== undefined &&
                valeur !== null &&
                String(valeur).trim() !== ""
                    ? valeur
                    : valeurDefaut;

        }


        /*==========================================
          NOM
        ==========================================*/

        afficher(
            "nom",
            membre.nom,
            "Membre"
        );


        afficher(
            "nomBienvenue",
            membre.nom,
            "Membre"
        );


        afficher(
            "nomMembre",
            membre.nom,
            "Nom du membre"
        );


        /*==========================================
          MATRICULE
        ==========================================*/

        afficher(
            "matricule",
            membre.matricule,
            "MMB-0000"
        );


        afficher(
            "matriculeCard",
            membre.matricule,
            "MMB-0000"
        );


        /*==========================================
          TELEPHONE
        ==========================================*/

        afficher(
            "telephone",
            membre.telephone,
            "---"
        );


        /*==========================================
          STATUT
        ==========================================*/

        afficher(
            "statut",
            membre.statut,
            "Actif"
        );


        /*==========================================
          PARRAIN
        ==========================================*/

        afficher(
            "parrain",
            membre.parrain,
            "---"
        );


        /*==========================================
          DATE ADHESION
        ==========================================*/

        afficher(
            "dateAdhesion",
            membre.dateAdhesion,
            "---"
        );


        /*==========================================
          PHOTO
        ==========================================*/

        const photo =
            document.getElementById(
                "photo"
            );


        if (photo) {

            photo.src =
                membre.photo ||
                "logo.png";

        }


        /*==========================================
          MINI PHOTO DU HEADER
        ==========================================*/

        const imagesHeader =
            document.querySelectorAll(
                ".member-mini img"
            );


        imagesHeader.forEach(
            (image) => {

                image.src =
                    membre.photo ||
                    "logo.png";

            }
        );


        /*==========================================
          ACCES PRESIDENT
        ==========================================*/

        const bureauPresident =
            document.getElementById(
                "bureauPresident"
            );


        if (bureauPresident) {

            const role =
                String(
                    membre.role ||
                    ""
                )
                .toLowerCase()
                .trim();


            const fonction =
                String(
                    membre.fonction ||
                    ""
                )
                .toLowerCase()
                .trim();


            const estPresident =

                role === "president" ||

                role === "président" ||

                fonction === "president" ||

                fonction === "président";


            if (estPresident) {

                bureauPresident.style.display =
                    "block";

            }
            else {

                bureauPresident.style.display =
                    "none";

            }

        }


        /*==========================================
          STATISTIQUES
        ==========================================*/

        const statistiques = {

            cotisations:
                "0 FCFA",

            filleuls:
                "0",

            revenus:
                "0 FCFA",

            projets:
                "0",

            formations:
                "0",

            entraides:
                "0",

            investissements:
                "0",

            notifications:
                "0"

        };


        Object.keys(
            statistiques
        ).forEach(
            (id) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.textContent =
                        statistiques[id];

                }

            }
        );


        /*==========================================
          DECONNEXION
        ==========================================*/

        const logout =
            document.getElementById(
                "logout"
            );


        if (logout) {

            logout.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    const confirmation =
                        confirm(
                            "Voulez-vous vous déconnecter ?"
                        );


                    if (!confirmation) {

                        return;

                    }


                    deconnexion(
                        "manuelle"
                    );

                }
            );

        }


        /*==========================================
          FIN
        ==========================================*/

        console.log(
            "Nom :",
            membre.nom
        );

        console.log(
            "Matricule :",
            membre.matricule
        );

        console.log(
            "Espace membre opérationnel."
        );

    }
);
