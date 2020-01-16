<template>
  <div class="page">
    <h3 class="page-header">按站点设置</h3>
    <section class="page-main" v-loading="loading">
      <el-row>
        <el-col :span="16">
          <el-button type="primary" @click="handleCreate" icon="el-icon-document-add">新增规则</el-button>
        </el-col>
      </el-row>
      <section class="card-list">
        <template v-for="site in sites">
          <el-card class="box-card" shadow="hover" :key="site.name">
            <template v-slot:header>
              <div class="card-header">
                <h4>{{site.name}}</h4>
                <el-button type="text" class="btn-edit" @click="handleEdit(site)">编辑</el-button>
              </div>
            </template>
            <div class="detail">
              <p class="detail-item">
                <span class="label">匹配规则</span>
                <span class="content">{{site.regexp}}</span>
              </p>
              <p class="detail-item">
                <span class="label">入口选择器</span>
                <span class="content">{{site.entry}}</span>
              </p>
              <p class="detail-item">
                <span class="label">忽略的选择器</span>
                <span class="content">{{site.ignores}}</span>
              </p>
              <p class="detail-item">
                <span class="label">图片描述选择器</span>
                <span class="content">{{site.imgdesc}}</span>
              </p>
            </div>
          </el-card>
        </template>
      </section>
    </section>
    <dialog-edit-rule
      ref="dialog"
      @submit="handleSubmit" 
    />
  </div>
</template>
<script>
import { merge } from 'lodash';
import DialogEditRule from '_components/options/DialogEditRule.vue';

export default {
  inject: {
    sitesConfig: {
      from: 'sites',
    },
  },
  components: {
    DialogEditRule,
  },
  data() {
    return {
      loading: false,
      sites: {},
    };
  },
  async created() {
    this.sites = await this.sitesConfig.get() || {};
  },
  methods: {
    handleCreate() {
      this.$refs['dialog'].showCreate();
    },
    handleEdit(site) {
      this.$refs['dialog'].showEdit(site);
    },
    handleSubmit(type, model) {
      this.loading = true;
      if (type === 'create') {
        this.sites[model.name] =  {
          name: model.name,
          regexp: model.regexp,
          entry: model.entry,
          imgdesc: model.imgdesc,
          ignores: model.ignores,
          ignoreFirstImg: model.ignoreFirstImg,
        };
      } else {
        this.sites[model.name] =  {
          regexp: model.regexp,
          entry: model.entry,
          imgdesc: model.imgdesc,
          ignores: model.ignores,
          ignoreFirstImg: model.ignoreFirstImg,
        };
      }
      this.sitesConfig.set(merge({}, this.sites)).then(() => {
        this.loading = false;
        this.$message({
          type: 'success',
          message: '保存设置成功',
        });
      }).catch(() => {
        this.loading = false;
        this.$message({
          type: 'error',
          message: '保存设置失败',
        });
      })
    }
  },
};
</script>
<style lang="scss" scoped>
.card-list {
  margin-top: 15px;
  display:flex;
  flex-wrap: wrap;
}
.box-card {
  margin-right: 10px;
  flex: 1 1;
  width: 360px;

  .card-header {
    h4 {
      display: inline-block;
      margin: 0;
      padding: 0;
    }
    .btn-edit {
       float: right;
    }
  }
  .detail-item {
    clear: both;
    height: 32px;
    white-space: nowrap;
    overflow: hidden;
    margin-bottom: 5px;
    text-overflow: ellipsis;

    .label {
      display: inline-block;
      text-align: right;
      width: 120px;
    }
    .content {
      display: inline-block;
      padding-left: 5px;
      text-overflow: ellipsis;
      font-family: 'Courier New', Courier, monospace;
    }
  }
}
</style>