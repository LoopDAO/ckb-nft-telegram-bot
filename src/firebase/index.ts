const { UserFirestore } = require('../shared/firestoreTypes.js')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require("./firebase.json")
const { initializeApp, cert, arrayContains } = require('firebase-admin/app')
const firebaseConfig = {
    credential: cert(serviceAccount)
}
const app = initializeApp(firebaseConfig)
const dbFirebase = getFirestore(app)
dbFirebase.settings({ ignoreUndefinedProperties: true }) // ignore undefined properties

async function isFirestoreAvialable() {
    return new Promise((resolve, reject) => {
        dbFirebase.collection("Users").get().then(() => {
            resolve(true)
        }).catch(() => {
            resolve(false)
        })
    })
}

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
// bot.context = {
//     groupId: "",
//     groupName: "",
//     network:
//       process.env.CHAIN_TYPE == "testnet" ? "Aggron Testnet" : "Lina Mainnet",
//     contractAddress: "",
//     nftType: "NFT-0",
//     minNft: "",
//   }
async function syncBotInfo(bot) {
    let context = bot.context
    const Doc = bot.token + "__" + context.userId
    let info = await dbFirebase
        .collection("Bot-User")
        .doc(Doc)
        .get()
    if (info.exists) {
        info = info.data()
        console.log("firebase bot info:", info)
        if (context?.groupId?.length > 0) info.groupId = context.groupId
        if (context?.groupName?.length > 0)    info.groupName = context.groupName
        if (context?.network?.length > 0) info.network = context.network
        if (context?.contractAddress?.length > 0) info.contractAddress = context.contractAddress
        if (context?.nftType?.length > 0) info.nftType = context.nftType
        if (context?.minNft?.length > 0) info.minNft = context.minNft
        if (context?.userId?.length > 0) info.userId = context.userId
        if (context?.token?.length > 0) info.token = context.token
    } else
        info = context
    
    await dbFirebase
        .collection("Bot-User")
        .doc(Doc)
        .set(info)
    return info
}

async function getMember(userId, groupId) {
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

async function getGroupInfoById(groupId) {
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
    if(data.condition==undefined)data.condition="AND"
    const group = await dbFirebase
        .collection("Groups")
        .doc(String(chatId))
        .set(data)
    return data
}
async function addInvitationInfo(code, userId, groupId) {
    const info = await dbFirebase
        .collection("Invitations")
        .doc(String(code))
        .set({ userId: userId, groupId: groupId })
    return info
}


module.exports = {
    isFirestoreAvialable,
    getUser,
    setUser,
    getMember,
    setMember,
    getUserByInvitedGroupId,
    addInvitationInfo,
    updateGroup,
    getGroupInfoById,
    getInvitationInfo,
    getInvitationByUserId,
    getInvitationByGroupId,
    getGroupsList,
    syncBotInfo
}
