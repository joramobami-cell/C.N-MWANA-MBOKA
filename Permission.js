/*==================================================
PERMISSIONS.JS
COMMUNAUTE NUMERIQUE MWANA MBOKA
VERSION PREMIUM
==================================================*/


//==================================================
// SESSION
//==================================================

const utilisateur = JSON.parse(
localStorage.getItem("utilisateurConnecte")
);


//==================================================
// SI AUCUNE SESSION
//==================================================

if(!utilisateur){

window.location.replace("connexion.html");

}


//==================================================
// INFORMATIONS UTILISATEUR
//==================================================

export const matricule =
utilisateur.matricule || "";

export const nom =
utilisateur.nom || "";

export const fonction =
(utilisateur.fonction || "membre").toLowerCase();

export const bureau =
utilisateur.bureau || "";


//==================================================
// PRESIDENT
//==================================================

export const estPresident =
fonction === "president";


//==================================================
// VERIFICATION DES AUTORISATIONS
//==================================================

export function autoriser(fonctionsAutorisees=[]){

if(estPresident){

return true;

}

if(fonctionsAutorisees.includes(fonction)){

return true;

}

document.body.innerHTML=`

<div style="
height:100vh;
display:flex;
justify-content:center;
align-items:center;
background:#07130d;
color:white;
font-family:Arial;
">

<div style="
background:#101010;
padding:40px;
border-radius:25px;
text-align:center;
border:2px solid #D4AF37;
max-width:500px;
">

<h1 style="color:#D4AF37;">
Accès refusé
</h1>

<p style="margin:20px 0;">

Vous ne possédez pas les autorisations nécessaires
pour accéder à ce bureau.

</p>

<button
id="btnRetour"
style="
padding:15px 30px;
background:#009245;
border:none;
border-radius:12px;
color:white;
font-size:16px;
cursor:pointer;
">

Retour à l'espace membre

</button>

</div>

</div>

`;

document
.getElementById("btnRetour")
.onclick=()=>{

window.location.href="espace.html";

};

throw new Error("Accès refusé");

}


//==================================================
// TEST D'UNE FONCTION
//==================================================

export function possedeFonction(f){

return fonction===f.toLowerCase();

}


//==================================================
// TEST DE PLUSIEURS FONCTIONS
//==================================================

export function possedeUneFonction(liste){

return liste.includes(fonction);

}


//==================================================
// DECONNEXION
//==================================================

export function deconnexion(){

localStorage.clear();

window.location.replace("connexion.html");

}


//==================================================
// INFORMATIONS
//==================================================

console.log("Utilisateur :",nom);

console.log("Fonction :",fonction);

console.log("Bureau :",bureau);
