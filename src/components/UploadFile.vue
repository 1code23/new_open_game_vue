<template>
  <el-upload
    action="#"
    ref="uploadRef"
    class="uploader"
    :show-file-list="false"
    :disabled="disabled || loading"
    :http-request="handleHttpRequest"
  >
    <slot>
      <el-button
        :disabled="disabled"
        type="primary"
        :loading="loading"
      >
        <slot name="text">上传文件</slot>
      </el-button>
    </slot>
  </el-upload>
</template>

<script>
import { obsServe } from "@/common/utils/utils.js";
export default {
  model: { prop: "url", event: "change" },
  props: {
    url: { default: "" },
    type: { default: "other" }, // 上传的文件类型，可用值:apk,image,other,video
    expandData: {}, // 其他附加数据
    // 接受上传的文件类型
    acceptType: {
      type: Array,
      default() {
        return [];
      },
    },
    // 限制大小单位为MB
    limSize: {
      type: Number,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fileUrl: this.url,
      loading: false,
    };
  },

  methods: {
    async handleHttpRequest({ file }) {
      const isUpload = await this.beforeUpload(file);
      if (isUpload) {
        this.loading = true;
        try {
          // 文件上传至服务器
          const res = await obsServe(file, this.type);
          if (res) {
            this.fileUrl = res.accessPath || "";
            this.$emit("success", res);
          }
          this.loading = false;
        } catch (err) {
          this.loading = false;
        }
      }
    },
    async beforeUpload(file) {
      const acceptType = this.acceptType; // 限制上传类型
      const limSize = this.limSize; // 限制大小单位为MB
      let [isFileType, isFileSize] = [true, true];
      if (acceptType.length != 0) {
        // 父组件传入可接受类型
        const fileType = file.name
          .substring(file.name.lastIndexOf(".") + 1)
          .toLowerCase();
        isFileType = acceptType.includes(fileType);
      }

      if (limSize) {
        // 父组件传入限制大小
        isFileSize = file.size / 1024 / 1024 <= limSize;
      }
      if (!isFileType) {
        this.$message.error(`上传文件只能是 ${acceptType.join("、")} 格式！`);
        return isFileType;
      }
      if (!isFileSize) {
        this.$message.error(`上传文件大小不能超过 ${limSize}MB!`);
        return isFileSize;
      }
      return isFileType && isFileSize;
    },
    // 暴露给父组件校验组件文件是否正在上传
    getValidate(showMsg = true) {
      if (this.loading) {
        if (showMsg) {
          this.$message.error("文件正在上传，请稍后；");
        }
        return false;
      }
      return true;
    },
  },
  watch: {
    url(url) {
      if (url === this.fileUrl) return;
      this.fileUrl = url;
    },
    fileUrl(url) {
      this.$emit("change", url);
    },
  },
};
</script>
<style scoped>
.uploader {
  display: inline-block;
}
</style>
