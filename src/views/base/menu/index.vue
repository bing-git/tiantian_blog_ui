<template>
  <el-card class="body-card">
    <div slot="header" class="clearfix">
      <span>菜单配置</span>
    </div>
    <el-container style="border: 1px solid #eee">
      <el-aside width="25%" style="background-color: rgb(238, 241, 246)">
        <!-- 左侧权限树 -->
        <el-tree
          v-loading="loading"
          :data="privTreeList"
          :props="defaultProps"
          @node-click="handleNodeClick"
        />
      </el-aside>
      <el-main width="75%">
        <el-header class="header">
          <span class="text">基本信息</span>
        </el-header>
        <el-form ref="priv" :model="priv" label-width="100px" :rules="rules" lable-position="left">
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单编码" prop="code">
                <el-input v-model="priv.code" placeholder="必填" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上级编码">
                <el-input v-model="priv.parentName" placeholder="必填" readonly="readonly" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单名称" prop="name">
                <el-input v-model="priv.name" placeholder="必填" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否菜单">
                <el-radio-group v-model="priv.isMenu">
                  <el-radio label="1">是</el-radio>
                  <el-radio label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="菜单URL">
                <el-input v-model="priv.url" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单排序" prop="sortId">
                <el-input v-model="priv.sortId" placeholder="必填" @input="isNum(priv.sortId)" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否生效">
                <el-radio-group v-model="priv.status">
                  <el-radio label="10">是</el-radio>
                  <el-radio label="20">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="前端组件">
                <el-input v-model="priv.component" placeholder="必填" @input="isNum(priv.sortId)" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="隐藏路由">
                <el-radio-group v-model="priv.hidden">
                  <el-radio label="1">是</el-radio>
                  <el-radio label="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="重定向">
                <el-input v-model="priv.redirect" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="别名">
                <el-input v-model="priv.alias" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="23" :offset="1">
              <el-button v-if="priv.parentId !== 0" @click="add">新增</el-button>
              <el-button
                v-if="priv.parentId !== 10 && priv.parentId !== 0"
                @click="save('priv')"
              >
                保存
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-main>
    </el-container>
  </el-card>
</template>
<script>
import { getMenuTree, save } from '@/api/base/menu'
export default {
  data() {
    return {
      labelPosition: 'left',
      rules: {
        code: [
          {
            required: true,
            message: '请输入菜单编码',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '请输入菜单名称',
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
        privId: '',
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
      this.priv.privId = data.privId
      this.priv.code = data.code
      if (data.privId !== '1') {
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
              this.getMenuTree()
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
      this.priv.parentId = this.priv.privId
      if (this.priv.name !== '') {
        this.priv.parentName = this.priv.name
      }
      this.priv.privId = ''
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

<style>
  .body-card{
    width: 80%;
    margin:1% auto;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
    clear: both;
  }
  .el-card__header{
    background-color: #20a0ff;
  }
  .header {
    text-align: center;
    font-size: 20px;
  }
</style>
