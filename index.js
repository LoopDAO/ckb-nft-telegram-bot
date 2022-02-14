require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const fs = require('fs')

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)

// should use mongodb to store user's data
let userId = ''
let groupId = ''
let groupName = ''
let network = ''

bot.start(async (ctx) => {
  console.log('ctx.update.message...', ctx.update.message)
  const chat = ctx.chat
  if (chat.type === 'private') {
    const username = ctx.from.username
    let message = `<b>Welcome to ${process.env.BOT_NAME} ${username}</b>! I am your bot. I am here to help manage your groups and NFT holders. Choose below to get started.`
    let inlineButtons = []
    if (groupId !== '') {
      inlineButtons = [Markup.button.callback(`🍃 Group Admin`, 'groupAdmin')]
    } else {
      inlineButtons = [
        Markup.button.callback(`🍋 Setup NFT Holders Group`, 'setup')
      ]
    }
    return await ctx.replyWithAnimation(
      { source: fs.readFileSync('./assets/robot.gif') },
      {
        caption: message,
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(inlineButtons)
      }
    )
    // return await ctx.replyWithHTML(
    //   message,
    //   Markup.inlineKeyboard(inlineButtons)
    // )
  }
  const startPayload = ctx.startPayload

  if (startPayload === 'c') {
    const message = `Thank you for adding me to the group. Please make sure to promote me as an administrator.`
    userId = ctx.from.id
    groupId = chat.id
    groupName = chat.title
    await ctx.reply(message)
    await ctx.telegram.sendMessage(
      ctx.from.id,
      message,
      Markup.inlineKeyboard([
        Markup.button.callback('🌸 Config NFT Holders Group', 'config')
      ])
    )

    // should record group info
  }
})

bot.action('setup', setupGroup)
bot.action('config', configGroup)
bot.action('groupAdmin', groupAdmin)
bot.action('showGroup', showGroupInfo)
bot.action('showChat', showChatInfo)
bot.action('chooseNetwork', chooseNetwork)
bot.action('selectMainnet', selectMainnet)
bot.action('selectTestnet', selectTestnet)
bot.action('addTokenConfig', addTokenConfig)

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
  // https://core.telegram.org/bots/api#formatting-options
  await ctx.reply(
    `Here is NFT Permissioned Chat configuration for *${groupName}*
Invite others using [Invitation Link](https://t.me/${process.env.BOT_USER_NAME}?start=xxx)`,
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
<Contract Address> <Minimum number of NFTs>
i.e 0xABCDED 5`,
    { parse_mode: 'Markdown' }
  )
}

// register global error handler to prevent the bot from stopping after an exception
bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.launch()
