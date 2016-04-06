/**
 * 重写src/plugins/insertfile插件
 *
 * 增加attachmentIconUrl, allowInsertFileToEditor, attachmentName, attachmentValue属性
 * allowInsertFileToEditor 允许附件插入到编辑区域, 否则插入到附件列表中
 * attachmentIconUrl 设置附件图标路径, 由于某些框架的asset管理机制可能会出现图标失效的问题.
 * attachmentName 附件input Name
 * attachmentValue 附件初始值, 格式 [{title: "附件名字", url: "附件地址"}]
 */
UE.plugin.register('insertfile', function () {

    var me = this;
    var attachmentId = 'ueditor_attachment_';

    function getFileIcon(url) {
        var ext = url.substr(url.lastIndexOf('.') + 1).toLowerCase(),
            maps = {
                "rar": "icon_rar.gif",
                "zip": "icon_rar.gif",
                "tar": "icon_rar.gif",
                "gz": "icon_rar.gif",
                "bz2": "icon_rar.gif",
                "doc": "icon_doc.gif",
                "docx": "icon_doc.gif",
                "pdf": "icon_pdf.gif",
                "mp3": "icon_mp3.gif",
                "xls": "icon_xls.gif",
                "chm": "icon_chm.gif",
                "ppt": "icon_ppt.gif",
                "pptx": "icon_ppt.gif",
                "avi": "icon_mv.gif",
                "rmvb": "icon_mv.gif",
                "wmv": "icon_mv.gif",
                "flv": "icon_mv.gif",
                "swf": "icon_mv.gif",
                "rm": "icon_mv.gif",
                "exe": "icon_exe.gif",
                "psd": "icon_psd.gif",
                "txt": "icon_txt.gif",
                "jpg": "icon_jpg.gif",
                "png": "icon_jpg.gif",
                "jpeg": "icon_jpg.gif",
                "gif": "icon_jpg.gif",
                "ico": "icon_jpg.gif",
                "bmp": "icon_jpg.gif"
            };
        return maps[ext] ? maps[ext] : maps['txt'];
    }
    function InsertFileUi(options) {
        this.initOptions(options);
        this.initInsertFileUi();
    }
    InsertFileUi.prototype = {
        uiName: "insert-file-list",
        initInsertFileUi: function() {
            this.id = this.editor.ui.id + '_' + this.getIdByUiNameConvert();
            this._globalKey = this.editor.ui._globalKey;
        },
        getIdByUiNameConvert: function() {
            return this.uiName.replace('-', '_');
        },
        getHtmlTpl: function() {
            return '<ul id="##" class="%%" style="display:none"></ul>';
        }
    };
    utils.inherits(InsertFileUi, baidu.editor.ui.UIBase);

    function _insertByEditor(filelist) {
        filelist = utils.isArray(filelist) ? filelist : [filelist];

        var i, item, icon, title,
            html = '',
            URL = me.getOpt('UEDITOR_HOME_URL'),
            iconDir = me.getOpt('attachmentIconUrl') || URL + (URL.substr(URL.length - 1) == '/' ? '' : '/') + 'dialogs/attachment/fileTypeImages/';
        for (i = 0; i < filelist.length; i++) {
            item = filelist[i];
            icon = iconDir + getFileIcon(item.url);
            title = item.title || item.url.substr(item.url.lastIndexOf('/') + 1);
            html += '<p style="line-height: 16px;">' +
                '<img style="vertical-align: middle; margin-right: 2px;" src="' + icon + '" _src="' + icon + '" />' +
                '<a style="font-size:12px; color:#0066cc;" href="' + item.url + '" title="' + title + '">' + title + '</a>' +
                '</p>';
        }
        me.execCommand('insertHtml', html);
    }

    function _insertByUl(filelist) {
        var html = '',
            baseUi = new InsertFileUi({editor:me}),
            elem = me.ui.getDom(baseUi.getIdByUiNameConvert());
        for (var i = 0; i< filelist.length; i++) {
            html += baseUi.formatHtml('<li data-url="'+filelist[i].url+'" data-title="'+filelist[i].title+'"><span class="%%-name">'+filelist[i].title+'</span><span class="%%-remove" onclick="$$.editor.execCommand(&quot;deletefile&quot;, this);"><i class="%%-remove-icon">&times;</i>删除</span></li>');
        }
        append(elem, html);
        elem.style.display = '';
    }

    function append(parent, child) {
        var frag;
        if (typeof child === 'string') {
            frag = document.createDocumentFragment();
            var temp = document.createElement('div');
            temp.innerHTML = child;
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
        } else {
            frag = child;
        }

        parent.appendChild(frag);

    }

    function _deleteFile(elem) {
        var ul = elem.parentNode.parentNode;
        ul.removeChild(elem.parentNode);
        if (ul.childNodes.length <= 0) {
            ul.style.display = 'none';
        }
    }

    function _ready(me) {
        new InsertFileUi({editor:me}).render(me.ui.getDom('bottombar'));
        _insertByUl(me.getOpt('attachmentValue') || []);
    }

    function _setValue(me) {
        var ui = new InsertFileUi({editor:me}),
            ul = me.ui.getDom(ui.getIdByUiNameConvert()),
            result = [],
            textarea = me.getOpt('textarea'),
            id = attachmentId + textarea,
            name = 'attachment',
            reg = /(\[([\w]+)?\])$/i,
            attachmentName = me.getOpt('attachmentName') || (textarea.match(reg) ? textarea.replace(reg, '['+name+']') : textarea + '_' + name),
            attachment = document.getElementById(id);

        for(var i = 0; i < ul.childNodes.length; i++) {
            var li = ul.childNodes[i];
            result.push({title: li.getAttribute('data-title'), url: li.getAttribute('data-url')});
        }
        if (!attachment) {
            attachment = me.form.appendChild(domUtils.createElement(document, 'input', {
                name: me.getOpt('attachment') || attachmentName,
                id: id,
                style: "display:none"
            }));
        }
        attachment.setAttribute('value', utils.json2str(result));
    }

    function _submit(me) {
        if (me.form && me.form.tagName == 'FORM') {
            domUtils.on(me.form, 'submit', function () {
                _setValue(me);
            });

        }
    }

    return {
        defaultOptions: {
            allowInsertFileToEditor: false
        },
        bindEvents: {
            'ready': function (e) {
                if (!me.getOpt('allowInsertFileToEditor')) {
                    _ready(me);
                    _submit(me);
                }
            }
        },
        commands: {
            'insertfile': {
                execCommand: function (command, filelist) {
                    if (me.getOpt('allowInsertFileToEditor')) {
                        _insertByEditor(filelist);
                    } else {
                        _insertByUl(filelist);
                    }
                }
            },
            'deletefile': {
                execCommand: function(command, file) {
                    _deleteFile(file);
                }
            }
        }
    }
});


