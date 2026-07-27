/*==================================================
PERMISSIONS.JS
COMMUNAUTE NUMERIQUE MWANA MBOKA
==================================================*/


//=========================================
// UTILISATEUR CONNECTE
//=========================================

const utilisateur = JSON.parse(

localStorage.getItem("utilisateurConnecte")

);


//=========================================
// VERIFICATION SESSION
//=========================================

if(!utilisateur){

window.location.href="connexion.html";

}


//=========================================
// VARIABLES
//=========================================

export const fonction =
(utilisateur.fonction || "membre").toLowerCase();

export const bureau =
utilisateur.bureau || "";

export const matricule =
utilisateur.matricule || "";

export const nom =
utilisateur.nom || "";


//=========================================
// AUTORISATION
//=========================================

export function autoriser(liste){

if(fonction==="president"){

return true;

}

if(liste.includes(fonction)){

return true;

}

document.body.innerHTML=`

<div
style="
height:100vh;
display:flex;
justify-content:center;
align-items:center;
background:#111;
color:white;
font-family:Arial;
text-align:center;
padding:30px;
">

<div>

<h1 style="color:#d4af37;">
Accès refusé
</h1>

<p>

Vous n'avez pas les autorisations nécessaires.

</p>

<br>

<a
href="espace.html"
style="
background:#009245;
padding:15px 25px;
color:white;
text-decoration:none;
border-radius:10px;
">

Retour

</a>

</div>

</div>

`;

throw new Error("Accès refusé");

}


//=========================================
// DECONNEXION
//=========================================

export function deconnexion(){

localStorage.clear();

window.location.href="connexion.html";

}
