<template>
  <div class="regist-help">
    <div class="header">
      <h1 class="title">挂号帮助</h1>
    </div>

    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、如何挂号？</h2>
        <ul>
          <li>1. 进入登记挂号→新增挂号。</li>
          <li>2. 填写客户信息、就诊信息。</li>
          <li>3. 首次在本系统进行挂号的客户信息将会保存在客户档案中。</li>
          <li>4. 再次进行挂号登记时输入客户姓名或手机号码，姓名列表将展示出符合的信息，点击选中的客户姓名，之前保存的客户信息将被带出，除姓名外其他信息可更改。</li>
          <li>5. 根据患者情况指定科室、医生以及选择挂号类别<span class="red">（科室、医生、挂号项可在机构管理中维护）</span>。</li>
          <li>6. 挂号费的两种收取方式：
            <div class="text">① 挂号处直接收取：输入客户信息→勾选登记并收费→立即挂号。</div>
            <div class="text">② 仅挂号，挂号费后收：输入客户信息→立即挂号<span class="red">（不勾选登记并收费）</span>。</div>
            <div class="text"><span class="red">（注：就诊信息中如果指定了科室、医生，那么只有该医生账号才能接诊）</span></div>
          </li>
        </ul>
        <img src="./img/GH1.1.png" class="img-big">
        <img src="./img/GH1.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">二、如何查看挂号信息以及退号？</h2>
        <ul>
          <li>1.	进入登记挂号→登记列表。</li>
          <li>2.	点击退号→确认退号。</li>
          <li>3.	完成退号。</li>
          <li><span class="red">（注：已接诊患者无法退号）</span></li>
        </ul>
        <img src="./img/GH2.1.png" class="img-big">
        <img src="./img/GH2.2.png" class="img-big">
      </div>
      
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      printWindow: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.regist-help {
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
