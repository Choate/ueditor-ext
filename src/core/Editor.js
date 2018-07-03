(function () {
    UE.Editor.prototype.getActionUrl = function (action) {
        var actionName = this.getOpt(action) || action,
            imageUrl = this.getOpt('imageUrl'),
            serverUrlCallback = this.getOpt('imageUrl'),
            serverUrl = this.getOpt('serverUrl');

        if (typeof serverUrlCallback === 'function') {
            return utils.formatUrl(serverUrlCallback.call(this, action));
        }

        if (!serverUrl && imageUrl) {
            serverUrl = imageUrl.replace(/^(.*[\/]).+([\.].+)$/, '$1controller$2');
        }

        if (serverUrl) {
            serverUrl = serverUrl + (serverUrl.indexOf('?') == -1 ? '?' : '&') + 'action=' + (actionName || '');
            return utils.formatUrl(serverUrl);
        } else {
            return '';
        }
    }
})();