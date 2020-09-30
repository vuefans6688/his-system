<template>
  <div class="booking-query">
     <el-table :data="bookingList" stripe>
      <el-table-column label="约定类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bkf122 | bookingTypeFilter }}</span>
        </template>
      </el-table-column>
       <el-table-column label="约定状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bkf222 | bkf222Filter }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { BKF122 } from '@/common/dictionary'
import { menuCode } from '@/common/code'  // 按需导出
export default {
  props: {
    bookingList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  filters: {
    bookingTypeFilter(value) {
      const obj = BKF122.find(val => val.key === value)
      if (obj) {
        return obj.value
      }
      return '-'
    },
    bkf222Filter(val) {
      return menuCode.bkf222[val]  // 按需导出使用
    }
  }
}
</script>

