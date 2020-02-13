const expres = require('express')
const router = require('./router/index.js')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = expres()

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

app.use('/', router)

// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(18082, function () {
    const {
        address,
        port
    } = server.address()
    console.log('Http Server is running on http://%s:%s', address, port)
})