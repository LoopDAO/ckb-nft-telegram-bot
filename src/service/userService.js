const { v4: uuidV4 } = require('uuid')
const User = require('../models/user')
const Member = require('../models/member')

exports.getUserInfo = async (ctx) => {
  try {
    const chat = ctx.chat
    if (chat.type === 'private') {
      const sender = ctx.from
      let user = await User.findOne({ chatId: ctx.chat?.id })
      if (!user) {
        const userModel = new User({
          firstName: sender?.first_name,
          lastName: sender?.last_name,
          username: sender?.username,
          isBot: sender?.is_bot,
          chatId: ctx.chat?.id
        })
        user = await userModel.save()
      }
      return user
    } else {
      let user = await User.findOne({ chatId: ctx.from?.id })
      if (user) {
        let index = user.groups.findIndex(
          (el) => el.groupId === chat.id.toString()
        )
        if (index === -1) {
          user.groups = [
            ...user.groups,
            {
              groupId: chat.id,
              groupName: chat.title,
              invitationCode: uuidV4()
            }
          ]
          user = await user.save()
        }
      }
      return user
    }
  } catch (error) {
    console.log('error', error)
  }
}

exports.updateGroupRules = async (data) => {
  const { chatId, groupId, network, nftType, contractAddress, minNft } = data
  console.log('groupId...', groupId)
  let user = await User.findOne({ chatId })
  if (!user) return
  if (user) {
    let group = user.groups.find((el) => el.groupId === groupId)
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
          minQuantity: minNft
        }
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
    await User.updateOne(
      { 'chatId': chatId, 'groups.groupId': groupId },
      { 'groups.$.configurations': newRules }
    )
    return newRules
  }
}

exports.deleteGroupRule = async (data) => {
  const { chatId, groupId, configIndex } = data
  let user = await User.findOne({ chatId })
  if (!user) return
  console.log('configIndex...', configIndex)
  if (user) {
    let group = user.groups.find((el) => el.groupId === groupId)
    let newRules = [
      ...group.configurations.slice(0, configIndex),
      ...group.configurations.slice(configIndex + 1)
    ]
    console.log('delete newRules...', newRules)
    await User.updateOne(
      { 'chatId': chatId, 'groups.groupId': groupId },
      { 'groups.$.configurations': newRules }
    )
  }
}

exports.getGroupInfo = async (invitationCode) => {
  const user = await User.findOne({ 'groups.invitationCode': invitationCode })
  const group = user.groups.filter(
    (el) => el.invitationCode === invitationCode
  )[0]
  if (group) return group
}

exports.saveMemberInfo = async (data) => {
  try {
    let member = await Member.findOne({
      userId: data.userId,
      groupId: data.groupId
    })
    if (!member) {
      const memberModal = new Member(data)
      await memberModal.save()
    }
  } catch (err) {
    console.log('saveMemberInfo err...', err)
  }
}

exports.saveMemberInfo = async (data) => {
  try {
    let member = await Member.findOne({
      userId: data.userId,
      groupId: data.groupId
    })
    if (!member) {
      const memberModal = new Member(data)
      await memberModal.save()
    }
  } catch (err) {
    console.log('saveMemberInfo err...', err)
  }
}

exports.getGroupMembers = async (groupId) => {
  try {
    return await Member.find({ groupId })
  } catch (err) {
    console.log('getGroups err...', err)
  }
}

exports.getGroups = async (data) => {
  try {
    let users = await User.find()
    if (users) {
      let groups = users.reduce((sum, el) => {
        if (el.groups.length > 0) {
          return [...sum, ...el.groups]
        }
        return sum
      }, [])
      return groups
    }
  } catch (err) {
    console.log('getGroups err...', err)
  }
}

exports.getGroupRules = async (groupId) => {
  try {
    let user = await User.findOne({ 'groups.groupId': groupId })
    console.log('user...', user)
    if (user) {
      console.log('user.groups...', user.groups)
      const group = user.groups.filter((el) => el.groupId === groupId)[0]
      return group?.configurations
    }
  } catch (err) {
    console.log('getGroupRules err...', err)
  }
}
