# 重要说明
该扩展基于choate/ueditor-ext和fex-team/ueditor项目, 

# 安装
## 未编译之前
拷贝该扩展到ext-dialogs
使用`grunt`编译
## 已编译
直接拷贝编译好的ext-dialogs目录下
## 更改配置
打开`ueditor.config.js`找到或添加`iframeUrlMap`选项, 加入以下内容:
```json
iframeUrlMap: {
    'insertimage':'~/ext-dialogs/image/image.html',
}
```

# 额外的配置
该扩展增加以下配置:
```
allowOnlineImage: true or false, // 是否开启在线管理图片功能
allowSearchImage: true or false, // 是否开启搜索图片功能
```


