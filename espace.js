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
          RECUPERATION DE LA SESSION
        ==========================================*/

        const sessionStockee =
            localStorage.getItem(
                "utilisateurConnecte"
            );


        /*==========================================
          VERIFICATION SESSION
        ==========================================*/

        if (!sessionStockee) {

            console.warn(
                "Aucune session membre trouvée."
            );

            window.location.replace(
                "connexion.html"
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
                "Session membre invalide :",
                erreur
            );


            deconnexion(
                "session_invalide"
            );

            return;

        }


        /*==========================================
          VERIFICATION DES DONNEES ESSENTIELLES
        ==========================================*/

        if (
            !membre ||
            !membre.nom ||
            !membre.matricule
        ) {

            console.warn(
                "Informations membre absentes."
            );


            deconnexion(
                "session_invalide"
            );

            return;

        }


        console.log(
            "SESSION MEMBRE :",
            membre
        );


        /*==========================================
          AFFICHAGE INFORMATIONS MEMBRE
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


        /*------------------------------------------
          NOM
        ------------------------------------------*/

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


        /*------------------------------------------
          MATRICULE
        ------------------------------------------*/

        afficherInformation(
            "matricule",
            membre.matricule
        );


        afficherInformation(
            "matriculeCard",
            membre.matricule
        );


        /*------------------------------------------
          TELEPHONE
        ------------------------------------------*/

        afficherInformation(
            "telephone",
            membre.telephone ||
            "---"
        );


        /*------------------------------------------
          STATUT
        ------------------------------------------*/

        afficherInformation(
            "statut",
            membre.statut ||
            "Actif"
        );


        /*------------------------------------------
          PARRAIN
        ------------------------------------------*/

        afficherInformation(
            "parrain",
            membre.parrain ||
            "---"
        );


        /*------------------------------------------
          DATE ADHESION
        ------------------------------------------*/

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
          DECONNEXION MANUELLE
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
          FIN INITIALISATION
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

    }
);
