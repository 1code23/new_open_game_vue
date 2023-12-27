import request from "@/config/serve.js";


// 部署资源获取
//type：app--自营应用；yyb--应用宝；order--预约应用；image--图片资源；assembly--组件列表；label--标签列表
export function getDeployResource(params) {
  return request("get", "/admin/MarketAssembly/detailList", params);
}
// 组件配置资源获取
export function getConfigDetail(params) {
  return request("get", "/admin/MarketAssembly/pageconfigdetail", params);
}
// 组件部署
export function assemblyDetailAdd(params) {
  return request("post", "/admin/MarketAssembly/detailAdd", params);
}
// 页面配置资源获取
export function getPageConfigDetail(params) {
  return request("get", "/admin/MarketPage/pageconfigdetail", params);
}
// 页面部署
export function pageDetailAdd(params) {
  return request("post", "/admin/MarketPage/detailAdd", params);
}
// 智能推荐配置资源获取
export function getRecommendDetail(params) {
  return request("get", "/admin/NewApkRecommend/pageconfigdetail", params);
}
// 智能推荐部署
export function recommendDetailAdd(params) {
  return request("post", "/admin/NewApkRecommend/detailAdd", params);
}
// 开屏部署资源获取
export function getOpenScreenDetail(params) {
  return request("get", "/admin/NewOpenscreen/pageconfigdetail", params);
}
// 开屏部署
export function openScreenDetailAdd(params) {
  return request("post", "/admin/NewOpenscreen/detailAdd", params);
}
// 关键字广告资源获取
export function getKeywordsAdDetail(params) {
  return request("get", "/Admin/KeywordApp/pageConfigDetail", params);
}
// 关键字广告部署
export function keywordsAdAdd(params) {
  return request("post", "/Admin/KeywordApp/detailAdd", params);
}
// 一键安装资源获取
export function getOneClickDetail(params) {
  return request("get", "/Admin/OneClickInstall/pageConfigDetail", params);
}
// 一键安装部署
export function oneClickAdd(params) {
  return request("post", "/Admin/OneClickInstall/detailAdd", params);
}
// 微信小程序api 分类明细
export function getcategoryList(params) {
  return request("get", "/Admin/MarketAssembly/detailList", params);
}

