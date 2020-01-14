<template>
  <section class="page">
    <h3 class="page-header">通用设置</h3>
    <section class="page-main">
      <el-form ref="form" :model="frmModel" label-width="84px">
        <el-form-item label="保留的图片">
          <el-checkbox-group v-model="frmModel.imgtype">
            <el-checkbox label="jpg" name="imgtype"></el-checkbox>
            <el-checkbox label="png" name="imgtype"></el-checkbox>
            <el-checkbox label="webp" name="imgtype"></el-checkbox>
            <el-checkbox label="gif" name="imgtype"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="下载视频">
          <el-radio-group disabled>
            <el-radio label="是" name="videotype"></el-radio>
            <el-radio label="否" name="videotype"></el-radio>
          </el-radio-group>
          <el-tooltip effect="dark" content="此功能将在后续版本开放">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </section>
  </section>
</template>
<script>
export default {
  inject: {
    commonConfig: {
      from: 'common',
    },
  },
  data() {
    return {
      frmModel: {
        imgtype: ['jpg', 'png', 'webp'],
      },
    };
  },
  async created() {
    const config = await this.commonConfig.get() || {};
    this.frmModel.imgtype = config.imgtype || [];
  },
  methods: {
    async handleSave() {
      const frmModel = this.frmModel;
      await this.commonConfig.set({
        imgtype: frmModel.imgtype,
      });
      this.$message({
        message: '设置保存成功',
        type: 'success',
      });
    },
  },
};
</script>
<style lang="scss" scoped>

</style>