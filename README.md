
# CKB NFT Telegram Bot

This project is a telegram bot used as a gate keeper of telegram group.

## Features

Note: Currently it only supports NFT issued by [CoTA SDK](https://github.com/nervina-labs/cota-sdk-js)

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

Required environment:
- Nodejs version: "^12.20.0 || >=14.13.1"
- Firestroe index setup：
       Groups -> groupId
       Users -> userId
       Invitations -> groupId

### 4. Invite members to group

Interact with your bot to invite and verify new members to your group.

1. Send command/message to bot: `/start`

![2022-06-11 at 18 19](https://user-images.githubusercontent.com/1963646/173183828-0ff96e28-01b7-4334-9114-259ceec16f92.png)

2. Click `Group Admin`

![2022-06-11 at 18 20](https://user-images.githubusercontent.com/1963646/173183846-359529c5-3af3-46a2-95fe-bc12771ea43e.png)

3. Click `Add xxx to Group...`, then select a group from the group list

![2022-06-11 at 18 22](https://user-images.githubusercontent.com/1963646/173183894-d10af97d-bb7c-47ad-ad99-74d7c30dfb33.png)

Then you need to set the bot as group admin in your group settings. The menu path is `Group info > Manage group > Administrators > Add Administrators`

![2022-06-11 at 18 26](https://user-images.githubusercontent.com/1963646/173183995-0ad04427-45c5-4523-8f3f-99fce4a84499.png)

4. Click your bot name from menu, it will show `Invitation Link` and `Add NFT Permissioned Config` button.

![2022-06-11 at 18 45](https://user-images.githubusercontent.com/1963646/173184573-9f12e3b3-ee89-43e1-81a6-79bb2654ba1f.png)

5. Click `Add NFT Permissioned Config` button, it will show how to add NFT rule

```
Tell me your NFT details in the format below:

        /rule <Contract Address> <Minimum number of NFTs>

        for example: /rule 0xABCDED 5
```

Then add your rule, for example:

![2022-06-11 at 18 48](https://user-images.githubusercontent.com/1963646/173184667-b00a7016-0655-4969-9547-9fa7f49865af.png)


6. Use `/group` command to get 'Invitation Link' and then send it to the user

8. Use `/settings` command to get current bot settings
![2022-06-11 at 18 51](https://user-images.githubusercontent.com/1963646/173184792-de5d4b2b-1366-4de5-ada2-a78255078559.png)

Use `Set all rules condition to "And"` and `Set all rules condition to "OR"` to handle multiple rules. Below is an example of adding another rule after `OR` rule enabled:

![2022-06-11 at 18 59](https://user-images.githubusercontent.com/1963646/173185107-609d50c6-e0a2-4513-b6e5-c80bed433bd2.png)


**Use `/help` to get all commands.**

![2022-06-11 at 19 00](https://user-images.githubusercontent.com/1963646/173185127-9236a55b-c855-4e4c-85e1-52dbbb5f7669.png)

## License
MIT
