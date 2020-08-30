<template>
  <div class="app-container">
    <el-button style="margin:2% auto" type="primary" @click="handleAddRole">新增</el-button>
    <el-table :data="rolesList" style="width:100%;margin:0 auto;" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}" border>
      <el-table-column align="center" label="序号">
        <template slot-scope="scope">
          {{ scope.row.roleId }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="角色编码">
        <template slot-scope="scope">
          {{ scope.row.roleCode }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称">
        <template slot-scope="scope">
          {{ scope.row.roleName }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="角色状态">
        <template slot-scope="scope">
          <p v-if="scope.row.status===0" type="danger">禁用</p>
          <p v-if="scope.row.status===1" type="success">启用</p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status===1" type="primary" size="small" @click="handleEdit(scope)">授权</el-button>
          <el-button v-if="scope.row.status===1" type="danger" size="small" @click="handleOff(scope)">禁用</el-button>
          <el-button v-if="scope.row.status===0" type="primary" size="small" @click="handleOn(scope)">启用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='授权'?'编辑角色':'新增角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名称">
          <el-input v-model="role.roleName" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="role.roleCode" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="privId"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { addRole, deleteRole, getMenu, getMenuByRole, getRoles, openRole, updateRole } from '@/api/base/role'

const defaultRole = {
  roleId: '',
  roleName: '',
  status: '',
  roleCode: '',
  routes: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: '新增',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const res = await getMenu()
      this.serviceRoutes = res.data
      this.routes = res.data
    },
    async getRoles() {
      const res = await getRoles()
      this.rolesList = res.data
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
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = '新增'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = '授权'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      const query = { 'roleId': this.role.roleId }
      this.$nextTick(() => {
        // 根据角色查询菜单
        getMenuByRole(query).then(res => {
          const routes = res.data
          this.$refs.tree.setCheckedNodes(this.generateArr(routes))
          // set checked state of a node not affects its father and child nodes
          this.checkStrictly = false
        }
        )
      })
    },
    handleOff({ row }) {
      this.$confirm('确认禁用该角色', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          deleteRole(row.roleId).then(() => {
            this.getRoles()
            this.$message({
              showClose: true,
              type: 'success',
              message: '成功禁用该角色!'
            })
          })
        })
        .catch(err => { console.error(err) })
    },
    handleOn({ row }) {
      this.$confirm('确认启用该角色', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'success'
      })
        .then(async() => {
          openRole(row).then(() => {
            this.getRoles()
            this.$message({
              showClose: true,
              type: 'success',
              message: '成功启用该角色!'
            })
          })
        })
        .catch(err => { console.error(err) })
    },
    async confirmRole() {
      const isEdit = this.dialogType === '授权'

      this.role.routes = this.$refs.tree.getCheckedKeys()
      if (isEdit) {
        updateRole(this.role).then(() => {
          this.getRoles()
        })
        this.$message({
          showClose: true,
          type: 'success',
          message: '修改成功'
        })
      } else {
        addRole(this.role).then(() => {
          this.getRoles()
        })
        this.$message({
          showClose: true,
          type: 'success',
          message: '新增成功'
        })
      }
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    .roles-table {
      margin-top: 30px;
    }
    .permission-tree {
      margin-bottom: 30px;
    }
  }
</style>
