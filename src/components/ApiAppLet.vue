<template>
  <el-form
    :model="formData"
    label-suffix="："
    class="formArea"
    label-width="100px"
    :rules="rules"
    ref="formRef"
  >
    <el-form-item label="sceneID" prop="sceneID">
      <el-input
        v-model="formData.sceneID"
        placeholder="请输入sceneID"
      ></el-input>
    </el-form-item>
    <el-form-item label="分类类目" prop="category_level">
      <el-select
        v-model="formData.category_level"
        filterable
        placeholder="请选择分类"
        @change="changeid"
      >
        <el-option
          v-for="item in assApiList"
          :key="item.key"
          :value="item.key"
          :label="item.name"
        ></el-option>
      </el-select>
      <el-select
        style="margin-left: 10px"
        v-model="formData.categoryID"
        filterable
        multiple
        placeholder="请选择分类明细（可多选）"
      >
        <el-option
          multiple
          collapse-tags
          v-for="item in categoryList"
          :key="item.id"
          :value="
            formData.category_level == 2 ? item.parent_id : item.category_id
          "
          :label="formData.category_level == 2 ? item.parent_name : item.name"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: {
    // assApiList: {
    //   type: Array,
    //   default() {
    //     return [];
    //   },
    // },
    // hasLabel: {// 是否需要显示标签字段
    //   type: Boolean,
    //   default: true,
    // },
  },
  data() {
    return {
      formData: {
        sourceType: "appletApi", // 添加来源标识字段 用于区分
        category_level: 2,
        sceneID: "",
        categoryID: [],
      },
      assApiList: [
        { key: 2, name: "二级分类" },
        { key: 3, name: "三级分类" },
      ],
      categoryList: [],
      rules: {
        category_level: [{ required: true, message: "请选择" }],
        sceneID: [{ required: true, message: "请输入sceneID" }],
        categoryID: [{ required: true, message: "请选择分类明细" }],
      },
    };
  },
  created() {
    this.getcategoryList(this.formData.category_level);
  },
  methods: {
    changeid(val) {
      this.getcategoryList(val);
    },
    async getcategoryList(parentId) {
      const res = await this.$api.getcategoryList({
        type: "wechatApi",
        parent_id: parentId,
      });
      this.categoryList = res.list || [];
      this.formData.categoryID = []
    },
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 备份数据再传给父组件
          const data = JSON.parse(JSON.stringify(this.formData));
          data.category_name = "";

          const { category_level, categoryID } = this.formData;
          categoryID.map((cid) => {
            const id = category_level == 2 ? "parent_id" : "category_id";
            const name = category_level == 2 ? "parent_name" : "name";

            data.category_name +=
              this.categoryList.find((item) => item[id] == cid)[name] + ";";
          });

          this.$emit("submit", data);
        } else {
          this.$message.error("请检查输入的数据");
        }
      });
    },
    // 暴露给父组件清除表单数据
    resetFields() {
      const level = this.formData.category_level;
      this.$refs.formRef.resetFields();
      this.formData.category_level = level;
      this.formData.categoryID = []
    },
  },
};
</script>
<style scoped lang="less">
.formArea {
  padding: 20px;
  /deep/.el-input {
    width: 250px;
  }
}
</style>
