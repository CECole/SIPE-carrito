var framework;
(function (framework) {
    var ajax;
    (function (ajax) {
        var ToggleControls = (function () {
            function ToggleControls(selector) {
                var _this = this;
                this.disableControls = function () {
                    _this.controls$.attr('disabled', 'disabled');
                    _this.buttons$.attr('disabled', 'disabled');
                    _this.days$.addClass('readonly');
                    _this.buttons$.css('cursor', 'wait');
                };
                this.enableControls = function () {
                    _this.controls$.removeAttr('disabled');
                    _this.buttons$.removeAttr('disabled');
                    _this.days$.removeClass('readonly');
                    _this.buttons$.css('cursor', 'pointer');
                };
                this.main$ = $(selector);
                this.controls$ = this.main$.find(':input').not('select[multiple]').not('[disabled="disabled"]');
                this.buttons$ = this.main$.find('button, a.btn').not('[disabled="disabled"]');
                this.days$ = this.main$.find('.day');
            }
            return ToggleControls;
        }());
        var ResponseType;
        (function (ResponseType) {
            ResponseType[ResponseType["JSON"] = 0] = "JSON";
            ResponseType[ResponseType["HTML"] = 1] = "HTML";
        })(ResponseType || (ResponseType = {}));
        function processError(xhr, estatus, error) {
            var obtenerMensaje = function () {
                var message = 'Por el momento no es posible procesar su petición. Por favor, inténtelo más tarde.', responseJSON = xhr.responseJSON;
                if (responseJSON && typeof responseJSON.Data === 'string' && responseJSON.Data.hasValue()) {
                    message = xhr.responseJSON.Data;
                }
                ;
                return message;
            };
            switch (xhr.status) {
                case 401:
                case 403:
                    return framework.promises.chain()
                        .done(framework.SessionManager.close);
                default:
                    return framework.modal.alert(obtenerMensaje());
            }
        }
        function send(url, method, data, responseType) {
            var deferred$ = $.Deferred(), newUrl = framework.urlCombine(framework.root, url);
            $.ajax(newUrl, {
                cache: false,
                global: false,
                type: method,
                data: data,
                success: function (response) {
                    deferred$.resolve((responseType === ResponseType.JSON) ? response.Data : response);
                },
                error: function (xhr, estatus, error) {
                    processError(xhr, estatus, error)
                        .done(function () {
                        deferred$.reject();
                    });
                }
            });
            return deferred$.promise();
        }
        function toogle(fn) {
            var controls = new ToggleControls('body');
            return framework.promises.chain()
                .pipe(framework.SessionManager.restart)
                .pipe(controls.disableControls)
                .pipe(fn)
                .always(controls.enableControls);
        }
        var toogleSend = function (url, method, data, responseType) { return toogle(function () { return send(url, method, data, responseType); }); };
        ajax.getHTML = function (url, data) { return toogleSend(url, 'GET', data, ResponseType.HTML); };
        ajax.postfn = function (url, data) { return function () { return toogleSend(url, 'POST', data, ResponseType.JSON); }; };
        ajax.post = function (url, data) { return toogleSend(url, 'POST', data, ResponseType.JSON); };
        ajax.simplePost = function (url, data) { return send(url, 'POST', data, ResponseType.JSON); };
        function prepareSubmit(selector, additionalData, fn) {
            var form$ = $(selector);
            if (!form$.is('form')) {
                throw 'El elemento seleccionado no corresponde a una forma.';
            }
            var data = form$.serialize() + '&' + $.param(additionalData || {});
            return fn(form$, data);
        }
        function simpleSubmit(selector, url, additionalData) {
            return prepareSubmit(selector, additionalData || null, function (form, data) { return send(url || form.attr('action'), 'POST', data, ResponseType.JSON); });
        }
        ajax.simpleSubmit = simpleSubmit;
        function submit(selector, url, additionalData) {
            return prepareSubmit(selector, additionalData || null, function (form, data) {
                if (form.valid()) {
                    return toogleSend(url || form.attr('action'), 'POST', data, ResponseType.JSON);
                }
                return framework.promises.empty();
            });
        }
        ajax.submit = submit;
        function submitForm(selector, additionalData) {
            return prepareSubmit(selector, additionalData || null, function (form, data) {
                if (form.valid()) {
                    return toogleSend(form.attr('action'), 'POST', data, ResponseType.JSON);
                }
                return framework.promises.empty();
            });
        }
        ajax.submitForm = submitForm;
        ajax.validate = function (form) {
            if (form === void 0) { form = 'form'; }
            return framework.promises.createPromiseFromPredicate(function () {
                var form$ = $(form);
                return !(form$.is('form') && !form$.valid());
            });
        };
        ajax.validateField = function (fieldSelector) {
            return framework.promises.createPromiseFromPredicate(function () {
                var element$ = $(fieldSelector);
                return element$.valid();
            });
        };
        function onSubmit(selector) {
            var form$ = $(selector), observer = new framework.Observer();
            form$.submit(function (e) {
                e.preventDefault();
                observer.publish(submitForm(form$));
            });
            return observer;
        }
        ajax.onSubmit = onSubmit;
    })(ajax = framework.ajax || (framework.ajax = {}));
})(framework || (framework = {}));
