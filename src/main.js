import Vue from "vue";
import less from "less";
import Draggable from "vuedraggable";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import * as api from "@/serveApi/commonApi";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;
Vue.prototype.$api = api;

Vue.use(less);
//全局尺寸使用small
Vue.use(ElementUI, { size: "small" });
Vue.component("Draggable", Draggable);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
