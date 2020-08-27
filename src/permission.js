import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout' // Layout 是架构组件，不在后台返回，在文件里单独引入

const _import = require('./router/_import_' + process.env.NODE_ENV) // 获取组件的方法

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

var remoteRouters // 用来获取后台拿到的路由

router.beforeEach(async(to, from, next) => {
  NProgress.start()
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
  const filtedRoutes = filterAsyncRouter(remoteRouters) // 过滤路由
  for (const route of filtedRoutes) {
    mainRoutes.push(route)
  }
  remoteRouters = mainRoutes
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
})

function filterAsyncRouter(asyncRouterMap) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = _import(route.component) // 导入组件
      }
    }
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
  return accessedRouters
}
