<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    setTimeout(() => {
      window.L2Dwidget.init({
        'dialog': {
          'enable': true,
          'script': {
            // 每20s，显示一言（调用一言Api返回的句子）
            'every idle 40s': '$hitokoto$',
            // 触摸到身体
            'tap body': '别瞎点(•ω•)',
            // 触摸到头部
            'tap face': '打你脑壳(QωQ)'
          }
        },
        pluginRootPath: 'static/live2dw/',
        pluginJsPath: 'lib/',
        pluginModelPath: 'live2d-widget-model-haru/02/assets/',
        tagMode: false,
        debug: false,
        model: { jsonPath: '../static/live2dw/live2d-widget-model-haru/02/assets/haru02.model.json' },
        display: { position: 'right', width: 150, height: 400 },
        mobile: { show: true },
        log: false
      })
    }, 1000)
  }
}
</script>
