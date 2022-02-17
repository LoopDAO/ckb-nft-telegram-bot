const { Markup, registerReferral } = require('telegraf')
const { v4: uuidV4 } = require('uuid')
const { registerStartMenu } = require('./registerStartMenu')

exports.registerHandlers = async (bot) => {
  console.log('registerHandlers...')
  await registerStartMenu(bot)

  // should use mongodb to store user's data
  let userId = ''
  let groupId = ''
  let groupName = ''
  let network = ''
  let contractAddress = ''
  let minNft = ''

  bot.action('setup', setupGroup)
  bot.action('config', configGroup)
  bot.action('groupAdmin', groupAdmin)
  bot.action('showGroup', showGroupInfo)
  bot.action('showChat', showChatInfo)
  bot.action('chooseNetwork', chooseNetwork)
  bot.action('selectMainnet', selectMainnet)
  bot.action('selectTestnet', selectTestnet)
  bot.action('addTokenConfig', addTokenConfig)
  bot.action('deleteConfig', deleteConfig)

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
    console.log('configGroup userId....', userId)
    await ctx.telegram.sendMessage(
      userId,
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback(`🍏 ${groupName}`, 'showGroup')],
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

  async function groupAdmin(ctx) {
    await ctx.reply(
      `Please add me to the group as admin. Once added I'll help you to setup NFT holders chat room.`,
      Markup.inlineKeyboard([
        [Markup.button.callback(`🍏 ${groupName}`, 'showGroup')],
        [
          Markup.button.url(
            `Add ${process.env.BOT_NAME} to Group`,
            `https://t.me/${process.env.BOT_USER_NAME}?startgroup=c`
          )
        ]
      ])
    )
  }

  async function showGroupInfo(ctx) {
    // get a specific group info
    const message = `Please choose from options below

Group Id: ${groupId}
Group Name: ${groupName}
`
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        Markup.button.callback('🌻 NFT Permissioned Chat', 'showChat')
      ])
    })
  }

  async function showChatInfo(ctx) {
    // TODO: should bind invite link with nft configuration
    await ctx.reply(
      `Here is NFT Permissioned Chat configuration for *${groupName}*
Invite others using [Invitation Link](https://t.me/${
        process.env.BOT_USER_NAME
      }?start=${uuidV4()})`,
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
        [Markup.button.callback('Lina Mainnet', 'selectMainnet')],
        [Markup.button.callback('Aggron Testnet', 'selectTestnet')]
      ])
    })
  }

  async function selectNft(ctx, network) {
    await ctx.reply(
      `Groovy! Let’s configure NFT permission for *${groupName}*

Now, choose what kind of membership you want to add to this community.
Please choose NFT type for selected chain *${network}*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('NFT-0', 'addTokenConfig'),
          Markup.button.callback('NFT-1', 'addTokenConfig')
        ])
      }
    )
  }

  async function selectMainnet(ctx) {
    network = 'Lina Mainnet'
    await selectNft(ctx, network)
  }

  async function selectTestnet(ctx) {
    network = 'Aggron Testnet'
    await selectNft(ctx, network)
  }

  async function addTokenConfig(ctx) {
    console.log('addTokenConfig ctx.update...', ctx.update)
    await ctx.reply(
      `Tell me your NFT details in the format below:

/rule <Contract Address> <Minimum number of NFTs>

for example: /rule 0xABCDED 5`,
      { parse_mode: 'Markdown' }
    )
  }

  async function deleteConfig(ctx) {
    await ctx.reply(`Configuration Deleted.`)
  }

  bot.command('/rule', setNftConfiguration)
  async function setNftConfiguration(ctx) {
    let params = ctx.message?.text?.split(' ')
    //check for incorrect usage
    if (!params || params?.length < 2) {
      const message = `Usage template: 

*/rule <Contract Address> <Minimum number of NFTs>*`
      return ctx.replyWithMarkdown(message)
    }
    contractAddress = params[1]
    minNft = Number(params[2])
    await ctx.reply('Congrats!!! Configuration added.')
    const message = `Here is NFT Permissioned Chat configuration for DemoBot
Invite others using [Invitation Link]()

Below is list of current configuration.

1. Network: <pre style="color: #ff5500">${network}</pre>
NFT Type: <b>NFT-0</b>
NFT Address: <pre style="color: #ff5500">${contractAddress}</pre>
Min NFT: <b>${minNft}</b>
`
    await ctx.reply(message, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('❎ Delete Config 1', 'deleteConfig')],
        [
          Markup.button.callback(
            '🍀 Add NFT Permissioned Config',
            'chooseNetwork'
          )
        ]
      ])
    })
  }

  // when a user wants to join group through invitation link
  // https://core.telegram.org/bots#deep-linking
  bot.hears(/^\/start[ =](.+)$/, (ctx) => registerReferral(ctx.match[1]))

  return bot
}
