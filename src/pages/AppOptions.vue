<template>
  <el-container class="page-option">
    <el-aside class="c-aside" width="300px">
      <el-menu default-active="1" class="menu">
        <el-menu-item key="1">
          <i class="el-icon-cpu"></i>
          <template v-slot:title>
            <router-link :to="{ name: 'common' }">通用设置</router-link>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="c-container">
      <el-header class="header">
        <h1 class="title">抓取插件的配置</h1>
      </el-header>
      <section class="c-section">
        <router-view></router-view>
      </section>
    </el-main>
  </el-container>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
    handleSave() {},
  },
};
</script>
<style lang="scss" scoped>
.page-option {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  .c-aside {
    position: absolute;
    top: 0;
    left: 0;
    width: 300px;
    height: 100%;
    background-color: #fff;
    overflow: auto;
  }
  .c-container {
    margin-left: 300px;

    .header {
      height: 60px;
      
      .title {
        margin: 0;
        font-size: 20px;
      }
    }

    .c-section {
      padding: 10px;
    }
  }
}
</style>