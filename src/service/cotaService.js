const { Aggregator } = require("@nervina-labs/cota-sdk")
const {
  addressToScript,
  serializeScript,
} = require("@nervosnetwork/ckb-sdk-utils")
const {
  getGroups,
  getGroupMembers,
} = require("./userService.ts")
const {
    getGroupInfoById,
}= require("../firebase/index.ts")

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
  const group = await getGroupInfoById(groupId)
  const rules = group.configurations
  //const rules = await getGroupRules(groupId)
  if (!rules || rules.length <= 0) {
    console.log("no rules...", groupId)
    return false
  }
  condition = group.condition ?? "and"
  console.log("condition...", condition)
  for (let i = 0; i < rules.length; i++) {
    const rs = await getCotaCount(account, rules[i].address)
    console.log("getCotaCount...", rs, rules[i].address, rules[i].minQuantity)

    if (condition.toLowerCase() === "and") {
      if (!rs || rs.count < rules[i].minQuantity) {
        console.log("not qualified...", i, rs, rules[i].minQuantity)
        return false
      }
    } else {
      if (rs && rs.count >= rules[i].minQuantity) {
        console.log("qualified...", i, rs, rules[i].minQuantity)
        return true
      }
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
