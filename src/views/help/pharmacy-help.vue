<template>
  <div class="pharmacy-help">
    <div class="header">
      <h1 class="title">药房帮助</h1>
    </div>
    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	发药</h2>
        <ul>
          <li>1.	药房→待发药列表→选择患者待发药信息→点击右侧发药按钮→进入发药详情页面→勾选所发处方笺→点击发药按钮→完成发药。
            <div class="red">注：当前所发药品低于库存时发药失败</div>
          </li>
        </ul>
        <img src="./img/YF1.1.png" class="img-big">
        <img src="./img/YF1.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">二、	退药、查看发药记录</h2>
        <ul>
          <li>1.	药房→发药记录→选择状态为已发药的记录点击查看明细。</li>
        </ul>
        <img src="./img/YF2.1.png" class="img-big">
        <img src="./img/YF2.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">三、	查看退药记录</h2>
        <ul>
          <li>1.	药房→发药记录→选择状态为已退药的记录点击查看明细。</li>
        </ul>
        <img src="./img/YF3.1.png" class="img-big">
        <img src="./img/YF3.2.png" class="img-big">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pharmacy-help{
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
