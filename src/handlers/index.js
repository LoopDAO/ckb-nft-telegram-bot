const { Markup, registerReferral } = require('telegraf')
const { registerStartMenu } = require('./registerStartMenu')
const { updateGroupRules, deleteGroupRule } = require('../service/userService')

exports.registerHandlers = async (bot) => {
  await registerStartMenu(bot)

  // TODO: should use mongodb to store user's data
  let groupId = ''
  let groupName = ''
  let network = ''
  let contractAddress = ''
  let nftType = ''
  let minNft = ''

  bot.action('setup', setupGroup)
  bot.action('config', configGroup)
  bot.action(/^groups::(\-\d+)::(.+)$/, showGroupInfo)
  bot.action(/showChat::(\-\d+)/, showChatInfo)
  bot.action('chooseNetwork', chooseNetwork)
  bot.action(/^network::(.+)$/, showNetworkInfo)
  bot.action(/^NFT::(.+)$/, addTokenConfig)
  bot.action(/^deleteConfig::(\-\d+)::(\d+)$/, deleteConfig)

  async function setupGroup(ctx) {
    await ctx.reply(
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      Markup.inlineKeyboard([
        Markup.button.url(
          `Add ${process.env.BOT_NAME} to Group`,
          `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
        )
      ])
    )
  }

  async function configGroup(ctx) {
    // how to get all of the groups that use the bot
    const groupList = ctx.user.groups.map((el, index) => [
      Markup.button.callback(
        `🍏 ${el.groupName}`,
        `groups::${el.groupId}::${el.groupName}`
      )
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
            )
          ]
        ])
      }
    )
  }

  async function showGroupInfo(ctx) {
    // get a specific group info
    const message = `Please choose from options below

Group Id: ${ctx.match[1]}
Group Name: ${ctx.match[2]}
`
    groupId = ctx.match[1]
    groupName = ctx.match[2]
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback(
          '🌻 NFT Permissioned Chat',
          `showChat::${groupId}`
        )
      ])
    })
  }

  async function showChatInfo(ctx) {
    const group = ctx.user.groups.filter((el) => el.groupId === ctx.match[1])[0]

    const invitationLink = `https://t.me/${process.env.BOT_USER_NAME}?start=${group?.invitationCode}`

    await ctx.reply(
      `Here is NFT Permissioned Chat configuration for *${groupName}*
Invite others using [Invitation Link](${invitationLink})`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            '🍀 Add NFT Permissioned Config',
            'chooseNetwork'
          )
        ])
      }
    )
  }

  async function chooseNetwork(ctx) {
    await ctx.reply(`Please choose Nervos network`, {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Lina Mainnet', `network::Lina Mainnet`)],
        [Markup.button.callback('Aggron Testnet', `network::Aggron Testnet`)]
      ])
    })
  }

  async function showNetworkInfo(ctx) {
    network = ctx.match[1]
    await selectNft(ctx, ctx.match[1])
  }

  async function selectNft(ctx, network) {
    await ctx.reply(
      `Groovy! Let’s configure NFT permission for *${groupName}*

Now, choose what kind of membership you want to add to this community.
Please choose NFT type for selected chain *${network}*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('NFT-0', 'NFT::NFT-0'),
          Markup.button.callback('NFT-1', 'NFT::NFT-1')
        ])
      }
    )
  }

  async function addTokenConfig(ctx) {
    nftType = ctx.match[1]
    await ctx.reply(
      `Tell me your NFT details in the format below:

/rule <Contract Address> <Minimum number of NFTs>

for example: /rule 0xABCDED 5`,
      { parse_mode: 'Markdown' }
    )
  }

  async function deleteConfig(ctx) {
    const groupId = ctx.match[1]
    const configIndex = ctx.match[2]
    await deleteGroupRule({ chatId: ctx.chat.id, groupId, configIndex })
    await ctx.reply(`Configuration Deleted.`)
  }

  bot.command('/rule', setNftConfiguration)

  async function setNftConfiguration(ctx) {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    let params = ctx.message?.text?.split(' ')
    //check for incorrect usage
    if (!params || params?.length < 2) {
      const message = `Usage template:

*/rule <Contract Address> <Minimum number of NFTs>*`
      return ctx.replyWithMarkdown(message)
    }
    contractAddress = params[1]
    minNft = Number(params[2])
    // save data to db
    const rules = await updateGroupRules({
      chatId: ctx.chat.id,
      groupId,
      network,
      contractAddress,
      nftType,
      minNft
    })
    await ctx.reply('Congrats!!! Configuration added.')

    const ruleList = rules.map((el, index) => [
      Markup.button.callback(
        `❎ Delete Config ${index + 1}`,
        `deleteConfig::${groupId}::${index}`
      )
    ])
    const ruleTextList = rules
      .map((el, index) => {
        return `${index + 1}. Network: <pre style="color: #ff5500">${
          el.network
        }</pre>
    NFT Type: <b>${el.nftType}</b>
    NFT Address: <pre style="color: #ff5500">${el.address}</pre>
    Min NFT: <b>${el.minQuantity}</b>`
      })
      .join('\n')

    const group = ctx.user.groups.filter((el) => el.groupId === groupId)[0]

    const invitationLink = `https://t.me/${process.env.BOT_USER_NAME}?start=${group?.invitationCode}`

    // doc: https://core.telegram.org/bots/api#formatting-options
    const message = `Here is NFT Permissioned Chat configuration for <b>${groupName}</b>
Invite others using <a href="${invitationLink}">Invitation Link</a>

Below is list of current configuration.

${ruleTextList}
`
    await ctx.reply(message, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        ...ruleList,
        [
          Markup.button.callback(
            '🍀 Add NFT Permissioned Config',
            'chooseNetwork'
          )
        ]
      ])
    })
  }

  // when a user wants to chat with this bot through invitation link
  // https://core.telegram.org/bots#deep-linking
  bot.hears(/^\/start[ =](.+)$/, (ctx) => registerReferral(ctx.match[1]))

  return bot
}
