import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/tiantian_blog_ui/table/list',
    method: 'get',
    params
  })
}
