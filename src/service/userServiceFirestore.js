const { v4: uuidV4 } = require("uuid")
const { UserFirestore } = require("./../shared/firestoreTypes")
const {
  getUser,
  setUser,
  getUserByInvitedGroupId,
  updateGroup,
  addInvitationInfo,
  getGroupByInvitationCode,
  getInvitationInfo,
  getGroupInfoById,
  getGroupsList,
  getMember,
  setMember,
} = require("../firebase/index.ts")

exports.getUserInfo = async (ctx) => {
  try {
    const chat = ctx.chat
    if (chat.type === "private") {
      const sender = ctx.from

      let user = await getUser(ctx.chat?.id)
      console.log("chat private getUserInfo user...", user)
      if (!user.exists) {
        u = {
          userId: sender.id,
          firstName: sender.first_name,
          lastName: sender.last_name,
          username: sender?.username,
          isBot: sender.is_bot,
          groups: [],
        }
        user = await setUser(ctx.chat?.id, u)
        console.log("save user...", u)
        return u
      }

      return user?.data()
    } else {
      let user = await getUser(ctx.from?.id)
      if (user.exists) {
        user = user.data()
        let index = user?.groups?.findIndex((el) => el === chat.id)
        //if user not in group yet then add user to group,invitation and return user
        if (index === -1) {
          let group = {
            groupId: chat.id,
            groupName: chat.title,
            groupType: chat.type,
            groupMembers: [],
            configurations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          updateGroup(chat.id, group)
          addInvitationInfo(uuidV4(), user.userId, group.groupId)
          user.groups = [...user.groups, chat.id]
          await setUser(ctx.from?.id, user)
        }
        return user
      }
      return user.data()
    }
  } catch (error) {
    console.log("error", error)
  }
}

exports.updateGroupRules = async (data) => {
  const { chatId, groupId, network, nftType, contractAddress, minNft } = data
  console.log("updateGroupRules groupId...", groupId)
  let user = await getUser(chatId)
  if (!user.exists) return
  user = user.data()
  if (user && groupId) {
    let group = await getGroupInfoById(groupId)
    let rules = group.configurations
    const index = rules?.findIndex(
      (el) =>
        el.network === network &&
        el.address === contractAddress &&
        el.nftType === nftType &&
        el.minQuantity === minNft
    )
    if (index !== -1) return rules

    const index1 = rules.findIndex(
      (el) =>
        el.network === network &&
        el.address === contractAddress &&
        el.nftType === nftType
    )
    let newRules = []
    if (index1 === -1) {
      newRules = [
        ...rules,
        {
          network,
          nftType: nftType,
          address: contractAddress,
          minQuantity: minNft,
        },
      ]
    } else {
      newRules = rules.map((el) => {
        if (
          el.network === network &&
          el.address === contractAddress &&
          el.nftType === nftType
        ) {
          if (el.minQuantity !== minNft) {
            el.minQuantity = minNft
          }
          return el
        }
        return el
      })
    }
    group.configurations = newRules
    group.updatedAt = new Date()
    await updateGroup(groupId, group)
    return newRules
  } else {
    console.log("updateGroupRules error...")
  }
}

exports.deleteGroupRule = async (data) => {
  const { chatId, groupId, configIndex } = data

  let group = await getGroupInfoById(groupId)
  if (group) {
    // let newRules = [
    //   ...group.configurations.slice(0, configIndex),
    //   ...group.configurations.slice(configIndex + 1),
    // ]
    // console.log("delete newRules...", newRules)
    // group.configurations = newRules
    group.configurations.splice(configIndex, 1)
    await updateGroup(groupId, group)
    return group
  }
}

exports.getGroupByInvitationCode = async (invitationCode) => {
  try {
    const code = await getInvitationInfo(invitationCode)
    if (code) {
      return await getGroupInfoById(code.groupId)
    }
  } catch (error) {
    console.log("error", error)
  }
}

exports.saveMemberInfo = async (data) => {
  try {
    let member = await getMember(data.userId, data.groupId)
    if (!member) {
      console.log("saveMemberInfo...", data)
      await setMember(data.userId, data)
    }
  } catch (err) {
    console.log("saveMemberInfo err...", err)
  }
}

exports.getGroupMembers = async (groupId) => {
  try {
    return await getMembersBuGroupId(groupId)
  } catch (err) {
    console.log("getGroups err...", err)
  }
}

exports.getGroups = async (data) => {
  try {
    return await getGroupsList()
    // let users = await User.find()
    // if (users) {
    //   let groups = users.reduce((sum, el) => {
    //     if (el.groups.length > 0) {
    //       return [...sum, ...el.groups]
    //     }
    //     return sum
    //   }, [])
    //   return groups
    // }
  } catch (err) {
    console.log("getGroups err...", err)
  }
}

exports.getGroupRules = async (_groupId) => {
  try {
    let user = await getUserByInvitedGroupId(_groupId)
    if (user) {
      const groupId = user.groups.filter((el) => el === _groupId)[0]
      const group = await getGroupInfoById(groupId)
      return group?.configurations
    }
  } catch (err) {
    console.error("getGroupRules err...", err)
  }
}
