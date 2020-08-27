import request from '@/utils/request'

export function getMenuTree() {
  return request({
    method: 'get',
    url: '/menu/tree'
  })
}

export function save(data) {
  return request({
    method: 'post',
    url: '/menu/save',
    data: data
  })
}
