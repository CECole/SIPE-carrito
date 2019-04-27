var framework;
(function (framework) {
    var Observer = (function () {
        function Observer() {
            var _this = this;
            this.successCallbacks = $.Callbacks('memory');
            this.cancelCallbacks = $.Callbacks('memory');
            this.publish = function (object) {
                _this.successCallbacks.fire(object);
            };
            this.reject = function () {
                _this.cancelCallbacks.fire();
            };
            this.subscribe = function (successCallback, cancelCallback) {
                _this.successCallbacks.add(successCallback);
                if (cancelCallback) {
                    _this.cancelCallbacks.add(cancelCallback);
                }
            };
        }
        return Observer;
    }());
    framework.Observer = Observer;
    function execute(fn) {
        if ($.isFunction(fn)) {
            fn();
        }
    }
    framework.execute = execute;
    function applyTwice(fn, n) {
        return fn(fn(n));
    }
    framework.applyTwice = applyTwice;
    function memoize(callback) {
        var t = undefined;
        return function () {
            if (!t) {
                t = callback();
            }
            return t;
        };
    }
    framework.memoize = memoize;
    function tap(fn) {
        return function (x) {
            fn();
            return x;
        };
    }
    framework.tap = tap;
    framework.toDate = function (value) { return new Date(parseFloat(value.substr(6, 13))); };
    framework.daysInMonth = function (month, year) { return new Date(year, month, 0).getDate(); };
    function diffInDays(start, end) {
        var diff = Math.abs(start.getTime() - end.getTime());
        return ((diff / 1000) / 3600) / 24;
    }
    framework.diffInDays = diffInDays;
    function parseDate(value) {
        var date = value.split('/');
        if (date.length === 3) {
            return new Date(parseInt(date[2], 10), parseInt(date[1], 10) - 1, parseInt(date[0], 10));
        }
        return new Date();
    }
    framework.parseDate = parseDate;
    function postJson(urlOrForm, options) {
        var target = urlOrForm;
        if (typeof urlOrForm === 'string') {
            target = urlCombine(framework.root, urlOrForm);
        }
        ko.utils.postJson(target, {}, options || {});
    }
    framework.postJson = postJson;
    function postJson2(urlOrForm, additionalData) {
        var target = urlOrForm, fields = {}, params = {};
        if (typeof urlOrForm === 'string') {
            target = urlCombine(framework.root, urlOrForm);
        }
        else {
            fields = $(target).find(':input:not([disabled="disabled"])').filter(function (i, element) { return element.id.hasValue(); }).map(function (i, element) { return element.id; }).toArray();
            $(target).find('select:not([disabled="disabled"])').each(function (i, e) { return params[e.name] = e.value; });
        }
        additionalData = $.extend({}, params, additionalData);
        ko.utils.postJson(target, {}, { includeFields: fields, params: additionalData });
    }
    framework.postJson2 = postJson2;
    framework.deferred = function (fn) {
        return (function () {
            var id = setTimeout(function () {
                clearTimeout(id);
                framework.execute(fn);
            }, 0);
        })();
    };
    function urlCombine(baseUrl, url) {
        var patternBase = /\/$/g, patternUrl = /^\/|\/$/g;
        if (url.indexOf(baseUrl) < 0) {
            return [baseUrl.replace(patternBase, ''), url.replace(patternUrl, '')].join('/');
        }
        return url;
    }
    framework.urlCombine = urlCombine;
    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    framework.getParameterByName = getParameterByName;
})(framework || (framework = {}));
var framework;
(function (framework) {
    var SessionManager;
    (function (SessionManager) {
        var closeSession = function () { return framework.portal.redirectUrl('/Salir'); };
        var timer = new ((function () {
            function TimerImp(handler, timeout) {
                this.handler = handler;
                this.timeout = timeout;
                this.start();
            }
            TimerImp.prototype.start = function (timeout) {
                clearTimeout(this.id);
                this.id = setTimeout(this.handler, timeout || this.timeout);
            };
            return TimerImp;
        }()))(closeSession, 120 * (1000 * 60));
        SessionManager.restart = function () { return timer.start(); };
        SessionManager.close = function () { return timer.start(1); };
    })(SessionManager = framework.SessionManager || (framework.SessionManager = {}));
})(framework || (framework = {}));
