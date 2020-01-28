<template>
  <section v-if="showme" v-show="isshow" class="cztvcatchmodal">
    <header class="cztvcatchmodal-header">
      <span class="cztvcatchmodal-header-title">抓取内容</span>
      <button type="button" class="cztvcatchmodal-header-button" @click="handleHide">&times;</button>
    </header>
    <section class="cztvcatchmodal-body">
      <el-form ref="form" :model="model" label-width="80px">
        <el-form-item label="入口区域">
          <el-col :span="14">
            <el-input v-model="model.selector" />
          </el-col>
          <el-col :offset="2" :span="8">
            <el-button type="primary" @click="handleCatchDiv">选择页面区域</el-button>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">抓取并格式化</el-button>
        </el-form-item>
      </el-form>
    </section>
  </section>
</template>
<script>
import $ from 'jquery';
import { debounce } from 'throttle-debounce';

const selected = '___cztvcloud_catched'

const fnHookCatch = (callback) => {
  const $body = $(document.body);
  $body.one('click', `.${selected}`, function (e) {
    console.log(e);
    const $selected = $(`.${selected}`);
    $selected.attr('data-catched', '___cztvcloud_catched');
    $selected.removeClass(selected);
    $body.off('mousemove.selector');
    callback($selected[0]);
  });
  $body.on('mousemove.selector', debounce(25, function (e) {
    console.log(e);
    const target = e.target;
    $(`.${selected}`).removeClass(selected);
    $(target).addClass(selected);
  }));
};

export default {
  props: {
    handleCatch: {
      default: () => new Function(),
      type: Function,
    },
  },
  data() {
    return {
      showme: true,
      isshow: true,
      model: {
        selector: '',
      },
    };
  },
  methods: {
    handleHide() {
      this.showme = false;
    },
    handleCatchDiv() {
      this.isshow = false;
      fnHookCatch(() => {
        this.model.selector = '[data-catched=___cztvcloud_catched]';
        this.isshow = true;
      });
    },
    handleSubmit() {
      if (this.model.selector) {
        this.handleCatch(this.model.selector);
      } else {
        this.$alert('没有找到抓取入口，您需要手动选择一下', 'cztvcloud抓取提示');
      }
    },
    injectEntryDom(selector) {
      if (selector) {
        this.model.selector = selector;
      } else {
        this.$alert('没有找到抓取入口，您需要手动选择一下', 'cztvcloud抓取提示');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.cztvcatchmodal {
  position: fixed !important;
  display: block !important;
  right: 20px !important;;
  bottom: 20px !important;;
  width: 480px !important;;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
  background-color: #fff;

  .cztvcatchmodal-header {
    height: 36px;
    padding: 5px 10px;
    border-bottom: 1px solid #eee;
    
  }
  .cztvcatchmodal-header-title {
    font-size: 16px;
    line-height: 26px;
    color: #303133;
  }
  .cztvcatchmodal-header-button {
    position: absolute;
    right: 10px;
    top: 5px;
    height: 26px;
    font-size: 24px;
    line-height: 26px;
    color: #909399;
    border: none;
    background-image: none;
    background-color: transparent;

    &:hover {
      color: #409eff;
    }
  }
  .cztvcatchmodal-body {
    padding: 10px;
  }
}
</style>