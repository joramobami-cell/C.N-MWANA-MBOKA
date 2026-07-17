/*==================================================
    MEMBRES.JS
    COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA
==================================================*/

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/*==================================================
            INITIALISATION
==================================================*/

console.clear();

console.log("====================================");
console.log("GESTION DES MEMBRES");
console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");
console.log("====================================");

/*==================================================
        VÉRIFICATION SESSION
==================================================*/

const utilisateur =
localStorage.getItem("utilisateurConnecte");

if(!utilisateur){

    window.location.href="connexion.html";

}

/*==================================================
            DATE ET HEURE
==================================================*/

const dateElement=document.getElementById("date");
const heureElement=document.getElementById("heure");

function afficherDate(){

    if(!dateElement) return;

    dateElement.textContent=

    new Date().toLocaleDateString("fr-FR",{

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    });

}

function afficherHeure(){

    if(!heureElement) return;

    heureElement.textContent=

    new Date().toLocaleTimeString("fr-FR");

}

afficherDate();
afficherHeure();

setInterval(afficherHeure,1000);

/*==================================================
            ANNÉE FOOTER
==================================================*/

const annee=document.getElementById("annee");

if(annee){

    annee.textContent=

    new Date().getFullYear();

}

/*==================================================
            DÉCONNEXION
==================================================*/

const btnLogout=document.getElementById("logoutBtn");

if(btnLogout){

    btnLogout.addEventListener("click",()=>{

        if(confirm("Voulez-vous quitter la gestion des membres ?")){

            localStorage.removeItem("utilisateurConnecte");

            window.location.href="connexion.html";

        }

    });

}

/*==================================================
        VARIABLES GLOBALES
==================================================*/

let listeMembres=[];

const tbody=
document.getElementById("listeMembres");

const recherche=
document.getElementById("recherche");

console.log("Initialisation terminée.");

/*==================================================
        CHARGEMENT DES MEMBRES FIREBASE
==================================================*/

function chargerMembres(){

    const q=query(

        collection(db,"membres"),

        orderBy("nom","asc")

    );

    onSnapshot(q,(snapshot)=>{

        listeMembres=[];

        if(snapshot.empty){

            tbody.innerHTML=`

                <tr>

                    <td colspan="9" class="loading">

                        <i class="fa-solid fa-users-slash"></i>

                        Aucun membre enregistré.

                    </td>

                </tr>

            `;

            mettreAJourStatistiques();

            return;

        }

        snapshot.forEach((doc)=>{

            listeMembres.push({

                id:doc.id,

                ...doc.data()

            });

        });

        afficherMembres(listeMembres);

        mettreAJourStatistiques();

    },

    (erreur)=>{

        console.error(erreur);

    });

}

/*==================================================
        AFFICHER LES MEMBRES
==================================================*/

function afficherMembres(membres){

    tbody.innerHTML="";

    membres.forEach((membre)=>{

        tbody.innerHTML+=`

        <tr>

            <td>

                <img src="${membre.photo || 'logo.png'}">

            </td>

            <td>${membre.nom || "-"}</td>

            <td>${membre.matricule || "-"}</td>

            <td>${membre.telephone || "-"}</td>

            <td>${membre.parrain || "-"}</td>

            <td>

                <span class="badge badge-${(membre.statut || "actif").toLowerCase()}">

                    ${membre.statut || "Actif"}

                </span>

            </td>

            <td>${membre.dateAdhesion || "-"}</td>

            <td>

                <div class="actions">

                    <button class="btn-view"

                        onclick="voirMembre('${membre.id}')">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                    <button class="btn-edit"

                        onclick="modifierMembre('${membre.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button class="btn-delete"

                        onclick="supprimerMembre('${membre.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

}

/*==================================================
        STATISTIQUES
==================================================*/

function mettreAJourStatistiques(){

    document.getElementById("totalMembres").textContent=

        listeMembres.length;

}


/*==================================================
        RECHERCHE DES MEMBRES
==================================================*/

if(recherche){

    recherche.addEventListener("keyup",()=>{

        const valeur=recherche.value.toLowerCase().trim();

        const resultat=listeMembres.filter((membre)=>{

            return(

                (membre.nom || "").toLowerCase().includes(valeur) ||

                (membre.matricule || "").toLowerCase().includes(valeur) ||

                (membre.telephone || "").toLowerCase().includes(valeur) ||

                (membre.parrain || "").toLowerCase().includes(valeur)

            );

        });

        afficherMembres(resultat);

    });

}

/*==================================================
        VOIR UN MEMBRE
==================================================*/

window.voirMembre=function(id){

    const membre=listeMembres.find(

        item=>item.id===id

    );

    if(!membre) return;

    document.getElementById("photoMembre").src=

        membre.photo || "logo.png";

    document.getElementById("nomDetail").textContent=

        membre.nom || "-";

    document.getElementById("matriculeDetail").textContent=

        membre.matricule || "-";

    document.getElementById("telephoneDetail").textContent=

        membre.telephone || "-";

    document.getElementById("parrainDetail").textContent=

        membre.parrain || "-";

    document.getElementById("statutDetail").textContent=

        membre.statut || "-";

    document.getElementById("dateDetail").textContent=

        membre.dateAdhesion || "-";

    document.getElementById("modalMembre").style.display="flex";

};

/*==================================================
        MODIFIER UN MEMBRE
==================================================*/

window.modifierMembre=function(id){

    const membre=listeMembres.find(

        item=>item.id===id

    );

    if(!membre) return;

    localStorage.setItem(

        "membreModification",

        JSON.stringify(membre)

    );

    window.location.href="modifier-membre.html";

};

/*==================================================
        FERMETURE DE LA MODALE
==================================================*/

const fermer=document.querySelector(".close");

if(fermer){

    fermer.addEventListener("click",()=>{

        document.getElementById("modalMembre").style.display="none";

    });

}

window.addEventListener("click",(e)=>{

    const modal=document.getElementById("modalMembre");

    if(e.target===modal){

        modal.style.display="none";

    }

});

/*==================================================
        SUPPRESSION D'UN MEMBRE
==================================================*/

import {
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

window.supprimerMembre = async function(id){

    const membre = listeMembres.find(

        item => item.id === id

    );

    if(!membre) return;

    const confirmation = confirm(

        "Supprimer définitivement le membre :\n\n" +

        (membre.nom || "Sans nom") +

        " ?"

    );

    if(!confirmation) return;

    try{

        await deleteDoc(doc(db,"membres",id));

        creerNotification(

            "Membre supprimé avec succès.",

            "success"

        );

        console.log(

            "Suppression :",membre.nom

        );

    }

    catch(erreur){

        console.error(erreur);

        creerNotification(

            "Impossible de supprimer ce membre.",

            "error"

        );

    }

};

/*==================================================
            NOTIFICATIONS
==================================================*/

function creerNotification(message,type="info"){

    const notification=document.createElement("div");

    notification.className=

        "notification "+type;

    notification.innerHTML=`

        <i class="fa-solid fa-bell"></i>

        <span>${message}</span>

    `;

    document.body.appendChild(notification);

    setTimeout(()=>{

        notification.classList.add("show");

    },100);

    setTimeout(()=>{

        notification.classList.remove("show");

        setTimeout(()=>{

            notification.remove();

        },500);

    },4000);

}

/*==================================================
        RAFRAÎCHISSEMENT
==================================================*/

function actualiserMembres(){

    chargerMembres();

}

/*==================================================
        DÉMARRAGE
==================================================*/

actualiserMembres();

console.log(

    "Gestion des membres démarrée."

);


/*==================================================
        ANIMATION DU TABLEAU
==================================================*/

function animerTableau(){

    const lignes=document.querySelectorAll(

        "#listeMembres tr"

    );

    lignes.forEach((ligne,index)=>{

        ligne.style.opacity="0";

        ligne.style.transform="translateY(20px)";

        setTimeout(()=>{

            ligne.style.transition="all .4s ease";

            ligne.style.opacity="1";

            ligne.style.transform="translateY(0)";

        },index*70);

    });

}

/*==================================================
        CONNEXION INTERNET
==================================================*/

window.addEventListener("online",()=>{

    creerNotification(

        "Connexion Internet rétablie.",

        "success"

    );

    actualiserMembres();

});

window.addEventListener("offline",()=>{

    creerNotification(

        "Connexion Internet interrompue.",

        "warning"

    );

});

/*==================================================
        RACCOURCIS CLAVIER
==================================================*/

document.addEventListener("keydown",(e)=>{

    // CTRL + F
    if(e.ctrlKey && e.key==="f"){

        e.preventDefault();

        if(recherche){

            recherche.focus();

        }

    }

    // ECHAP
    if(e.key==="Escape"){

        const modal=document.getElementById("modalMembre");

        if(modal){

            modal.style.display="none";

        }

    }

});

/*==================================================
        RAFRAÎCHISSEMENT AUTOMATIQUE
==================================================*/

setInterval(()=>{

    actualiserMembres();

},60000);

/*==================================================
        CHARGEMENT DE LA PAGE
==================================================*/

window.addEventListener("load",()=>{

    actualiserMembres();

    creerNotification(

        "Gestion des membres prête.",

        "success"

    );

    setTimeout(()=>{

        animerTableau();

    },500);

});

/*==================================================
        FERMETURE DE LA PAGE
==================================================*/

window.addEventListener("beforeunload",()=>{

    console.log(

        "Fermeture du module Membres."

    );

});

/*==================================================
        VERSION
==================================================*/

console.log("======================================");
console.log("COMMUNAUTÉ NUMÉRIQUE MWANA MBOKA");
console.log("MODULE : GESTION DES MEMBRES");
console.log("Version : 1.0");
console.log("Statut : Opérationnel");
console.log("======================================");
