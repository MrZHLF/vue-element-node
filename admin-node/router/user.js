const express = require('express')
const router = express.Router()
const Result = require('../models/Result')
const {
    PRIVATE_KEY,
    JWT_EXPIRED
} = require('../utils/constant')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const {
    body,
    validationResult
} = require('express-validator')
const {
    login,
    findUser
} = require('../services/user')

const {
    md5,
    decode
} = require('../utils/index')
const {
    PWD_SALT
} = require('../utils/constant')

// 登录
router.post('/login', [
    body('username').isString().withMessage('用户名必须为字符串'),
    body('password').isString().withMessage('密码必须为字符串'),
], function (req, res, next) {
    const err = validationResult(req)
    console.log(err);
    if (!err.isEmpty()) {
        const [{
            msg
        }] = err.errors;
        next(boom.badGateway(msg))
    } else {
        let {
            username,
            password
        } = req.body
        password = md5(`${password}${PWD_SALT}`)
        login(username, password).then(user => {
            console.log(user)
            if (!user || user.length === 0) {
                new Result('登录失败').fail(res)
            } else {
                const token = jwt.sign({
                        username
                    },
                    PRIVATE_KEY, {
                        expiresIn: JWT_EXPIRED
                    }
                )
                new Result({
                    token
                }, '登录成功').success(res)
            }
        })
    }
})

router.get('/info', function (req, res, next) {
    //对token解析
    let token = req.get('authorization')
    if (token.indexOf('Bearer') === 0) {
        token = token.replace('Bearer ', '')
    }
    let decode = jwt.verify(token, PRIVATE_KEY)

    if (decode && decode.username) {
        findUser('admin').then(user => {
            if (user) {
                user.roles = [user.role]
                new Result(user, '用户信息查询成功').success(res)
            } else {
                new Result('用户信息查询失败').fail(res)
            }
        })
    } else {
        new Result('用户信息查询失败').fail(res)
    }

})

module.exports = router