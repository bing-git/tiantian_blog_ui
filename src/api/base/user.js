import request from '@/utils/request'

export function getUsers(data) {
  return request({
    url: '/user/userList',
    method: 'get',
    params: data
  })
}
