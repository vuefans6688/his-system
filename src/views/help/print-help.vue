<template>
  <div class="print-help">
    <div class="header">
      <h1 class="title">打印帮助</h1>
    </div>
    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	医生如何打印病历？</h2>
        <ul>
          <li>1.	进入医生站→病历→选择客户接诊。</li>
          <li>2.	输入问诊详情→点击【保存】按钮。</li>
          <li>3.	点击【打印病历】按钮。</li>
          <li>  
            <span class="red">注：以A4纸打印为例：</span>
            <div class="red">①打印病历时，必须先保存病历</div>
            <div class="red">②打印时，将页眉和页脚去掉</div>
          </li>
        </ul>
        <img src="./img/DY1.1.png" class="img-big">
        <img src="./img/DY1.2.png" class="img-mm">
      </div>
      <div class="big-items">
        <h2 class="setting">二、	医生如何打印西药处方？</h2>
        <ul>
          <li>1.	进入医生站→处方→西药→选择接诊客户。</li>
          <li>2.	输入药品信息→点击【保存】按钮。</li>
          <li>3.	点击【打印处方】。</li>
          <li>  
            <span class="red">注：以A4纸打印为例：</span>
            <div class="red">打印时，将页眉和页脚去掉</div>
          </li>
        </ul>
        <img src="./img/DY2.1.png" class="img-big">
        <img src="./img/DY2.2.png" class="img-mm">
      </div>
      <div class="big-items">
        <h2 class="setting">三、	医生如何打印中药处方？</h2>
        <ul>
          <li>1.	进入医生站→处方→中药→选择接诊客户。</li>
          <li>2.	输入药品信息→点击【保存】按钮。</li>
          <li>3.	点击【打印处方】。</li>
          <li>  
            <span class="red">注：以A4纸打印为例：</span>
            <div class="red">打印时，将页眉和页脚去掉</div>
          </li>
        </ul>
        <img src="./img/DY3.1.png" class="img-big">
        <img src="./img/DY3.2.png" class="img-mm">
      </div>
      <div class="big-items">
        <h2 class="setting">四、	医生如何打印输液处方？</h2>
        <ul>
          <li>1.	进入医生站→处方→输液→选择接诊客户。</li>
          <li>2.	输入药品信息→点击【保存】按钮。</li>
          <li>3.	点击【打印处方】。</li>
          <li>  
            <span class="red">注：以A4纸打印为例：</span>
            <div class="red">打印时，将页眉和页脚去掉</div>
          </li>
        </ul>
        <img src="./img/DY4.1.png" class="img-big">
        <img src="./img/DY4.2.png" class="img-mm">
      </div>
      <div class="big-items">
        <h2 class="setting">五、	医生如何打印诊疗项目？</h2>
        <ul>
          <li>1.	进入医生站→诊疗项目→选择接诊客户。</li>
          <li>2.	输入药品信息→点击【保存】按钮。</li>
          <li>3.	点击【打印处方】。</li>
          <li>  
            <span class="red">注：以A4纸打印为例：</span>
            <div class="red">打印时，将页眉和页脚去掉</div>
          </li>
        </ul>
        <img src="./img/DY5.1.png" class="img-big">
        <img src="./img/DY5.2.png" class="img-mm">
      </div>
      <div class="big-items">
        <h2 class="setting">六、	收费处如何打印收费收据？</h2>
        <ul>
          <li>1.	进入收费→待发药→点击【收费】。</li>
          <li>2.	勾选收费项→点击【收费】→弹出收费信息框。</li>
          <li>3.	点击【打印处方】。</li>
          <li>  
            <span class="red">注：以收银纸为例：</span>
            <div class="red">打印收费时，应将边距改为无</div>
          </li>
        </ul>
        <img src="./img/DY6.1.png" class="img-big">
        <img src="./img/DY6.2.png" class="img-big">
        <img src="./img/DY6.3.png" class="img-mm">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.print-help {
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
.img-mm {
  display: block;
  height: 388px;
}
.red {
  color: red;
}

</style>
