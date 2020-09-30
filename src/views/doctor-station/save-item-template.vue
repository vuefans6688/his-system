<template>
  <div class="save-item-template">
    <div class="container">
      <div class="close" @click="closeSavePlatesWin">
        <i class="el-icon-close"></i>
      </div>
      <h3 class="title">保存项目模板</h3>
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
    ...mapGetters(['token', 'user', 'clinic'])
  },
  props: {
    itemtype: {
      type: Number,
      default: 0
    },
    items: {
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
        if (valid) {
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
          item_list: this.item_list
        }
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.$message({ message: '保存成功', type: 'success', showClose: true, duration: 1000 })
          this.closeSavePlatesWin()
        }
      })
    }
  },
  mounted() {
    this.items.forEach(element => {
      const item = {
        item_id: '',
        item_type: '',
        name: '',
        total: '',
        total_unit: ''
      }
      item.item_id = element.chargitem_id
      item.item_type = this.itemtype
      item.name = element.name
      item.total = parseInt(element.total, 10)
      item.total_unit = element.total_unit
      this.item_list.push(item)
    })
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

