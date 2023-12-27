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
        <ImgDrag v-show="activeName == 'image'"></ImgDrag>
        <AppDrag
          v-show="activeName == 'app'"
          sourceType="app"
          :selectList="selectList"
          :needImg="true"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'yyb'"
          sourceType="yyb"
          :selectList="selectList"
          :needImg="true"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'order'"
          sourceType="order"
          :selectList="selectList"
          :needImg="true"
        ></AppDrag>
      </el-col>
      <el-col :xs="24" :sm="10" class="rightCard">
        <div>提交信息：</div>
        <div class="summitContent borderA">
          <AppReceiver v-model="selectList" class="selectList">
            <div class="itemArea" slot="itemBottom" slot-scope="{ item }">
              <!-- 去掉是否选中 -->
              <!-- <el-checkbox v-model="item.is_checked">是否选中</el-checkbox> -->
              <el-checkbox v-model="item.jump_type">是否跳转</el-checkbox>
              <template v-if="item.jump_type">
                <el-input
                  v-model="item.jump_url"
                  placeholder="请输入URL，以http://或者https://开头"
                ></el-input>
                <el-input
                  v-model="item.title"
                  placeholder="请输入跳转URL标题"
                ></el-input>
              </template>
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
import ImgDrag from "@/components/ImgDrag";
import AppDrag from "@/components/AppDrag";
import AppReceiver from "@/components/AppReceiver";
export default {
  name: "openScreen",
  components: { ImgDrag, AppDrag, AppReceiver },
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
          label: "图片",
          name: "image",
        },
        {
          label: "自营应用",
          name: "app",
        },
        {
          label: "应用宝应用",
          name: "yyb",
        },
        {
          label: "预约应用",
          name: "order",
        },
      ];
      return list;
    },
  },

  methods: {
    handleSubmit() {
      // 校验数据
      const imgMsg = []; // 记录未拖入图片的位置
      const urlMsg = []; // 记录外部链接输入不正确的位置
      this.selectList.forEach((item, index) => {
        if (item.imgList && item.imgList.length == 0) {
          imgMsg.push(index + 1);
        }
        if (item.jump_type) {
          // 需要跳转外部链接时，校验标题和url输入的正确性
          const patt = /(http|https):\/\/([\w.]+\/?)\S*/;
          const checkUrl = item.jump_url && patt.test(item.jump_url);
          if (!(checkUrl && item.title)) {
            urlMsg.push(index + 1);
          }
        }
      });
      if (imgMsg.length > 0) {
        this.$message.error(`请部署第${imgMsg}位置的图片`);
        return false;
      }
      if (urlMsg.length > 0) {
        this.$message.error(`第${urlMsg}位置的输入的标题或url有误`);
        return false;
      }
      this.openScreenDetailAdd();
    },
    handleClear() {
      this.selectList = [];
    },
    async getOpenScreenDetail(id) {
      const res = await this.$api.getOpenScreenDetail({ id });
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
          needChecked: true, // 添加选择框
          is_checked: item.is_checked == 0 ? true : false, //0选中 1不选中
          jump_type: item.click_type == 3, //1 应用详情 3 跳转web地址
          jump_url: item.h5_url,
          title: item.title,
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
        } 
        // 处理图片信息
        obj.imgList = [{ hd_image_url: item.img_url }];
        return obj;
      });
    },
    async openScreenDetailAdd() {
      const list = this.selectList.map((item, index) => {
        const obj = {
          display_sort: index + 1,
          package_name: item.package_name,
          res_name: item.apk_name, // 资源名称
          is_checked: item.is_checked ? 0 : 1, //是否选中
          click_type: item.jump_type ? 3 : 1, //1 应用详情 3 跳转web地址
          title: item.jump_type ? item.title : "", // 跳转地址
          h5_url: item.jump_type ? item.jump_url : "", // 跳转地址
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
        } 
        // 处理图片信息
        if (item.imgList && item.imgList.length > 0) {
          obj.img_url = item.imgList[0].hd_image_url;
        } else {
          obj.img_url = "";
        }
        return obj;
      });

      const data = { oneclick_id: this.$route.query.id, list };
      const res = await this.$api.openScreenDetailAdd(data);
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
          this.getOpenScreenDetail(id);
        }
      },
    },
  },
};
</script>
