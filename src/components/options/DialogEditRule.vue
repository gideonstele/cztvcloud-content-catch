<template>
  <el-dialog :title="title" :visible.sync="show" append-to-body :close-on-click-modal="false">
    <el-form ref="form" :model="model" label-width="120px">
      <el-form-item label="规则名称" v-if="type === 'create'">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="匹配的网站">
        <el-input v-model="model.regexp" />
      </el-form-item>
      <el-form-item label="入口选择器">
        <el-input v-model="model.entry" />
      </el-form-item>
      <el-form-item label="图片描述选择器">
        <el-input v-model="model.imgdesc" />
      </el-form-item>
      <el-form-item label="忽略的选择器">
        <el-input v-model="model.ignores" />
      </el-form-item>
      <el-form-item label="忽略第一张图">
        <el-switch v-model="model.ignoreFirstImg" />
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button type="primary" @click="show = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
const TYP_E = 'editor';
const TYP_CR = 'create';

const initFields = () => ({
  name: '',
  regexp: '',
  entry: '',
  imgdesc: '',
  ignores: '',
  ignoreFirstImg: false,
});

export default {
  data() {
    return {
      show: false,
      type: TYP_CR,
      title: '创建规则',
      model: initFields(),
    };
  },
  methods: {
    showEdit(model) {
      this.type = TYP_E;
      this.title = `修改规则 - ${model.name}`;
      this.model = {
        // name: model.name,
        regexp: model.regexp,
        entry: model.entry,
        imgdesc: model.imgdesc,
        ignores: model.ignores,
        ignoreFirstImg: undefined,
      };
      this.show = true;
    },
    showCreate() {
      this.type = TYP_CR;
      this.title = '创建规则';
      this.show = true;
    },
    initFields() {
      this.model = initFields();
    },
    submit() {
      this.$emit('submit', this.type, {
        name: this.type === TYP_CR ? this.model.name : undefined,
        regexp: this.model.regexp,
        entry: this.model.entry,
        imgdesc: this.model.imgdesc,
        ignores: this.model.ignores,
        ignoreFirstImg: this.model.ignoreFirstImg,
      });
      this.show = false;
    },
    closed() {
      this.initFields();
    }
  },
};
</script>
<style>

</style>