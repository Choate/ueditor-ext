# 重要说明
该扩展基于choate/ueditor-ext和fex-team/ueditor项目.

# build.conf文件说明
```
sourcePath      配置UEditor项目路径
exceptModules   剔除系统模块, 该路径会自动补全UEditor项目路径, 具体引入模块查看 ueditor/_examples/editor_api.js::paths
extendModules   扩展UEditor模块
extendStyles    扩展UEditor样式表
exceptStyles    剔出UEditor样式表, 该参数路径会自动补全UEditor项目路径, 具体引入样式查看 ueditor/themes/default/_css/ueditor.css
extendParse     扩展UEditor解析模块
exceptParse     剔除UEdiotr解析模块, 该参数路径会自动补全UEditor项目路径, 具体引入解析模块查看 ueditor/ueditor.parse.js::paths
```

# 更多信息
更多的UEditor信息,请查看[UEditor文档](http://fex.baidu.com/ueditor/)
