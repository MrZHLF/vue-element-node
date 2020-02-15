const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    UPLOAD_PATH
} = require('../utils/constant')
const fs = require('fs')

const Epub = require('../utils/epub')
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
        this.filPath = this.path //文件路径
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
            const bookPath = `${UPLOAD_PATH}${this.filPath}`
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
                        this.rootFile = epub.rootFile

                        const handleGetImage = (err, file, mineType) => {
                            if (err) {
                                reject(err)
                            } else {
                                const suffix = mineType.split('/')[1]
                                const coverPath = `${UPLOAD_PATH}/img/${this.filename}.${suffix}`
                                const coverUrl = `${UPLOAD_URL}/img/${this.filename}.${suffix}`

                                fs.writeFileSync(coverPath, file, 'binary')
                                this.covePath = `/img/￥{this.filename}.${suffix}`
                                this.cover = coverUrl
                                resolve(this)
                            }
                        }
                        epub.getImage(cover, handleGetImage)

                    }
                }
            })
            epub.parse()
        })
    }
}

module.exports = Book