<template>
  <div class="fee-help">
    <div class="header">
      <h1 class="title">收费帮助</h1>
    </div>
    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	收费处如何进行收费以及打印？</h2>
        <ul>
          <li>1.	进入收费→待收费。</li>
          <li>2.	选择就诊日期/填写客户信息进行搜索。</li>
          <li>3.	待收费列表→点击收费→打开收费详情页面。</li>
          <li>4.	确认客户信息及收费金额。</li>
          <li>5.	勾选收费项→点击收费→进入收费页面。</li>
          <li>6.	选择支付方式、减免额度、勾选/不勾选打印收费收据。</li>
          <li>7.	点击收费→收费成功。</li>
        </ul>
        <img src="./img/SF1.1.png" class="img-big">
        <img src="./img/SF1.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">二、	收费处如何查看收费记录以及退费</h2>
        <ul>
          <li>1.	进入收费→收费记录。</li>
          <li>2.	点击退费→打开退费详细页面。</li>
          <li>3.	勾选退费项→输入退费金额。</li>
          <li>4.	点击确认退费→确定。</li>
          <li> <span class="red">（注：就诊中、就诊完成的客户挂号费用不可退，已发药的需先退药才可退费）</span></li>
        </ul>
        <img src="./img/SF2.1.png" class="img-big">
        <img src="./img/SF2.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">三、	如何查看退费信息</h2>
        <ul>
          <li>1.	进入收费→收费记录。</li>
        </ul>
        <img src="./img/SF3.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">四、	如何直接购药</h2>
        <ul>
          <li>1.  进入收费→门诊购药。</li>
          <li>2.  填写药品名称、规格、数量。</li>
          <li>3.  填写客户信息→输入姓名、性别、年龄等信息。</li>
          <li>4.  点击收费。</li>
        </ul>
        <img src="./img/SF4.png" class="img-big">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fee-help {
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
