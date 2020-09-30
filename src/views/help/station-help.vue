<template>
  <div class="station-help">
    <div class="header">
      <h1 class="title">医生站帮助</h1>
    </div>

    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	快速接诊？</h2>
        <ul>
          <li>当患者未通过挂号处登记，直接前往医生处时，医生可在医生站点击左侧快速接诊为患者进行登记。</li>
          <li>1.	点击医生站→快速接诊→输入客户信息→选择科室、医生、诊金→确定。
            <div class="text"><span class="red">注：</span></div>
            <div class="red">
              <div>①首次进行登记的患者信息将保存至客户档案中。</div>
              <div>②该客户为系统已登记过的老客户，可在客户姓名根据姓名或手机号码检索。</div>
              <div>③就诊科室选择非当前医生所在科室或就诊医生指定为其他医生，则当前操作医生就诊列表中无法显示快速接诊后的患者，仅快速接诊填写信息中所选科室<br>或医生可接诊。</div>
            </div>
          </li>
        </ul>
        <img src="./img/YS1.1.png" class="img-big">
        <img src="./img/YS1.2.png" class="img_mid">
        <img src="./img/YS1.3.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">二、	接诊</h2>
        <ul>
          <li>1. 就诊列表找到当前就诊患者姓名</li>
          <li>2. 点击接诊</li>
          <li>3. 客户信息下带出挂号时所填患者详细信息</li>
          <li>4. 选择患者就诊类型（初诊/复诊）</li>
        </ul>
        <img src="./img/YS2.1.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">三、	电子病历</h2>
        <ul>
          <li>1. 普通书写操作
            <div class="text">根据患者病情填写主诉、诊断等信息→保存</div>
          </li>
          <img src="./img/YS3.1.png" class="img-big">
          <li>2. 快捷操作
            <ul>
              <li>2.1 保存为模板
                <p class="text">若当前所填写病历可作为常用病历模板，可点击右上方保存为模板进入新增门诊病历模板页面，填写该模板名称，选择类型为个人或者通用。<span class="red">（注：选择个人则该模板仅创建者本人可见和调用）</span></p>
                <img src="./img/YS3.2.png" class="img-big">
                <img src="./img/YS3.3.png" class="img-big">
              </li>
              <li>2.2 调用常用病历模板
                <p class="text">点击右上方调用模板→选择要调用的模板→确定，则调用成功。调用的模板也可以进行修改后再保存，多次保存以结束就诊前的最后一次保存为记录。</p>
                <img src="./img/YS3.4.png" class="img-big">
                <img src="./img/YS3.5.png" class="img-big">
              </li>
              <li>2.3 常用疾病辅助框
                <p class="text">常用疾病辅助框为本系统为客户提供的一种快捷填充病历内容的一种方式之一</p>
                <img src="./img/YS3.4.png" class="img-big">
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="big-items">
        <h2 class="setting">四、	电子处方</h2>
        <ul>
          <li>操作流程</li>
          <li>1.	医生站→就诊列表中接诊→处方→选择处方类型（西药/中成药处方、中药处方、输液处方）；</li>
          <li>2.	药品名称处输入所开药品名称或拼音码→选择要开药品→选择用法→单次剂量→用药频次→天数→开药数量；</li>
          <li>3.	多个药品则点击下方添加一行继续添加药品→保存；</li>
          <li>4.	多个处方则点击处方名称右侧增加处方继续添加处方→开药→保存；
            <div class="container"><span class="red">注：</span></div>
            <div class="red">
              <div>①未收费的处方可继续添加、删除、修改。</div>
              <div>②已收费的处方不能修改。</div>
              <div>③开药数量超过库存时无法保存处方。</div>
              <div>④未维护的药品不会在输入药品名称时被检索到。</div>
              <div>⑤西药/中成药处方一张处方单最多开五种药，可添加处方单继续开药。</div>
            </div>
          </li>
          <img src="./img/YS4.1.png" class="img-big">
          <img src="./img/YS4.2.png" class="img-big">
          <img src="./img/YS4.3.png" class="img-big">
        </ul>
      </div>
      <div class="big-items">
        <h2 class="setting">五、	诊疗项目</h2>
        <img src="./img/YS5.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">六、	耗材</h2>
        <img src="./img/YS6.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">七、	其他</h2>
        <img src="./img/YS7.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">八、	医嘱</h2>
        <img src="./img/YS8.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">九、	接诊记录</h2>
        <ul>
          <li>1.	医生站→接诊记录</li>
          <li>2.	检索：按患者姓名或手机号、日期检索</li>
          <li>3.	点击操作下方对应患者的查看按钮查看患者上次就诊记录详细信息</li>
        </ul>
        <img src="./img/YS9.1.png" class="img-big">
        <img src="./img/YS9.2.png" class="img-big">
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.station-help {
  position: relative;
  padding: 30px 40px;
  padding-bottom: 60px;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  .header {
    height: 49px;
    color: #1a1a1a;
    font-size: 14px;
    border-bottom: 1px solid #dfdfdf;
    position: relative;
    min-width: 1100px;
  }
  .content {
    min-width: 1100px;
    .big-items {
      padding: 20px 0;
      ul {
        margin-top: 20px;
        font-size: 15px;
        li {
          margin-top: 10px;
        }
      }
    }
  }
}
.img-big {
  width: 80%;
  min-width: 1100px;
  height: 580px;
  margin-top: 20px;
}
.red {
  color: red;
}
</style>
