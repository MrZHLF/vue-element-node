const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    UPLOAD_PATH
} = require('../utils/constant')
const fs = require('fs')

const Epub = require('../utils/epub')
const xml2js = require('xml2js').parseString
const path = require('path')
class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFromFile(file)
        } else {
            this.createBookFromData(data)
        }
    }

    createBookFromFile(file) {
        const {
            destination,
            filename,
            path,
            originalname,
            mimetype = MIME_TYPE_EPUB
        } = file
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '' //电子书后缀名
        // const oldBookPath=`${destination}/${filename}`
        const oldBookPath = path //原有路径
        const bookPath = `${destination}/${filename}${suffix}` //新的路径
        const url = `${UPLOAD_URL}/book/${filename}${suffix}` //文件下载URL链接
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}` //文件解压路径
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}` //电子书解压后的URL

        // 创建文件
        if (!fs.existsSync(unzipPath)) {
            fs.mkdirSync(unzipPath, {
                recursive: true
            })
        }
        // 文件命名
        if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
            fs.renameSync(oldBookPath, bookPath)
        }

        this.filename = filename //文件名
        this.path = `/book/${filename}${suffix}` //epub相对路径
        this.filePath = this.path //文件路径
        this.unzipPath = `/unzip/${filename}` //epub解压后的相对路径
        this.url = url //下载链接
        this.title = '' //电子书标题
        this.author = '' //作者
        this.publisher = '' //出版社
        this.contents = [] //目录
        this.cover = '' //封面图片
        this.coverPath = '' //封面图片路径
        this.category = -1 //分类ID
        this.cetagoryText = '' //分类名称
        this.language = '' //语言
        this.unzipUrl = unzipUrl //解压后文件链接
        this.originalname = originalname //电子书原名
    }
    createBookFromData(data) {}

    parse() {
        return new Promise((resolve, reject) => {
            const bookPath = `${UPLOAD_PATH}${this.filePath}`
            if (!fs.existsSync(bookPath)) {
                reject(new Error('电子书不存在'))
            }
            const epub = new Epub(bookPath)
            epub.on('error', err => {
                reject(err)
            })
            epub.on('end', err => {
                if (err) {
                    reject(err)
                } else {
                    const {
                        language,
                        creator,
                        creatorFileAs,
                        title,
                        cover,
                        publisher
                    } = epub.metadata
                    if (!title) {
                        reject(new Error('图书标题为空'))
                    } else {
                        this.title = title
                        this.language = language || 'en'
                        this.author = creator || creatorFileAs || 'unkown'
                        this.publisher = publisher || 'unkown'
                        const handleGetImage = (err, file, mineType) => {
                            if (err) {
                                reject(err)
                            } else {
                                const suffix = mineType.split('/')[1]
                                const coverPath = `${UPLOAD_PATH}/img/${this.filename}.${suffix}`
                                const coverUrl = `${UPLOAD_URL}/img/${this.filename}.${suffix}`

                                fs.writeFileSync(coverPath, file, 'binary')
                                this.coverPath = `/img/${this.filename}.${suffix}`
                                this.cover = coverUrl
                                resolve(this)
                            }
                        }
                        try {
                            this.unzip()
                            this.parseContents(epub).then(({
                                chapters,
                                chapterTree
                            }) => {
                                this.contents = chapters
                                this.contentsTree = chapterTree
                                epub.getImage(cover, handleGetImage)
                            })


                        } catch (e) {
                            reject(e)
                        }

                        this.rootFile = epub.rootFile



                    }
                }
            })
            epub.parse()
        })
    }
    unzip() {
        const AdmZIP = require('adm-zip')
        const zip = new AdmZIP(Book.genPath(this.path))
        zip.extractAllTo(Book.genPath(this.unzipPath), true)
    }

    parseContents(epub) {
        // 解析目录
        function getNcxFilePath() {
            const spine = epub && epub.spine
            const manifest = epub && epub.manifest
            const ncx = spine.toc && spine.toc.href
            const id = spine.toc && spine.toc.id

            if (ncx) {
                return ncx
            } else {
                return manifest[id].href
            }
        }

        function findParent(array, level = 0, pid = '') {
            // 多级目录
            return array.map(item => {
                item.level = level
                item.pid = pid
                if (item.navPoint && item.navPoint.length > 0) {
                    item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
                } else if (item.navPoint) {
                    item.navPoint.level = level + 1
                    item.navPoint.pid = item['$'].id
                }
                return item
            })
        }

        function flatten(array) {
            return [].concat(...array.map(item => {
                if (item.navPoint && item.navPoint.length > 0) {
                    return [].concat(item, ...flatten(item.navPoint))
                } else if (item.navPoint) {
                    return [].concat(item, item.navPoint)
                }
                return item
            }))
        }


        const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
        if (fs.existsSync(ncxFilePath)) {
            return new Promise((resolve, reject) => {
                const xml = fs.readFileSync(ncxFilePath, 'utf-8')
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '')
                const filename = this.filename
                xml2js(xml, {
                    explicitArray: false,
                    ignoreAttrs: false
                }, function (err, json) {
                    if (err) {
                        reject(err)
                    } else {
                        const navMap = json.ncx.navMap
                        if (navMap.navPoint && navMap.navPoint.length > 0) {
                            navMap.navPoint = findParent(navMap.navPoint)
                            const newNavMap = flatten(navMap.navPoint)
                            const chapters = []
                            newNavMap.forEach((chapter, index) => {
                                // if (index + 1 > newNavMap.length) {
                                //     return
                                // }
                                // const nav = newNavMap[index]
                                const src = chapter.content['$'].src
                                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                                chapter.label = chapter.navLabel.text || ''
                                // if (nav && nav.navLabel) {
                                //     chapter.label = nav.navLabel.text || ''
                                // } else {
                                //     chapter.label = ''
                                // }
                                // chapter.level = nav.level
                                // chapter.pid = nav.pid
                                chapter.navId = chapter['$'].id
                                chapter.filename = filename
                                chapter.order = index + 1
                                chapters.push(chapter)
                            })
                            // 将目录转化为树状结构
                            const chapterTree = []
                            chapters.forEach(c => {
                                c.children = []
                                if (c.pid === '') {
                                    chapterTree.push(c)
                                } else {
                                    const parent = chapters.find(_ => _.navId === c.pid)
                                    parent.children.push(c)
                                }
                            }) // 将目录转化为树状结构
                            resolve({
                                chapters,
                                chapterTree
                            })
                        } else {
                            reject(new Error('目录解析失败,目录数为0'))
                        }
                    }
                })
            })
        } else {
            throw new Error('目录不存在')
        }
    }

    static genPath(path) {
        if (!path.startsWith('/')) {
            path = `/{path}`
        }
        return `${UPLOAD_PATH}${path}`
    }
}

module.exports = Book