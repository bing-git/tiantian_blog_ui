import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 不需要判断统一返回体状态码的白名单
const whiteList = ['/druid']
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 100000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    for (const url of whiteList) {
      if (config.url.indexOf(url) > -1) {
        return config
      }
    }
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Access-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // 当获得后台发来的新JWT时，刷新token防止过期
    // 203状态码代表token认证失败
    if (response.status === 200) {
      const token = response.headers['Access-Token']
      if (typeof token !== undefined && token != null && token !== '') {
        store.dispatch('user/setToken', token).then(() => {})
      }
      // 后台统一返回体
      const res = response.data
      // if the custom code is not 1, it is judged as an error.
      // console.log(res)
      for (const url of whiteList) {
        if (response.config.url.indexOf(url) > -1) {
          return res
        }
      }
      if (res.code !== 1) {
        Message({
          message: res.message || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        return res
      }
    } else {
      let errorText = ''
      if (response.status === 203) {
        errorText = '认证TOKEN为空，您可以点击取消留在当前页面，或重新登录'
      } else if (response.status === 204) {
        errorText = '认证TOKEN失效，您可以点击取消留在当前页面，或重新登录'
      } else {
        errorText = '身份认证失败，您可以点击取消留在当前页面，或重新登录'
      }
      // to re-login
      MessageBox.confirm(errorText, {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
      return Promise.reject(new Error('Error'))
    }
  },
  error => {
    console.log(error)
    console.log(error.response) // for debug
    Message({
      message: error.response.data.message,
      showClose: true,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
