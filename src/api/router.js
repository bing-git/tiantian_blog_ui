import request from '@/utils/request'

export function getRouter() {
  return request({
    method: 'post',
    url: '/base/router'
  })
}
