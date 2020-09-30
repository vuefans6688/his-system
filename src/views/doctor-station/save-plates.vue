<template>
  <div class="save-plates">
    <div class="container">
      <div class="close" @click="closeSavePlatesWin">
        <i class="el-icon-close"></i>
      </div>
      <h3 class="title">保存{{ type }}处方模板</h3>
      <el-form :model="templateType" ref="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="模板名称:" prop="name">
          <el-input v-model="templateType.name"></el-input>
        </el-form-item>
        <el-form-item label="模板类型:">
          <el-radio-group v-model="templateType.owner_type">
            <el-radio :label="0">个人</el-radio>
            <el-radio :label="1">通用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save('form')">保存</el-button>
          <el-button @click="closeSavePlatesWin">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'
import { createTemplate } from '@/serve/api'
export default {
  data() {
    return {
      templateType: {
        name: '',
        owner_type: 0
      },
      item_list: [],
      rules: {
        name: [
          { required: true, message: ' ', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    type() {
      if (this.itemtype === 2) {
        return '西药处方'
      }
    }
  },
  props: {
    itemtype: {
      type: Number,
      default: 0
    },
    // 西药处方
    drugList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    closeSavePlatesWin() {
      this.$emit('cancel')
    },
    save(ruleForm) {
      this.$refs[ruleForm].validate(valid => {
        this.drugList.forEach(v => delete v.druginfo)
        if (valid) {
          if (this.itemtype === 2) {
            this.stringToNumber2()
          } else if (this.itemtype === 3) {
            this.stringToNumber3()
          } else if (this.itemtype === 4) {
            this.stringToNumber4()
          }
          this.saveAsTemplate()
        } else {
          return false
        }
      })
    },
    saveAsTemplate() {
      service(createTemplate, {
        name: this.templateType.name,
        owner_type: this.templateType.owner_type,
        template_id: '',
        type: this.itemtype,
        data: {
          drug_list: this.drugList,
          daily_use: this.drugList[0].daily_use,
          daily_use_unit: this.drugList[0].daily_use_unit,
          frequency: this.drugList[0].frequency,
          taking_note: this.drugList[0].taking_note,
          total: this.drugList[0].total,
          total_unit: this.drugList[0].total_unit,
          use_method: this.drugList[0].use_method
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '保存成功', type: 'success', showClose: true, duration: 1000 })
          this.closeSavePlatesWin()
        }
      })
    },
    stringToNumber2() {
      this.drugList.forEach((drug, index) => {
        this.drugList[index].days = parseFloat(drug.days)
        this.drugList[index].dosage = parseFloat(drug.dosage)
        this.drugList[index].total = parseFloat(drug.total)
      })
    },
    // 中药
    stringToNumber3() {
      this.drugList.forEach((drug, index) => {
        this.drugList[index].daily_use = parseFloat(drug.daily_use)
        this.drugList[index].dosage = parseFloat(drug.dosage)
        this.drugList[index].total = parseFloat(drug.total)
      })
    },
    // 输液
    stringToNumber4() {
      this.drugList.forEach((drug, index) => {
        this.drugList[index].skin_test = this.drugList[index].skin_test ? 1 : 0
        this.drugList[index].dosage = parseFloat(drug.dosage)
        this.drugList[index].total = parseFloat(drug.total)
        this.drugList[index].infusion_speed = parseFloat(drug.infusion_speed)
        this.drugList[index].days = parseFloat(drug.days)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.close {
  position: relative;
  .el-icon-close {
    position: absolute;
    right: 30px;
    bottom: 30px;
    color: #09f;
  }
}
.title {
  text-align: center;
  color: #666;
}
</style>

