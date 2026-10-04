/*==================================================
    ESPACE.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA

    Gestion :
    - Session membre sécurisée
    - Profil membre
    - Accès Président
    - Statistiques tableau de bord
    - Déconnexion
==================================================*/


/*==================================================
  IMPORT DU SYSTEME DE SESSION
==================================================*/

import {
    utilisateur,
    deconnexion
} from "./permissions.js";


/*==================================================
  INITIALISATION ESPACE MEMBRE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "ESPACE MEMBRE JS CHARGÉ"
        );


        /*==========================================
          VERIFICATION DE LA SESSION
          
          permissions.js a déjà effectué :
          - vérification de la session
          - contrôle des 10 minutes
          - contrôle des 8 heures
        ==========================================*/

        if (
            !utilisateur ||
            !utilisateur.nom ||
            !utilisateur.matricule
        ) {

            console.warn(
                "Session membre invalide."
            );

            deconnexion(
                "session_invalide"
            );

            return;

        }


        /*==========================================
          SESSION ACTIVE
        ==========================================*/

        const membre =
            utilisateur;


        console.log(
            "SESSION MEMBRE :",
            membre
        );


        /*==========================================
          FONCTION AFFICHAGE
        ==========================================*/

        function afficherInformation(
            id,
            valeur
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    valeur;

            }

        }


        /*==========================================
          NOM DU MEMBRE
        ==========================================*/

        afficherInformation(
            "nom",
            membre.nom
        );


        afficherInformation(
            "nomBienvenue",
            membre.nom
        );


        afficherInformation(
            "nomMembre",
            membre.nom
        );


        /*==========================================
          MATRICULE
        ==========================================*/

        afficherInformation(
            "matricule",
            membre.matricule
        );


        afficherInformation(
            "matriculeCard",
            membre.matricule
        );


        /*==========================================
          TELEPHONE
        ==========================================*/

        afficherInformation(
            "telephone",
            membre.telephone ||
            "---"
        );


        /*==========================================
          STATUT
        ==========================================*/

        afficherInformation(
            "statut",
            membre.statut ||
            "Actif"
        );


        /*==========================================
          PARRAIN
        ==========================================*/

        afficherInformation(
            "parrain",
            membre.parrain ||
            "---"
        );


        /*==========================================
          DATE ADHESION
        ==========================================*/

        afficherInformation(
            "dateAdhesion",
            membre.dateAdhesion ||
            "---"
        );


        /*==========================================
          PHOTO PROFIL
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
          ACCES BUREAU PRESIDENT
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
          STATISTIQUES TABLEAU DE BORD
        ==========================================*/

        const statistiques = {

            cotisations:
                "0 FCFA",

            filleuls:
                0,

            revenus:
                "0 FCFA",

            projets:
                0,

            formations:
                0,

            entraides:
                0,

            investissements:
                0,

            notifications:
                0

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
            "Espace membre opérationnel."
        );


        console.log(
            "Session sécurisée active."
        );


        console.log(
            "Inactivité maximale : 10 minutes."
        );


        console.log(
            "Durée maximale de session : 8 heures."
        );

    }
);
