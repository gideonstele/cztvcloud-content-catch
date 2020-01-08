<template>
  <el-card class="box-card">
    <template v-slot:header>
      <h3 style="margin: 0; padding: 0; font-size: 1.25em;">格式化设置</h3>
    </template>
    <el-form ref="form" :model="formatdata" label-width="150px">
      <el-form-item label="保留加粗格式">
        <el-switch v-model="formatdata.bold"></el-switch>
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
  methods: {
    handleSave() {
      chrome.storage.local
    },
  },
};
</script>
<style lang="scss" scoped>

</style>