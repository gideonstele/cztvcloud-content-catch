<template>
  <div class="pg-sites">
    <h2 class="title">按站点设置</h2>
    <template v-for="site in sites">
      <el-card class="box-card" :key="site.id">
        <template v-slot:header>
          <span>{{site.name}}</span>
        </template>
        <div class="detail">
          <dl class="detail-item">
            <dt></dt>
            <dd></dd>
          </dl>
        </div>
      </el-card>
    </template>
  </div>
</template>
<script>
export default {
  data() {
    return { };
  },
  methods: { },
};
</script>
<style lang="scss" scoped>

</style>