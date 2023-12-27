<template>
  <el-form
    :model="formData"
    label-suffix="："
    class="formArea"
    label-width="100px"
    :rules="rules"
    ref="formRef"
  >
    <el-form-item label="场景" prop="slot_id">
      <el-select v-model="formData.slot_id" filterable placeholder="请选择场景">
        <el-option
          v-for="item in assApiList"
          :key="item.key"
          :value="item.key"
          :label="item.name"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="数量" prop="num">
      <el-input
        v-model.number="formData.num"
        placeholder="请输入数量"
      ></el-input>
    </el-form-item>
    <el-form-item label="标签" prop="label" v-if="hasLabel">
      <el-input v-model="formData.label" placeholder="请输入标签"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: {
    assApiList: {
      type: Array,
      default() {
        return [];
      },
    },
    hasLabel: {// 是否需要显示标签字段
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      formData: {
        sourceType: "yybApi", // 添加来源标识字段 用于区分
        slot_id: "",
        num: "",
        label: "",
      },
      rules: {
        slot_id: [{ required: true, message: "请选择" }],
        num: [
          { required: true, message: "请输入数量" },
          { type: "number", message: "请输入数字" },
        ],
        // label: [{ required: true, message: "请输入标签" }],
      },
    };
  },
  created() {},
  methods: {
    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 备份数据再传给父组件
          const data = JSON.parse(JSON.stringify(this.formData));
          data.hasLabel = this.hasLabel;// 标识是否需要显示标签字段
          const assApiObj = this.assApiList.find((i) => i.key == data.slot_id);
          if (assApiObj) {
            data.slotDesc = assApiObj.name; // 场景描述
          }
          this.$emit("submit", data);
        } else {
          this.$message.error("请检查输入的数据");
        }
      });
    },
    // 暴露给父组件清除表单数据
    resetFields() {
      this.$refs.formRef.resetFields();
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
