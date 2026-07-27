/*==================================================
FIREBASE-SERVICE.JS
COMMUNAUTE NUMERIQUE MWANA MBOKA
==================================================*/

import {
realtime,
db
}
from "./firebase-config.js";

import {

ref,
get,
set,
update,
remove,
push,
onValue

}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {

collection,
doc,
getDoc,
getDocs,
setDoc,
updateDoc,
deleteDoc,
addDoc,
onSnapshot

}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/*==================================================
REALTIME DATABASE
==================================================*/

export async function lire(chemin){

const snapshot =
await get(ref(realtime,chemin));

return snapshot.exists()
? snapshot.val()
: null;

}



export async function enregistrer(chemin,donnees){

await set(ref(realtime,chemin),donnees);

}



export async function modifier(chemin,donnees){

await update(ref(realtime,chemin),donnees);

}



export async function supprimer(chemin){

await remove(ref(realtime,chemin));

}



export async function ajouter(chemin,donnees){

const nouvelleRef =
push(ref(realtime,chemin));

await set(nouvelleRef,donnees);

return nouvelleRef.key;

}



export function ecouter(chemin,callback){

onValue(

ref(realtime,chemin),

(snapshot)=>{

callback(

snapshot.exists()
? snapshot.val()
: null

);

}

);

}



/*==================================================
FIRESTORE
==================================================*/

export async function lireDocument(collectionNom,id){

const documentRef =
doc(db,collectionNom,id);

const snapshot =
await getDoc(documentRef);

return snapshot.exists()
? snapshot.data()
: null;

}



export async function lireCollection(collectionNom){

const snapshot =
await getDocs(collection(db,collectionNom));

const liste=[];

snapshot.forEach(doc=>{

liste.push({

id:doc.id,

...doc.data()

});

});

return liste;

}



export async function creerDocument(

collectionNom,

id,

donnees

){

await setDoc(

doc(db,collectionNom,id),

donnees

);

}



export async function ajouterDocument(

collectionNom,

donnees

){

return await addDoc(

collection(db,collectionNom),

donnees

);

}



export async function modifierDocument(

collectionNom,

id,

donnees

){

await updateDoc(

doc(db,collectionNom,id),

donnees

);

}



export async function supprimerDocument(

collectionNom,

id

){

await deleteDoc(

doc(db,collectionNom,id)

);

}



export function ecouterCollection(

collectionNom,

callback

){

onSnapshot(

collection(db,collectionNom),

(snapshot)=>{

const liste=[];

snapshot.forEach(doc=>{

liste.push({

id:doc.id,

...doc.data()

});

});

callback(liste);

}

);

}



console.log(
"Firebase Service chargé."
);
