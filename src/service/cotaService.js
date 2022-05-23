const { Aggregator } = require("@nervina-labs/cota-sdk")
const {
  addressToScript,
  serializeScript,
} = require("@nervosnetwork/ckb-sdk-utils")
const {
  getGroupRules,
  getGroups,
  getGroupMembers,
} = require("./userService.ts")

const service = {
  aggregator: new Aggregator({
    // registryUrl: 'http://cota-registry-aggregator.rostra.xyz',
    // cotaUrl: 'http://cota-aggregator.rostra.xyz',
    registryUrl: "https://cota.nervina.dev/registry-aggregator",
    cotaUrl: "https://cota.nervina.dev/aggregator ",
  }),
}

const getCotaCount = async (account, contractAddress) => {
  const aggregator = service.aggregator
  const lockScript = serializeScript(addressToScript(account))
  const params = { lockScript, cotaId: contractAddress }
  const cotaCount = await aggregator.getCotaCount(params)

  console.log("cotaCount...", cotaCount)
  return cotaCount?.count
}

const isQualified = async (account, groupId) => {
  const rules = await getGroupRules(groupId)
  if (!rules||rules.length<=0) return false
  for (let i = 0; i < rules.length; i++) {
    const rs = await getCotaCount(account, rules[i].address)
    if (!rs || rs.count < rules[i].minQuantity) {
      return false
    }
  }
  return true
}

// get all groups
const banGroupMembers = async (bot) => {
  const groups = await getGroups()
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const rules = group.configurations
    const members = await getGroupMembers(group.groupId)
    let users = []
    for (let i = 0; i < members.length; i++) {
      for (let j = 0; j < rules.length; j++) {
        const rs = await getCotaCount(members[i], rules[i].address)
        if (!rs || rs.count < rules[i].minQuantity) {
          users.push({ userId: members[i], groupId: group.groupId })
          break
        }
      }
    }
    let arr = []
    for (let i = 0; i < users.length; i++) {
      arr.push(bot.telegram.banChatMember(users[i].groupId, users[i].userId))
    }
    await Promise.all(arr)
  }
  return true
}

module.exports = {
  getCotaCount,
  isQualified,
  banGroupMembers,
}
