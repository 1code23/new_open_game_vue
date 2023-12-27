<template>
  <draggable
    class="imageDrag borderA"
    v-model="imgList"
    :animation="150"
    group="image"
    @change="imgDragChange"
    ghostClass="ghostClass"
  >
    <div class="imageItem" v-for="(item, index) in imgList" :key="index">
      <i class="el-icon-delete deleteIcon" @click="deleteImg"></i>
      <el-image
        fit="cover"
        :src="item.hd_image_url"
        :preview-src-list="[item.hd_image_url]"
      >
      </el-image>
    </div>
  </draggable>
</template>
<script>
export default {
  name: "ImgReceiver",
  model: {
    prop: "data",
    event: "change",
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      imgList: this.data,
    };
  },
  methods: {
    // 拖拽发生改变时触发
    imgDragChange(row) {
      if (row.added) {
        const { element } = row.added;
        // 拖拽列表只允许有一个
        this.imgList = [element];
      }
    },
    deleteImg() {
      this.imgList = [];
    },
  },
  watch: {
    data() {
      if (this.imgList === this.data) {
        return;
      }
      this.imgList = this.data;
    },
    imgList() {
      this.$emit("change", this.imgList);
    },
  },
};
</script>
<style lang="less" scoped>
.imageDrag {
  height: 100px;
  width: 100%;
  box-sizing: border-box;
  padding: 15px;
  background: url("@/assets/images/market-img.png") center no-repeat;
  position: relative;

  .imageItem,
  .el-image {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .deleteIcon {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 20px;
    z-index: 9;
    cursor: pointer;
  }
}
</style>
