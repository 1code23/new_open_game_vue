import axios from "axios";
import Vue from "vue";
import { showFullLoading, tryHideFullScreenLoading } from "@/config/loading";
const isProduction = process.env.NODE_ENV === "production";
const instance = axios.create({
  baseURL: isProduction ? "/" : "/api",
  timeout: 10 * 60 * 1000, //超时
});

// 请求拦截
instance.interceptors.request.use(
  (req) => {
    let token = localStorage.getItem("token");
    if (token) {
      req.headers.token = token;
    }
    return req;
  },
  (error) => {
    return console.error(error);
  }
);

// 响应拦截
instance.interceptors.response.use(
  (res) => {
    //拦截数据响应
    //实现并发请求只加载一个loading
    tryHideFullScreenLoading();

    if (res.data && res.data.status != 1) {
      Vue.prototype.$message.error(res.data.msg || "请求错误!");
      return Promise.reject(new Error(JSON.stringify(res.data)));
    }
    return res.data;
  },
  (error) => {
    //实现并发请求只加载一个loading
    tryHideFullScreenLoading();
    Vue.prototype.$message.error("请求错误!");
    console.log("error", error.response);
    return false;
  }
);

export default (method, url, data, loading = true) => {
  if (loading) {
    //实现并发请求只加载一个loading
    showFullLoading();
  }
  method = method.toLowerCase();
  switch (method) {
    case "post":
      return instance.post(url, data);
    case "get":
      return instance.get(url, { params: data });
    case "delete":
      return instance.delete(url, { params: data });
    case "put":
      return instance.put(url, data);
    case "http":
      return instance(url, {
        url,
        ...data,
      });
    default:
      console.error("未知的请求方式！" + method);
      return false;
  }
};
