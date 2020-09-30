<template>
  <div class="all-message">
    <p class="no-message" v-show="!msg.length">暂无消息</p>
    <ul class="message-list">
      <li class="message-wrapper" v-for="(item, key) in msg" :key="key">
        <div class="icon-wrap">
          <span class="icon">
            <div class="dot" v-show='item.status === "未读"'></div>
            <i :class="{'el-icon-star-on': item.important, 'el-icon-star-off': !item.important}" @click="setImportant(item)"></i>
          </span>
        </div>
        <div class="message-content">
          <div class="title-body">
            <span class="title">{{ item.title }}</span>
            <span class="time">{{ item.time }}</span>
          </div>
          <div class="message-value">
            <p class="value">{{ item.value }}</p>
            <div class="oprator">
              <a href="javascript:void(0);" @click="read(item)" v-show="item.status === '未读'">置为已读</a>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: Array
    }
  },
  methods: {
    read(obj) {
      obj.status = '已读'
    },
    setImportant(obj) {
      obj.important = !obj.important
    }
  }
}
</script>

<style lang="scss" scoped>
.message-list { 
  list-style: none;
  .message-wrapper {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #ccc;
    .icon-wrap {
      flex: 0 0 64px;
      width: 64px;
      .icon {
        display: block;
        position: relative;
        width: 64px;
        height: 64px;
        margin-top: 50%;
        background: url(./img/icon_bg.gif);
        background-size: 100%;
        border-radius: 50%;
        border: 1px solid #ccc;
        .dot {
          position: absolute;
          right: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: red;
        }
        .el-icon-star-on, .el-icon-star-off {
          position: absolute;
          left: 50%;
          top: 50%;
          cursor: pointer;
          font-size: 16px;
          color: #FFB90F;
          transform: translate(-50%, -50%);
        }
      }
    }
    .message-content {
      flex: 1 1 auto;
      padding-left: 30px;
      .title-body {
        height: 60px;
        line-height: 60px;
        .title {
          display: flex;
          font-size: 12px;
          font-weight: bold;
        }
        .time {
          display: flex;
        }
      }
      .message-value {
        display: flex;
        .value {
          flex: 1 1 auto;
          padding: 0 10px;
          min-height: 100px;
        }
        .oprator {
          flex: 0 0 60px;
          width: 60px;
          font-size: 10px;
          a {
            text-decoration: none;
          }
        }
      }
    }
  }
}
</style>
