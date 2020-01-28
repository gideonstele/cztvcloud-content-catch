<template>
  <section class="page">
    <h3 class="page-header">帮助说明</h3>
    <section class="page-main">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="设置方法" name="site">
          <p>您可以在“站点设置”新增规则。</p>
          <p>规则名称最好填写英文、数字和下划线。</p>
          <p>匹配网站为对网址的正则匹配。</p>
          <p>选择器规则请参考<a href="http://jquery.cuishifeng.cn/" target="_blank">jQuery官方文档</a>。</p>
        </el-collapse-item>
        <el-collapse-item title="版本说明" name="version">
          <p class="atom-tac">版本：<span class="atom-ff">1.0.1</span></p>
          <p class="atom-tac">作者：<span class="atom-ff">shijinyu&lt;shjy90@126.com&gt;</span></p>
          <p class="atom-tac">respository：<a class="atom-ff" href="https://github.com/shijinyu/cztvcloud-content-catch" target="_blank">github.com/shijinyu/cztvcloud-content-catch</a></p>
        </el-collapse-item>
        <el-collapse-item title="更新日志" name="log">
          <section class="update-item">
            <h5>版本 1.0.1</h5>
            <p class="update-item-date">发布日期 2020.1.28</p>
            <ul>
              <li>修复了抓取配置不成功的BUG</li>
              <li>在配置页增加帮助说明</li>
            </ul>
          </section>
        </el-collapse-item>
      </el-collapse>
    </section>
  </section>
</template>
<script>
export default {
  data() {
    return {
      activeNames: ['version'],
    };
  }
};
</script>
<style lang="scss" scoped>
.update-item {
  margin-bottom: 10px;
}
</style>