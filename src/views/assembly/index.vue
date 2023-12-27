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
          :needImg="needImg"
          :needVideo="needVideo"
          ref="appRef"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'yyb'"
          sourceType="yyb"
          :selectList="selectList"
          :needImg="needImg"
          :needVideo="needVideo"
          ref="yybRef"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'cloudGaming'"
          sourceType="cloudGaming"
          :selectList="selectList"
          :needImg="needImg"
          :needVideo="needVideo"
          ref="cloudGamingRef"
        ></AppDrag>
        <AppDrag
          v-show="activeName == 'order'"
          sourceType="order"
          :selectList="selectList"
          :needImg="needImg"
          :needVideo="needVideo"
          ref="orderRef"
        ></AppDrag>
        <ApiForm
          ref="apiFormRef"
          v-show="activeName == 'yybApi'"
          :assApiList="assApiList"
          @submit="handleAddApi"
        ></ApiForm>
      </el-col>
      <el-col :xs="24" :sm="10" class="rightCard">
        <div>提交信息：</div>
        <div class="summitContent borderA">
          <AppReceiver
            :isSingle="[300103, 300105, 300107].includes(assemblyType)"
            v-model="selectList"
            class="selectList"
          >
            <div class="itemArea" slot="itemBottom" slot-scope="{ item }">
              <!-- 应用宝api和组件类型为500101, 400101, 400102的组件不需要跳转信息 -->
              <template
                v-if="
                  !(
                    item.sourceType == 'yybApi' ||
                    [500101, 400101, 400102].includes(assemblyType)
                  )
                "
              >
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
                  <el-input
                    v-model="item.description"
                    placeholder="请输入跳转URL描述"
                  ></el-input>
                </template>
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
import ApiForm from "@/components/ApiForm.vue";
// 组件分类 |组件描述
// 300101 |banner 图+app ，多份 【不要预约】
// 300102 |KV 图+app ，多份 【不要预约】
// 300103 |横向大图（横屏中图-单图-无更多） 图+APP，单份 【不要预约】
// 300104 |横向图片合集（多纵图+应用-更多） 图+app ，多份 【加预约】
// 300105 |图文卡片（单图+单应用） 图+APP，单份 【不要预约】
// 300106 |纵向图片合集（单横图片-横向滑动有更多） 图+app ，多份 【加预约】
// 300107 |纵向大图（单超级大图展示） 图+APP，单份 【不要预约】
// 400101 |纵向视频合集（视频-专题-可滑动） 图+视频+APP，多份 【不要预约】
// 400102 |横向视频合集（视频-专题-可滑动） 图+视频+APP，多份 【不要预约】
// 500101 |横向icon列表，可滑动 APP、API接口， 应用宝洗包 【加预约】
export default {
  name: "assembly",
  components: { ImgDrag, AppDrag, AppReceiver, ApiForm },
  data() {
    return {
      activeName: "app",
      selectList: [],
      assemblyType: "",
      assApiList: [],
    };
  },
  computed: {
    tabList() {
      let list = [
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
          label: "云玩应用",
          name: "cloudGaming",
        },
        {
          label: "预约应用",
          name: "order",
        },
      ];
      // 需要添加预约应用的组件类型
      // if ([300104, 300106, 500101].includes(this.assemblyType)) {
      //   list.push({
      //     label: "预约应用",
      //     name: "order",
      //   });
      // }
      // 需要添加应用宝API的组件类型
      if ([500101].includes(this.assemblyType)) {
        list.push({
          label: "应用宝API",
          name: "yybApi",
        });
      }
      // 不需要添加图片部署的组件类型
      if ([500101].includes(this.assemblyType)) {
        list = list.filter((i) => i.name != "image");
      }
      return list;
    },
    needImg() {
      let flag = true;
      // 不需要添加图片部署的组件类型
      if ([500101].includes(this.assemblyType)) {
        flag = false;
      }
      return flag;
    },
    needVideo() {
      let flag = false;
      // 需要添加视频部署的组件类型
      if ([400101, 400102].includes(this.assemblyType)) {
        flag = true;
      }
      return flag;
    },
  },
  created() {
    this.getAssApiList();
  },
  methods: {
    handleSubmit() {
      // 校验数据
      const imgMsg = []; // 记录未拖入图片的位置
      const videoMsg = []; // 记录录入视频的位置
      const urlMsg = []; // 记录外部链接输入不正确的位置
      this.selectList.forEach((item, index) => {
        if (item.imgList && item.imgList.length == 0) {
          imgMsg.push(index + 1);
        }
        if (item.needVideo && !item.video_url) {
          videoMsg.push(index + 1);
        }
        if (item.jump_type) {
          // 需要跳转外部链接时，校验标题和url输入的正确性
          const patt = /(http|https):\/\/([\w.]+\/?)\S*/;
          const checkUrl = item.jump_url && patt.test(item.jump_url);
          if (!(checkUrl && item.title && item.description)) {
            urlMsg.push(index + 1);
          }
        }
      });
      if (imgMsg.length > 0) {
        this.$message.error(`请部署第${imgMsg}位置的图片`);
        return false;
      }
      if (videoMsg.length > 0) {
        this.$message.error(`请部署第${videoMsg}位置的视频`);
        return false;
      }
      if (urlMsg.length > 0) {
        this.$message.error(`第${urlMsg}位置的输入的跳转信息有误`);
        return false;
      }
      this.assemblyDetailAdd();
    },
    handleClear() {
      this.selectList = [];
    },
    handleAddApi(fromData) {
      this.selectList.push(fromData);
      this.$refs.apiFormRef.resetFields();
    },
    async getConfigDetail(id) {
      const res = await this.$api.getConfigDetail({ id });
      const { assembly = {}, list = [] } = res;
      const _assemblyType = this.assemblyType;
      this.assemblyType = assembly.res_type; // 组件类型
      // 组件类型改变时，重新查询资源，保证根据组件类型渲染的正确
      if (_assemblyType != this.assemblyType) {
        this.$refs.appRef && this.$refs.appRef.init();
        this.$refs.yybRef && this.$refs.yybRef.init();
        this.$refs.orderRef && this.$refs.orderRef.init();
      }
      // res_type值
      // 100101 单icon横向自营应用
      // 100102 单icon横向应用宝应用
      // 100103 预约应用分类
      // 600101 应用宝【额外带场景信息JSON字符串】
      this.selectList = list.map((item) => {
        const obj = {
          apk_name: item.res_name,
          package_name: item.package_name,
          jump_type: item.link_type == 2, //1 应用详情 2 跳转web地址
          jump_url: item.web_url,
          title: item.title,
          description: item.description,
        };
        if (item.res_type == 100101) {
          // 自营应用
          obj.apk_id = item.apk_id;
          obj.sourceType = "app";
        } else if (item.res_type == 100102) {
          // 应用宝应用
          obj.sourceType = "yyb";
        }  else if (item.res_type == 100111) {
          // 云玩应用
          obj.sourceType = "cloudGaming";
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
        }
        // 处理图片信息
        if (this.needImg) {
          obj.imgList = [{ hd_image_url: item.img_url }];
        }
        // 处理视频信息
        if (this.needVideo) {
          obj.needVideo = true;
          obj.imgList = [{ hd_image_url: item.video_img_url }];
          obj.video_url = item.video_url;
        }
        return obj;
      });
    },
    async assemblyDetailAdd() {
      const list = this.selectList.map((item, index) => {
        const obj = {
          display_sort: index + 1,
          package_name: item.package_name,
          res_name: item.apk_name,
          link_type: item.jump_type ? 2 : 1, //1 应用详情 2 跳转web地址
          title: item.jump_type ? item.title : "", // 跳转地址标题
          description: item.jump_type ? item.description : "", // 跳转地址描述
          web_url: item.jump_type ? item.jump_url : "", // 跳转地址
        };
        //处理应用类型
        if (item.sourceType == "app") {
          // 自营应用
          obj.res_type = 100101;
          obj.apk_id = item.apk_id;
        } else if (item.sourceType == "yyb") {
          // 应用宝应用
          obj.res_type = 100102;
        } else if (item.sourceType == "cloudGaming") {
          // 云玩应用
          obj.res_type = 100111;
          obj.apk_id = item.apk_id;
        }else if (item.sourceType == "order") {
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
        }
        // 处理图片信息
        if (item.imgList && item.imgList.length > 0) {
          obj.img_url = item.imgList[0].hd_image_url;
        } else {
          obj.img_url = "";
        }
        // 处理视频信息
        if (item.needVideo) {
          obj.video_url = item.video_url;
          obj.video_img_url = item.imgList[0].hd_image_url;
        }
        return obj;
      });
      const data = { assembly_id: this.$route.query.id, list };
      const res = await this.$api.assemblyDetailAdd(data);
      if (res) {
        this.$message.success("部署成功");
      }
    },
    async getAssApiList() {
      const res = await this.$api.getDeployResource({ type: "assApi" });
      this.assApiList = res.list || [];
    },
  },
  watch: {
    "$route.query.id": {
      immediate: true,
      handler(id, oldId) {
        if (id !== oldId) {
          this.getConfigDetail(id);
        }
      },
    },
  },
};
</script>
