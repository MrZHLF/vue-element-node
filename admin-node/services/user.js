const {
    querySql,
    queryOne
} = require('../db')

// 登录
function login(username, password) {
    const sql = `select * from admin_user where username='${username}' and password='${password}'`
    return querySql(sql)
}

// 查询用户
function findUser(username) {
    const sql = `select id,username,nickname,role,avatar from admin_user where username='${username}'`
    return queryOne(sql)
}

module.exports = {
    login,
    findUser
}