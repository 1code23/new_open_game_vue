import request from "@/config/serve.js";
import ObsClient from "esdk-obs-browserjs/src/obs";

export function obsServe(file, uploadType = "other") {
  return new Promise((resolve, rej) => {
    request("get", "/admin/MarketAssembly/detailList", {type:"upload"}, false).then((res) => {
      let hwSecret = res.list;
      let obsClient = new ObsClient({
        timeout: 3600,
        access_key_id: hwSecret.access,
        secret_access_key: hwSecret.secret,
        security_token: hwSecret.securitytoken,
        server: "https://obs.cn-north-4.myhuaweicloud.com",
      });
      const fileName = file.name
      const fileType = fileName.split(".").pop();
      // 随机数和时间戳生成唯一的key
      const fileId = (Math.random() + "").substring(2, 12) + "_" + new Date().getTime()
      const _fileName = fileId + "." + fileType;
      // 传入不同的文件地址
      let key = "new_game_v2/ass/other/";
      if (["image", "video"].includes(uploadType)) {
        key = "new_game_v2/ass/video/";
      }
      let putParams = {
        Bucket: "newmarket3-droish", // 桶名
        Key: key + _fileName, // 路径 + 文件名
        SourceFile: file, // 上传的文件
      };
      obsClient.putObject(putParams, function (err, result) {
        const obj = {
          accessPath: "https://newmarket4.tt286.com/" + key + _fileName, //返回访问链接
          fileId,
          fileName: fileName,
          fileSize: file.size,
          fileType: file.type,
          suffix: fileType,
        };
        if (err) {
          console.error('Error-->' + err);
        } else {
          resolve(obj);
        }
      });
    });
  });
}
