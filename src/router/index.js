import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/deploy/assembly",
  },
  {
    path: "/notFound",
    name: "notFound",
    component: () => import("@/views/notFound/index.vue"),
    meta: { toolTip: "404" },
  },
  {
    path: "/deploy",
    component: () => import("@/views/index.vue"),
    children: [
      {
        path: "assembly",
        name: "assembly",
        meta: {
          title: "组件部署",
        },
        component: () => import("@/views/assembly/index.vue"),
      },
      {
        path: "page",
        name: "page",
        meta: {
          title: "页面部署",
        },
        component: () => import("@/views/pageDeploy/index.vue"),
      },
      {
        path: "recommend",
        name: "recommend",
        meta: {
          title: "智能推荐部署",
        },
        component: () => import("@/views/recommend/index.vue"),
      },
      {
        path: "openScreen",
        name: "openScreen",
        meta: {
          title: "开屏部署",
        },
        component: () => import("@/views/openScreen/index.vue"),
      },
      {
        path: "keywordsAd",
        name: "keywordsAd",
        meta: {
          title: "关键字广告部署",
        },
        component: () => import("@/views/keywordsAd/index.vue"),
      },
      {
        path: "setup",
        name: "setup",
        meta: {
          title: "一键安装"
        },
        component: () => import("@/views/packageSetup/index.vue"),
      },
    ],
  },
  {
    path: "*",
    redirect: "/notFound",
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);
  const title = to.meta.title;
  if (title) {
    document.title = title;
  }
  next();
});

export default router;
