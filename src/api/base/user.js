import request from '@/utils/request'

export function getUsers(data) {
  return request({
    url: '/user/userList',
    method: 'get',
    params: data
  })
}

export function getRoleByUser(data) {
  return request({
    url: '/user/userRole',
    method: 'get',
    params: data
  })
}

export function updateUser(data) {
  return request({
    url: '/user/updateUser',
    method: 'post',
    data: data
  })
}

export function insertUser(data) {
  return request({
    url: '/user/insertUser',
    method: 'post',
    data: data
  })
}

export function resetPwd(data) {
  return request({
    url: '/user/resetPwd',
    method: 'put',
    data: data
  })
}
