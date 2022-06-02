const { Markup, registerReferral } = require("telegraf")
const { registerStartMenu } = require("./registerStartMenu")
const {
  getGroupInfoById,
  getInvitationByGroupId,
    syncBotInfo,
    updateGroup
} = require("../firebase/index.ts")
const {
  updateGroupRules,
  deleteGroupRule,
} = require("../service/userService.ts")

exports.registerHandlers = async (bot) => {
  await registerStartMenu(bot)

  bot.action("setup", setupGroup)
  bot.action("config", configGroup)

  bot.action(/^setRuleCondition::(.+)$/, setRuleCondition)

  bot.action(/^groups::(\-\d+)::(.+)$/, showGroupInfo)
  bot.action(/showChat::(\-\d+)/, showChatInfo)
  bot.action("chooseNetwork", chooseNetwork)
  bot.action(/^network::(.+)$/, showNetworkInfo)
  bot.action(/^NFT::(.+)$/, addTokenConfig)
  bot.action(/addTokenConfig::(.+)$/, addTokenConfig)
  bot.action(/^deleteConfig::(\-\d+)::(\d+)$/, deleteConfig)

  async function setupGroup(ctx) {
    await ctx.reply(
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      Markup.inlineKeyboard([
        Markup.button.url(
          `Add ${process.env.BOT_NAME} to Group`,
          `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
        ),
      ])
    )
  }

  async function configGroup(ctx) {
    // how to get all of the groups that use the bot
    const groupList = ctx.user.groups.map((el, index) => [
      Markup.button.callback(
        `🍏 ${el.groupName}`,
        `groups::${el.groupId}::${el.groupName}`
      ),
    ])
    await ctx.telegram.sendMessage(
      ctx.user.chatId,
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      {
        ...Markup.inlineKeyboard([
          ...groupList,
          [
            Markup.button.url(
              `Add ${process.env.BOT_NAME} to Group`,
              `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
            ),
          ],
        ]),
      }
    )
  }
  async function setRuleCondition(ctx) {
    condition = String(ctx.match[1])
    condition = String(condition?.toLowerCase() === "and" ? "AND" : "OR")
    next = String(condition?.toLowerCase() === "and" ? "OR" : "AND")
    console.log("setRuleCondition:", condition)
      if (bot.context.groupId === undefined) {
          bot.context =await syncBotInfo(bot)
        }
      const group = await getGroupInfoById(bot.context.groupId)
      console.log("setRuleCondition:", group,bot.context)
    group.condition = condition
    updateGroup(group.groupId, group)

    await ctx.reply(`All rule conditions have been set to "${condition}".`, {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback(
          `🌻Set all rules condition to "${next}"`,
          `setRuleCondition::${next}`
        ),
      ]),
    })
  }
  async function showGroupInfo(ctx) {
    // get a specific group info
    const message = `Please choose from options below

    Group Id: ${ctx.match[1]}
    Group Name: ${ctx.match[2]}
    `
    bot.context.groupId = ctx.match[1]
    bot.context.groupName = ctx.match[2]
    syncBotInfo(bot)

    await ctx.reply(message, {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback(
          "🌻 NFT Permissioned Chat",
          `showChat::${bot.context.groupId}`
        ),
      ]),
    })
  }

  async function showChatInfo(ctx) {
    let groupId = ctx.user.groups.filter(
      async (groupId) => String(groupId) === String(ctx.match[1])
    )[0]
    const invitationCode = await getInvitationByGroupId(groupId)
    const invitationLink = `https://t.me/${process.env.BOT_USER_NAME}?start=${invitationCode}`
    await ctx.reply(
      `Here is NFT Permissioned Chat configuration for *${bot.context.groupName}*
    Invite others using [Invitation Link](${invitationLink})`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            "🍀 Add NFT Permissioned Config",
            "addTokenConfig::NFT-0"
          ),
        ]),
      }
    )
  }

  async function chooseNetwork(ctx) {
    await ctx.reply(`Please choose Nervos network`, {
      ...Markup.inlineKeyboard([
        [Markup.button.callback("Lina Mainnet", `network::Lina Mainnet`)],
        [Markup.button.callback("Aggron Testnet", `network::Aggron Testnet`)],
      ]),
    })
  }

  async function showNetworkInfo(ctx) {
    bot.context.network = ctx.match[1]
    await selectNft(ctx, ctx.match[1])
    syncBotInfo(bot)
  }

  async function selectNft(ctx, network) {
    await ctx.reply(
      `Groovy! Let’s configure NFT permission for *${bot.context.groupName}*

        Now, choose what kind of membership you want to add to this community.
        Please choose NFT type for selected chain *${network}*`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          Markup.button.callback("NFT-0", "NFT::NFT-0"),
          Markup.button.callback("NFT-1", "NFT::NFT-1"),
        ]),
      }
    )
  }

  async function addTokenConfig(ctx) {
    bot.context.nftType = ctx.match[1]
    syncBotInfo(bot)
    await ctx.reply(
      `Tell me your NFT details in the format below:

        /rule <Contract Address> <Minimum number of NFTs>

        for example: /rule 0xABCDED 5`,
      { parse_mode: "Markdown" }
    )
  }
  async function viewGroupTokenConfig(ctx, group) {
    const ruleList = group.configurations.map((el, index) => [
      Markup.button.callback(
        `❎ Delete Config ${index + 1}`,
        `deleteConfig::${group.groupId}::${index}`
      ),
    ])
    const ruleTextList = group.configurations
      .map((el, index) => {
        console.log("viewGroupTokenConfig:", el)
        return `${index + 1}. Network: <pre style="color: #ff5500">${
          el.network
        }</pre>
      NFT Address: <pre style="color: #ff5500">${el.address}</pre>
      Min NFT: <b>${el.minQuantity}</b>`
      })
      .join(
        `\n <pre style="color: #ff5500">---${group.condition}---</pre> \n`
      )

    const groupX = ctx.user.groups.filter((el) => el.groupId === group.groupId)[0]

    const invitationLink = `https://t.me/${process.env.BOT_USER_NAME}?start=${groupX?.invitationCode}`

    // doc: https://core.telegram.org/bots/api#formatting-options
    const message = `Here is NFT Permissioned Chat configuration for <b>${bot.context.groupName}</b>
  Invite others using <a href="${invitationLink}">Invitation Link</a>

  Below is list of current configuration.

  ${ruleTextList}
  `
    await ctx.reply(message, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        ...ruleList,
        [
          Markup.button.callback(
            "🍀 Add NFT Permissioned Config.",
            "addTokenConfig::NFT-0"
          ),
        ],
      ]),
    })
  }
  async function deleteConfig(ctx) {
    console.log("deleteConfig:", ctx.match[1], ctx.match[2])
    const groupId = ctx.match[1]
    const configIndex = ctx.match[2]
    const group = await deleteGroupRule({
      chatId: ctx.chat.id,
      groupId,
      configIndex,
    })
    await ctx.reply(`Configuration Deleted.`)
    const rules = []
    if (group.configurations) {
      group.configurations.forEach((el) => {
        rules.push(el)
      })
    }
    viewGroupTokenConfig(ctx, group)
  }

  bot.command("/rule", setNftConfiguration)

  bot.command("/group", showGroupInfo)

  bot.command("/rules", getNftConfiguration)

  async function setNftConfiguration(ctx) {
    console.log("command:", ctx.message.text)
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    let params = ctx.message?.text?.split(" ")
    //check for incorrect usage
    if (!params || params?.length < 3) {
      const message = `Usage template:

    */rule <Contract Address> <Minimum number of NFTs>*`
      return ctx.replyWithMarkdown(message)
    }

    console.log("params:", params)

    bot.context.contractAddress = params[1]
    bot.context.minNft = params[2]
    bot.context = await syncBotInfo(bot)
    console.log("---bot.context=", bot.context)
    // save data to db
    console.log(
      "save Rule groupId,nftType:",
      bot.context.groupId,
      bot.context.nftType
    )
    if (!bot.context.groupId || !bot.context.nftType) {
      return ctx.reply(
        `Please use "/start" and "Group Admin" to choose Group and NFT type`
      )
    }
    const group = await updateGroupRules({
      chatId: ctx.chat.id,
      groupId: bot.context.groupId,
      network: bot.context.network,
      contractAddress: bot.context.contractAddress,
      nftType: bot.context.nftType,
      minNft: bot.context.minNft,
    })
    await ctx.reply("Congrats!!! Configuration added.")
    viewGroupTokenConfig(ctx, group)
  }
  async function getNftConfiguration(ctx) {
    console.log("command:", ctx.message.text)
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    bot.context = await syncBotInfo(bot)
    console.log("--bot.context=", bot.context)
    ctx.user.groups.filter(async (groupId) => {
      const group = await getGroupInfoById(groupId)
      const rules = []
      if (group.configurations) {
        console.log("groupName:", group.groupName)
        group.configurations.forEach((el) => {
          rules.push(el)
        })
        viewGroupTokenConfig(ctx, group)
      }
    })
  }
  // when a user wants to chat with this bot through invitation link
  // https://core.telegram.org/bots#deep-linking
  bot.hears(/^\/start[ =](.+)$/, (ctx) => registerReferral(ctx.match[1]))

  return bot
}
