<template>
  <section class="page">
    <h3 class="page-header">输出</h3>
    <section class="page-main">
      <el-form ref="form" :model="frmModel" label-width="90px">
        <el-form-item label="保留标题等级">
          <el-switch v-model="frmModel.hlevel"></el-switch>
          <el-tooltip effect="dark" content="打开此项，原文中 h1~h6 级别的标题将会被保存，否则他们将会被视为一个段落">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </el-form-item>
        <!-- 正文 -->
        <h5>正文输出格式设置</h5>
        <el-row type="flex" justify="space-between" :gutter="0">
          <el-col :span="12">
            <el-form-item label="font-size">
              <el-input v-model="passage.fontsizeval" type="number" min="9" step="1">
                <template v-slot:append>
                  <el-select v-model="passage.fontsizeunit" class="__append-select">
                    <el-option value="px"></el-option>
                    <el-option value="pt"></el-option>
                    <el-option value="%"></el-option>
                    <el-option value="em"></el-option>
                    <el-option value="rem"></el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="保留加粗">
              <el-switch v-model="frmModel.passage_bold" active-text="保留" inactive-text="不保留" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="line-height">
          <el-input v-model="passage.lineheightval" type="number">
            <template v-slot:append>
              <el-select v-model="passage.lineheightunit" class="__append-select">
                <el-option value="" label="倍"></el-option>
                <el-option value="%"></el-option>
                <el-option value="px"></el-option>
                <el-option value="pt"></el-option>
                <el-option value="em"></el-option>
                <el-option value="rem"></el-option>
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="text-align">
          <el-radio-group v-model="frmModel.passage_textalign">
            <el-radio-button label="justify"></el-radio-button>
            <el-radio-button label="left"></el-radio-button>
            <el-radio-button label="center"></el-radio-button>
            <el-radio-button label="right"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-divider />
        <!-- 图片描述 -->
        <h5>图片描述格式设置</h5>
        <el-row type="flex" justify="space-between" :gutter="1">
          <el-col :span="12">
            <el-form-item label="font-size">
              <el-input v-model="imgdesc.fontsizeval" type="number" min="9" step="1">
                <template v-slot:append>
                  <el-select v-model="imgdesc.fontsizeunit" class="__append-select">
                    <el-option value="px"></el-option>
                    <el-option value="pt"></el-option>
                    <el-option value="%"></el-option>
                    <el-option value="em"></el-option>
                    <el-option value="rem"></el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="保留加粗">
              <el-switch v-model="frmModel.imgdesc_bold" active-text="保留" inactive-text="不保留" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="line-height">
          <el-input v-model="imgdesc.lineheightval" type="number">
            <template v-slot:append>
              <el-select v-model="imgdesc.lineheightunit" class="__append-select">
                <el-option value="" label="倍"></el-option>
                <el-option value="%"></el-option>
                <el-option value="px"></el-option>
                <el-option value="pt"></el-option>
                <el-option value="em"></el-option>
                <el-option value="rem"></el-option>
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="text-align">
          <el-radio-group v-model="frmModel.imgdesc_textalign" class="__append-select">
            <el-radio-button label="justify"></el-radio-button>
            <el-radio-button label="left"></el-radio-button>
            <el-radio-button label="center"></el-radio-button>
            <el-radio-button label="right"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-divider />
        <!-- 图片 -->
        <h5>图片格式设置</h5>
        <el-form-item label="text-align">
          <el-radio-group v-model="frmModel.img_textalign">
            <el-radio-button label="justify"></el-radio-button>
            <el-radio-button label="left"></el-radio-button>
            <el-radio-button label="center"></el-radio-button>
            <el-radio-button label="right"></el-radio-button>
          </el-radio-group>
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
    outputConfig: {
      from: 'output',
    },
  },
  data() {
    return {
      frmModel: {
        hlevel: false,
        passage_textalign: 'justify',
        passage_bold: false,
        imgdesc_textalign: 'center',
        imgdesc_bold: false,
        img_textalign: 'center',
      },
      passage: {
        fontsizeval: '16',
        fontsizeunit: 'px',
        lineheightval: '1.75',
        lineheightunit: '',
      },
      imgdesc: {
        fontsizeval: '16',
        fontsizeunit: 'px',
        lineheightval: '1.75',
        lineheightunit: '',
      },
    };
  },
  computed: {
    passage_fontsize: {
      get() {
        return this.passage.fontsizeval + this.passage.fontsizeunit;
      },
      set(value) {
        const matches = /^([0-9\.]+)([a-z\%]+)?$/i.exec(value);
        if (matches) {
          const [ , val = '16', unit = 'px' ] = matches;
          this.passage.fontsizeval = val;
          this.passage.fontsizeunit = unit;
        }
      },
    },
    passage_lineheight: {
      get() {
        return this.passage.lineheightval + this.passage.lineheightunit;
      },
      set(value) {
        const matches = /^([0-9\.]+)([a-z\%]+)?$/i.exec(value);
        if (matches) {
          const [ , val = '1.75', unit = '' ] = matches;
          this.passage.lineheightval = val;
          this.passage.lineheightunit = unit;
        }
      },
    },
    imgdesc_fontsize: {
      get() {
        return this.imgdesc.fontsizeval + this.imgdesc.fontsizeunit;
      },
      set(value) {
        const matches = /^([0-9\.]+)([a-z\%]+)?$/i.exec(value);
        if (matches) {
          const [ , val = '16', unit = 'px' ] = matches;
          this.imgdesc.fontsizeval = val;
          this.imgdesc.fontsizeunit = unit;
        }
      },
    },
    imgdesc_lineheight: {
      get() {
        return this.imgdesc.lineheightval + this.imgdesc.lineheightunit;
      },
      set(value) {
        const matches = /^([0-9\.]+)([a-z\%]+)?$/i.exec(value);
        if (matches) {
          const [ , val = '1.75', unit = '' ] = matches;
          this.imgdesc.lineheightval = val;
          this.imgdesc.lineheightunit = unit;
        }
      },
    },
  },
  async created() {
    const config = await this.outputConfig.get() || {};
    this.frmModel.hlevel = !!config.hlevel;
    this.frmModel.passage_textalign = config.passage_textalign || 'justify';
    this.frmModel.passage_bold = !!config.passage_bold;
    this.passage_fontsize = config.passage_fontsize || '16px';
    this.passage_lineheight = config.passage_lineheight || '1.75';
    this.frmModel.imgdesc_textalign = config.imgdesc_textalign || 'center';
    this.frmModel.imgdesc_bold = !!config.imgdesc_bold;
    this.imgdesc_fontsize = config.imgdesc_fontsize || '14px';
    this.imgdesc_lineheight = config.imgdesc_lineheight || '1.75';
    this.frmModel.img_textalign = config.img_textalign || 'center';
  },
  methods: {
    async handleSave() {
      const frmModel = this.frmModel;
      await this.outputConfig.set({
        hlevel: this.frmModel.hlevel,
        passage_textalign: this.frmModel.passage_textalign,
        passage_bold: this.frmModel.passage_bold,
        passage_fontsize: this.passage_fontsize,
        passage_lineheight: this.passage_lineheight,
        imgdesc_textalign: this.frmModel.imgdesc_textalign,
        imgdesc_bold: this.frmModel.imgdesc_bold,
        imgdesc_fontsize: this.imgdesc_fontsize,
        imgdesc_lineheight: this.imgdesc_lineheight,
        img_textalign: this.frmModel.img_textalign,
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
.__append-select {
  min-width: 76px;
}
</style>