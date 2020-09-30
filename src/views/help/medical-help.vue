<template>
  <div class="medical-help">
    <div class="header">
      <h1 class="title">药品进销存帮助</h1>
    </div>
    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	医生站开处方的前提条件</h2>
        <ul>
          <li>1.	新增药品信息→采购入库→挂号登记→接诊→开处方。</li>
        </ul>
      </div>
      <div class="big-items">
        <h2 class="setting">二、	如何新增药品信息？</h2>
        <ul>
          <li>1.	药品进销存→药品信息维护→新增药品。</li>
          <li>2.	输入药品名称，规格，剂型，厂商，使用方法及其他信息→保存。</li>
          <li>3.	根据处方分类，维护药品信息时西药、中成药在西药/中成药下维护，中草药维护在中草药下。
            <div class="container"><span class="red">注：</span></div>
            <div class="red">
              <div>①系统已配置部分药品信息，在输入药品名称时系统自动检索，若药品名称、规格、厂商都相同，可点击列表中药品信息进行快速录入，<br>可以对该信息进行修改，修改完成后点击保存即可维护到诊所药品目录中。</div>
              <div>②医生开处方时选择诊所药品目录中药品名称可带出已填写的药品使用信息，所以在维护药品信息时填写药品的使用信息，可提高医生接诊效率。</div>
              <div>③药品名称、药品规格都相同的为同一药品，不能重复维护，除药品名称、规格外其他信息可进行修改。</div>
              <div>④已维护的药品信息展示在药品信息维护首页，可通过药品名称、处方分类进行搜索。</div>
              <div>⑤已维护的药品信息不能删除，若使用/不使用该药品可在药品信息维护首页点击启用/禁用按钮进行启用/禁用。</div>
            </div>
          </li>
        </ul>
        <img src="./img/YP2.1.png" class="img-big">
        <img src="./img/YP2.2.png" class="img-big">
      </div>

      <div class="big-items">
        <h2 class="setting">三、	如何进行供应商维护？</h2>
        <ul>
          <li>1.	点击药品进销存→供应商维护→新增供应商。</li>
          <li>2.	输入供应商信息→确定。</li>
        </ul>
        <img src="./img/YP3.1.png" class="img-big">
      </div>

      <div class="big_items">
        <h2 class="setting">四、	如何进行药品入库及入库时需要注意的问题？</h2>
        <ul>
          <li>1.	点击药品进销存→采购入库→新增入库→选择供应商→添加药品→选择药品。</li>
          <li>2.	点击确定→输入数量、单位、批发价、处方价、零售价、到期日 <span>（注：到期日默认为当前时间）</span>。</li>
          <li>3.	点击入库→确认入库。
            <div class="container"><span class="red">注：</span></div>
            <div class="red">
              <div>①没有确认入库的单号，可进行修改以及删除，已确认入库的不能修改只能查看明细。</div>
              <div>②首次使用本系统，可将诊所现有药品库存数量以入库方式维护到系统中。</div>
              <div>③添加药品可根据药品名称、药品分类搜索，左侧勾选，点击确定即可出现在入库单中。</div>
              <div>④点击添加药品，根据条件搜索后，点击确定仅带出当前页面勾选的药品，若多个药品出现在不同页，请进行多次添加药品操作。</div>
              <div>⑤多次添加同一药品，则入库单中会出现多条该药品入库信息，望用户使用时注意观察，防止出现入库数量与实际不符。</div>
              <div>⑥在填写入库单的入库数量、价格、到期日时，本系统逐条自动保存，用户可填写完一个药品的所有信息后再往下填写，以确保所填信息不会丢失。</div>
            </div>
          </li>
        </ul>
        <img src="./img/YP4.1.png" class="img-big">
        <img src="./img/YP4.2.png" class="img-big">
        <img src="./img/YP4.3.png" class="img-big">
        <img src="./img/YP4.4.png" class="img-big">
        <img src="./img/YP4.5.png" class="img-big">
      </div>

      <div class="big-items">
        <h2 class="setting">五、	如何进行库存查询？</h2>
        <ul>
          <li>1.	点击药品进销存→库存查询。</li>
          <div class="red">(注:可通过搜索进行搜索查询)</div>
        </ul>
        <img src="./img/YP5.png" class="img-big">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.medical-help {
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
