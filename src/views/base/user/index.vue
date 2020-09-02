<template>
  <div class="app-container">
    <el-button style="margin:2% auto" type="primary" @click="handleAddUser">新增</el-button>
    <el-table :data="usersList" style="width:100%;margin:0 auto;" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}" border>
      <el-table-column align="center" label="账号">
        <template slot-scope="scope">
          {{ scope.row.userId }}
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="page.total>0" :total="page.total" :page.sync="current" :limit.sync="page.limit" @pagination="getUsers" />
  </div>
</template>

<script>
import { getUsers } from '@/api/base/user'
import Pagination from '@/components/Pagination'

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
      listLoading: true,
      usersList: [],
      page: {
        size: 10,
        pages: 0,
        current: 1,
        total: 0
      }
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
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
      this.role = Object.assign({}, userInfo)
    }
  }
}
</script>

<style scoped>

</style>
