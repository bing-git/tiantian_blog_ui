<template>
  <div class="container">
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行查询"
    />
    <!-- 左侧权限树 -->
    <div class="side" style="width:22%">
      <el-tree
        v-loading="loading"
        style="overflow:auto;height:490px;"
        :data="privTreeList"
        :props="defaultProps"
        @node-click="handleNodeClick"
      />
    </div>
    <!-- 右侧权限信息 -->
    <div ref="info" class="info">
      <el-header class="header">
        <span class="text">基本信息</span>
      </el-header>
      <el-form
        ref="priv"
        :rules="rules"
        class="form"
        :inline="true"
        :model="priv"
      ><ct-row>
         <ct-col :span="12">
           <el-form-item label="权限编码" prop="code">
             <el-input
               v-model="priv.code"
               style="width:250%"
               placeholder="必填"
             />
           </el-form-item>
         </ct-col>
         <ct-col :span="12">
           <el-form-item label="上级权限">
             <el-input
               v-model="priv.parentName"
               style="width:250%"
               readonly="readonly"
             />
           </el-form-item>
         </ct-col>
       </ct-row>
        <ct-row>
          <ct-col :span="12">
            <el-form-item label="权限名称" prop="name">
              <el-input
                v-model="priv.name"
                style="width:250%"
                placeholder="必填"
              />
            </el-form-item>
          </ct-col>
          <ct-col :span="12">
            <el-form-item label="是否菜单">
              <el-radio v-model="priv.isMenu" label="1">是</el-radio>
              <el-radio v-model="priv.isMenu" label="0">否</el-radio>
            </el-form-item>
          </ct-col>
        </ct-row>
        <ct-row>
          <ct-col :span="24">
          &nbsp;
            <el-form-item label="菜单URL">
              <el-input v-model="priv.url" style="width:550%" />
            </el-form-item>
          </ct-col>
        </ct-row>
        <ct-row>
          <ct-col :span="12">
            <el-form-item label="菜单排序" prop="sortId">
              <el-input
                v-model="priv.sortId"
                style="width:250%"
                placeholder="必填"
                @input="isNum(priv.sortId)"
              />
            </el-form-item>
          </ct-col>
          <ct-col :span="12">
            <el-form-item label="是否生效">
              <el-radio v-model="priv.status" label="10">是</el-radio>
              <el-radio v-model="priv.status" label="20">否</el-radio>
            </el-form-item>
          </ct-col>
        </ct-row>
        <ct-row>
          <ct-col :span="12">
          &nbsp;
            <el-form-item label="前端组件">
              <el-input v-model="priv.component" style="width:250%" />
            </el-form-item>
          </ct-col>
          <ct-col :span="12">
            <el-form-item label="是否隐藏路由">
              <el-radio v-model="priv.hidden" label="1">是</el-radio>
              <el-radio v-model="priv.hidden" label="0">否</el-radio>
            </el-form-item>
          </ct-col>
        </ct-row>
        <ct-row>
          <ct-col :span="12">
          &nbsp;&nbsp;&nbsp;&nbsp;
            <el-form-item label="重定向">
              <el-input v-model="priv.redirect" style="width:250%" />
            </el-form-item>
          </ct-col>
          <ct-col :span="12">
            <el-form-item label="别名">
              <el-input v-model="priv.alias" style="width:250%" />
            </el-form-item>
          </ct-col>
        </ct-row>
        <ct-row>
          <ct-col :span="24">
            <ct-button v-if="priv.parentId !== 0" @click="add">新增</ct-button>
            <ct-button
              v-if="priv.parentId !== 10 && priv.parentId !== 0"
              @click="save('priv')"
            >
              保存
            </ct-button>
          </ct-col>
        </ct-row>
      </el-form>
    </div>
  </div>
</template>
<script>
import { getMenuTree, save } from '@/api/base/menu'
export default {
  data() {
    return {
      rules: {
        code: [
          {
            required: true,
            message: '请输入权限编码',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '请输入权限名称',
            trigger: 'blur'
          }
        ],
        sortId: [
          {
            required: true,
            message: '请输入菜单排序',
            trigger: 'blur'
          }
        ]
      },
      priv: {
        id: '',
        code: '',
        parentName: '',
        parentId: '',
        name: '',
        url: '',
        sortId: '',
        isMenu: '1',
        status: '10',
        component: '',
        hidden: '0',
        redirect: '',
        alias: '',
        clientId: ''
      },
      privTreeList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      form: {},
      loading: true
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getMenuTree()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 初始化权限树
    getMenuTree() {
      getMenuTree().then(res => {
        this.privTreeList = res.data
        this.loading = false
      })
    },
    // data:当前节点数据  node:当前节点
    handleNodeClick(data, node) {
      // 点击权限树展示权限对应信息
      this.$refs.info.style.display = 'block'
      this.$refs.info.style.float = 'right'

      this.priv.id = data.id
      this.priv.code = data.code
      if (data.id !== '1') {
        this.priv.parentName = node.parent.data.name
      } else {
        this.priv.parentName = ''
      }
      this.priv.parentId = data.parentId
      this.priv.name = data.name
      this.priv.url = data.url
      this.priv.sortId = data.sortId
      this.priv.isMenu = data.isMenu
      this.priv.status = data.status
      this.priv.component = data.component
      this.priv.hidden = data.hidden
      this.priv.redirect = data.redirect
      this.priv.alias = data.alias

      // 是否菜单和是否生效两项单选按钮中的value值需要转成string类型才能识别
      this.priv.isMenu = this.priv.isMenu.toString()
      this.priv.status = this.priv.status.toString()
      this.priv.hidden = this.priv.hidden.toString()
    },
    save(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          save(this.priv).then(res => {
            if (res.code === 1) {
              this.$message({
                showClose: true,
                message: '保存成功',
                type: 'success'
              })
              this.getprivTree()
            } else {
              this.$message({
                showClose: true,
                message: res.message,
                type: 'error'
              })
            }
          })
        } else {
          console.log('error submit!!')
        }
      })
    },
    isNum(val) {
      if (isNaN(val)) {
        this.$message({
          message: '菜单排序只能输入数字！',
          type: 'warning'
        })
        this.priv.sortId = ''
      }
    },
    add() {
      this.priv.parentId = this.priv.id
      if (this.priv.name !== '') {
        this.priv.parentName = this.priv.name
      }
      this.priv.id = ''
      this.priv.code = ''
      this.priv.name = ''
      this.priv.url = ''
      this.priv.sortId = ''
      this.priv.component = ''
      this.priv.hidden = '0'
      this.priv.redirect = ''
      this.priv.alias = ''
    }
  }
}
</script>

<style scoped>

</style>
