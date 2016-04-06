/**
 * 重写src/plugins/video.js插件
 * 增加videoWidth, videoHeight配置, 以及加入视频原地址
 * videoWidth 配置视频默认宽度
 * videoHeight 配置视频默认高度
 */

UE.plugins['video'] = function () {
    var me = this;

    /**
     * 创建插入视频字符窜
     * @param url 视频地址
     * @param width 视频宽度
     * @param height 视频高度
     * @param align 视频对齐
     * @param toEmbed 是否以flash代替显示
     * @param addParagraph  是否需要添加P 标签
     */
    function creatInsertStr(url, width, height, id, align, classname, type, sourceUrl) {
        var str;
        switch (type) {
            case 'image':
                str = '<img ' + (id ? 'id="' + id + '"' : '') + ' width="' + width + '" height="' + height + '" _url="' + url + '" _source="' + sourceUrl + '" class="' + classname.replace(/\bvideo-js\b/, '') + '"' +
                    ' src="' + me.options.UEDITOR_HOME_URL + 'themes/default/images/spacer.gif" style="background:url(' + me.options.UEDITOR_HOME_URL + 'themes/default/images/videologo.gif) no-repeat center center; border:1px solid gray;' + (align ? 'float:' + align + ';' : '') + '" />'
                break;
            case 'embed':
                str = '<embed type="application/x-shockwave-flash" class="' + classname + '" pluginspage="http://www.macromedia.com/go/getflashplayer"' +
                    ' src="' + utils.html(url) + '" _source="' + utils.html(sourceUrl) + '" width="' + width + '" height="' + height + '"' + (align ? ' style="float:' + align + '"' : '') +
                    ' wmode="transparent" play="true" loop="false" menu="false" allowscriptaccess="never" allowfullscreen="true" >';
                break;
            case 'video':
                var ext = url.substr(url.lastIndexOf('.') + 1);
                if (ext == 'ogv') ext = 'ogg';
                str = '<video' + (id ? ' id="' + id + '"' : '') + ' class="' + classname + ' video-js" ' + (align ? ' style="float:' + align + '"' : '') +
                    ' controls preload="none" width="' + width + '" height="' + height + '" src="' + url + '" data-setup="{}">' +
                    '<source src="' + url + '" _source="' + sourceUrl + '" type="video/' + ext + '" /></video>';
                break;
        }
        return str;
    }

    function switchImgAndVideo(root, img2video) {
        utils.each(root.getNodesByTagName(img2video ? 'img' : 'embed video'), function (node) {
            var className = node.getAttr('class');
            if (className && className.indexOf('edui-faked-video') != -1) {
                var html = creatInsertStr(img2video ? node.getAttr('_url') : node.getAttr('src'), node.getAttr('width'), node.getAttr('height'), null, node.getStyle('float') || '', className, img2video ? 'embed' : 'image', node.getAttr('_source'));
                node.parentNode.replaceChild(UE.uNode.createElement(html), node);
            }
            if (className && className.indexOf('edui-upload-video') != -1) {
                var html = creatInsertStr(img2video ? node.getAttr('_url') : node.getAttr('src'), node.getAttr('width'), node.getAttr('height'), null, node.getStyle('float') || '', className, img2video ? 'video' : 'image', node.getAttr('_source'));
                node.parentNode.replaceChild(UE.uNode.createElement(html), node);
            }
        })
    }

    me.addOutputRule(function (root) {
        switchImgAndVideo(root, true)
    });
    me.addInputRule(function (root) {
        switchImgAndVideo(root)
    });

    /**
     * 插入视频
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Object } videoAttr 键值对对象， 描述一个视频的所有属性
     * @example
     * ```javascript
     *
     * var videoAttr = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100
     * };
     *
     * //editor 是编辑器实例
     * //向编辑器插入单个视频
     * editor.execCommand( 'insertvideo', videoAttr );
     * ```
     */

    /**
     * 插入视频
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Array } videoArr 需要插入的视频的数组， 其中的每一个元素都是一个键值对对象， 描述了一个视频的所有属性
     * @example
     * ```javascript
     *
     * var videoAttr1 = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100
     * },
     * videoAttr2 = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100
     * }
     *
     * //editor 是编辑器实例
     * //该方法将会向编辑器内插入两个视频
     * editor.execCommand( 'insertvideo', [ videoAttr1, videoAttr2 ] );
     * ```
     */

    /**
     * 查询当前光标所在处是否是一个视频
     * @command insertvideo
     * @method queryCommandState
     * @param { String } cmd 需要查询的命令字符串
     * @return { int } 如果当前光标所在处的元素是一个视频对象， 则返回1，否则返回0
     * @example
     * ```javascript
     *
     * //editor 是编辑器实例
     * editor.queryCommandState( 'insertvideo' );
     * ```
     */
    me.commands["insertvideo"] = {
        execCommand: function (cmd, videoObjs, type) {
            videoObjs = utils.isArray(videoObjs) ? videoObjs : [videoObjs];
            var html = [], id = 'tmpVedio', cl;
            for (var i = 0, vi, len = videoObjs.length; i < len; i++) {
                vi = videoObjs[i];
                cl = (type == 'upload' ? 'edui-upload-video video-js vjs-default-skin' : 'edui-faked-video');
                html.push(creatInsertStr(vi.url, vi.width || me.getOpt('videoWidth') || 420, vi.height || me.getOpt('videoHeight') || 280, id + i, null, cl, 'image'));
            }
            me.execCommand("inserthtml", html.join(""), true);
            var rng = this.selection.getRange();
            for (var i = 0, len = videoObjs.length; i < len; i++) {
                var img = this.document.getElementById('tmpVedio' + i);
                domUtils.removeAttributes(img, 'id');
                rng.selectNode(img).select();
                me.execCommand('imagefloat', videoObjs[i].align)
            }
        },
        queryCommandState: function () {
            var img = me.selection.getRange().getClosedNode(),
                flag = img && (img.className == "edui-faked-video" || img.className.indexOf("edui-upload-video") != -1);
            return flag ? 1 : 0;
        }
    };
};