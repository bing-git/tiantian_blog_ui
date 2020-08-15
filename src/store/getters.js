const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  routers: state => state.router.routers,
  menus: state => state.router.menus
}
export default getters
