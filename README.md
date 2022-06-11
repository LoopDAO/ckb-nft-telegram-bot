
# CKB NFT Telegram Bot

This project is a telegram bot used as a gate keeper of telegram group.

## Features
Admin
- Setup rules of NFT holdings
- Support multiple NFT addresses, use `OR` and `And` command to specify
- Generate invitation link for group

User
- Join telegram by invitation link if they hold specified NFT by group admin

## How to run

### 0. Create your bot
[BotFather](https://t.me/botfather) is the official manager, it will help you create new bots and change settings for existing ones.

Message [BotFather](https://t.me/botfather) with `/newbot` command to create your own bot.

Refer to [telegram's doc](https://core.telegram.org/bots#6-botfather) for more information.

### 1. Config env
```bash
cp .env examples .env.dev
```

env list:

```bash
# You can get them from last step
BOT_TOKEN=TOKEN_GOT_FROM_TELEGRAM_BOT_INITIAL_SETTING
BOT_USER_NAME=YOUR_BOT_USER_NAME
BOT_NAME=YOUR_BOT_NAME

# Is the public URL of this service, which needs to be accessible from public world. You can use [ngrok](https://ngrok.com/) to test locally
SERVER_URL=SERVER_URL_WHERE_BOT_IS_RUNNING

#enable firestore and auto disenable MONGODB_URL
FIRESTORE_ENABLE=true

# use to encrypt data in between your server and telegram api
TOKEN_SECRET=123456PASSword

CHAIN_TYPE=testnet
LISTEN_PORT=3000
```

### 2. Config firebase

First, generate a private key file for your service account:
1. In the Firebase console, open Settings > [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk).
2. Click Generate New Private Key, then confirm by clicking Generate Key.
3. Securely store the JSON file containing the key.

More information refer to [this document](https://firebase.google.com/docs/admin/setup#initialize-sdk)

Then, save the file, name the file as `firebase.json` and put it into `src/firebase/` folder

### 3. Start bot service

```bash
yarn start
```

### 4. Invite members to group
send message to telegram bot:

    1. /start 
    2. click ‘Group Admin’
    3. click ‘Add *** to Group...’
    4. select your Group and click 'Add Bot as Admin'
    5. Return to chat window with Telegram BOT and click "Group Admin" select "*** Group"
    6. Using command to add rule: '/rule 0x*** 1’
    7. Use /group to get 'Invitation Link' and then send it to the user
Use ‘/help’ for more information

### Required environment
- node version: "^12.20.0 || >=14.13.1"
- firestroe index：
       Groups -》 groupId
       Users -》userId
       Invitations -》groupId
