/*==================================================
    PERMISSIONS.JS
    MWANA MBOKA
    MOTEUR CENTRAL DES AUTORISATIONS
==================================================*/

import { auth, realtime } from "./firebase-config.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

/*==================================================
   VERIFICATION CONNEXION
==================================================*/

export function verifierConnexion(callback){

    onAuthStateChanged(auth, async(user)=>{

        if(!user){

            window.location.href="connexion.html";
            return;

        }

        const permissions =
        await chargerPermissions(user.uid);

        callback(permissions);

    });

}

/*==================================================
   CHARGER LES PERMISSIONS
==================================================*/

export async function chargerPermissions(uid){

    const membreRef =
    ref(realtime,"membres/"+uid);

    const membreSnap =
    await get(membreRef);

    if(!membreSnap.exists()){

        return null;

    }

    const membre =
    membreSnap.val();

    const matricule =
    membre.matricule;

    return await rechercherRole(matricule);

}

/*==================================================
   RECHERCHE DANS GS ORGANIGRAMME
==================================================*/

async function rechercherRole(matricule){

    const orgaRef =
    ref(realtime,"organigramme");

    const snap =
    await get(orgaRef);

    if(!snap.exists()){

        return roleMembre();

    }

    const data =
    snap.val();

    const resultat =
    parcourir(data,matricule);

    if(resultat){

        return resultat;

    }

    return roleMembre();

}

/*==================================================
   PARCOURS RECURSIF
==================================================*/

function parcourir(obj,matricule){

    for(const cle in obj){

        const valeur=obj[cle];

        if(typeof valeur==="object"){

            if(valeur.matricule===matricule){

                return {

                    role:cle,

                    bureau:
                    valeur.bureau ||

                    "membre.html",

                    permissions:
                    valeur.permissions ||

                    {}

                };

            }

            const suite=
            parcourir(valeur,matricule);

            if(suite){

                return suite;

            }

        }

    }

    return null;

}

/*==================================================
   ROLE MEMBRE PAR DEFAUT
==================================================*/

function roleMembre(){

    return{

        role:"membre",

        bureau:"membre.html",

        permissions:{

            lecture:true,

            creation:false,

            modification:false,

            suppression:false,

            validation:false

        }

    };

}

/*==================================================
   VERIFICATION D'UNE PERMISSION
==================================================*/

export function autorise(
permissions,
action){

    return permissions &&
           permissions.permissions &&
           permissions.permissions[action]===true;

}

/*==================================================
   REDIRECTION AUTOMATIQUE
==================================================*/

export function ouvrirBureau(
permissions){

    if(!permissions)
        return;

    window.location.href=
    permissions.bureau;

}

console.log(
"Permissions MWANA MBOKA chargées");
