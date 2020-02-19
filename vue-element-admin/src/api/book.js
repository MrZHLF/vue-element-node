import require from '../utils/request'

// 上传电子书
export function createBook(book) {
  return require({
    url: '/book/create',
    method: 'post',
    data: book
  })
}

//查询电子书
export function getBook(fileName) {
  return require({
    url: '/book/get',
    method: 'get',
    params: {
      fileName
    }
  })
}

// 更新电子书
export function updateBook(book) {
  return require({
    url: '/book/update',
    method: 'post',
    data: book
  })
}
