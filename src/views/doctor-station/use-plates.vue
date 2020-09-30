<template>
  <div class="use-plates">
    <h3 class="title">调用{{ type }}模板</h3>
    <span class="name">模板名称: </span>
    <el-input size="small" v-model="search" placeholder="请输入模板名称" style="width: 680px;"></el-input>
    <el-table :data="templateList" @row-click="select" stripe>
      <el-table-column prop="name" label="模板名字" align="center" width="100"></el-table-column>
      <el-table-column label="模板类型" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.owner_type | typeFilter }}</span>
        </template>
      </el-table-column> 
      <!-- 诊疗项目展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 5 || templateType === 6 || templateType === 7">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <p v-for="(item, index) in scope.row.data.item_list" :key="index">
              {{ item.name }}-{{ item.total }}-{{ item.total_unit }}
            </p>
            <div slot="reference" class="name-wrapper">{{ scope.row.data.item_list | miniNum }}</div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 病历展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 1">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <p>
              {{ scope.row.data.complaint }}-{{ scope.row.data.allergy_history }}-{{ scope.row.data.cur_history }}
            </p>
            <p>
              {{ scope.row.data.family_history }}-{{ scope.row.data.past_history }}-{{ scope.row.data.person_history }}
            </p>
            <p>
              {{ scope.row.data.other_history }}-{{ scope.row.data.other_phy_exam }}
            </p>
            <div slot="reference" class="name-wrapper">{{ scope.row.data.diagn_result }}</div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 西药处方模板展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 2">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <p v-for="(drug, index) in scope.row.data.drug_list" :key="index">
              {{ drug.name }}-{{ drug.spec_text }}-{{ drug.use_method }}
            </p>
            <div slot="reference" class="name-wrapper">
              <span v-for="(drug, index) in scope.row.data.drug_list" :key="index">{{ drug.name }}</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 中药处方模板展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 3">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <div class="data-list">
              <p v-for="(drug, index) in scope.row.data.drug_list" :key="index">{{ drug.name }}</p>
              <p>
                {{ scope.row.data.use_method }}
                总共{{ scope.row.data.total }}{{ scope.row.data.total_unit }}
                每次{{ scope.row.data.daily_use }}{{ scope.row.data.daily_use_unit }}
              </p>
            </div>
            <div slot="reference" class="name-wrapper">
              <span v-for="(drug, index) in scope.row.data.drug_list" :key="index">{{ drug.name }}</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 输液处方模板展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 4">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <div class="drug-list" v-for="(drug, index) in scope.row.data.drug_list" :key="index">
              <p>{{ drug.name }}-{{ drug.spec_text }}</p>
              <p>{{ drug.infusion_speed }}-{{ drug.infu_speed_unit }}-{{ drug.frequency }}-{{ drug.use_method }}</p>
            </div>
            <div slot="reference">
              <span v-for="(drug, index) in scope.row.data.drug_list" :key="index">{{ drug.name }}</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 医嘱展示 -->
      <el-table-column label="模板内容" align="center" v-if="templateType === 8">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right" width="300">
            <p>{{ scope.row.data.advice }}</p>
            <div slot="reference">{{ scope.row.data.advice }}</div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handleCurrentChange" :current-page="pageindex" :page-size="10" layout="total, prev, pager, next, jumper" :total="pageTotal"></el-pagination>
  </div>
</template>

<script>
import service from '@/utils/request'
import { getTemplateMenu } from '@/serve/api'
export default {
  data() {
    return {
      search: '',
      templateList: [],
      pageindex: 1,
      pageTotal: 0
    }
  },
  props: {
    templateType: {
      type: Number,
      default: 0
    }
  },
  filters: {
    typeFilter(id) {
      if (id === 0) {
        return '个人'
      } else if (id === 1) {
        return '通用'
      }
    },
    miniNum(list) {
      let label = ''
      list.forEach(element => label += element.name + ' ')
      return label
    }
  },
  methods: {
    handleCurrentChange(index) {  // 分页
      this.pageindex = index
      this.getMedicalTemplateList()
    },
    select(row) {
      this.$confirm(`调用${row.name}？`)
      .then(() => {
        this.$emit('callball', row, this.templateType)
      }).catch()
    },
    // 获取处方模板
    getMedicalTemplateList() {
      service(getTemplateMenu, {
        type: this.templateType,
        name: this.search,
        owner_type: 2,
        page_index: this.pageindex - 1,
        page_size: 10
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          if (res.items && res.items.length) {
            res.items.forEach(item => {
              if (item.data && item.data.jibingjson && item.data.jibingjson.length) {
                item.data.jibingstring = item.data.jibingjson.map(v => (v.maincode + '-' + v.jbname))
              }
            })
          }
          this.templateList = res.items || []
          this.pageTotal = res.total ? res.total : 0
        }
      })
    }
  },
  computed: {
    type() {
      switch (this.templateType) {
        case 1:
          return '病历'
        case 2:
          return '西药处方'
        case 3:
          return '中药处方'
        case 4:
          return '输液处方'
        case 5:
          return '诊疗项目'
        case 6:
          return '耗材'
        case 7:
          return '其他'
        case 8:
          return '常用医嘱'      
      }
    }
  },
  created() {
    this.getMedicalTemplateList()
  },
  watch: {
    search() {
      this.pageindex = 1
      this.getMedicalTemplateList()
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  text-align: center;
  color: #666;
}
.name {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}
.el-table {
  width: 100%;
  margin-top: 20px;
}
.el-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
