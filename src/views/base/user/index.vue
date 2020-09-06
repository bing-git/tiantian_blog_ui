<template>
  <div class="app-container">
    <el-button style="margin:2% auto" type="primary" @click="handleAddUser">新增</el-button>
    <el-table :data="usersList" style="width:100%;margin:0 auto;" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}" border>
      <el-table-column align="center" label="账号">
        <template slot-scope="scope">
          {{ scope.row.userId }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="名称">
        <template slot-scope="scope">
          {{ scope.row.userName }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <p v-if="scope.row.status==='1'" type="danger">禁用</p>
          <p v-if="scope.row.status==='0'" type="success">启用</p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditUser(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="resetPwd(scope)">重置</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="page.total>0" :page.sync="page" @pagination="getUsers" />
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='编辑'?'编辑用户':'新增用户'">
      <el-form ref="userInfo" :model="user" label-width="80px" label-position="left" :rules="rules">
        <el-form-item label="账号" prop="userId">
          <el-input v-model="user.userId" placeholder="账号" prop="userId" />
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="user.userName" placeholder="用户名称" prop="userName" />
        </el-form-item>
        <el-form-item label="角色列表">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="rolesData"
            :props="defaultProps"
            show-checkbox
            node-key="roleId"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmUser">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, getRoleByUser, resetPwd, saveUser } from '@/api/base/user'
import { getRoles } from '@/api/base/role'
import Pagination from '@/components/Pagination'
import { deepClone } from '@/utils'

const userInfo = {
  userId: '',
  userName: '',
  pwd: '',
  status: ''
}

export default {
  components: { Pagination },
  data() {
    return {
      rules: {
        userId: [{ required: true, message: '请选择输入账号', trigger: 'blur' }],
        userName: [{ required: true, message: '请输入用户名称', trigger: 'blur' }]
      },
      user: Object.assign({}, userInfo),
      listLoading: true,
      usersList: [],
      page: {
        size: 10,
        pages: 0,
        current: 1,
        total: 0
      },
      defaultProps: {
        label: 'roleName'
      },
      dialogVisible: false,
      dialogType: '新增',
      checkStrictly: false,
      roles: []
    }
  },
  computed: {
    rolesData() {
      return this.roles
    }
  },
  created() {
    this.getUsers()
    this.getRoles()
  },
  methods: {
    async getRoles() {
      const res = await getRoles()
      this.roles = res.data
    },
    async getUsers() {
      this.listLoading = true
      const query = {
        current: this.page.current,
        size: this.page.size
      }
      getUsers(query).then(res => {
        this.usersList = res.data.records
        this.page.size = res.data.size
        this.page.current = res.data.current
        this.page.pages = res.data.pages
        this.page.total = res.data.total
      })
    },
    handleAddUser() {
      this.user = Object.assign({}, userInfo)
      this.dialogType = '新增'
      this.dialogVisible = true
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
    },
    handleEditUser(scope) {
      this.dialogType = '编辑'
      this.dialogVisible = true
      this.checkStrictly = true
      this.user = deepClone(scope.row)
      // 根据用户id查询用户已有角色
      const query = { 'userId': this.user.userId }
      this.$nextTick(() => {
        // 根据角色查询菜单
        getRoleByUser(query).then(res => {
          const roles = res.data
          this.$refs.tree.setCheckedNodes(this.generateArr(roles))
          // set checked state of a node not affects its father and child nodes
          this.checkStrictly = false
        }
        )
      })
    },
    confirmUser() {
      this.$refs['userInfo'].validate(valid => {
        if (valid) {
          this.user.roles = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
          saveUser(this.user).then(res => {
            console.log(res)
          })
        }
      })
    },
    resetPwd(scope) {
      this.user.userId = scope.row.userId
      resetPwd(this.user).then(res => {
        if (res.code === 1) {
          this.$message({
            showClose: true,
            message: '重置密码成功',
            type: 'success'
          })
        }
      })
    },
    closeDialog() {
      this.dialogVisible = false
      this.$refs['userInfo'].resetFields()
    },
    generateArr(routes) {
      let data = []
      if (routes) {
        routes.forEach(route => {
          data.push(route)
          if (route.children) {
            const temp = this.generateArr(route.children)
            if (temp.length > 0) {
              data = [...data, ...temp]
            }
          }
        })
      }
      return data
    }
  }
}
</script>

<style scoped>

</style>
