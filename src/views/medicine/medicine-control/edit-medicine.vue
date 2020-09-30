<template>
  <div class="edit-medicine">
    <div class="header">
      <h3 class="title top-title">{{ medicineTitle }}</h3>
      <div class="button-type">
        <button class="drug-button" :class="{active: buttonShowXiYao}" @click="showOrHideXiYao" :disabled="markX">西药/中成药</button>
        <button class="drug-button" :class="{active: buttonShowZhongYao}" @click="showOrHideZhongYao" :disabled="markZ">中草药</button>
      </div>
      <div class="button-group">
        <el-button type="primary" size="small" @click="handleSaveXi('xiyaoapply')" v-show="saveXiButton">保存</el-button>
        <el-button type="primary" size="small" @click="handleSaveZhong('zhongyaoapply')" v-show="saveZhongButton">保存</el-button>
        <el-button type="warning" size="small" @click="handleCancel">取消</el-button>
      </div>
    </div>
    <!-- 西药/中成药 -->
    <div class="west-info" v-show="xiYaoShow">
      <el-form :rules="rules1" ref="xiyaoapply" :model="xiyaoapply">
        <!-- 基本信息 -->
        <h3 class="title">基本信息</h3>
        <p class="warning" v-show="!doNot">提示语：为方便您后续接入社保需求，与您诊所匹配的药品信息请您优先选择带有社保标识的药品。</p>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="med_name" label="药品名称:">
              <el-autocomplete :disabled="doNot" v-model="xiyaoapply.med_name" :trigger-on-focus="false"
                :fetch-suggestions="querySearchAsync" placeholder="请输入药品名称" 
                @select="handleSelect" style="width: 260px;">
                <template slot-scope="props">
                  <div class="think">
                    <span class="name">{{ props.item.name }}</span> 
                    <span class="shebao" v-if="props.item.extra4 !== ''">社保</span>
                    <p class="spec">{{ props.item.extra1 }}</p>
                    <p class="factory">{{ props.item.extra2 }}</p>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="药品别名:">
              <el-input placeholder="请输入药品别名" v-model="xiyaoapply.med_lname" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="ake001" label="社保编码:" label-width="100px" 
              :rules="[{required: requiredFlag, message: '请输入社保编码', trigger: 'change'}]">
              <el-input placeholder="社保编码" v-model="xiyaoapply.ake001" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="aka074" label="规格:" label-width="82px"
              :rules="[{required: requiredFlag, message: '请输入药品本位码', trigger: 'change'}]">
              <el-input placeholder="药品本位码" v-model="xiyaoapply.aka074" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="批准文号:">
              <el-input placeholder="批准文号" v-model="xiyaoapply.med_titanic" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="standard_number" label="药品本位码:" label-width="100px"
              :rules="[{required: requiredFlag, message: '请输入药品本位码', trigger: 'change'}]">
              <el-input placeholder="药品本位码" v-model="xiyaoapply.standard_number" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <p>
          <i style="color: #f00;">*</i>
          药品规格: (<span style="color: #f00;"> 例如: 每【盒】有【20】【包】；每【包】有【20】【g】</span>)
        </p>
        <el-row>
          <el-col :span="3">
            <el-form-item prop="bigunit1" label="每">
              <el-select v-model="xiyaoapply.bigunit1" placeholder="请选择" :disabled="doNot" style="width: 110px;">
                <el-option v-for="(item, index) in bigUnitXiYao" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item prop="med_manyunit1" label="有">
              <el-input v-model="xiyaoapply.med_manyunit1" @keyup.native="limit('med_manyunit1')" :disabled="doNot" style="width: 110px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item prop="smallunit1">
              <el-select v-model="xiyaoapply.smallunit1" placeholder="请选择" :disabled="doNot" style="width: 110px;">
                <el-option v-for="(item, index) in options3" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item prop="smallunit1" label="每">
              <el-select v-model="xiyaoapply.smallunit1" placeholder="请选择" :disabled="doNot" style="width: 110px;">
                <el-option v-for="(item, index) in options4" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item prop="med_manyunit2" label="有">
              <el-input v-model="xiyaoapply.med_manyunit2" @keyup.native="limit('med_manyunit2')" :disabled="doNot" style="width: 110px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-form-item prop="smallunit2">
              <el-select v-model="xiyaoapply.smallunit2" placeholder="请选择" :disabled="doNot" style="width: 110px;">
                <el-option v-for="(item, index) in options5" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="med_dosage" label="药品剂型:">
              <el-select v-model="xiyaoapply.med_dosage" placeholder="请选择" :clearable="true" filterable style="width: 300px;">
                <el-option v-for="(item, index) in options8" :key="index" :label="item.value" :value="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="med_type" label="用药类型:">
              <el-select v-model="xiyaoapply.med_type" placeholder="请选择" :clearable="true" style="width: 300px;">
                <el-option v-for="(item, index) in options9" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="生产厂家:">
              <el-input placeholder="生产厂家" v-model="xiyaoapply.factory" style="width: 300px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="医保价格:">
              <el-input placeholder="医保价格" v-model="xiyaoapply.price_healthcard" @keyup.native="limit('price_healthcard')" :disabled="true" style="width: 300px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 使用信息 -->
        <h3 class="title">使用信息</h3>
        <el-row>
          <el-col :span="8">
            <el-form-item label="用法:" label-width="80px">
              <el-select v-model="xiyaoapply.usage" placeholder="请选择" clearable style="width: 290px;">
                <el-option v-for="(item, index) in options6" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单次用量:">
              <el-input v-model="xiyaoapply.use_times1" @keyup.native="limit('use_times1')" style="width: 90px;"></el-input>
              <span>{{ xiyaoapply.smallunit2 }}/次</span>
              <el-select v-model="xiyaoapply.use_times2" placeholder="请选择" clearable style="width: 195px;">
                <el-option v-for="(item, index) in options11" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item label="总量:">
              <el-select v-model="xiyaoapply.use_days" placeholder="请选择" clearable style="width: 110px;">
                <el-option v-for="(item, index) in options12" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item>
              <el-input v-model="xiyaoapply.use_total" @keyup.native="limit('use_total')" style="width: 110px;"></el-input>
              <span>{{ xiyaoapply.bigunit1 }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="药品说明:" label-width="80px">
              <el-input placeholder="药品说明" v-model="xiyaoapply.med_instruction" style="width: 290px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="药品功效:">
              <el-input placeholder="药品功效" v-model="xiyaoapply.med_efficacy" style="width: 310px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:" label-width="80px">
              <el-input type="textarea" placeholder="备注" v-model="xiyaoapply.remark" style="width: 750px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- 中草药 -->
    <div class="china-info" v-show="zhongYaoShow">
      <el-form :rules="rules2" ref="zhongyaoapply" :model="zhongyaoapply">
        <!-- 基本信息 -->
        <h3 class="title">基本信息</h3>
        <div class="add-action" v-if="act === '新增'">
          <router-link to="/static/中药批量导入.xlsx" class="download">下载模板</router-link>
          <el-upload class="upload" ref="upload" action="https://jsonplaceholder.typicode.com/posts/"
            :file-list="fileList" :before-upload="beforeFileUpload">
            <el-button slot="trigger" size="small" type="primary">一键导入</el-button>
          </el-upload>
        </div>
        <p class="warning">提示语：为方便您后续接入社保需求，与您诊所匹配的药品信息请您优先选择带有社保标识的药品。</p>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="med_name_z" label="药品名称:">
              <el-form-item prop="med_name">
                <el-autocomplete :disabled="doNot" v-model="zhongyaoapply.med_name_z"
                  :fetch-suggestions="querySearchAsync" placeholder="药品名称" 
                  @select="handleSelect" :trigger-on-focus="false" style="width: 260px;">
                  <template slot-scope="props">
                    <div class="think">
                      <span class="name">{{ props.item.name }}</span>  
                      <span class="shebao" v-if="props.item.extra4 !== ''">社保</span>
                      <span class="spec">{{ props.item.extra1 }}</span>
                      <p class="factory">{{ props.item.extra2 }}</p>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="med_lname_z" label="药品别名:" label-width="100px">
              <el-input placeholder="药品别名" v-model="zhongyaoapply.med_lname_z" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="factory_z" label="生产厂家:" label-width="100px">
              <el-input placeholder="生产厂家" v-model="zhongyaoapply.factory_z" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="ake001_z" label="社保编码:" label-width="82px" 
              :rules="[{required: requiredFlagZ, message: '请输入社保编码', trigger: 'change'}]">
              <el-input placeholder="社保编码" v-model="zhongyaoapply.ake001_z" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="standard_number_z" label="药品本位码:" label-width="100px"
              :rules="[{required: requiredFlagZ, message: '请输入药品本位码', trigger: 'change'}]">
              <el-input placeholder="药品本位码" v-model="zhongyaoapply.standard_number_z" style="width: 260px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="med_dosage_z" label-width="100px" label="药品剂型:">
              <el-select v-model="zhongyaoapply.med_dosage_z" placeholder="药品剂型" :clearable="true" style="width: 260px;">
                <el-option v-for="(item, index) in options8" :key="index" :label="item.value" :value="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 使用信息 -->
        <h3 class="title">使用信息</h3>
        <el-row>
          <el-col :span="8">
            <el-form-item label="用法:" label-width="80px">
              <el-select v-model="zhongyaoapply.usage_z" placeholder="请选择" :clearable="true" style="width: 290px;">
                <el-option v-for="(item, index) in options6" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="单次剂量:">
              <el-input v-model="zhongyaoapply.use_times1_z" @keyup.native="limit2('use_times1_z')" style="width: 250px;"></el-input>
              <span style="margin-left: 10px;">克/剂</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="药品说明:" label-width="80px">
              <el-input placeholder="药品说明" v-model="zhongyaoapply.med_instruction_z" style="width: 290px;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="15">
            <el-form-item label="药品功效:">
              <el-input placeholder="药品功效" v-model="zhongyaoapply.med_efficacy_z" style="width: 290px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注:" label-width="80px">
            <el-input type="textarea" placeholder="备注" v-model="zhongyaoapply.remark_z" style="width: 730px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import XLSX from 'xlsx'
import { querySearchDrugKey, selectDrug, saveDrug } from '@/serve/api'
import service from '@/utils/request'
import { floatLimit } from '@/utils/inputLimit'
import { AKA070 } from '@/common/dictionary'
export default{
  data() {
    return {
      data: {
        act: ''
      },
      requiredFlag: false,
      requiredFlagZ: false,
      rules1: {
        med_name: [
          { required: true, message: '请输入药品名称', trigger: 'blur' }
        ],
        bigunit1: [
          { required: true, message: '请输入常用单位', trigger: 'change' }
        ],
        med_manyunit1: [
          { required: true, message: '请输入换算量', trigger: 'change' }
        ],
        smallunit1: [
          { required: true, message: '请输入最小单位', trigger: 'change' }
        ],
        med_manyunit2: [
          { required: true, message: '请输入剂量', trigger: 'change' }
        ],
        smallunit2: [
          { required: true, message: '请输入剂型单位', trigger: 'change' }
        ],
        aka074: [
          { required: true, message: '请输入规格', trigger: 'change' }
        ]
      },
      rules2: {
        med_name_z: [
          { required: true, message: '请输入药品名称', trigger: 'blur' }
        ],
        med_class_z: [
          { required: true, message: '请输入药品分类', trigger: 'change' }
        ]
      },
      options1: [
        { value: '饮片', label: '饮片' }, { value: '中成药', label: '中成药' }, 
        { value: '西药', label: '西药' },
        { value: '化学制剂', label: '化学制剂' }, { value: '耗材', label: '耗材' },
        { value: '生物制剂', label: '生物制剂' }, { value: '其他', label: '其他' }
      ],
      bigUnitZhongYao: [
        { value: 'kg', label: 'kg' }, { value: 'g', label: 'g' },
        { value: '盒', label: '盒' }, { value: '袋', label: '袋' }, { value: '包', label: '包' },
        { value: 'mg', label: 'mg' }, { value: 'ml', label: 'ml' },
        { value: '单位', label: '单位' }, { value: '瓶', label: '瓶' }, { value: '桶', label: '桶' },
        { value: '万单位', label: '万单位' }, { value: '把', label: '把' }, { value: '板', label: '板' },
        { value: '小包', label: '小包' }, { value: '小袋', label: '小袋' }, { value: '粒', label: '粒' },
        { value: '枚', label: '枚' }, { value: '片', label: '片' }, { value: '张', label: '张' },
        { value: '只', label: '只' }, { value: '支', label: '支' }, { value: '贴', label: '贴' },
        { value: '%', label: '%' }, { value: '罐', label: '罐' }
      ],
      bigUnitXiYao: [
        { value: '盒', label: '盒' }, { value: '袋', label: '袋' }, { value: '包', label: '包' }, { value: 'ug', label: 'ug' },
        { value: 'mg', label: 'mg' }, { value: 'ml', label: 'ml' }, { value: 'kg', label: 'kg' }, { value: 'g', label: 'g' },
        { value: '单位', label: '单位' }, { value: '瓶', label: '瓶' }, { value: '桶', label: '桶' },
        { value: '万单位', label: '万单位' }, { value: '把', label: '把' }, { value: '板', label: '板' },
        { value: '小包', label: '小包' }, { value: '小袋', label: '小袋' }, { value: '粒', label: '粒' },
        { value: '枚', label: '枚' }, { value: '片', label: '片' }, { value: '张', label: '张' },
        { value: '只', label: '只' }, { value: '支', label: '支' }, { value: '贴', label: '贴' },
        { value: '%', label: '%' }, { value: '罐', label: '罐' }
      ],
      options3: [
        { value: 'g', label: 'g' }, { value: 'mg', label: 'mg' }, { value: 'ml', label: 'ml' }, { value: 'ug', label: 'ug' },
        { value: '板', label: '板' }, { value: '小包', label: '小包' }, { value: '小袋', label: '小袋' },
        { value: '粒', label: '粒' }, { value: '片', label: '片' }, { value: '枚', label: '枚' },
        { value: '张', label: '张' }, { value: '贴', label: '贴' }, { value: '支', label: '支' },
        { value: '只', label: '只' }, { value: '瓶', label: '瓶' }, { value: '包', label: '包' },
        { value: '袋', label: '袋' }, { value: '盒', label: '盒' }, { value: '桶', label: '桶' },
        { value: '单位', label: '单位' }, { value: '万单位', label: '万单位' }, { value: '把', label: '把' },
        { value: '%', label: '%' }, { value: '个', label: '个' }
      ],
      options4: [],
      options5: [
        { value: 'g', label: 'g' }, { value: 'mg', label: 'mg' }, { value: 'ml', label: 'ml' }, { value: 'ug', label: 'ug' },
        { value: '板', label: '板' }, { value: '小包', label: '小包' }, { value: '小袋', label: '小袋' },
        { value: '粒', label: '粒' }, { value: '片', label: '片' }, { value: '枚', label: '枚' },
        { value: '张', label: '张' }, { value: '贴', label: '贴' }, { value: '支', label: '支' },
        { value: '只', label: '只' }, { value: '瓶', label: '瓶' }, { value: '包', label: '包' },
        { value: '袋', label: '袋' }, { value: '盒', label: '盒' }, { value: '桶', label: '桶' },
        { value: '单位', label: '单位' }, { value: '万单位', label: '万单位' }, { value: '把', label: '把' },
        { value: '%', label: '%' }, { value: '个', label: '个' }
      ],
      // 用法
      options6: [
        { value: '冲服', label: '冲服' }, { value: '口服', label: '口服' }, { value: '外用', label: '外用' },
        { value: '雾化', label: '雾化' }, { value: '皮下注射', label: '皮下注射' }, { value: '肌肉注射', label: '肌肉注射' },
        { value: '静脉注射', label: '静脉注射' }, { value: '静脉滴注', label: '静脉滴注' }, { value: '穴位注射', label: '穴位注射' },
        { value: '肌肉注射皮试', label: '肌肉注射皮试' }, { value: '雾化皮试', label: '雾化皮试' }, { value: '静脉滴注皮试', label: '静脉滴注皮试' },
        { value: '局部封闭', label: '局部封闭' }, { value: '灌肠', label: '灌肠' }, { value: '左眼', label: '左眼' },
        { value: '右眼', label: '右眼' }, { value: '直接服用', label: '直接服用' }, { value: '温水服用', label: '温水服用' },
        { value: '泡水', label: '泡水' }, { value: '生吃', label: '生吃' }, { value: '外敷', label: '外敷' },
        { value: '煎服', label: '煎服' }, { value: '水煎服两次使用', label: '水煎服两次使用' }, { value: '碾碎分两次服用', label: '碾碎分两次服用' }
      ],
      options8: [],  // 剂型单位(字典)
      options9: [  // 用药类型
        { value: 1, label: '处方药' }, { value: 0, label: '非处方药' }
      ], 
      options11: [
        { value: 1, label: '每日一次(qd)' }, { value: 2, label: '每日二次(bid)' }, { value: 3, label: '每日三次(tid)' },
        { value: 4, label: '每日四次(qid)' }, { value: 5, label: '隔日一次(qod)' }, { value: 6, label: '必要时(prn)' },
        { value: 7, label: '每周一次(qw)' }, { value: 8, label: '立即' }
      ],
      options12: [
        { value: 1, label: '1天' }, { value: 2, label: '2天' }, { value: 3, label: '3天' },
        { value: 4, label: '4天' }, { value: 5, label: '5天' }, { value: 6, label: '6天' },
        { value: 7, label: '7天' }
      ],
      options13: [],
      options14: [],
      // 中西药区分数据
      buttonShowXiYao: true,  // 西药的标题按钮
      buttonShowZhongYao: false,  // 中药的标题按钮
      xiYaoShow: true,  // 西药的页面
      zhongYaoShow: false,  // 中药的页面
      saveXiButton: true,  // 西药的保存按钮
      saveZhongButton: false,  // 中药的保存按钮
      drugtype: '0',  // 区分西药0、中药1的字段
      markX: false,  // 控制西药标题按钮的禁用
      markZ: false,  // 控制中药标题按钮的禁用
      // 禁止编辑
      doNot: false,
      // 编辑时控制中西药标题的显示
      showbtntital: false,
      // 初始的药品社保编号
      ake001_z: '',
      ake001: '',
      // 药品数据
      xiyaoapply: {
        med_name: '',  // 药品名称.
        med_lname: '',  // 药品别名.
        med_titanic: '', // 批准文号.
        med_barcode: '',  // 药品条码
        bigunit1: '',  // 大单位.
        med_manyunit1: '', // 小单位数量.
        smallunit1: '',  // 小单位.
        med_manyunit2: '',  // 剂型单位数量.
        smallunit2: '',  // 剂型单位.
        med_class: '',  // 药品分类.
        med_dosage: '',  // 药品剂型.
        med_type: '',  // 用药类型.
        factory: '',   // 生产厂家.
        price_healthcard: '',  // 社保价格.
        usage: '',  // 用法.
        use_times1: '',  // 单次用量1.
        use_times2: '',  // 单次用量2.
        use_days: '',   // 总量天数.
        use_total: '',  // 总量.
        med_instruction: '',  // 药品说明.
        med_efficacy: '',  // 药品功效.
        remark: '',  // 备注.
        ake001: '',  // 社保编号
        aka074: '',  // 规格
        sebaoList: {},  // 社保参数对象
        standard_number: '',  // 药品本位码
        szsbstatus: ''  // 社保备案状态
      },
      zhongyaoapply: {
        med_name_z: '',
        med_lname_z: '',
        med_titanic_z: '',
        med_barcode_z: '',
        bigunit1_z: '',
        med_manyunit1_z: '',
        smallunit1_z: '',
        med_class_z: '',
        med_dosage_z: '',
        med_type_z: '',
        factory_z: '',
        price_healthcard_z: '',
        usage_z: '',
        use_times1_z: '',
        use_times2_z: '',
        use_days_z: '',
        use_total_z: '',
        med_instruction_z: '',
        med_efficacy_z: '',
        remark_z: '',
        ake001_z: '',  // 社保编号
        standard_number_z: '',  // 药品本位码
        aka074_z: '',  // 中药规格
        sebaoList_z: {},
        szsbstatus_z: ''  // 社保备案状态
      },
      fileList: [],
      outputs: [],
      failList: []
    }
  },
  methods: {
    // 西药的新增与编辑的保存
    handleSaveXi(formName) {
      // 新增药品信息
      if (sessionStorage.getItem('med_key') === 'add') {
        this.$refs[formName].validate(valid => {
          if (valid) {
            const specsTxt = `${this.xiyaoapply.med_manyunit2}${this.xiyaoapply.smallunit2}/${this.xiyaoapply.smallunit1} ${this.xiyaoapply.med_manyunit1}${this.xiyaoapply.smallunit1}/${this.xiyaoapply.bigunit1}`
            this.$http.post('/service/drug/infoadd', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                clinic_id: this.clinic,
                approval_number: this.xiyaoapply.med_titanic,  // 批准文号
                product_name: this.xiyaoapply.med_name,   // 药物名称
                productalicas: this.xiyaoapply.med_lname,  // 药品别名
                specs: {
                  unit_large: {
                    specs_name: this.xiyaoapply.bigunit1  // 大单位
                  },
                  unit_middle: {
                    specs_name: this.xiyaoapply.smallunit1,  // 小单位
                    specs_unit: Number(this.xiyaoapply.med_manyunit1)  // 小单位数量
                  },
                  unit_primary: {
                    specs_name: this.xiyaoapply.smallunit2,  // 剂型单位
                    specs_unit: Number(this.xiyaoapply.med_manyunit2)  // 剂型数量
                  }
                },
                otc: Number(this.xiyaoapply.med_type),  // 用法类型
                dosage_type: this.xiyaoapply.med_dosage, // 药品剂型
                drugclass: this.xiyaoapply.med_class,  // 药品分类
                producer: this.xiyaoapply.factory,  // 生产厂家
                yongfa: this.xiyaoapply.usage,  // 用法
                shebao_price: Number(this.xiyaoapply.price_healthcard),  // 社保价格
                drugspectxt: this.xiyaoapply.med_instruction,  // 药品说明
                drugfunctxt: this.xiyaoapply.med_efficacy,  // 药品功效
                drugnotetxt: this.xiyaoapply.remark,  // 备注
                drugtype: this.drugtype,      // 区分中西药
                specs_txt: specsTxt,   // 药品规格
                use_enable: 1,
                useunit: {
                  specs_name: this.xiyaoapply.smallunit2,  // 单次用量次数
                  specs_unit: Number(this.xiyaoapply.use_times1)  // 次数单位
                },
                usedaily_times: Number(this.xiyaoapply.use_times2),  // 用药频率
                usedall_days: Number(this.xiyaoapply.use_days),  // 天数
                useall: {
                  specs_name: this.xiyaoapply.bigunit1,    // 总量单位
                  specs_unit: Number(this.xiyaoapply.use_total)  // 总量
                },
                ake001: this.xiyaoapply.ake001,
                aka074: this.xiyaoapply.aka074,
                standard_number: this.xiyaoapply.standard_number,
                ...this.xiyaoapply.sebaoList
              }
            }).then(res => {
              if (res.data.errcode === 0) {
                sessionStorage.setItem('preAction', 'addxiyao')
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '保存成功！',
                  type: 'success'
                })
                this.$router.back()
              } else if (res.data.errcode === 35) {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '该药品已存在！',
                  type: 'warning'
                })
              } else {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  type: 'error',
                  message: res.data.errmsg
                })
              }
            }).catch(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存失败！',
                type: 'error'
              })
            })
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      } else {
        // 社保的编号有变化,将备案状态改成0
        if (this.ake001 !== this.xiyaoapply.ake001) {
          this.xiyaoapply.szsbstatus = 0
        }
        // 编辑更新药品信息
        this.$refs[formName].validate(valid => {
          if (valid) {
            const specsTxt = `${this.xiyaoapply.med_manyunit1}${this.xiyaoapply.smallunit1}/${this.xiyaoapply.bigunit1}${this.xiyaoapply.med_manyunit2}${this.xiyaoapply.smallunit2}/${this.xiyaoapply.smallunit1}`
            this.$http.post('/service/drug/infoupdate', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                clinic_id: this.clinic,
                drug_key: sessionStorage.getItem('drug_key'),
                approval_number: this.xiyaoapply.med_titanic,  // 批准文号
                product_name: this.xiyaoapply.med_name,   // 药物名称
                productalicas: this.xiyaoapply.med_lname,  // 药品别名
                specs: {
                  unit_large: {
                    specs_name: this.xiyaoapply.bigunit1  // 大单位
                  },
                  unit_middle: {
                    specs_name: this.xiyaoapply.smallunit1,  // 小单位
                    specs_unit: Number(this.xiyaoapply.med_manyunit1)  // 小单位数量
                  },
                  unit_primary: {
                    specs_name: this.xiyaoapply.smallunit2,  // 剂型单位
                    specs_unit: Number(this.xiyaoapply.med_manyunit2)  // 剂型数量
                  }
                },
                otc: Number(this.xiyaoapply.med_type),  // 用法类型
                dosage_type: this.xiyaoapply.med_dosage, // 药品剂型
                drugclass: this.xiyaoapply.med_class,  // 药品分类
                producer: this.xiyaoapply.factory,  // 生产厂家
                yongfa: this.xiyaoapply.usage,  // 用法
                shebao_price: Number(this.xiyaoapply.price_healthcard),  // 社保价格
                drugspectxt: this.xiyaoapply.med_instruction,  // 药品说明
                drugfunctxt: this.xiyaoapply.med_efficacy,  // 药品功效
                drugnotetxt: this.xiyaoapply.remark,  // 备注
                drugtype: this.drugtype,      // 区分中西药
                specs_txt: specsTxt,   // 药品规格
                useunit: {
                  specs_name: this.xiyaoapply.smallunit2,  // 单次用量次数
                  specs_unit: Number(this.xiyaoapply.use_times1)  // 次数单位
                },
                usedaily_times: Number(this.xiyaoapply.use_times2),  // 用药频率
                usedall_days: Number(this.xiyaoapply.use_days),  // 天数
                useall: {
                  specs_name: this.xiyaoapply.bigunit1,    // 总量单位
                  specs_unit: Number(this.xiyaoapply.use_total)  // 总量
                },
                ...this.xiyaoapply.sebaoList,
                ake001: this.xiyaoapply.ake001,
                aka074: this.xiyaoapply.aka074,
                standard_number: this.xiyaoapply.standard_number,
                szsbstatus: this.xiyaoapply.szsbstatus
              }
            }).then(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存成功！',
                type: 'success'
              })
              this.$router.back()
            }).catch(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存失败！',
                type: 'warning'
              })
            })
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      }
    },
    // 中药的新增与编辑的保存
    handleSaveZhong(formName) {
      // 新增药品信息
      if (sessionStorage.getItem('med_key') === 'add') {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$http.post('/service/drug/infoadd', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                clinic_id: this.clinic,
                approval_number: this.zhongyaoapply.med_titanic_z,  // 批准文号
                product_name: this.zhongyaoapply.med_name_z,   // 药物名称
                productalicas: this.zhongyaoapply.med_lname_z,  // 药品别名
                specs: {
                  unit_large: {
                    specs_name: '克'  // 大单位
                  },
                  unit_primary: {
                    specs_name: '克',  // 小单位
                    specs_unit: 1  // 小单位数量
                  }
                },
                otc: Number(this.zhongyaoapply.med_type_z),  // 用法类型
                dosage_type: this.zhongyaoapply.med_dosage_z,  // 药品剂型
                drugclass: this.zhongyaoapply.med_class_z,  // 药品分类
                producer: this.zhongyaoapply.factory_z,  // 生产厂家
                yongfa: this.zhongyaoapply.usage_z,  // 用法
                shebao_price: Number(this.zhongyaoapply.price_healthcard_z),  // 社保价格
                drugspectxt: this.zhongyaoapply.med_instruction_z,  // 药品说明
                drugfunctxt: this.zhongyaoapply.med_efficacy_z,  // 药品功效
                drugnotetxt: this.zhongyaoapply.remark_z,  // 备注
                drugtype: this.drugtype,      // 区分中西药
                specs_txt: '1克/克',   // 药品规格
                use_enable: 1,  // 禁用启用
                useunit: {
                  specs_name: this.zhongyaoapply.smallunit1_z,  // 单次用量名字
                  specs_unit: Number(this.zhongyaoapply.use_times1_z)  // 次数单位
                },
                usedaily_times: Number(this.zhongyaoapply.use_times2_z),  // 用药频率
                usedall_days: Number(this.zhongyaoapply.use_days_z),  // 天数
                useall: {
                  specs_name: this.zhongyaoapply.smallunit1_z,    // 总量单位
                  specs_unit: Number(this.zhongyaoapply.use_total_z)  // 总量
                },
                ...this.zhongyaoapply.sebaoList_z,
                ake001: this.zhongyaoapply.ake001_z,
                aka074: '1克/克',
                standard_number: this.zhongyaoapply.standard_number_z
              }
            }).then(res => {
              if (res.data.errcode === 0) {
                sessionStorage.setItem('preAction', 'addzhongyao')
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '保存成功！',
                  type: 'success'
                })
                this.$router.back()
              } else if (res.data.errmsg === '已存在') {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  message: '该药品已存在！',
                  type: 'warning'
                })
              } else {
                this.$message({
                  showClose: true,
                  duration: 1000,
                  type: 'error',
                  message: res.data.errmsg
                })
              }
            }).catch(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存失败！',
                type: 'error'
              })
            })
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      } else {
        // 判断社保的编号有没有变化
        if (this.ake001_z !== this.zhongyaoapply.ake001_z) {
          this.zhongyaoapply.szsbstatus_z = 0
        }
        // 编辑更新药品信息
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$http.post('/service/drug/infoupdate', {
              head: {
                accessToken: this.token,
                lastnotice: 0
              },
              body: {
                clinic_id: this.clinic,
                drug_key: sessionStorage.getItem('drug_key'),
                approval_number: this.zhongyaoapply.med_titanic_z,  // 批准文号
                product_name: this.zhongyaoapply.med_name_z,   // 药物名称
                productalicas: this.zhongyaoapply.med_lname_z,  // 药品别名
                specs: {
                  unit_large: {
                    specs_name: '克'  // 大单位
                  },
                  unit_primary: {
                    specs_name: '克',  // 小单位
                    specs_unit: 1  // 小单位数量
                  }
                },
                otc: Number(this.zhongyaoapply.med_type_z),  // 用法类型
                dosage_type: this.zhongyaoapply.med_dosage_z,  // 药品剂型
                drugclass: this.zhongyaoapply.med_class_z,  // 药品分类
                producer: this.zhongyaoapply.factory_z,  // 生产厂家
                yongfa: this.zhongyaoapply.usage_z,  // 用法
                shebao_price: Number(this.zhongyaoapply.price_healthcard_z),  // 社保价格
                drugspectxt: this.zhongyaoapply.med_instruction_z,  // 药品说明
                drugfunctxt: this.zhongyaoapply.med_efficacy_z,  // 药品功效
                drugnotetxt: this.zhongyaoapply.remark_z,  // 备注
                drugtype: this.drugtype,      // 区分中西药
                specs_txt: 1 + '克/克',   // 药品规格
                useunit: {
                  specs_name: this.zhongyaoapply.smallunit1_z,  // 单次用量次数
                  specs_unit: Number(this.zhongyaoapply.use_times1_z)  // 次数单位
                },
                usedaily_times: Number(this.zhongyaoapply.use_times2_z),  // 用药频率
                usedall_days: Number(this.zhongyaoapply.use_days_z),  // 天数
                useall: {
                  specs_name: this.zhongyaoapply.smallunit1_z,    // 总量单位
                  specs_unit: Number(this.zhongyaoapply.use_total_z)  // 总量
                },
                ake001: this.zhongyaoapply.ake001_z,
                aka074: '1克/克',
                standard_number: this.zhongyaoapply.standard_number_z,
                szsbstatus: this.zhongyaoapply.szsbstatus_z  // 社保备案状态
              }
            }).then(() => {
              this.$router.back();
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存成功！',
                type: 'success'
              })
            }).catch(() => {
              this.$message({
                showClose: true,
                duration: 1000,
                message: '保存失败！',
                type: 'warning'
              })
            })
          } else {
            this.$message({
              showClose: true,
              duration: 1000,
              message: '请填写未填写的信息',
              type: 'error'
            })
            return false
          }
        })
      }
    },
    // 取消返回上一页
    handleCancel() {
      this.$confirm('确认取消操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        center: true
      }).then(() => {
        this.$router.back()
      }).catch()
    },
    // 切换的西药
    showOrHideXiYao() {
      this.xiYaoShow = true
      this.zhongYaoShow = false
      this.buttonShowXiYao = true
      this.buttonShowZhongYao = false
      this.saveXiButton = true
      this.saveZhongButton = false
      this.drugtype = '0'
    },
    // 切换的中药
    showOrHideZhongYao() {
      this.xiYaoShow = false
      this.zhongYaoShow = true
      this.buttonShowXiYao = false
      this.buttonShowZhongYao = true
      this.saveXiButton = false
      this.saveZhongButton = true
      this.drugtype = '1'
    },
    // 只能输数字
    limit(str) {
      this.xiyaoapply[str] = floatLimit(this.xiyaoapply[str], 3)
    },
    limit2(str) {
      this.zhongyaoapply[str] = floatLimit(this.zhongyaoapply[str], 3)
    },
    // 单次用量和总量的数量为0时制空
    makeEmpty() {
      if (this.zhongyaoapply.use_times1_z === 0) {
        this.zhongyaoapply.use_times1_z = ''
      }
      if (this.xiyaoapply.use_times1 === 0) {
        this.xiyaoapply.use_times1 = ''
      }
      if (this.xiyaoapply.use_total === 0) {
        this.xiyaoapply.use_total = ''
      }
    },
    // 联想系统的药品
    querySearchAsync(queryString, callback) {
      service(querySearchDrugKey, {
        pageid: 0,
        pagesize: 100,
        drugname: queryString,
        drugtype: this.drugtype
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          // 成功的回调，直接返回data
          if (!res.SourceList) {   // 联想无则返回空
            callback([])
          } else {
            for (let i = 0; i < res.IdList.length; i++) {
              res.SourceList[i].drug_searchkey = res.IdList[i]
            }
            callback(res.SourceList)
          }
        } else { // code错误需要进行的操作
          callback([])
        }
      })
    },
    // 选择系统的药品
    handleSelect(item) {
      service(selectDrug, {
        drug_key: item.drug_searchkey
      }).then(res => {
        if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
          const edit = res
          if (edit.drugtype === '1') {  // 选择的药品是中药
            this.showOrHideZhongYao()
            this.zhongyaoapply.med_name_z = edit.product_name
            this.zhongyaoapply.med_lname_z = edit.commodityname
            this.zhongyaoapply.med_titanic_z = edit.approval_number
            this.zhongyaoapply.bigunit1_z = edit.specs.unit_large.specs_name
            this.zhongyaoapply.med_manyunit1_z = edit.specs.unit_primary.specs_unit
            this.zhongyaoapply.smallunit1_z = edit.specs.unit_primary.specs_name
            this.zhongyaoapply.med_class_z = edit.drugclass
            this.zhongyaoapply.med_dosage_z = edit.dosage_type
            this.zhongyaoapply.factory_z = edit.producer
            this.zhongyaoapply.price_healthcard_z = edit.shebao_price
            this.zhongyaoapply.usage_z = edit.yongfa
            this.zhongyaoapply.use_times1_z = edit.useunit.specs_unit
            this.zhongyaoapply.use_times2_z = edit.usedaily_times
            this.zhongyaoapply.use_days_z = edit.usedall_days
            this.zhongyaoapply.use_total_z = edit.useall.specs_unit
            this.zhongyaoapply.med_instruction_z = edit.drugspectxt
            this.zhongyaoapply.med_efficacy_z = edit.drugfunctxt
            this.zhongyaoapply.remark_z = edit.drugnotetxt
            this.zhongyaoapply.use_times2 = edit.usedaily_times
            this.zhongyaoapply.med_type_z = edit.otc
            this.zhongyaoapply.ake001_z = edit.ake001
            this.zhongyaoapply.ake070_z = edit.ake070
            this.zhongyaoapply.standard_number_z = edit.standard_number
            this.standard_number_z = edit.standard_number
            this.zhongyaoapply.sebaoList_z = {
              aae013: edit.aae013,
              aae030: edit.aae030,
              aae396: edit.aae396,
              aka022: edit.aka022,
              aka031: edit.aka031,
              aka036: edit.aka036,
              aka062: edit.aka062,
              aka065: edit.aka065,
              aka067: edit.aka067,
              aka068: edit.aka068,
              aka074: '1克/克',
              aka111: edit.aka111,
              akb020: edit.akb020,
              ake001: edit.ake001,
              ake003: edit.ake003,
              ala011: edit.ala011,
              ama011: edit.ama011,
              bka640: edit.bka640,
              bke111: edit.bke111,
              bkm032: edit.bkm032,
              bkm033: edit.bkm033,
              bkm034: edit.bkm034,
              bkm035: edit.bkm035,
              bkm036: edit.bkm036,
              bkm037: edit.bkm037,
              bkm038: edit.bkm038,
              bkm039: edit.bkm039,
              bkm040: edit.bkm040,
              bkm041: edit.bkm041,
              bkm042: edit.bkm042,
              bkm043: edit.bkm043,
              bkm044: edit.bkm044,
              bkm045: edit.bkm045,
              bkm046: edit.bkm046,
              bkm047: edit.bkm047,
              bkm048: edit.bkm048,
              bkm049: edit.bkm049,
              bkm054: edit.bkm054,
              bkm080: edit.bkm080,
              bkm081: edit.bkm081,
              bkm082: edit.bkm082,
              bkm083: edit.bkm083,
              bkm090: edit.bkm090,
              bkm095: edit.bkm095,
              bkm100: edit.bkm100,
              bkm101: edit.bkm101,
              bkm102: edit.bkm102,
              bla050: edit.bla050,
              bla051: edit.bla051,
              bla052: edit.bla052,
              bla053: edit.bla053,
              bla054: edit.bla054,
              bma030: edit.bma030,
              bma031: edit.bma031,
              cke900: edit.cke900,
              cke901: edit.cke901,
              cke902: edit.cke902,
              cke903: edit.cke903,
              cke904: edit.cke904,
              ckm097: edit.ckm097,
              ckm098: edit.ckm098,
              ckm099: edit.ckm099,
              ckm102: edit.ckm102,
              ckm104: edit.ckm104,
              ckm105: edit.ckm105,
              ckm106: edit.ckm106
            }
            if (edit.ake001 && edit.ake001 !== '') {
              this.requiredFlagZ = true
            }
          } else {  // 选择的药品是西药
            this.showOrHideXiYao()
            this.xiyaoapply.med_name = edit.product_name
            this.xiyaoapply.med_lname = edit.commodityname
            this.xiyaoapply.med_titanic = edit.approval_number
            this.xiyaoapply.bigunit1 = edit.specs.unit_large.specs_name
            this.xiyaoapply.med_manyunit1 = edit.specs.unit_middle.specs_unit
            this.xiyaoapply.smallunit1 = edit.specs.unit_middle.specs_name
            this.xiyaoapply.smallunit2 = edit.specs.unit_primary.specs_name
            this.xiyaoapply.med_manyunit2 = edit.specs.unit_primary.specs_unit
            this.xiyaoapply.med_class = edit.drugclass
            this.xiyaoapply.med_dosage = edit.dosage_type
            this.xiyaoapply.factory = edit.producer
            this.xiyaoapply.price_healthcard = edit.shebao_price
            this.xiyaoapply.usage = edit.yongfa
            this.xiyaoapply.use_times1 = edit.useunit.specs_unit
            this.xiyaoapply.use_times2 = edit.usedaily_times
            this.xiyaoapply.use_days = edit.usedall_days
            this.xiyaoapply.use_total = edit.useall.specs_unit
            this.xiyaoapply.med_instruction = edit.drugspectxt
            this.xiyaoapply.med_efficacy = edit.drugfunctxt
            this.xiyaoapply.remark = edit.drugnotetxt
            this.xiyaoapply.use_times2 = edit.usedaily_times
            this.xiyaoapply.med_type = edit.otc
            this.xiyaoapply.ake001 = edit.ake001
            this.xiyaoapply.aka074 = edit.aka074
            this.xiyaoapply.ake070 = edit.ake070
            this.xiyaoapply.standard_number = edit.standard_number
            this.standard_number = edit.standard_number
            this.xiyaoapply.sebaoList = {
              aka067: edit.aka067,
              aae030: edit.aae030,
              aae013: edit.aae013,
              aka111: edit.aka111,
              ake003: edit.ake003,
              bke111: edit.bke111,
              aka031: edit.aka031,
              ckm097: edit.ckm097,
              ckm098: edit.ckm098,
              aka036: edit.aka036,
              ckm099: edit.ckm099,
              bkm100: edit.bkm100,
              bkm101: edit.bkm101,
              bkm102: edit.bkm102,
              bka640: edit.bka640,
              aka065: edit.aka065,
              bkm032: edit.bkm032,
              aka022: edit.aka022,
              bkm033: edit.bkm033,
              bkm034: edit.bkm034,
              bkm035: edit.bkm035,
              bkm036: edit.bkm036,
              bkm037: edit.bkm037,
              bkm038: edit.bkm038,
              bkm039: edit.bkm039,
              bkm040: edit.bkm040,
              bkm041: edit.bkm041,
              bkm042: edit.bkm042,
              bkm043: edit.bkm043,
              bkm044: edit.bkm044,
              bkm045: edit.bkm045,
              bkm046: edit.bkm046,
              bkm047: edit.bkm047,
              bkm048: edit.bkm048,
              bkm049: edit.bkm049,
              ama011: edit.ama011,
              bma030: edit.bma030,
              bma031: edit.bma031,
              ala011: edit.ala011,
              bla050: edit.bla050,
              bla051: edit.bla051,
              bla052: edit.bla052,
              bla053: edit.bla053,
              bla054: edit.bla054,
              bkm054: edit.bkm054,
              akb020: edit.akb020,
              bkm090: edit.bkm090,
              ckm102: edit.ckm102,
              bkm095: edit.bkm095,
              aka068: edit.aka068,
              ckm104: edit.ckm104,
              ckm105: edit.ckm105,
              cke900: edit.cke900,
              cke901: edit.cke901,
              cke902: edit.cke902,
              cke903: edit.cke903,
              cke904: edit.cke904
            }
            if (edit.ake001 && edit.ake001 !== '') {
              this.requiredFlag = true
            }
          }
        }
      })
    },
    // 上传文件之前的钩子
    beforeFileUpload(file) {
      if (file.size <= 0) {  // 如果没有文件名
        return false
      } else if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
        this.$message.error('上传格式不正确，请上传xls或者xlsx格式')
        return false
      }
      const fileReader = new FileReader()
      fileReader.onload = ev => {
        try {
          const data = ev.target.result
          const workbook = XLSX.read(data, {
            type: 'binary'
          })
          const wsname = workbook.SheetNames[0]  // 取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])  // 生成json表格内容
          this.outputs = []  // 清空接收数据
          for (let i = 0; i < ws.length; i++) {
            const sheetData = {
              name: ws[i]['药品名称'],
              shebao_price: ws[i]['社保价'] ? +ws[i]['社保价'] : 0,
              factory: ws[i]['生产厂家']
            }
            this.outputs.push(sheetData)
          }
          this.batchImport(this.outputs)
        } catch (e) {
          return false
        }
      }
      fileReader.readAsBinaryString(file)
    },
    // 批量获取医保信息,然后添加
    batchImport(arr) {
      arr.forEach(e => {
        service(querySearchDrugKey, {
          pageid: 0,
          pagesize: 100,
          drugname: e.name,
          drugtype: '1'
        }).then(res => {
          if (!(typeof res === 'string' && res.includes('ERRORCODE'))) {
            // 根据key获取信息成功的回调，直接返回data
            if (!res.SourceList) {  // 联想无则返回空
              this.failList.push(e.name)
            } else {
              for (let i = 0; i < res.SourceList.length; i++) {
                if (res.SourceList[i].extra4 !== '' && res.SourceList[i].name === e.name) {
                  res.SourceList[i].drug_searchkey = res.IdList[i]
                  service(selectDrug, {
                    drug_key: res.IdList[i]
                  }).then(drugRes => {
                    if (!(typeof drugRes === 'string' && drugRes.includes('ERRORCODE'))) {
                      const shitsbcode = {
                        aae013: drugRes.aae013,
                        aae030: drugRes.aae030,
                        aae396: drugRes.aae396,
                        aka022: drugRes.aka022,
                        aka031: drugRes.aka031,
                        aka036: drugRes.aka036,
                        aka062: drugRes.aka062,
                        aka065: drugRes.aka065,
                        aka067: drugRes.aka067,
                        aka068: drugRes.aka068,
                        aka074: '1克/克',
                        aka111: drugRes.aka111,
                        akb020: drugRes.akb020,
                        ake001: drugRes.ake001,
                        ake003: drugRes.ake003,
                        ala011: drugRes.ala011,
                        ama011: drugRes.ama011,
                        bka640: drugRes.bka640,
                        bke111: drugRes.bke111,
                        bkm032: drugRes.bkm032,
                        bkm033: drugRes.bkm033,
                        bkm034: drugRes.bkm034,
                        bkm035: drugRes.bkm035,
                        bkm036: drugRes.bkm036,
                        bkm037: drugRes.bkm037,
                        bkm038: drugRes.bkm038,
                        bkm039: drugRes.bkm039,
                        bkm040: drugRes.bkm040,
                        bkm041: drugRes.bkm041,
                        bkm042: drugRes.bkm042,
                        bkm043: drugRes.bkm043,
                        bkm044: drugRes.bkm044,
                        bkm045: drugRes.bkm045,
                        bkm046: drugRes.bkm046,
                        bkm047: drugRes.bkm047,
                        bkm048: drugRes.bkm048,
                        bkm049: drugRes.bkm049,
                        bkm054: drugRes.bkm054,
                        bkm080: drugRes.bkm080,
                        bkm081: drugRes.bkm081,
                        bkm082: drugRes.bkm082,
                        bkm083: drugRes.bkm083,
                        bkm090: drugRes.bkm090,
                        bkm095: drugRes.bkm095,
                        bkm100: drugRes.bkm100,
                        bkm101: drugRes.bkm101,
                        bkm102: drugRes.bkm102,
                        bla050: drugRes.bla050,
                        bla051: drugRes.bla051,
                        bla052: drugRes.bla052,
                        bla053: drugRes.bla053,
                        bla054: drugRes.bla054,
                        bma030: drugRes.bma030,
                        bma031: drugRes.bma031,
                        cke900: drugRes.cke900,
                        cke901: drugRes.cke901,
                        cke902: drugRes.cke902,
                        cke903: drugRes.cke903,
                        cke904: drugRes.cke904,
                        ckm097: drugRes.ckm097,
                        ckm098: drugRes.ckm098,
                        ckm099: drugRes.ckm099,
                        ckm102: drugRes.ckm102,
                        ckm104: drugRes.ckm104,
                        ckm105: drugRes.ckm105,
                        ckm106: drugRes.ckm106
                      }
                      service(saveDrug, {
                        approval_number: drugRes.approval_number,  // 批准文号
                        product_name: drugRes.product_name,   // 药物名称
                        productalicas: drugRes.commodityname,  // 药品别名
                        specs: {
                          unit_large: {
                            specs_name: '克'  // 大单位
                          },
                          unit_primary: {
                            specs_name: '克',  // 小单位
                            specs_unit: 1  // 小单位数量
                          }
                        },
                        otc: Number(drugRes.otc),  // 用法类型
                        dosage_type: drugRes.dosage_type, // 药品剂型
                        drugclass: drugRes.drugclass,  // 药品分类
                        producer: e.factory || drugRes.producer,  // 生产厂家
                        yongfa: drugRes.yongfa,  // 用法
                        shebao_price: +e.shebao_price || Number(drugRes.shebao_price),  // 社保价格
                        drugspectxt: drugRes.drugspectxt,  // 药品说明
                        drugfunctxt: drugRes.drugfunctxt,  // 药品功效
                        drugnotetxt: drugRes.drugnotetxt,  // 备注
                        drugtype: '1',      // 区分中西药
                        specs_txt: '1克/克',   // 药品规格
                        use_enable: 1,  // 禁用启用
                        useunit: {
                          specs_name: drugRes.specs.unit_primary.specs_name,  // 单次用量名字
                          specs_unit: Number(drugRes.useunit.specs_unit)  // 次数单位
                        },
                        usedaily_times: Number(drugRes.usedaily_times),  // 用药频率
                        usedall_days: Number(drugRes.usedall_days),  // 天数
                        useall: {
                          specs_name: drugRes.specs.unit_primary.specs_name,  // 总量单位
                          specs_unit: Number(drugRes.useall.specs_unit)  // 总量
                        },
                        ...shitsbcode,
                        ake001: drugRes.ake001,
                        aka074: '1克/克',
                        standard_number: drugRes.standard_number
                      }).then(res => {
                        if (typeof res === 'string' && res.includes('ERRORCODE')) {
                          this.failList.push(e.name)
                        }
                      })
                    }
                  })
                }
              }
            }
          } else {  // 根据key获取药品信息失败
            this.failList.push(e.name)
          }
        })
      })
    }
  },
  created() {
    // 标题的改变
    this.act = sessionStorage.getItem('med_key')
    if (this.act === 'add') {
      this.act = '新增'
      this.doNot = false
      if (sessionStorage.getItem('preAction') === 'addzhongyao') {
        this.showOrHideZhongYao()
      }
    }
    if (this.act === 'edit') {
      this.act = '编辑'
      this.doNot = true
    }
    // 获取剂型
    this.options8 = AKA070
    // 编辑就请求数据
    if (sessionStorage.getItem('drug_key')) {
      const drugKey = sessionStorage.getItem('drug_key');
      this.$http.post('/service/drug/infoquerybykey', {
        head: {
          accessToken: this.token,
          lastnotice: 0
        },
        body: {
          clinic_id: this.clinic,
          drug_key: drugKey
        }
      }).then(res => {
        const edit = res.data.data
        if (edit.drugtype === '1') {
          this.showOrHideZhongYao()
          this.markX = true
          this.markZ = false
          this.zhongyaoapply.med_name_z = edit.product_name
          this.zhongyaoapply.med_lname_z = edit.productalicas
          this.zhongyaoapply.med_titanic_z = edit.approval_number
          this.zhongyaoapply.bigunit1_z = edit.specs.unit_large.specs_name
          this.zhongyaoapply.med_manyunit1_z = edit.specs.unit_primary.specs_unit
          this.zhongyaoapply.smallunit1_z = edit.specs.unit_primary.specs_name
          this.zhongyaoapply.med_class_z = edit.drugclass
          this.zhongyaoapply.med_dosage_z = edit.dosage_type
          this.zhongyaoapply.factory_z = edit.producer
          this.zhongyaoapply.price_healthcard_z = edit.shebao_price
          this.zhongyaoapply.usage_z = edit.yongfa
          this.zhongyaoapply.use_times1_z = edit.useunit.specs_unit
          this.zhongyaoapply.use_times2_z = edit.usedaily_times
          this.zhongyaoapply.use_days_z = edit.usedall_days
          this.zhongyaoapply.use_total_z = edit.useall.specs_unit
          this.zhongyaoapply.med_instruction_z = edit.drugspectxt
          this.zhongyaoapply.med_efficacy_z = edit.drugfunctxt
          this.zhongyaoapply.remark_z = edit.drugnotetxt
          this.zhongyaoapply.use_times2 = edit.usedaily_times
          this.zhongyaoapply.med_type_z = edit.otc
          this.zhongyaoapply.standard_number_z = edit.standard_number
          this.zhongyaoapply.ake001_z = edit.ake001
          this.zhongyaoapply.szsbstatus_z = edit.szsbstatus
        } else {
          this.markZ = true
          this.markX = false
          this.xiyaoapply.med_name = edit.product_name
          this.xiyaoapply.med_lname = edit.productalicas
          this.xiyaoapply.med_titanic = edit.approval_number
          this.xiyaoapply.bigunit1 = edit.specs.unit_large.specs_name
          this.xiyaoapply.med_manyunit1 = edit.specs.unit_middle.specs_unit
          this.xiyaoapply.smallunit1 = edit.specs.unit_middle.specs_name
          this.xiyaoapply.smallunit2 = edit.specs.unit_primary.specs_name
          this.xiyaoapply.med_class = edit.drugclass
          this.xiyaoapply.med_dosage = edit.dosage_type
          this.xiyaoapply.factory = edit.producer
          this.xiyaoapply.price_healthcard = edit.shebao_price
          this.xiyaoapply.usage = edit.yongfa
          this.xiyaoapply.use_times1 = edit.useunit.specs_unit
          this.xiyaoapply.use_times2 = edit.usedaily_times
          this.xiyaoapply.use_days = edit.usedall_days
          this.xiyaoapply.use_total = edit.useall.specs_unit
          this.xiyaoapply.med_instruction = edit.drugspectxt
          this.xiyaoapply.med_efficacy = edit.drugfunctxt
          this.xiyaoapply.remark = edit.drugnotetxt
          this.xiyaoapply.med_manyunit2 = edit.specs.unit_primary.specs_unit
          this.xiyaoapply.use_times2 = edit.usedaily_times
          this.xiyaoapply.med_type = edit.otc
          this.xiyaoapply.aka074 = edit.aka074
          this.xiyaoapply.ake001 = edit.ake001
          this.xiyaoapply.standard_number = edit.standard_number
          this.xiyaoapply.szsbstatus = edit.szsbstatus
        }
      }).catch()
    }
  },
  computed: {
    ...mapGetters(['token', 'user', 'clinic']),
    medicineTitle() {
      return `${this.act}药品`
    }
  },
  beforeDestroy() {
    sessionStorage.removeItem('drug_key')
    sessionStorage.removeItem('med_key')
  }
}
</script>

<style lang="scss" scoped>
.edit-medicine {
  margin-left: 30px;
  margin-top: 20px;
  .header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-bottom: 1px solid #ccc;
    .title {
      flex: 1;
      color: #666;
    }
    .top-title {
      color: #42b983;
    }
    .button-type {
      flex: 1;
      .drug-button {
        margin: 4px;
        width: 120px;
        height: 40px;
        border: 1px solid #c1c1c1;
        background-color: #fff;
        border-radius: 4px;
        outline: none;
        font-size: 16px;
        cursor: pointer;
        &.active {
          background-color: #09f;
          color: #fff;
          font-size: 16px;
        }
      }
      
    }
    .button-group {
      margin-right: 50px;
    }
  }
  .west-info, .china-info {
    .title {
      color: #666;
      background: #f5f5f5;
      height: 50px;
      line-height: 50px;
      padding-left: 10px;
    }
    .warning {
      color: #f00;
    }
  }
  .china-info {
    .add-action {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;
      padding-bottom: 6px;
      .download {
        margin: 4px;
        width: 90px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background: #409eff;
        color: #fff;
        border-radius: 4px;
        outline: none;
        font-size: 12px;
        cursor: pointer;
      }
    }
  }
}
</style>
