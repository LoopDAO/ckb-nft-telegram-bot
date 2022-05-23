//import { initializeApp, cert } from 'firebase-admin/app';

const { UserFirestore } = require('../shared/firestoreTypes.js')

const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require("./firebase.json")
const { initializeApp, cert, arrayContains } = require('firebase-admin/app')
//const { query, where } =require ("firebase/firestore");
const firebaseConfig = {
    credential: cert(serviceAccount)
}
// Initialize Firestore through Firebase
// const { initializeApp:initializeApp2 } =require("firebase/app")
// const { getFirestore:getFirestore2 } = require("firebase/firestore")
// const firebaseApp = initializeApp({
//   apiKey: '### FIREBASE API KEY ###',
//   authDomain: '### FIREBASE AUTH DOMAIN ###',
//   projectId: 'telegram-bot-2405c'
// });

// const app2 = initializeApp2(firebaseApp)
// const db = getFirestore2(app2);

const app = initializeApp(firebaseConfig)
const dbFirebase = getFirestore(app)
// Get a list of cities from your database
// async function getCities(db) {
//   const citiesCol = collection(db, 'cities');
//   const citySnapshot = await getDocs(citiesCol);
//   const cityList = citySnapshot.docs.map(doc => doc.data());
//   return cityList;
// }
async function getUser(chatId) {
    const user = await dbFirebase
        .collection("Users")
        .doc("" + chatId)
        .get()
    return user
}
async function getGroupsList() {
    const groups = await dbFirebase
        .collection("Groups")
        .get()
    return groups
}
async function getMember(userId,groupId) {
    return new Promise(resolve => {
        var Query = dbFirebase.collectionGroup('Members')
            .where('groupId', '==', parseInt(groupId))
            .where('userId', '==', parseInt(userId))

        Query.get().then(snapshot => {
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(doc => {
                resolve(doc.data())
            })
        }).catch(error => {
            console.log(error)
            resolve(undefined)
        })
    })
}
function getUserByInvitedGroupId(groupId) {
    return new Promise(resolve => {
        var Query = dbFirebase.collectionGroup('Users').where('groups', 'array-contains', parseInt(groupId))
        Query.get().then(snapshot => {
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(user => {
                resolve(user.data())
            })
        }).catch(error => {
            console.log(error)
            resolve(undefined)
        })
    })
}
function getUserByInvitationCode(invitationCode) {
    return new Promise(resolve => {
        const group = {
            groupId: -1001687679986,
            groupName: "rostraGroupTest123",
            invitationCode: invitationCode,
        }
        var Query = dbFirebase.collectionGroup('Users').where('groups', 'array-contains', group)
        Query.get().then(snapshot => {
            console.log("snapshot--:", snapshot)
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(subDoc => {
                resolve(subDoc.data())
            })
        })
    })
}
async function getUserByInvitationCode2(invitationCode) {
    const group = {
        groupId: -1001687679986,
        groupName: "rostraGroupTest123",
        invitationCode: invitationCode,
    }
    let Q = await dbFirebase.collectionGroup('Users').where('groups', 'array-contains', group)
    const users = await Q.get()
    await users.forEach(doc => {
        console.log(doc.id, '=>', doc.data())
        return doc.data()
    })
    return undefined
}
async function setUser(chatId, data) {
    const user = await dbFirebase
        .collection("Users")
        .doc(String(chatId))
        .set(data)
    return user
}
async function setMember(userId, data) {
    const member = await dbFirebase
        .collection("Members")
        .doc(String(userId))
        .set(data)
    return member
}
// async function getGroupInfoById(groupId){
//     const group = await dbFirebase
//         .collectionGroup("Groups").where('groupId', '==', groupId)
//         .get()
//     await group.forEach(doc => {
//         return doc.data()
//     })
//     return undefined
// }
async function getGroupInfoById(groupId){
    return new Promise(resolve => {
        var Query = dbFirebase.collectionGroup('Groups').where('groupId', '==', parseInt(groupId))
        Query.get().then(snapshot => {
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(subDoc => {
                resolve(subDoc.data())
            })
        })
    })
}

async function getInvitationInfo(code) {
    const invitation = await dbFirebase
        .collection("Invitations")
        .doc(String(code))
        .get()
    return invitation.data()
}
async function getInvitationByGroupId(groupId) {
    return new Promise(resolve => {
        var Query = dbFirebase.collectionGroup('Invitations').where('groupId', '==', groupId)
        
        Query.get().then(snapshot => {
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(subDoc => {
                resolve(subDoc.id)
            })
        })
    })
}
async function getInvitationByUserId(userId) {
    return new Promise(resolve => {
        var Query = dbFirebase.collectionGroup('Invitations').where('groupId', '==', userId)
        Query.get().then(snapshot => {
            console.log("snapshot--:", snapshot)
            if (snapshot.empty) {
                resolve(undefined)
            }
            snapshot.forEach(subDoc => {
                resolve(subDoc.id)
            })
        })
    })
}
async function updateGroup(chatId, data) {
    const group = await dbFirebase
        .collection("Groups")
        .doc(String(chatId))
        .set(data)
    return group
}
async function addInvitationInfo(code, userId, groupId) {
    const info = await dbFirebase
        .collection("Invitations")
        .doc(String(code))
        .set({ userId: userId, groupId: groupId })
    return info
}


module.exports = {
    getUser,
    setUser,
    getMember,
    setMember,
    getUserByInvitationCode,
    getUserByInvitedGroupId,
    addInvitationInfo,
    updateGroup,
    getGroupInfoById,
    getInvitationInfo,
    getInvitationByUserId,
    getInvitationByGroupId,
    getGroupsList
}
