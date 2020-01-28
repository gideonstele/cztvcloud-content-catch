<template>
  <el-container class="page-option">
    <el-header class="header">
      <h1 class="title">抓取插件的配置</h1>
    </el-header>
    <el-aside class="c-aside" width="300px">
      <el-menu default-active="1" class="menu" @select="handleSelect">
        <el-menu-item key="1" index="1">
          <i class="el-icon-setting"></i>
          <template v-slot:title>
            <span>通用设置</span>
          </template>
        </el-menu-item>
        <el-menu-item key="2" index="2">
          <i class="el-icon-share"></i>
          <template v-slot:title>
            <span>输出设置</span>
          </template>
        </el-menu-item>
        <el-menu-item key="3" index="3">
          <i class="el-icon-more"></i>
          <template v-slot:title>
            <span>站点设置</span>
          </template>
        </el-menu-item>
        <el-menu-item key="4" index="4">
          <i class="el-icon-help"></i>
          <template v-slot:title>
            <span>帮助说明</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="c-container">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      routesMap: {
        '1': { name: 'common' },
        '2': { name: 'output' },
        '3': { name: 'sites' },
        '4': { name: 'help' },
      }
    };
  },
  async mounted() {
    
  },
  methods: {
    handleSelect(index, indexPath) {
      console.log(index, indexPath);
      if (this.routesMap[index]) {
        const r = this.routesMap[index];
        this.$router.push(r);
      }
    },
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
  .header {
    height: 60px;
    border-bottom: 1px solid #ccc;
    .title {
      margin: 0;
      font-size: 20px;
      line-height: 60px;
    }
  }

  .c-aside {
    position: absolute;
    top: 60px;
    left: 0;
    width: 300px;
    height: 100%;
    background-color: #fff;
    overflow: auto;
    .el-menu {
      height: 100%;
    }
  }
  .c-container {
    margin-left: 300px;
    padding: 10px;
  }
}
</style>