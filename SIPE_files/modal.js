var framework;
(function (framework) {
    var modal;
    (function (modal_1) {
        var ButtonType;
        (function (ButtonType) {
            ButtonType[ButtonType["Default"] = 0] = "Default";
            ButtonType[ButtonType["Primary"] = 1] = "Primary";
        })(ButtonType || (ButtonType = {}));
        var templates = {
            modal: "<div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">\n\t\t\t<div class=\"modal-dialog\">\n\t\t\t\t<div class=\"modal-content\" >\n\t\t\t\t\t<div class=\"modal-header\">\n\t\t\t\t\t\t<b>Soluci\u00F3n Integral de Pagos Electr\u00F3nicos</b>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"modal-body\"></div>\n\t\t\t\t\t<div class=\"modal-footer\"></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>",
            primaryButton: '<button type="button" class="btn btn-primary"></button>',
            defaultButton: '<button type="button" class="btn btn-default"></button>'
        };
        var defaultModalSettings = {
            width: null,
            acceptButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            cancelButtonVisible: true
        };
        function enableValidators(modal$) {
            modal$.find('form').each(function () {
                $(this).removeData('validator').removeData('unobtrusiveValidation');
                $.validator.unobtrusive.parse(this);
            });
        }
        modal_1.enableValidators = enableValidators;
        function createButton(modal$, text, type, callback, closeOnExit) {
            if (closeOnExit === void 0) { closeOnExit = true; }
            var button$ = $(type === ButtonType.Default ? templates.defaultButton : templates.primaryButton);
            button$.append(text);
            button$.click(function (e) {
                framework.execute(callback);
                if (closeOnExit) {
                    modal$.modal('hide');
                }
            });
            return button$;
        }
        function createDefaultModal(content, settings) {
            var modal$ = $(templates.modal);
            modal$.find('.modal-body').append(content);
            modal$.on('hidden.bs.modal', function () { return modal$.remove(); });
            if (settings.width) {
                modal$.find('div.modal-dialog').css('width', settings.width);
            }
            return modal$.modal({ backdrop: "static", keyboard: false });
        }
        // Duplicado
        function configureMaxLength(control) {
            $(':input[data-val-maxlength-max]', control)
                .attr('maxLength', function () {
                return $(this).attr('data-val-maxlength-max');
            })
                .filter('textarea')
                .keypress(function (e) {
                try {
                    var control$ = $(this), maxLength = parseInt(control$.attr('maxLength'), 10);
                    if (control$.val().length >= maxLength) {
                        e.preventDefault();
                    }
                }
                catch (err) {
                }
            });
        }
        modal_1.configureMaxLength = configureMaxLength;
        // Duplicado
        function configureFileUpload(control) {
            var filepickerSelector = '.btn-file :file', displaySelector = ':text.filepicker';
            $(filepickerSelector, control).change(function () {
                var input$ = $(this), text$ = input$.parents('.input-group').find(displaySelector), label = input$.val().replace(/\\/g, '/').replace(/.*\//, '');
                text$.val(label);
                text$.valid();
            });
            $(displaySelector, control).click(function () {
                $(this).siblings().children(filepickerSelector).trigger('click');
            });
        }
        function create(settings) {
            var actualSettings = $.extend({}, defaultModalSettings, settings);
            return function (content) {
                var deferred = $.Deferred(), modal$ = createDefaultModal(content, actualSettings), footer = modal$.find('.modal-footer');
                if (actualSettings.cancelButtonVisible) {
                    footer.append(createButton(modal$, actualSettings.cancelButtonText, ButtonType.Default, deferred.reject.partial(null)));
                }
                footer.append(createButton(modal$, actualSettings.acceptButtonText, ButtonType.Primary, deferred.resolve.partial(null)));
                return deferred.promise();
            };
        }
        modal_1.create = create;
        modal_1.alert = create({ cancelButtonVisible: false });
        modal_1.confirm = create();
        function loadModal(url, data, settings, onLoad) {
            var observer = new framework.Observer();
            var actualSettings = $.extend({}, defaultModalSettings, settings);
            framework.ajax.getHTML(url, data)
                .done(function (html) {
                var modal$ = createDefaultModal(html, actualSettings), footer = modal$.find('.modal-footer');
                enableValidators(modal$);
                configureMaxLength(modal$);
                configureFileUpload(modal$);
                if (actualSettings.cancelButtonVisible) {
                    footer.append(createButton(modal$, actualSettings.cancelButtonText, ButtonType.Default, observer.reject));
                }
                footer.append(createButton(modal$, actualSettings.acceptButtonText, ButtonType.Primary, function () {
                    return observer.publish({
                        form: modal$.find('form'),
                        close: function () {
                            modal$.modal('hide');
                        }
                    });
                }, false));
                if (onLoad) {
                    onLoad(modal$);
                }
            });
            return observer;
        }
        modal_1.loadModal = loadModal;
    })(modal = framework.modal || (framework.modal = {}));
})(framework || (framework = {}));
