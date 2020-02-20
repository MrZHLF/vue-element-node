const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')
const {
    debug
} = require('../utils/constant.js')

function exists(book) {
    const {
        title,
        author,
        publisher
    } = book;
    const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
    return db.queryOne(sql)
}

async function removeBook(book) {
    if (book) {
        book.reset()
        if (book.fileName) {
            const removeBookSql = `delete from book where fileName='${book.fileName}'`
            const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
            await db.querySql(removeBookSql)
            await db.querySql(removeContentsSql)
        }
    }
}

async function insertContents(book) {
    const contents = book.getContents()
    if (contents && contents.length > 0) {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i]
            const _content = _.pick(content, [
                'fileName',
                'id',
                'href',
                'text',
                'order',
                'level',
                'label',
                'pid',
                'navId'
            ])
            await db.insert(_content, 'contents')
        }

    }
}
// 插入电子书
function insertBook(book) {
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    reject(new Error('电子书已存在'))
                } else {
                    await db.insert(book.toDb(), 'book')
                    await insertContents(book)
                    resolve()
                }
            } else {
                reject(new Error('添加的图书对象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}

// 更新电子书
function updateBook(book) {
    console.log(book, 'result')
    return new Promise(async (resolve, reject) => {
        try {
            if (book instanceof Book) {
                // const result = await getBook(book.fileName)
                //先查询是否存在
                const result = `select * from book where fileName='${book.fileName}'`
                console.log(result, 'result')
                if (result) {
                    const model = book.toDb()
                    if (Number(result.updateType) === 0) {
                        reject(new Error('默认图书不能编辑'))
                    } else {
                        await db.update(model, 'book', `where fileName='${book.fileName}'`)
                        resolve()
                    }
                } else {
                    reject(new Error('电子书不存在'))
                }
            } else {
                reject(new Error('添加的图书对象不合法'))
            }
        } catch (e) {
            reject(e)
        }
    })
}
// 查询电子书
function getBook(fileName) {
    const fileNames = JSON.parse(fileName).fileName || fileName
    return new Promise(async (resolve, reject) => {
        const bookSql = `select * from book where fileName='${fileNames}'`
        const contentsSql = `select * from contents where fileName='${fileNames}' order by \`order\``
        const book = await db.queryOne(bookSql)
        const contents = await db.querySql(contentsSql)
        if (book) {
            book.cover = Book.genCoverUrl(book)
            // 目录
            book.contentsTree = Book.genContentsTree(contents)
            resolve(
                book
            )
        } else {
            reject(new Error('电子书不存在'))
        }

    })
}


// 查询分类
async function getCategory() {
    const sql = 'select * from category order by category asc'
    const result = await db.querySql(sql)
    const categoryList = []
    result.forEach(item => {
        categoryList.push({
            label: item.categoryText,
            value: item.category,
            num: item.num
        })
    })
    return categoryList
}


// 获取图书列表
async function listBook(query) {
    debug && console.log(query, 'query');
    const {
        category,
        author,
        title,
        sort,
        page = 1,
        pageSize = 20,
    } = query
    const offset = (page - 1) * pageSize
    let bookSql = `select * from book`
    let where = 'where'
    title && (where = db.andLike(where, 'title', title))
    author && (where = db.andLike(where, 'author', author))
    category && (where = db.and(where, 'category', category))
    if (where !== 'where') {
        bookSql = `${bookSql} ${where}`
    }

    if (sort) {
        const symbol = sort[0]
        const column = sort.slice(1, sort.length)
        const order = symbol === '+' ? 'asc' : 'desc'
        bookSql = `${bookSql} order by ${column} ${order}`
    }

    bookSql = `${bookSql} limit ${pageSize} offset ${offset}` //分页
    const list = await db.querySql(bookSql)
    return {
        list
    }
}

module.exports = {
    insertBook,
    getBook,
    updateBook,
    getCategory,
    listBook
}