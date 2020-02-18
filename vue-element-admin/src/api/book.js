import require from '../utils/request'

export function createBook(book) {
  return require({
    url: '/book/create',
    method: 'post',
    data: book
  })
}
