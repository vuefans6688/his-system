<template>
  <div class="management-help">
    <div class="header">
      <h1 class="title">诊所管理帮助</h1>
    </div>
    <div class="content">
      <div class="big-items">
        <h2 class="setting">一、	如何查看注册信息及修改？</h2>
        <ul>
          <li>1.	进入诊所管理→注册信息→点击【修改诊所信息】按钮→可修改诊所信息。</li>
        </ul>
        <img src="./img/JG1.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="">二、	如何上传营业执照？</h2>
        <ul>
          <li>1.	进入诊所管理→注册信息→点击【上传执照】按钮。</li>
          <li>2.	点击【+】按钮→选择营业执照图片（仅支持gif，jpg，jpeg，png，bmp，小于4M图片上传）。</li>
          <li>3.	点击【确定】按钮→上传成功。</li>
        </ul>
        <img src="./img/JG2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">三、	如何进行科室管理？</h2>
        <ul>
          <li>1.	进入诊所管理→科室管理→新增科室→配置科室信息→科室编号/科室名称 。</li>
          <li>2.	选择是否预约 <span class="red">（注：选【是】登记挂号中就诊科室可进行选择，选【否】为不可选择）</span>。</li>
          <li>3.	启用/禁用科室 <span class="red">（注：禁用该科室则挂号时不能再选择该科室，新增子账号时也不能再选择该科室）</span>。</li>
          <li><span class="red">（注：科室编号、科室名称不可重复）</span></li>
        </ul>
        <img src="./img/JG3.1.png" class="img-big">
        <img src="./img/JG3.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">四、	如何进行人员管理及权限分配？</h2>
        <ul>
          <li>1.	进入诊所管理→人员管理→新建账号 （注：创建子账号前必须先维护科室）。</li>
          <li>2.	配置账号信息：登陆账号/姓名/密码/出生日期/科室/手机号→分配子账号权限 。</li>
          <li>3.	修改子账号信息/权限：点击操作下的修改按钮进行子账号信息或权限的修改 。
          <li>4.	禁用/启用子账户：点击操作下的禁用/启用按钮进行切换，切换后状态下显示被修改子账号当前状态，子账号被禁用后将无法登录 。
            <div class="red">
            （注：登陆账号不可重复、不可修改 ；子账号如果有机构管理权限，可对其它子账号进行修改以及权限分配，前提是该子账号须有被修改账号的权限，也可给自己进行删除权限）
            </div>
          </li>
        </ul>
        <img src="./img/JG4.1.png" class="img-big">
        <img src="./img/JG4.2.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">五、	如何进行收费项目管理（挂号费设置）？</h2>
        <ul>
          <li>1.	进入诊所管理→收费项目→挂号费设置 。</li>
          <li>2.	输入编号/挂号项名称/成本价/销售价→确定 。</li>
        </ul>
        <img src="./img/JG5.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">六、	如何进行收费项目管理（诊疗项目）？</h2>
        <ul>
          <li>1.	进入诊所管理→收费项目→诊疗项目→新建诊疗项目 。</li>
          <li>2.	输入检验项编号/检验项名称/成本价/销售价/单位→确认 。</li>
        </ul>
        <img src="./img/JG6.png" class="img-big">
      </div>
      <div class="big-items">
        <h2 class="setting">七、	如何进行收费项目管理（耗材设置）？</h2>
        <ul>
          <li>1.	进入诊所管理→收费项目→耗材设置 。</li>
          <li>2.	输入编号/耗材名称/成本价/销售价/单位→确认 。</li>
        </ul>
        <img src="./img/JG7.png" class="img_big">
      </div>
      <div class="big-items">
        <h2 class="setting">八、	如何进行收费项目管理（其它设置）？</h2>
        <ul>
          <li>1.	进入诊所管理→收费项目→其它设置 。</li>
          <li>2.	输入编号/其它项名称/成本价/销售价/单位 。
            <div class="red">
              （注：诊所内除药品、挂号费、诊疗项目、耗材费外其他费用都可以在此维护，然后在医生站开收费单）
            </div>
          </li>
        </ul>
        <img src="./img/JG8.png" class="img-big">
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.management-help {
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
