import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout' // Layout 是架构组件，不在后台返回，在文件里单独引入
import DES from '@/utils/DES-crypto'

const _import = require('./router/_import_' + process.env.NODE_ENV) // 获取组件的方法

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

var remoteRouters // 用来获取后台拿到的路由

router.beforeEach(async(to, from, next) => {
  // 对路由query中的参数统一加密
  if (
    whiteList.indexOf(from.path) === -1 &&
    Object.keys(to.query).length > 0 &&
    typeof to.query.routerEncrypted === 'undefined'
  ) {
    const keys = Object.keys(to.query)
    for (const key of keys) {
      let value = to.query[key]
      // 如果query的值为object类型，则将其转为字符串，防止页面刷新后无法正确展示
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      to.query[key] = DES.encrypt(to.query[key])
    }
    to.query.routerEncrypted = true
    // start progress bar
    NProgress.start()
    // 重新发送请求
    next(to)
  }

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken && to.path !== '/login') {
    // 不加这个判断，路由会陷入死循环
    if (!remoteRouters) {
      if (getRouters().length === 0) {
        // 将路由数据传递给全局变量，做侧边栏菜单渲染工作
        store.dispatch('router/getRouters').then(routers => {
          remoteRouters = routers
          routerGo(to, next) // 执行路由跳转方法
        })
      } else {
        // 从vuex拿到路由
        remoteRouters = getRouters() // 拿到路由
        routerGo(to, next)
      }
    } else {
    // if (to.path === '/login') {
    //   // if is logged in, redirect to the home page
    //   next({ path: '/' })
    //   NProgress.done()
    // } else {
      const hasGetUserInfo = store.getters.userName
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo')

          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

function routerGo(to, next) {
  // 为了让一级菜单也有布局layout组件，必须让所有路由共有一个主路由
  const mainRoutes = router.options.routes
  const filtedRoutes = filterAsyncRouter(remoteRouters)
  for (const route of filtedRoutes) {
    mainRoutes[1].children.push(route)
  }
  remoteRouters = mainRoutes // 过滤路由
  remoteRouters.push({ path: '*', redirect: '/404', hidden: true })
  router.addRoutes(remoteRouters) // 动态添加路由
  next({ ...to, replace: true })
}

function getRouters() {
  // localStorage 获取数组对象的方法
  return store.getters.routers
}

router.afterEach((to, from) => {
  // finish progress bar
  NProgress.done()
  // 对路由中的参数统一解密
  if (
    whiteList.indexOf(from.path) === -1 &&
    Object.keys(to.query).length > 0 &&
    typeof to.query.routerEncrypted !== 'undefined'
  ) {
    // 加密路由中query的value值
    const keys = Object.keys(to.query)
    for (const key of keys) {
      if (key !== 'routerEncrypted') {
        let value = DES.decrypt(to.query[key])
        if (isJsonString(value)) {
          value = JSON.parse(value)
        }
        to.query[key] = value
      }
    }
  }
})

function filterAsyncRouter(asyncRouterMap) {
  // 遍历后台传来的路由字符串，转换为组件对象
  return asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') {
        // Layout组件特殊处理
        route.component = Layout
      } else {
        route.component = _import(route.component)
      }
    }

    // 路由的别名设置，当从后台获取的路由表中alias字段为@,就表示该路由是父路由的别名，当跳转父路由时，URL仍为父路由，内容组件却是该路由自己
    // 这样做的目的是为了实现同一菜单选项卡内部多个组件页面的跳转而不会新增选项卡
    // 举例而言：对于活动管理这个菜单，它的默认页面应该是活动管理.列表页面，从列表页面可以跳转活动管理.新增和活动管理.修改页面，且跳转活动管理.新增和修改页面时，不应弹出新选项卡
    // 为了实现这一点，应在后台路由表中建立活动管理路由，component为routerView/index，和其三个子路由：活动管理.列表，活动管理.新增和活动管理.修改，其中，默认页面活动管理.列表的alias字段应设置为@
    if (route.alias === '') {
      delete route.alias
    } else if (route.alias === '@') {
      route.alias = ''
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true
    }
  } catch (e) {
    console.log()
  }
  return false
}
