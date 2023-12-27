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
          >
            <div class="itemArea" slot="itemBottom" slot-scope="{ item }">
              <el-checkbox v-model="item.is_checked">是否选中</el-checkbox>
            </div>
          </AppReceiver>
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
  name: "oneClickInstall",
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
      this.oneClickAdd();
    },
    handleClear() {
      this.selectList = [];
    },
    async getOneClickDetail(id) {
      const res = await this.$api.getOneClickDetail({
        id,
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
          is_checked: item.is_checked == 1,
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
      console.log(this.selectList);
    },
    async oneClickAdd() {
      const list = this.selectList.map((item, index) => {
        const obj = {
          sort: index + 1,
          package_name: item.package_name,
          apk_name: item.apk_name, // 资源名称
        };
        obj.is_checked = item.is_checked ? 1 : 0;

        //处理应用类型
        if (item.sourceType == "app") {
          // 自营应用
          obj.type = 1;
          obj.res_type = 100101;
          obj.apk_id = item.apk_id;
        } else if (item.sourceType == "yyb") {
          // 应用宝应用
          obj.type = 2;
          obj.res_type = 100102;
        }
        return obj;
      });
      const data = {
        id: this.$route.query.id,
        app: list,
      };
      const res = await this.$api.oneClickAdd(data);
      if (res) {
        this.$message.success("部署成功");
      }
    },
  },
  watch: {
    "$route.query.id": {
      immediate: true,
      handler(id, oldId) {
        if (id !== oldId) {
          this.getOneClickDetail(id);
        }
      },
    },
  },
};
</script>
