<template>
  <div class="section-manage">
    <div class="add-section">
      <el-button size="small" type="primary" @click="modifySection(-1)">新增</el-button>
    </div>
    <el-table :data="sections" type="index" stripe>
      <el-table-column align="center" prop="seq_num" label="社保编号"></el-table-column>
      <el-table-column align="center" prop="name" label="名称"></el-table-column>
      <el-table-column align="center" prop="createTime" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | clinicDateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.disabled | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否开通挂号">
        <template slot-scope="scope">
          <span>{{ scope.row.can_appoint | yesOrNoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="modifySection(scope.$index)">编辑</el-button>
          <el-button type="text" @click="forbidSection(scope.$index)" v-if="scope.row.disabled === 0" style="color: #f00;">禁用</el-button>
          <el-button type="text" @click="startSection(scope.$index)" v-if="scope.row.disabled !== 0" style="color: #42b983;">启用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="modify-section" v-show="modifySectionShow">
      <div class="container">
        <h4 class="title">{{ oparation }}科室</h4>
        <div class="close" @click="modifySectionCancel('section')">
          <i class="el-icon-close"></i>
        </div>
        <el-form :model="section" ref="section" :rules="sectionRules" label-width="120px" size="small">
          <el-form-item label="科室编号:" prop="seq_num">
            <el-input v-model="section.seq_num" :disabled="true" style="width: 500px;"></el-input>
          </el-form-item>
          <el-form-item label="科室名称:" prop="name">
            <el-autocomplete popper-class="my-autocomplete" v-model="section.name" style="width: 500px;"
              :fetch-suggestions="querySearch" placeholder="请选择科室名称" @select="handleSelect"
              value-key="name">  
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="是否开通挂号:" prop="can_appoint" required align="left">
            <el-radio-group v-model="section.can_appoint">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="footer">
            <el-button type="primary" @click="modifySectionConfirm('section')" size="small">确定</el-button>
            <el-button @click="modifySectionCancel('section')" size="small">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { AKF001 } from '@/common/dictionary'
import { createDept, modifyDept, getDeptList } from '@/serve/api'
import service from '@/utils/request'
export default {
  data() {
    return {
      modifySectionShow: false,
      section: {
        name: '',
        seq_num: '',  // 科室编号
        can_appoint: 1, // 是否开通预约(1表示是)
        szsbcode: '',
        szsbname: ''
      },
      sections: [],
      sectionNames: AKF001,
      sectionRules: {
        name: [
          { required: true, message: '请输入科室名称', trigger: 'change' }
        ]
      },
      action: '', // 记录是新增还是编辑
      index: -1  // 记录编辑的行号
    }
  },
  methods: {
    // 医保科室联想
    querySearch(queryString, callback) {
      const sectionNames = this.sectionNames
      const results = queryString ? sectionNames.filter(this.createFilter(queryString)) : sectionNames
      // 调用 callback 返回建议列表的数据
      callback(results)
    },
    createFilter(queryString) {
      return sectionName => sectionName.value.toLowerCase().includes(queryString.toLowerCase())
    },
    handleSelect(item) {  // 联想选择事件
      this.section.name = item.value
      this.section.seq_num = item.key
    },
    modifySection(index) {
      this.index = index
      if (index > -1) {
        this.action = 'edit'
        this.section.seq_num = this.sections[index].seq_num
        this.section.name = this.sections[index].name
        this.section.can_appoint = this.sections[index].can_appoint
      } else {
        this.action = 'new'
      }
      this.modifySectionShow = true
    },
    modifySectionCancel() {
      this.addOrEditReset('section')
    },
    // 创建科室
    createDepartment() {
      service(createDept, {
        ...this.section,
        szsbcode: this.section.seq_num,
        szsbname: this.section.name
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const newSection = res
          // 更新
          this.sections.push(newSection)
          // 重置表单
          this.addOrEditReset('section')
          this.$message.success({ message: '科室创建成功!', duration: 1000, showClose: true })
        }
      })
    },
    // 编辑
    editDepartment() {
      service(modifyDept, {
        item_id: this.sections[this.index].dept_id,
        items: [
          {
            name: 'seq_num',
            newVal: this.section.seq_num
          },
          {
            name: 'name',
            newVal: this.section.name
          },
          {
            name: 'szsbcode',
            newVal: this.section.seq_num
          },
          {
            name: 'szsbname',
            newVal: this.section.name
          },
          {
            name: 'can_appoint',
            newVal: this.section.can_appoint + ''
          }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 更新
          this.sections[this.index].seq_num = this.section.seq_num
          this.sections[this.index].name = this.section.name
          this.sections[this.index].szsbcode = this.section.szsbcode
          this.sections[this.index].szsbname = this.section.szsbname
          this.sections[this.index].can_appoint = this.section.can_appoint
          // 重置表单
          this.addOrEditReset('section')
          this.$message.success({ message: '科室修改成功!', duration: 1000, showClose: true })
        }
      })
    },
    modifySectionConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 验证成功的处理
          if (this.action === 'new') {
            // 新建科室
            this.createDepartment()
          } else {
            // 编辑科室
            this.editDepartment()
          }
        } else {
          return false
        }
      })
    },
    startSection(index) {
      this.changeStatus(index, 0)
    },
    forbidSection(index) {
      this.$confirm('禁用后将无法使用, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.changeStatus(index, 1)
      }).catch()
    },
    changeStatus(index, status) {
      service(modifyDept, {
        item_id: this.sections[index].dept_id,
        items: [
          {
            name: 'disabled',
            newVal: status + ''
          }
        ]
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          this.sections[index].disabled = status
          // 重置表单
          this.addOrEditReset('section')
        }
      })
    },
    addOrEditReset(ruleForm) {
      // 重置表单
      this.modifySectionShow = false
      this.$refs[ruleForm].resetFields()
    },
    getDepartment() {  // 获取科室
      service(getDeptList, {
        disabled: 2,    // 2表示获取所有
        can_appoint: 2  // 同上
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          res = res && res.length ? res : []
          this.sections = res
        }
      })
    }
  },
  watch: {
    section: {
      handler() {
        const results = this.sectionNames.filter(item => item.value === this.section.name)
        if (results && results.length === 0) {
          this.section.seq_num = ''
        } else {
          this.section.seq_num = results[0].key
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    oparation() {
      return this.action === 'edit' ? '编辑' : '新增'
    }
  },
  filters: {
    yesOrNoFilter(flag) {
      return flag ? '是' : '否'
    },
    statusFilter(status) {
      return status === 0 ? '已启用' : '已禁用'
    },
    clinicDateFilter(date) {
      const str = date + ''
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2)
    }
  },
  created() {
    this.getDepartment()
  }
}
</script>

<style lang="scss" scoped>
.section-manage {
  margin-top: 20px;
  margin-left: 30px;
  .add-section {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    width: 90%;
  }
  .el-table {
    width: 90%;
    margin-top: 20px;
  }
  .modify-section {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3001;
    background: rgba(7, 17, 27, 0.7);
    .container {
      width: 700px;
      height: 300px;
      position: absolute;
      left: 50%;
      top: 35%;
      transform: translate(-50%, -50%);
      background: #fff;
      .title {
        text-align: center;
        color: #666;
      }
      .close {
        .el-icon-close {
          position: absolute;
          right: 25px;
          top: 20px;
          font-size: 20px;
          cursor: pointer;
        }
      }
      .el-form {
        margin-left: 10px;
        .footer {
          text-align: center;
        }
      } 
    }
  }
}
</style>
