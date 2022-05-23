const dataSource = process.env.DATASOURCE_TYPE
let { saveMemberInfo,
    getGroupByInvitationCode,
    updateGroupRules,
    deleteGroupRule,
    getGroupMembers,
    getGroups,
    getGroupRules,
    getUserInfo } = require('./userServiceFirestore.js')
if (dataSource === 'mongodb') {
  let  {saveMemberInfo,
    getGroupByInvitationCode,
        updateGroupRules,
        deleteGroupRule,
        getGroupMembers,
        getGroups,
        getGroupRules,
        getUserInfo
} = require('./userServiceMongo.js')
} 

module.exports = {
    saveMemberInfo,
    getGroupByInvitationCode,
    updateGroupRules,
    deleteGroupRule,
    getGroupMembers,
    getGroups,
    getGroupRules,
    getUserInfo
}
