<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane
        v-for="item in tabList"
        :label="item.label"
        :name="item.name"
        :key="item.label"
      ></el-tab-pane>
    </el-tabs>
    <el-row class="contentWrapper">
      <el-col :xs="24" :sm="14" class="leftCard">
        <AppDrag
          v-show="activeName == 'app'"
          sourceType="app"
          :selectList="selectList"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'yyb'"
          sourceType="yyb"
          :selectList="selectList"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'order'"
          sourceType="order"
          :selectList="selectList"
        ></AppDrag>
        <ApiForm
          ref="apiFormRef"
          v-show="activeName == 'yybApi'"
          :assApiList="assApiList"
          @submit="handleAddApi"
        ></ApiForm>
        <ApiAppLet
          ref="ApiAppLetRef"
          v-show="activeName == 'appletApi'"
          @submit="handappletApi"
        ></ApiAppLet>
      </el-col>
      <el-col :xs="24" :sm="10" class="rightCard">
        <div>提交信息：</div>
        <div class="summitContent borderA">
          <AppReceiver v-model="selectList" class="selectList"></AppReceiver>
        </div>
        <div class="optionArea">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button type="danger" @click="handleClear">清空</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import AppDrag from "@/components/AppDrag";
import AppReceiver from "@/components/AppReceiver";
import ApiForm from "@/components/ApiForm.vue";
import ApiAppLet from "@/components/ApiAppLet.vue";
export default {
  name: "recommend",
  components: { AppDrag, AppReceiver, ApiForm, ApiAppLet },
  data() {
    return {
      activeName: "app",
      selectList: [],
      assApiList: [],
      appletApiList: [],
    };
  },
  computed: {
    tabList() {
      const list = [
        {
          label: "自营应用",
          name: "app",
        },
        {
          label: "应用宝应用",
          name: "yyb",
        },
        {
          label: "应用宝API",
          name: "yybApi",
        },
        {
          label: "微信小程序API",
          name: "appletApi",
        },
      ];
      if (this.$route.query.scenes_type != 3) {
        list.push({
          label: "预约应用",
          name: "order",
        });
      }
      return list;
    },
  },
  created() {
    this.getAssApiList();
  },
  methods: {
    handleSubmit() {
      this.recommendDetailAdd();
    },
    handleClear() {
      this.selectList = [];
    },
    handleAddApi(fromData) {
      this.selectList.push(fromData);
      this.$refs.apiFormRef.resetFields();
    },
    handappletApi(fromData) {
      this.selectList.push(fromData);
      this.$refs.ApiAppLetRef.resetFields();
    },
    async getRecommendDetail(id) {
      const res = await this.$api.getRecommendDetail({ id });
      const { list = [] } = res;
      // res_type值
      // 100101 单icon横向自营应用
      // 100102 单icon横向应用宝应用
      // 100103 预约应用分类
      // 组件300101-500101
      this.selectList = list.map((item) => {
        const obj = {
          apk_name: item.res_name,
          package_name: item.package_name,
        };
        if (item.res_type == 100101) {
          // 自营应用
          obj.apk_id = item.apk_id;
          obj.sourceType = "app";
        } else if (item.res_type == 100102) {
          // 应用宝应用
          obj.sourceType = "yyb";
        } else if (item.res_type == 100103) {
          // 预约应用
          obj.apk_id = item.apk_id;
          obj.order_id = item.order_id;
          obj.sourceType = "order";
        } else if (item.res_type == 600101) {
          //应用宝API
          obj.sourceType = "yybApi";
          if (item.external_res_info) {
            const externalInfo = JSON.parse(item.external_res_info);
            obj.slot_id = externalInfo.slotId;
            obj.slotDesc = externalInfo.slotDesc;
            obj.num = externalInfo.num;
            obj.label = externalInfo.label;
          }
        } else if (item.res_type == 600401) {
          // 微信小程序API
          obj.sourceType = "appletApi";
          obj.category_level = item.category_level;
          obj.category_name = item.category_name;
          obj.category_id = item.category_id;
          obj.sceneID = item.sceneID || item.scene_id
        }
        return obj;
      });
    },
    async recommendDetailAdd() {
      const list = this.selectList.map((item, index) => {
        const obj = {
          display_sort: index + 1,
          package_name: item.package_name,
          res_name: item.apk_name, // 资源名称
        };
        //处理应用类型
        if (item.sourceType == "app") {
          // 自营应用
          obj.res_type = 100101;
          obj.apk_id = item.apk_id;
        } else if (item.sourceType == "yyb") {
          // 应用宝应用
          obj.res_type = 100102;
        } else if (item.sourceType == "order") {
          // 预约应用
          obj.res_type = 100103;
          obj.order_id = item.order_id;
          obj.apk_id = item.apk_id;
        } else if (item.sourceType == "yybApi") {
          // 应用宝API
          obj.res_type = 600101;
          obj.slot_id = item.slot_id;
          obj.slotDesc = item.slotDesc;
          obj.num = item.num;
          obj.label = item.label;
        } else if (item.sourceType == "appletApi") {
          // 应用宝API
          obj.res_type = 600401;
          obj.categoryLevel = item.category_level;
          obj.sceneID = item.sceneID;
          obj.categoryID = item.category_id || item.categoryID;
        }
        return obj;
      });
      const data = { recommend_id: this.$route.query.id || 25, list };
      const res = await this.$api.recommendDetailAdd(data);
      if (res) {
        this.$message.success("部署成功");
      }
    },
    async getAssApiList() {
      const res = await this.$api.getDeployResource({ type: "recommendApi" });
      this.assApiList = res.list || [];
    },
  },
  watch: {
    "$route.query.id": {
      immediate: true,
      handler(id, oldId) {
        if (id !== oldId) {
          this.getRecommendDetail(id);
        }
      },
    },
  },
};
</script>
