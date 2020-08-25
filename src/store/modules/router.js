import { getRouter } from '@/api/router'

const state = {
  routers: [],
  menus: []
}

const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.routers = routers
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  }
}

function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter(route => {
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    if (!route.hidden) {
      return route
    }
  })
}

const actions = {
  getRouters({ commit }) {
    return new Promise((resolve, reject) => {
      getRouter()
        .then(res => {
          const { data } = res
          commit('SET_ROUTERS', data)
          // 去除hidden===1的项目
          const newObj = JSON.parse(JSON.stringify(data))
          const menus = filterAsyncRouter(newObj)
          commit('SET_MENUS', menus)
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
