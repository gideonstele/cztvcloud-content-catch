<template>
  <el-card class="box-card">
    <template v-slot:header>
      <h3 style="margin: 0; padding: 0; font-size: 1.25em;">格式化设置</h3>
    </template>
    <el-form ref="form" :model="formatdata" label-width="150px">
      <el-form-item label="保留加粗格式">
        <el-switch v-model="formatdata.bold"></el-switch>
      </el-form-item>
      <el-form-item label="保留标题等级">
        <el-switch v-model="formatdata.hlevel"></el-switch>
        <el-tooltip effect="dark" content="打开此项，原文中 h1~h6 级别的标题将会被保存，否则他们将会被视为一个段落">
          <i class="el-icon-info"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="格式化对齐方式">
        <el-select v-model="formatdata.textalign">
          <el-option label="左对齐" value="left" />
          <el-option label="居中" value="center" />
          <el-option label="右对齐" value="right" />
          <el-option label="两端对齐" value="justify" />
        </el-select>
      </el-form-item>
      <el-form-item label="保留的图片">
        <el-checkbox-group v-model="formatdata.imgtype">
          <el-checkbox label="jpg" name="imgtype"></el-checkbox>
          <el-checkbox label="png" name="imgtype"></el-checkbox>
          <el-checkbox label="webp" name="imgtype"></el-checkbox>
          <el-checkbox label="gif" name="imgtype"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import storage from '_utils/localstore.js';
export default {
  data() {
    return {
      formatdata: {
        bold: false,
        textalign: 'left',
        imgtype: ['jpg', 'png', 'webp'],
      },
    };
  },
  async created() {
    const common = await storage.getItem('common') || {};
    this.formatdata.bold = common.bold || 'false';
    this.formatdata.textalign = common.textalign || 'left';
    this.formatdata.imgtype = common.imgtype || [];
  },
  methods: {
    async handleSave() {
      const formatdata = this.formatdata;
      console.log(formatdata);
      await storage.set({
        'common': {
          bold: formatdata.bold,
          textalign: formatdata.textalign,
          imgtype: formatdata.imgtype,
        },
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