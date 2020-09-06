<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="page.current"
      :page-size.sync="page.size"
      :layout="layout"
      :page-sizes="[10, 20, 50, 100]"
      :total="page.total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    page: {
      type: Object,
      default: function() {
        return {
          size: 10,
          pages: 0,
          current: 1,
          total: 0
        }
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    current: {
      get() {
        return this.page.current
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    size: {
      get() {
        return this.page.size
      },
      set(val) {
        this.$emit('update:size', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { current: this.page.current, size: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { current: val, size: this.page.size })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 32px 16px;
  float: right;
}
.pagination-container.hidden {
  display: none;
}
</style>
