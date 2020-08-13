import request from '@/utils/request'

export function getCaptcha() {
  return request({
    method: 'get',
    url: '/imgcode'
  })
}
export function getPublicKey() {
  return request({
    method: 'get',
    url: '/base/publickey',
    headers: {
      'Content-type': 'application/json'
    }
  })
}
