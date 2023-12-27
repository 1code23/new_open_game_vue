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
      </el-col>
      <el-col :xs="24" :sm="10" class="rightCard">
        <div>提交信息：</div>
        <div class="summitContent borderA">
          <AppReceiver
            :formWhere="'keywords'"
            v-model="selectList"
            class="selectList"
          ></AppReceiver>
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
export default {
  name: "keywordsAd",
  components: { AppDrag, AppReceiver },
  data() {
    return {
      activeName: "app",
      selectList: [],
    };
  },
  computed: {
    tabList() {
      const list = [
        {
          label: "游戏应用",
          name: "app",
        },
        {
          label: "应用宝应用",
          name: "yyb",
        },
      ];
      return list;
    },
  },
  methods: {
    handleSubmit() {
      this.keywordAdAdd();
    },
    handleClear() {
      this.selectList = [];
    },
    async getKeywordAdDetail(id) {
      const res = await this.$api.getKeywordsAdDetail({
        keyword_id: id,
        site: this.$route.query.site,
      });
      const { list = [] } = res;
      // res_type值
      // 100101 单icon横向自营应用
      // 100102 单icon横向应用宝应用
      // 100103 预约应用分类
      // 组件300101-500101
      this.selectList = list.map((item) => {
        const obj = {
          apk_name: item.apk_name,
          package_name: item.package_name,
        };
        if (item.res_type == 100101) {
          // 自营应用
          obj.apk_id = item.apk_id;
          obj.sourceType = "app";
        } else if (item.res_type == 100102) {
          // 应用宝应用
          obj.sourceType = "yyb";
        }
        return obj;
      });
    },
    async keywordAdAdd() {
      const list = this.selectList.map((item, index) => {
        const obj = {
          sort: index + 1,
          package_name: item.package_name,
          apk_name: item.apk_name, // 资源名称
        };
        //处理应用类型
        if (item.sourceType == "app") {
          // 自营应用
          obj.res_type = 100101;
          obj.apk_id = item.apk_id;
        } else if (item.sourceType == "yyb") {
          // 应用宝应用
          obj.res_type = 100102;
        }
        return obj;
      });
      const data = {
        keyword_id: this.$route.query.keyword_id,
        site: this.$route.query.site,
        app: list,
      };
      const res = await this.$api.keywordsAdAdd(data);
      if (res) {
        this.$message.success("部署成功");
      }
    },
  },
  watch: {
    "$route.query.keyword_id": {
      immediate: true,
      handler(id, oldId) {
        if (id !== oldId) {
          this.getKeywordAdDetail(id);
        }
      },
    },
  },
};
</script>
