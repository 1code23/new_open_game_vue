<template>
  <draggable
    class="appReceiver"
    v-model="list"
    group="app"
    :animation="150"
    :scroll="true"
    :sort="true"
    :scrollSensitivity="50"
    :forceFallback="true"
    @change="appDragChange"
    handle=".dragItem"
  >
    <div v-for="(item, index) in list" :key="index" class="listItem borderA">
      <i class="el-icon-delete deleteIcon" @click="removeItem(index)"></i>
      <!-- 防止按钮点击不了的bug赋予可移动的类dragItem -->
      <div class="dragItem">
        <div class="appInfo">
          <el-tag
            class="fixed-tag"
            :type="item.sourceType | tagType"
            v-if="item.sourceType"
          >
            <span v-if="formWhere == 'keywords'">{{ item.sourceType== 'app'?'游戏应用':"应用宝应用" }}</span>
            <span v-else>{{ typeDesc(item.sourceType) }}</span>
          </el-tag>
          <div class="item-left" @click="handleClickSort(index)">
            <el-input
              :key="item.assembly_id"
              v-model="sortNumber"
              v-if="sortIndex === index"
              @blur="handleInputBlur"
              @keyup.enter.native="handleInputEnter(index)"
            />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="item-right">
            <!-- 显示组件 -->
            <template v-if="item.sourceType == 'assembly'">
              <div>
                {{ item.assembly_name }}
              </div>
              <div>组件id：{{ item.assembly_id }}</div>
            </template>
            <!-- 显示应用宝API -->
            <template v-if="item.sourceType == 'yybApi'">
              <div>场景：{{ item.slotDesc }}</div>
              <div>数量：{{ item.num }}</div>
              <div v-if="item.hasLabel == undefined || item.hasLabel">
                标签：{{ item.label }}
              </div>
            </template>
            <!-- 显示应用 -->
            <template v-if="!['assembly', 'yybApi'].includes(item.sourceType)">
              <div>
                {{ item.apk_name }}
              </div>
              <div>{{ item.package_name }}</div>
            </template>
            <template v-if="['appletApi'].includes(item.sourceType)">
              <div>分类类目：{{item.category_level==2?'二级分类':'三级分类'}}</div>
              <div>分类名称：{{item.category_name}}</div>
            </template>
            <slot name="itemRight" :item="item"></slot>
          </div>
        </div>
        <ImgReceiver
          v-if="item.imgList"
          class="imageReceive"
          v-model="item.imgList"
        ></ImgReceiver>
      </div>
      <div class="videoArea" v-if="item.needVideo">
        <el-input
          v-model="item.video_url"
          placeholder="视频链接地址"
        ></el-input>
        <UploadFile
          type="video"
          class="uploadFile"
          :acceptType="['mov', 'mp4']"
          v-model="item.video_url"
        ></UploadFile>
      </div>
      <slot name="itemBottom" :item="item"></slot>
    </div>
  </draggable>
</template>
<script>
import ImgReceiver from "@/components/ImgReceiver";
import UploadFile from "@/components/UploadFile";
const sourceTypeList = [
  {
    label: "自营应用",
    name: "app",
    type: "success",
  },
  {
    label: "应用宝应用",
    name: "yyb",
    tag: "warning",
  },
  {
    label: "预约应用",
    name: "order",
    tag: "danger",
  },
  {
    label: "应用宝API",
    name: "yybApi",
    tag: "",
  },
  {
    label: "组件",
    name: "assembly",
    tag: "info",
  },
  {
    label: "云玩应用",
    name: "cloudGaming",
    tag: "",
  },
  {
    label: "微信小程序API",
    name: "appletApi",
    tag: "",
  },
];
export default {
  name: "AppReceiver",
  components: { ImgReceiver, UploadFile },
  model: {
    prop: "data",
    event: "change",
  },
  props: {
    data: {
      type: Array,
    },
    // 是否只能部署一个应用
    isSingle: {
      type: Boolean,
      default: false,
    },
    formWhere: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      list: this.data,
      sortIndex: "", // 正在编辑sort的index
      sortNumber: "", //新的排序号
    };
  },
  filters: {
    tagType(key) {
      return (sourceTypeList.find((item) => item.name === key) || {}).tag || "";
    },
  },
  methods: {
    typeDesc(key){
      return (
        (sourceTypeList.find((item) => item.name === key) || {}).label || key
      );
    },
    typecategoryDesc(key){
      return (
        (sourceTypeList.find((item) => item.name === key) || {}).label || key
      );
    },
    appDragChange(row) {
      // 某些组件类型，只能部署一个应用
      if (row.added && this.isSingle) {
        if (this.list.length > 1) {
          this.$message.error("该组件类型只能部署一个应用");
          const { newIndex } = row.added;
          this.list.splice(newIndex, 1);
        }
      }
    },
    handleClickSort(index) {
      this.sortIndex = index;
      this.sortNumber = index + 1;
    },
    handleInputEnter(index) {
      if (!parseInt(this.sortNumber)) {
        // nextSort必须是数字
        alert("请输入数字");
        return;
      }
      // 回车保存排序
      this.updateNumber(index, this.sortNumber);
      this.sortIndex = "";
    },
    handleInputBlur() {
      // 失去焦点取消编辑
      this.sortIndex = "";
    },
    removeItem(index) {
      this.list.splice(index, 1);
    },
    updateNumber(preIndex, nextSort) {
      const sortIndex = parseInt(nextSort) - 1;
      if (sortIndex < 0) {
        return false;
      }
      const preItem = this.list.splice(preIndex, 1)[0]; // 从数组中删除该数据
      this.list.splice(sortIndex, 0, preItem); // 将数据插入到对应的位置
    },
  },
  watch: {
    data() {
      if (this.list === this.data) {
        return;
      }
      this.list = this.data;
    },
    list() {
      this.$emit("change", this.list);
    },
  },
};
</script>
<style scoped lang="less">
.appReceiver {
  background: url("@/assets/images/market-app.png") center no-repeat;
}
.listItem {
  background: #fff;
  width: 100%;
  padding: 15px;
  position: relative;
  box-sizing: border-box;
  .imageReceive {
    width: 80%;
    height: 150px;
    margin-top: 10px;
  }
  .appInfo {
    display: flex;
    align-items: center;
  }
  .item-left {
    width: 60px;
    height: 60px;
    margin-right: 10px;
    background-color: #f2f2f2;
    color: #ff5722;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    font-style: italic;
    font-weight: 400;
    flex-shrink: 0;
    cursor: pointer;
  }

  .item-right {
    flex: 1;
    cursor: pointer;
  }

  .fixed-tag {
    position: absolute;
    right: 0;
    top: 0;
  }
  .deleteIcon {
    position: absolute;
    bottom: 6px;
    right: 6px;
    font-size: 20px;
    z-index: 9;
    cursor: pointer;
  }
  .videoArea {
    margin-top: 8px;
    width: 93%;
    display: flex;
    .uploadFile {
      margin-left: 10px;
    }
  }
}
</style>
