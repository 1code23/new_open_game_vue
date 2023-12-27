<template>
  <div class="img-drag">
    <div class="searchArea">
      <el-input
        v-model="searchData.image"
        placeholder="请输入图片名称"
        class="mr10"
      ></el-input>
      <el-button
        size="small"
        type="primary"
        icon="el-icon-search"
        @click="handleSearch()"
        >查询</el-button
      >
    </div>
    <el-row
      :gutter="16"
      class="scroll-card"
      ref="imgListRef"
      v-loading="loading"
    >
      <draggable
        v-model="imgList"
        :group="{ name: 'image', pull: 'clone', put: false }"
        :animation="150"
        :scroll="true"
        :sort="false"
        :forceFallback="true"
      >
        <el-col
          :xs="8"
          :sm="6"
          class="img-card borderA"
          v-for="(item, index) in imgList"
          :key="index"
        >
          <img :src="item.hd_image_url" />
          <div>{{ item.image_name }}</div>
        </el-col>
      </draggable>
    </el-row>
  </div>
</template>
<script>
import PageMore from "@/common/utils/pageMore";
export default {
  name: "ImgDrag",
  data() {
    return {
      searchData: {},
      page: 1,
      imgList: [],
      loading: false,
    };
  },
  mounted() {
    this.getDetailList();
    this.initScrollPage();
  },
  methods: {
    handleSearch(params) {
      this.page = 1;
      this.getDetailList({ page: 1, ...params });
      this.$refs.imgListRef.$el.scrollTop = 0; // 查询后滚动到顶部
    },
    async getDetailList(params, isAdd) {
      const data = {
        type: "image",
        page: this.page,
        ...this.searchData,
        ...params,
      };
      this.loading = true;
      const res = await this.$api.getDeployResource(data);
      this.loading = false;
      if (isAdd) {
        this.imgList = this.imgList.concat(res.list);
      } else {
        this.imgList = res.list;
      }
    },
    async handleScroll() {
      this.page++;
      this.getDetailList({}, true);
    },
    initScrollPage() {
      new PageMore({
        dom: this.$refs.imgListRef.$el,
        callBack: this.handleScroll,
      });
    },
    // 暴露给父组件直接调用，重新查询数据
    init(params) {
      this.handleSearch(params);
    },
  },
};
</script>
<style scoped lang="less">
.img-drag {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;

  .scroll-card {
    flex: 1;
    padding: 10px 0px;
    overflow: auto;
    border-top: 1px solid #dfdfdf;
  }

  .img-card {
    padding: 5px;
    img {
      border-radius: 10px;
      width: 100%;
      height: 100%;
    }
  }
}

// 拖拽时占位符的样式，在接收该拖拽元素的元素写ghostClass="ghostClass"
.ghostClass {
  img {
    height: 100% !important;
    width: 100% !important;
  }
}
.searchArea {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  .el-input {
    width: 150px;
  }
}
</style>
