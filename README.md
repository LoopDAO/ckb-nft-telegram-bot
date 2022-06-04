
# start telegram bot

## 1.create .env
Required:
       
* BOT_TOKEN,BOT_USER_NAME:Use botfather to get through the command /newbot
* SERVER_URL: Is the access URL of this program
* FIRESTORE_ENABLE=true to enable firestore 
## 2.create firebase.json
> path:src/firebase/firebase.json 

Reference：
* https://firebase.google.com/docs/firestore/quickstart
* https://firebase.google.com/docs/projects/api-keys
* https://console.cloud.google.com/apis/credentials

## 3.run： yarn start


## 4.Invite members to group
send message to telegram bot:

    1. /start 
    2. click ‘Group Admin’
    3. click ‘Add *** to Group...’
    4. select your Group and click 'Add Bot as Admin'
    5. Return to chat window with Telegram BOT and click "Group Admin" select "*** Group"
    6. Using command to add rule: '/rule 0x*** 1’
    7. Use /group to get 'Invitation Link' and then send it to the user
Use ‘/help’ for more information
