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
    'insertvideo':'~/ext-dialogs/video/video.html',
}
```

# 额外的配置
该扩展增加以下配置:
```
allowVideoUpload: true or false, // 是否开启上传视频功能

// 配置额外的匹配视频路径, 域名为键
videoUrlConvert: {
    "v.youku.com": [
        {
            "match": /v\.youku\.com\/v_show\/id_([\w\-=]+)\.html/i,
            "replace": "player.youku.com/player.php/sid/$1/v.swf" or function() {} // 更多使用方法请看String.prototype.replace
        }
    ]
}
```


