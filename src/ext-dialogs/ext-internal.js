(function ($) {
    var langImgPath = editor.options.langPath + editor.options.lang + "/images/";
    /**
     * 根据给定的列表载入语言包
     *
     * @param list
     */
    loadStaticLangByList = function (list) {
        var result = [];
        var tmp;
        for (var i = 0; i < list.length; i++) {
            tmp = lang['static'][list[i]];
            if (tmp) {
                _loadStaticLang($('#' + list[i]), tmp);
            }
        }
    };
    /**
     * 根据selector载入语言包
     *
     * @param selector #id or .id or element
     *
     * @see http://api.jquery.com/category/selectors/
     */
    loadStaticLangBySelector = function (selector) {
        for (var i in lang['static']) {
            _loadStaticLang($(selector).find('#'+i), lang['static'][i]);
        }
    };

    function _loadStaticLang(dom, language) {
        dom = dom[0];
        if (!dom) return;
        var tagName = dom.tagName,
            content = language;
        if (content.src) {
            //clone
            content = utils.extend({}, content, false);
            content.src = langImgPath + content.src;
        }
        if (content.style) {
            content = utils.extend({}, content, false);
            content.style = content.style.replace(/url\s*\(/g, "url(" + langImgPath)
        }
        switch (tagName.toLowerCase()) {
            case "var":
                dom.parentNode.replaceChild(document.createTextNode(content), dom);
                break;
            case "select":
                var ops = dom.options;
                for (var j = 0, oj; oj = ops[j];) {
                    oj.innerHTML = content.options[j++];
                }
                for (var p in content) {
                    p != "options" && dom.setAttribute(p, content[p]);
                }
                break;
            default :
                domUtils.setAttributes(dom, content);
        }
    }

})(jQuery);