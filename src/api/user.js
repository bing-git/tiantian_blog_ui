import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/base/login',
    method: 'post',
    data: data
  })
}

export function getInfo() {
  return request({
    url: '/base/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/base/logout',
    method: 'post'
  })
}
