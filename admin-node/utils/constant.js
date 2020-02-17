const {
    env
} = require('./env')
// D:\epub\admin-upload-ebook   /User/sam/upload/admin-upload-ebook
// const UPLOAD_PATH = env === 'dev' ? '/upload/admin-upload-ebook' : 'root/upload/admin-upload/ebook'; //上传保存书的目录文件
const UPLOAD_PATH = '/upload/admin-upload-ebook'
const UPLOAD_URL = 'http://localhost:8089/admin-upload-ebook'
module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    CODE_TOKEN_EXPIRED: -2,
    debug: true,
    PWD_SALT: 'admin_imooc_node',
    PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED: 60 * 60, // token失效时间
    UPLOAD_PATH,
    UPLOAD_URL,
    MIME_TYPE_EPUB: 'application/epub+zip'
}