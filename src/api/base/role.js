import request from '@/utils/request'

export function getMenu() {
  return request({
    url: '/menu/tree',
    method: 'get'
  })
}

export function getMenuByRole(data) {
  return request({
    url: '/menu/roleMenu',
    method: 'get',
    params: data
  })
}

export function getRoles() {
  return request({
    url: '/role/roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/role/insertRole',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/role/updateRole`,
    method: 'put',
    data: data
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/delete/${id}`,
    method: 'delete'
  })
}

export function openRole(data) {
  return request({
    url: `/role/openRole`,
    method: 'post',
    data: data
  })
}
