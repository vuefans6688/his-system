<template>
  <div class="doctor-station-search">
    <h3>常见疾病辅助框</h3>
    <el-input placeholder="请输入常见诊断结果" class="input-with-select" v-model="searchText" size="small">
      <el-button slot="append" icon="el-icon-search" @click="searchTitle"></el-button>
    </el-input>
    <el-collapse v-model="activeNames">
      <el-collapse-item :name="index + 1" v-for="(item,index) in collapse" :key="index">
        <template slot="title">
          <div class="collapse-title">
            <el-tooltip class="item" effect="light" :content="item.titleName" placement="left">
              <span @click.stop="getTitle(item.titleName)" class="title-name">{{ item.titleName }}</span>
            </el-tooltip>
          </div>
        </template>
        <div class="collapse-content">
            <strong>表现: </strong>
        <p class="collapse">
          <span v-for="(item, index) in item.act" :key="index" @click="getBehavior(item)">{{ item }}</span>
        </p>
        <strong>查体: </strong>
         <p class="collapse">
          <span v-for="(item, index) in item.body" :key="index" @click="getBodyCheck(item)">{{ item }}</span>
        </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeNames: 1,
      biaoxian: {
        huxi: [
          '发热', '咳嗽', '咽痛', '鼻塞', '流鼻涕', '打喷嚏', '乏力', '呕吐', '咳痰', '头痛', '食欲不振', '咽部不适'
        ],
        chati: [
          '咽部充血', '下颌淋巴结肿大', '扁桃体肿大'
        ]
      },
      search: {
        checked1: true
      },
      collapse: [
        {
          titleName: '急性上呼吸道感染',
          act: [
            '发热', '咳嗽', '咽痛', '鼻塞', '流鼻涕', '打喷嚏', '乏力', '呕吐', '咳痰', '头痛', '食欲不振', '咽部不适'
          ],
          body: [
            '咽部充血', '下颌淋巴结肿大', '扁桃体肿大'
          ],
          checkbox: false
        },
        {
          titleName: '原发性血压',
          act: [
            '头晕', '头痛', '头胀', '头颈部扳紧感', '高血压家族史'
          ],
          body: [
            '高血压'
          ]
        },
        {
          titleName: '急性气管支气管炎',
          act: [
            '咳嗽', '咳痰', '发热', '胸闷', '湿罗音', '全身酸痛', '声音嘶哑', '鼻塞', '咽痛'
          ],
          body: [
            '咳嗽后啰音消失', '咳嗽后啰音减少', '干啰音'
          ]
        },
        {
          titleName: '糖尿病',
          act: [
            '高血糖', '乏力', '多食', '多尿', '外阴瘙痒', '多饮', '体重减轻'
          ]
        },
        {
          titleName: '咽炎',
          act: [
            '咽部异物感', '咽干', '咽部不适', '咽痒', '咽痛', '咳嗽', '刺激性干咳', '吞咽痛'
          ],
          body: [
            '咽部充血', '颌下淋巴结肿大伴压痛'
          ]
        },
        {
          titleName: '胃食管反流病',
          act: [
            '夜间反酸', '反酸', '烧心', '胸骨后烧灼感', '吞咽困难', '呕血', '胸痛', '胸骨后疼痛', '胸骨后异物感', '咽部异物感'
          ]
        },
        {
          titleName: '消化不良',
          act: [
            '嗳气', '早饱感', '恶心', '上腹胀痛', '食欲不振', '餐后上腹痛', '上腹不适', '呕吐'
          ],
          body: [
            '咽部充血', '下颌淋巴结肿大', '扁桃体肿大'
          ]
        },
        {
          titleName: '扁桃体炎',
          act: [
            '吞咽痛', '发热', '咽痛', '红细胞沉降率升高', '咽干', '咽痒', '咽部异物感', '刺激性咳嗽'
          ],
          body: [
            '扁桃体脓点', '扁桃体肿大', '扁桃体瘢痕凹凸不平与周围组织粘连', '扁桃体充血', '颌下淋巴结肿大伴牙痛', '咽部充血'
          ]
        },
        {
          titleName: '骨质疏松',
          act: [
            '腰背痛', '骨痛', '脊柱畸形', '脊柱压缩性骨折', '身材变矮', '负重能力下降', '自发性骨折'
          ]
        },
        {
          titleName: '脑梗死',
          act: [
            '偏身感觉障碍', '失语', '单侧肢体活动不利', '口角歪斜', '语言不利', '失读', '晕厥', '呕吐', '抽搐', '头痛'
          ],
          body: [
            '偏瘫', '伸舌偏斜', '双眼凝视', '意识障碍', '偏盲', '肌张力降低', '偏身感觉缺失', '共济失调', '不自主运动', '眼震'
          ]
        },
        {
          titleName: '感染性腹泻',
          act: [
            '腹泻', '发热', '腹痛', '呕吐', '恶心', '食欲不振', '反酸', '呕血', '进食生冷食物史', '大量饮酒史'
          ]
        },
        {
          titleName: '胃炎',
          act: [
            '嗳气', '腹胀', '上腹痛', '呕吐', '恶心', '食欲不振', '反酸', '呕血', '进食生冷食物史', '大量饮酒史', '食欲不振', '咽部不适'
          ]
        },
        {
          titleName: '慢性软组织损伤',
          act: [
            '腰痛', '腰骶部疼痛', '腰痛向下肢放射', '腰部酸胀', '关节或骨突出部包块', 'Finkelstein试验阳性', '肢体无力', '颈肩痛', '肢体麻木', '颈肩痛向上肢放射'
          ],
          body: [
            '腰部固定点压痛', '肢体感觉障碍', '腰骶部牵涉痛', '腱消炎'
          ]
        },
        {
          titleName: '哮喘',
          act: [
            '喘憋', '平喘药物治疗后呼吸困难缓解', '呼气性呼吸困难', '咳嗽', '咳痰', '流清水涕', '有过敏史'
          ],
          body: [
            '双肺哮鸣音'
          ]
        },
        {
          titleName: '过敏性鼻炎',
          act: [
            '流清水涕', '鼻塞', '鼻痒', '症状与季节相关', '嗅觉减退', '有过敏史', '过敏性鼻炎家族史'
          ]
        }
      ],
      searchText: ''  // 搜索信息
    }
  },
  methods: {
    getBehavior(str) {
      this.$emit('sendBehavior', str)
    },
    getBodyCheck(str) {
      this.$emit('sendBodyCheck', str)
    },
    getTitle(str) {
      this.$emit('sendTitle', str)
    },
    searchTitle() {
      const searchText = this.searchText
      if (searchText === '') return  // 空返回
      this.collapse.forEach((val, index) => { // 存在则放在第一位
        if (val.titleName.indexOf(searchText) > -1) {
          this.collapse.splice(0, 0, this.collapse[index])
          this.collapse.splice(index + 1, 1)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.doctor-station-search {
  padding: 5px;
  overflow-y: auto;
  overflow-x: hidden;
}
h3 {
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #000;
  text-align: center;
}
.el-collapse {
  margin-top: 5px;
  width: 100%;
  .collapse-title {
    font-size: 15px;
    padding-left: 5px;
    color: #000;
    border-bottom: 1px solid #ccc;
    .title-name:hover {
      color: #09f;
    }
    .el-checkbox {
      margin-right: 5px;
    }
  }
  .collapse-content {
    padding: 5px;
    strong {
      font-size: 15px;
      line-height: 30px;
    }
    span {
      box-sizing: border-box;
      border: 1px solid #ccc;
      padding: 0px 6px;
      font-size: 14px;
      margin: 5px 7px 5px 0;
      display: inline-block;
      cursor: pointer;
    }
  }
}
</style>
