/**
 * Created by mekdr on 12/27/2016.
 */

String.prototype.lcfirst = function () {
    if (this.length < 1) {
        return this;
    }
    var val = this.substr(0, 1).toLowerCase();
    if (this.length < 2) {
        return val;
    }
    return val + this.substr(1);
};

String.prototype.extractParamNameFromDataName = function (prefix) {
    return this.substr(prefix.length).lcfirst();
};

String.prototype.beginsWith = function (text) {
    return this.substr(0, text.length) == text;
};

String.prototype.endsWith = function (text) {
    return this.substr(-text.length) == text;
};

String.prototype.parseQuery = function () {
    var ret = {};
    var groups = this.split('&');
    for (var i = 0; i < groups.length; i++) {
        var item = groups[i].split('=', 2);
        ret[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
    }
    return ret;
};

String.prototype.descConcat = function(description) {
    if (!description) {
        return this;
    }
    return this + ' - ' + description;
}