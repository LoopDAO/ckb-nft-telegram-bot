const User = require('../models/user')

exports.getUserInfo = async (ctx) => {
  try {
    console.log('getUserInfo ctx.update...', ctx.update)
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
        user = await new User(userModel).save()
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
            { groupId: chat.id, groupName: chat.title }
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

exports.updateGruopRules = async (data) => {
  const { chatId, groupId, network, nftType, contractAddress, minNft } = data
  console.log('updateGruopRules data...', data)
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
    console.log('newRules...', newRules)
    await User.updateOne(
      { 'chatId': chatId, 'groups.groupId': groupId },
      { 'groups.$.configurations': newRules }
    )
    return newRules
  }
}

exports.deleteGruopRule = async (data) => {
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
