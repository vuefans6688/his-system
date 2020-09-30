<template>
  <div class="charge-statistics">
    <!-- 查询 -->
    <el-form :model="searchData" size="small" label-width="80px">
      <el-form-item label="日期:">
        <el-date-picker v-model="searchData.dateVal" unlink-panels :editable="false" 
          :clearable="false" type="daterange" :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <div class="time-select">
        <span class="change-time" @click="changeTime(30)">最近一月</span>
        <span class="change-time" @click="changeTime(91)">最近三月</span>
        <span class="change-time" @click="changeTime(183)">最近半年</span>
        <span class="change-time" @click="changeTime(364)">最近一年</span>
      </div>
    </el-form>
    <el-tabs type="card" v-model="selectName">
      <el-tab-pane label="图表" name="1">
        <div class="finance">
          <h4 class="title">财务概况</h4>
          <el-row>
            <el-col :span="6">
              <p style="color: #f00;">实际收入: {{ echartsArr.sum_real_price | priceFilter }}元</p>
              <p>总应收: {{ echartsArr.sum_total_price | priceFilter }}元</p>
            </el-col>
            <el-col :span="6">
              <p style="color: #f00;">总减免: {{ echartsArr.sum_reduce_price | priceFilter }}元</p>
              <p style="color: #f00;">总退费: {{ echartsArr.sum_refund | priceFilter }}元</p>
            </el-col>
            <el-col :span="6">
              <p>现金: {{ echartsArr.sum_cash | priceFilter }}元</p>
              <p>银行卡: {{ echartsArr.sum_card | priceFilter }}元</p>
            </el-col>
            <el-col :span="6">
              <p>微信支付: {{ echartsArr.sum_wechat | priceFilter }}元</p>
              <p>支付宝支付: {{ echartsArr.sum_alipay | priceFilter }}元</p>
            </el-col>
          </el-row>
        </div>
        <div class="canvas">
          <div id="main2" ref="chartOne"></div>
          <div id="main3"></div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="详情" name="2">
        <div class="detail">
          <el-form :model="searchData" size="small" label-width="80px">
            <el-form-item label="收费类型:">
              <el-select v-model="searchData.charge_type">
                <el-option :label="item.name" :value="item.value" v-for="item in payItem" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收费情况:" style="margin-left: 10px;">
              <el-select v-model="searchData.data_type">
                <el-option label="已收费" :value="1"></el-option>
                <el-option label="已退费" :value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="charge-table" v-if="searchData.data_type === 1">
          <el-table :data="chargeTable" ref="multipleTable" stripe>
            <el-table-column label="序号" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.index }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收费时间" align="center" width="190">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.create_time }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收费类型" align="center">
              <template slot-scope="props">
                <el-tooltip placement="top" effect="light">
                  <span :class="{'total-price': props.row.index === '合计'}">
                    {{ props.row.charge_type | chargeFilter }}
                  </span>
                  <div slot="content">
                    <p v-for="(item, index) in props.row.tips" :key="index">
                      {{ item.chargetype | chargeFilter }}
                    </p>
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="收费单号" align="center" width="140">
              <template slot-scope="props">
                <span>{{ props.row.item_id | undefineFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="patient_name" label="客户姓名" align="center"></el-table-column>
            <el-table-column label="性别" align="center">
              <template slot-scope="props">
                <span>{{ props.row.patient_gender | sexFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="手机号" align="center" width="140">
              <template slot-scope="props">
                <span>{{ props.row.patient_phone | undefineFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="就诊科室" align="center" width="120">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.diagn_dept | undefineFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="就诊医生" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.diagn_doctor | undefineFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="应收金额" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.total_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="实收金额" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.real_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="减免金额" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.reduce_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="现金" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.cash_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="银行卡" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.bank_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="微信支付" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.wx_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="支付宝支付" align="center" width="140">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.zfb_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="charge-table" v-if="searchData.data_type === 2">
          <el-table :data="chargeTable" ref="multipleTable" stripe>
            <el-table-column label="序号" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.index }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收费时间" align="center" width="190">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">{{ props.row.create_time }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收费类型" align="center">
              <template slot-scope="props">
                <el-tooltip placement="top" effect="light">
                  <span :class="{'total-price': props.row.index === '合计'}">
                    {{ props.row.charge_type | chargeFilter }}
                  </span>
                  <div slot="content">
                    <p v-for="(item, index) in props.row.tips" :key="index">
                      {{ item.chargetype | chargeFilter }}
                    </p>
                  </div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="收费单号" align="center" width="140">
              <template slot-scope="props">
                <span>{{ props.row.item_id | undefineFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="patient_name" label="客户姓名" align="center">
            </el-table-column>
            <el-table-column label="性别" align="center">
              <template slot-scope="props">
                <span>{{ props.row.patient_gender | sexFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="手机号" align="center" width="130">
              <template slot-scope="props">
                <span>{{ props.row.patient_phone | undefineFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="就诊科室" align="center" width="120">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.diagn_dept | undefineFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="就诊医生" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.diagn_doctor | undefineFilter }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="退费金额" align="center">
              <template slot-scope="props">
                <span :class="{'total-price': props.row.index === '合计'}">
                  {{ props.row.real_price | priceFilter }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="pagination" v-show="selectName === '2'">
      <el-pagination @current-change="handleCurrentChange" :current-page="pageindex" :page-size="15" layout="total, prev, pager, next, jumper" :total="totalCount"></el-pagination>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/bar')  // 引入柱状图组件
require('echarts/lib/chart/pie')
require('echarts/lib/component/tooltip')  // 引入提示框和title组件
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/toolbox')
export default {
  data() {
    return {
      value: 3,
      selectName: '1',
      clinicName: '',   // 诊所名
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 30))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三月',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 91))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近半年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 183))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(new Date() - (1000 * 60 * 60 * 24 * 364))
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      chargeTable: [],  // 收费数据
      echartsArr: {},   // 图标数据
      searchData: {
        dateVal: [new Date(new Date() - (1000 * 60 * 60 * 24 * 30)), new Date()],   // 日期
        charge_type: 0,   // 收费类型
        data_type: 1   // 收费退费
      },
      payItem: [
        {
          value: 0,
          name: '全部'
        },
        {
          value: 7,
          name: '诊金'
        },
        {
          value: 2,
          name: '处方'
        },
        {
          value: 3,
          name: '诊疗项目'
        },
        {
          value: 4,
          name: '耗材'
        },
        {
          value: 5,
          name: '门诊购药'
        },
        {
          value: 6,
          name: '其他'
        }
      ],
      pageindex: 1,  // 当前页数
      totalCount: 0  // 总页数
    }
  },
  methods: {
    handleCurrentChange(index) {  // 切换页数
      this.pageindex = index
      this.getList()
    },
    changeTime(time) {
      this.$set(this.searchData.dateVal, 0, new Date(new Date() - (1000 * 60 * 60 * 24 * time)))
    },
    makeDateTimeString(timestamp) {
      const str = '' + timestamp
      return '20' + str.substr(0, 2) + '-' + str.substr(2, 2) + '-' + str.substr(4, 2) + ' ' + str.substr(6, 2) + ':' + str.substr(8, 2)
    },
    getClinicName() {  // 获取诊所名
      this.$http.post('/service/public/clinic_name', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic
        }
      }).then(res => {
        if (res.data.errcode === 0) {
          this.clinicName = res.data.data.clinic_name
        } else {
          this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
        }
      })
    },
    getList() {
      this.$http.post('/service/stats/charges', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          charge_type: this.searchData.charge_type,
          date_from: this.searchData.dateVal[0].format('yyMMdd'),
          date_to: this.searchData.dateVal[1].format('yyMMdd'),
          page_index: this.pageindex - 1,
          page_size: 10,
          data_type: this.searchData.data_type
        }
      }).then(response => {
        const res = response.data
        if (res.errcode === 0 && res.data.clinic_id === this.clinic) {
          const data = res.data.items || []
          this.chargeTable = data.map(val => {
            val.create_time = this.makeDateTimeString(val.create_time)
            return val
          })
          let sum = 0
          if (this.searchData.data_type === 1) {
            res.data.sum_typed_total_price.forEach(val => sum += val)
          } else if (this.searchData.data_type === 2) {
            res.data.sum_typed_refund.forEach(val => sum += val)
          }
          const obj = {
            index: '合计',
            create_time: `${this.searchData.dateVal[0].getFullYear()}-${this.searchData.dateVal[0].getMonth() + 1}-${this.searchData.dateVal[0].getDate()} 至
            ${this.searchData.dateVal[1].getFullYear()}-${this.searchData.dateVal[1].getMonth() + 1}-${this.searchData.dateVal[1].getDate()}`,
            charge_type: 99,
            item_id: '',
            patient_name: '-',
            patient_gender: '',
            patient_phone: '',
            diagn_dept: '所有科室',
            diagn_doctor: '所有医生',
            total_price: sum,
            real_price: res.data.sum_refund,
            reduce_price: res.data.sum_reduce_price,
            cash_price: res.data.sum_cash,
            bank_price: res.data.sum_card,
            wx_price: res.data.sum_wechat,
            zfb_price: res.data.sum_alipay
          }
          this.chargeTable.forEach((val, index) => {
            val.index = index + 1
            val.cash_price = 0
            val.wx_price = 0
            val.zfb_price = 0
            val.bank_price = 0
            switch (val.pay_method) {
              case 1:
                val.cash_price = val.real_price
                break
              case 2:
                val.bank_price = val.real_price
                break
              case 3:
                val.wx_price = val.real_price
                break
              case 4:
                val.zfb_price = val.real_price
                break
              default:
                break
            }
            if (val.data.length === 1) {
              val.charge_type = val.data[0].chargetype
            }
            val.tips = val.data
          })
          this.chargeTable.unshift(obj)
          this.totalCount = res.data.total
        } else {
          this.chargeTable = []
          if (res.errcode !== 0) {
            this.$message({ message: res.data.errmsg, type: 'error', showClose: true, duration: 1000 })
          }
        }
      }).catch()
    },
    getCharts() {
      this.$http.post('/service/stats/charges', {
        head: {
          accessToken: this.token,
          lastnotice: 0,
          msgid: ''
        },
        body: {
          clinic_id: this.clinic,
          charge_type: this.searchData.charge_type,
          date_from: this.searchData.dateVal[0].format('yyMMdd'),
          date_to: this.searchData.dateVal[1].format('yyMMdd'),
          data_type: 0
        }
      }).then(response => {
        const pieArr = []
        const res = response.data.data
        const arrString = ['挂号费', '处方费', '诊疗项目', '耗材', '门诊购药', '其它', '诊金']
        for (let i = 0; i < res.sum_typed_refund.length; i++) {
          res.sum_typed_total_price[i] = Number(res.sum_typed_total_price[i].toFixed(2))
          res.sum_typed_refund[i] = Number(res.sum_typed_refund[i].toFixed(2))
          res.sum_typed_refund[i] *= -1
          const pieArrVal = (res.sum_typed_total_price[i] + res.sum_typed_refund[i]).toFixed(2)
          pieArr.push({
            value: pieArrVal,
            name: arrString[i]
          })
          if (res.sum_typed_refund[i] === 0) {
            res.sum_typed_refund[i] = ''
          }
        }
        res.pieArr = pieArr
        this.echartsArr = res
        this.echartsArr.sum_real_price = this.echartsArr.sum_total_price - this.echartsArr.sum_reduce_price - this.echartsArr.sum_refund
        this.drawBar2('main2')
        this.drawPie('main3')
      }).catch()
    },
    drawPie(id) {  // 饼状图
      const chartOne = echarts.init(document.getElementById(id))
      const arrData = this.echartsArr.pieArr
      arrData.splice(0, 1)  // 删掉挂号费
      const arrString = ['处方费', '诊疗项目', '耗材', '门诊购药', '其它', '诊金']
      const option = {
        title: {
          text: this.clinicName,
          subtext: '实际收入占比',
          x: 'center',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333'         // 主标题文字颜色
          },
          subtextStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c}元 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'right',
          data: arrString
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: arrData,
            stillShowZeroSum: false,
            label: {
              normal: {
                formatter: '{b}: {c}元 ({d}%)',
                textStyle: {
                  fontSize: 14
                },
                subtextStyle: {
                  color: '#f00',  // 副标题文字颜色
                  fontSize: 14
                }
              }
            },
            labelLine: {
              show: true
            }
          }
        ]
      }
      chartOne.setOption(option)
    },
    drawBar2(id) {  // 柱状图
      const myChart = echarts.init(document.getElementById(id))
      const xAxisData = ['处方费', '诊疗项目', '耗材', '门诊购药', '其它', '诊金']
      const data1 = this.echartsArr.sum_typed_total_price
      const data2 = this.echartsArr.sum_typed_refund
      data1.splice(0, 1)  // 删掉挂号费
      data2.splice(0, 1)  // 删掉挂号费
      const option = {
        title: {
          text: this.clinicName,
          subtext: '收/退费分析',
          x: 'center',
          fontSize: '22px',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333'         // 主标题文字颜色
          },
          subtextStyle: {
            fontSize: 15
          }
        },
        legend: {
          data: ['收费金额', '退费金额'],
          align: 'left',
          left: 10
        },
        brush: {
          toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
          xAxisIndex: 0
        },
        toolbox: {
          feature: {
            magicType: {
              type: ['stack', 'tiled']
            }
          }
        },
        tooltip: {},
        xAxis: {
          data: xAxisData,
          name: '项目'
        },
        yAxis: {
          name: '金额（元）'
        },
        grid: {
          left: 50
        },
        series: [
          {
            name: '收费金额',
            type: 'bar',
            stack: 'one',
            stillShowZeroSum: false,
            itemStyle: {
              emphasis: {
                barBorderWidth: 1,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              normal: {
                label: {
                  show: true,  // 显示数字
                  color: 'grey',
                  position: 'top',  // 位置
                  fontSize: 14
                }
              }
            },
            data: data1
          },
          {
            name: '退费金额',
            type: 'bar',
            stack: 'one',
            itemStyle: {
              emphasis: {
                barBorderWidth: 1,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              normal: {
                label: {
                  show: true,  // 显示数字
                  color: 'grey',
                  position: 'bottom',  // 位置
                  fontSize: 14
                }
              }
            },
            data: data2
          }
        ],
        color: ['rgba(61, 119, 185, 0.8)', 'rgba(254, 67, 101, 0.9)']
      }
      myChart.setOption(option)
    }
  },
  mounted() {
    this.getClinicName()
    this.getCharts()
    this.getList()
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic'])
  },
  watch: {
    searchData: {
      handler() {
        this.getList()
        this.getCharts()
      },
      deep: true
    }
  },
  filters: {
    chargeFilter(id) {
      switch (id) {
        case 1:
          return '挂号费'
        case 2:
          return '处方费'
        case 3:
          return '诊疗项目费'
        case 4:
          return '耗材费'
        case 5:
          return '门诊售药费'
        case 6:
          return '其他费'
        case 99:
          return '合计'
        default:
          return '多项收费'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.charge-statistics {
  margin-top: 20px;
  .el-form {
    display: flex;
    .time-select {
      margin-left: 20px;
      margin-top: 6px;
      .change-time {
        padding: 8px;
        cursor: pointer;
        color: #09f;
        &:hover {
          border-bottom: 1px solid #09f;
        }
      }
    }
  }
  .el-tabs {
    margin-top: 20px;
    margin-left: 30px;
    width: 92%;
    .finance {
      .title {
        color: #666;
        background: #eee;
        height: 40px;
        line-height: 40px;
        padding-left: 6px;
      }
      .el-row {
        margin-left: 15px;
        font-size: 20px;
      }
    }
    .canvas {
      display: flex;
      height: 500px;
      padding-top: 20px;
      #main2 {
        /* 需要制定具体高度，以px为单位 */
        flex: 4;
      }
      #main3 {
        flex: 3;
      }
    }
    .detail {
      margin-top: 10px;
    }
    .charge-table {
      margin-top: 20px;
      .el-table {
        width: 100%;
        .total-price {
          font-weight: bold;
        }
      }
    }
  }
  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
