<template>
  <div class="app-drag">
    <div class="searchArea">
      <template v-if="sourceType !== 'assembly'">
        <el-input
          v-model="searchData.apk_name"
          placeholder="请输入应用名称"
          class="mr10 mb10"
        ></el-input>
        <el-input
          v-model="searchData.package_name"
          placeholder="请输入包名"
          class="mr10 mb10"
        ></el-input>
        <el-select
          v-if="sourceType == 'app'"
          filterable
          clearable
          v-model="searchData.label_id"
          placeholder="请选择标签"
          class="mr10 mb10"
        >
          <el-option
            v-for="item in labelList"
            :key="item.value"
            :label="item.label_name"
            :value="item.label_id"
          >
          </el-option>
        </el-select>
      </template>
      <template v-else>
        <el-input
          v-model="searchData.assembly_name"
          placeholder="请输入组件名称"
          class="mr10 mb10"
        ></el-input>
      </template>
      <el-button
        class="mb10"
        type="primary"
        icon="el-icon-search"
        @click="handleSearch()"
        >查询</el-button
      >
    </div>
    <el-row class="scroll-card" ref="appListRef" v-loading="loading">
      <draggable
        v-model="appList"
        filter=".line_active"
        :group="{ name: 'app', pull: 'clone', put: false }"
        :animation="150"
        :scroll="true"
        :sort="false"
        :forceFallback="true"
        :scrollSensitivity="50"
      >
        <el-col
          :span="12"
          :class="{ line_active: item.isDeployed }"
          v-for="(item, index) in appList"
          :key="index"
        >
          <AppCard :data="item" :sourceType="sourceType"></AppCard>
        </el-col>
      </draggable>
    </el-row>
  </div>
</template>
<script>
import PageMore from "@/common/utils/pageMore";
import AppCard from "./AppCard.vue";
export default {
  name: "AppDrag",
  components: { AppCard },
  props: {
    // 已选择的app列表
    selectList: {
      type: Array,
      default() {
        return [];
      },
    },
    // 应用来源：app--自营应用；yyb--应用宝；order--预约应用；assembly--组件
    sourceType: {
      type: String,
      default: "app",
    },
    // 部署时是否需要添加图片
    needImg: {
      type: Boolean,
      default: false,
    },
    // 部署时是否需要添加视频
    needVideo: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchData: {},
      page: 1,
      labelList: [],
      appList: [],
      loading: false,
    };
  },
  mounted() {
    this.getLabelList();
    this.getDetailList();
    this.initScrollPage();
  },
  methods: {
    handleSearch(params) {
      this.page = 1;
      this.getDetailList({ page: 1, ...params });
      this.$refs.appListRef.$el.scrollTop = 0; // 查询后滚动到顶部
    },
    async getLabelList() {
      if (this.sourceType == "app") {
        const res = await this.$api.getDeployResource({ type: "label" });
        this.labelList = res.list || [];
      }
    },
    async getDetailList(params, isAdd) {
      const data = {
        type: this.sourceType,
        page: this.page,
        ...this.searchData,
        ...params,
      };
      this.loading = true;
      const res = await this.$api.getDeployResource(data);
      this.loading = false;
      const list = (res.list || []).map((item) => {
        item.sourceType = this.sourceType; // 来源类型
        // 需要添加图片
        if (this.needImg) {
          item.imgList = [];
        }
        // 是否需要添加视频
        item.needVideo = this.needVideo;
        // 判断是否为已部署，需要放在赋值来源类型后面，因为判断中有涉及到来源
        item.isDeployed = this.checkIsDeployed(item);
        return item;
      });
      if (isAdd) {
        this.appList = this.appList.concat(list);
      } else {
        this.appList = list;
      }
    },
    async handleScroll() {
      this.page++;
      this.getDetailList({}, true);
    },
    initScrollPage() {
      new PageMore({
        dom: this.$refs.appListRef.$el,
        callBack: this.handleScroll,
      });
    },
    checkIsDeployed(item) {
      let isDeployed = false;
      if (["app", "order"].includes(this.sourceType)) {
        isDeployed =
          this.selectList.findIndex((i) => i.apk_id == item.apk_id) != -1;
      } else if (this.sourceType == "assembly") {
        isDeployed =
          this.selectList.findIndex((i) => i.assembly_id == item.assembly_id) !=
          -1;
      } else {
        isDeployed =
          this.selectList.findIndex(
            (i) =>
              i.package_name == item.package_name &&
              i.sourceType == this.sourceType
          ) != -1;
      }
      return isDeployed;
    },
    // 暴露给父组件直接调用，重新查询数据
    init(params) {
      this.handleSearch(params);
    },
  },
  watch: {
    selectList: {
      immediate: true,
      handler() {
        // 已选择的列表变化时，重新检测当前tab页list的部署情况
        this.appList.map((item) => {
          item.isDeployed = this.checkIsDeployed(item);
          return item;
        });
      },
    },
  },
};
</script>
<style scoped lang="less">
.app-drag {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .scroll-card {
    flex: 1;
    padding: 10px 0px;
    overflow: auto;
    border-top: 1px solid #dfdfdf;
  }
}
// 拖拽时占位符的样式，在接收该拖拽元素的元素写ghostClass="ghostClass"
.ghostClass {
  width: 100% !important;
}
.searchArea {
  display: flex;
  flex-wrap: wrap;
  .el-input {
    width: 150px;
  }
}
</style>
