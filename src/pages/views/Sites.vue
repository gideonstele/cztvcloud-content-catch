<template>
  <div class="page">
    <h3 class="page-header">按站点设置</h3>
    <section class="page-main">
      <el-row>
        <el-col :span="16">
          
        </el-col>
      </el-row>
      <template v-for="site in sitesConfig">
        <el-card class="box-card" :key="site.id">
          <template v-slot:header>
            <span>{{site.name}}</span>
          </template>
          <div class="detail">
            <p class="detail-item">
              <span class="label">入口选择器</span>
              <span class="content">{{site.entry}}</span>
            </p>
            <p class="detail-item">
              <span class="label">忽略的选择器</span>
              <span class="content">{{site.ignores}}</span>
            </p>
            <p>
              <span class="label">图片描述选择器</span>
              <span class="content">{{site.imgdesc}}</span>
            </p>
          </div>
        </el-card>
      </template>
    </section>
  </div>
</template>
<script>
import storage from '_utils/localstore.js';
export default {
  inject: {
    sitesConfig: {
      from: 'sites',
    },
  },
  data() {
    return {
      sitesConfig: [],
    };
  },
  methods: {
    
  },
};
</script>
<style lang="scss" scoped>

</style>