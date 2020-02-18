const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')
const jwt = require('jsonwebtoken')
const boom = require('boom')
const bookService = require('./../services/book')

const {
    UPLOAD_PATH,
    PRIVATE_KEY
} = require('../utils/constant')
const router = express.Router()

//上传电子书
router.post(
    '/upload',
    multer({
        dest: `${UPLOAD_PATH}/book`
    }).single('file'),
    function (req, res, next) {
        if (!req.file || req.file.length === 0) {
            new Result(null, '上传电子书失败').fail(res)
        } else {
            const book = new Book(req.file)

            book
                .parse()
                .then(book => {
                    console.log(book, 'book')
                    new Result(book, '上传电子书成功').fail(res)
                })
                .catch(err => {
                    next(boom.badImplementation(err))
                })
        }
    }
)

// router.post('/create', function (req, res, next) {
//     //对token解析
//     let token = req.get('authorization')
//     if (token.indexOf('Bearer') === 0) {
//         token = token.replace('Bearer ', '')
//     }
//     let decode = jwt.verify(token, PRIVATE_KEY)
//     if (decode && decode.username) {
//         req.book.username = decode.username
//     }
//     const book = new Book(null, req.body)
//     console.log(book);
//     bookService.inserBook(book).then(() => {

//     }).catch(err => {
//         next(boom.badImplementation(err))
//     })
// })

router.post(
    '/create',
    function (req, res, next) {
        //对token解析
        let token = req.get('authorization')
        if (token.indexOf('Bearer') === 0) {
            token = token.replace('Bearer ', '')
        }
        let decoded = jwt.verify(token, PRIVATE_KEY)
        if (decoded && decoded.username) {
            req.body.username = decoded.username
        }
        const book = new Book(null, req.body)
        bookService.insertBook(book)
            .then(() => {
                new Result().success(res)
            })
            .catch(err => {
                console.log('/book/create', err)
                next(boom.badImplementation(err))
            })
    }
)


module.exports = router