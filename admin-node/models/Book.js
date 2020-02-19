const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    UPLOAD_PATH,
    OLD_UPLOAD_URL
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

        this.fileName = filename //文件名
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
        this.cetegoryText = '' //分类名称
        this.language = '' //语言
        this.unzipUrl = unzipUrl //解压后文件链接
        this.originalName = file.originalname //电子书原名
        console.log(this.originalName)
    }
    createBookFromData(data) {
        this.fileName = data.fileName;
        this.cover = data.coverPath;
        this.title = data.title;
        this.author = data.author;
        this.publisher = data.publisher;
        this.bookId = data.fileName;
        this.language = data.language;
        this.rootFile = data.rootFile;
        this.originalName = data.originalName;
        this.path = data.path || data.filePath;
        this.filePath = data.path || data.filePath;
        this.unzipPath = data.unzipPath;
        this.coverPath = data.coverPath;
        this.createUser = data.username;
        this.createDt = new Date().getTime();
        this.updateDt = new Date().getTime();
        this.updateType = data.updateType === 0 ? data.updateType : 1;
        this.category = data.category | 99;
        this.cetegoryText = data.cetegoryText || '自定义';
        this.contents = data.contents || []
    }

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
                                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`

                                fs.writeFileSync(coverPath, file, 'binary')
                                this.coverPath = `/img/${this.fileName}.${suffix}`
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
                const fileName = this.fileName
                const unzipPath = this.unzipPath
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
                                chapter.id = `${src}`
                                chapter.href = `${dir}/${src}`.replace(unzipPath, '')
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
                                chapter.fileName = fileName
                                chapter.order = index + 1
                                chapters.push(chapter)
                            })
                            // 将目录转化为树状结构
                            const chapterTree = Book.genContentsTree(chapters)
                            // const chapterTree = []
                            // chapters.forEach(c => {
                            //     c.children = []
                            //     if (c.pid === '') {
                            //         chapterTree.push(c)
                            //     } else {
                            //         const parent = chapters.find(_ => _.navId === c.pid)
                            //         parent.children.push(c)
                            //     }
                            // }) // 将目录转化为树状结构
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
    toDb() {
        return {
            fileName: this.fileName,
            cover: this.cover,
            title: this.title,
            author: this.author,
            publisher: this.publisher,
            bookId: this.bookId,
            updateType: this.updateType,
            language: this.language,
            rootFile: this.rootFile,
            originalName: this.originalName,
            filePath: this.path,
            unzipPath: this.unzipPath,
            coverPath: this.coverPath,
            createUser: this.createUser,
            createDt: this.createDt,
            updateDt: this.updateDt,
            category: this.category || 99,
            categoryText: this.categoryText || '自定义'
        }
    }
    getContents() {
        return this.contents
    }
    reset() {
        if (Book.pathExists(this.filePath)) {
            fs.unlinkSync(Book.genPath(this.filePath))
        }
        if (Book.pathExists(this.coverPath)) {
            fs.unlinkSync(Book.genPath(this.coverPath))
        }
        if (Book.pathExists(this.unzipPath)) {
            fs.rmdirSync(Book.genPath(this.unzipPath), {
                recursive: true
            })
        }

    }

    static genPath(path) {
        if (!path.startsWith('/')) {
            path = `/{path}`
        }
        return `${UPLOAD_PATH}${path}`
    }

    static pathExists(path) {
        if (path.startsWith(UPLOAD_PATH)) {
            return fs.existsSync(path)
        } else {
            return fs.existsSync(Book.genPath(path))
        }
    }
    static genCoverUrl(book) {
        if (Number(book.updateType) === 0) {
            const {
                cover
            } = book
            if (cover) {
                if (cover.startsWith('/')) {
                    return `${OLD_UPLOAD_URL}${cover}`
                } else {
                    return `${OLD_UPLOAD_URL}/${cover}`
                }
            } else {
                return null
            }
        } else {
            if (book.cover) {
                if (book.cover.startsWith('/')) {
                    return `${UPLOAD_URL}${book.cover}`
                } else {
                    return `${UPLOAD_URL}/${book.cover}`
                }
            } else {
                return null
            }
        }
    }

    static genContentsTree(contents) {
        if (contents) {
            // 将目录转化为树状结构
            const contentsTree = []
            contents.forEach(c => {
                c.children = []
                if (c.pid === '') {
                    contentsTree.push(c)
                } else {
                    const parent = contents.find(_ => _.navId === c.pid)
                    parent.children.push(c)
                }
            }) // 将目录转化为树状结构
            return contentsTree
        }
    }
}

module.exports = Book