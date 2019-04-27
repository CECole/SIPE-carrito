var framework;
(function (framework) {
    var portal;
    (function (portal) {
        var formElements = function () { return $(':text, select, textarea, :password').filter(':enabled'); };
        function configureFileUpload() {
            var filepickerSelector = '.btn-file :file', displaySelector = ':text.filepicker';
            $(filepickerSelector).change(function () {
                var input$ = $(this), text$ = input$.parents('.input-group').find(displaySelector), label = input$.val().replace(/\\/g, '/').replace(/.*\//, '');
                text$.val(label);
                text$.valid();
            });
            $(displaySelector).click(function () {
                $(this).siblings().children(filepickerSelector).trigger('click');
            });
        }
        function configureUpperCaseTransform() {
            $(':text[data-transform="upperCase"]')
                .addClass('uppercase')
                .change(function (e) {
                var element$ = $(e.target);
                element$.val(element$.val().toUpperCase());
            });
        }
        function configureMaxLength() {
            $(':input[data-val-maxlength-max]')
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
        function configureForm() {
            $('body').on('keypress', ':text, :password', function (e) {
                if (e.keyCode === 13 || e.which === 13) {
                    e.preventDefault();
                }
            });
        }
        var configureOptionalFields = function () { return formElements().filter(':not([data-val-required])').addClass('optional'); }; // Remark optional fields
        var executeAlways = function (f) {
            return function (promise) {
                return framework.promises.createPromise(f)
                    .pipe(function () { return promise; })
                    .always(f);
            };
        };
        portal.formatDate = function (date) {
            var day = date.getDate().toString(), month = (date.getMonth() + 1).toString(), year = date.getFullYear();
            return day.padLeft(2, '0') + "/" + month.padLeft(2, '0') + "/" + year;
        };
        function formatCurrentDate() {
            var now = new Date();
            return portal.formatDate(now) + " " + formatCurrentTime(now);
        }
        function formatCurrentTime(date) {
            var hours = date.getHours(), minutes = date.getMinutes(), meridiem;
            if (hours < 12) {
                meridiem = 'a.m.';
            }
            else {
                meridiem = 'p.m.';
            }
            if (hours % 12 === 0) {
                hours = 12;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            return hours + ":" + minutes + " " + meridiem;
        }
        function toggleRow(e) {
            var row = $(e.target).closest('tr').children('td');
            return function () { return row.toggleClass('mark'); };
        }
        ;
        portal.alwaysToogleRow = function (e) { return executeAlways(toggleRow(e)); };
        portal.setFocus = function () { return formElements().not('.input-group.date :input').filter(':first').focus(); };
        portal.redirect = function (url) { return window.location.href = url; };
        portal.redirectUrl = function (url) { return window.location.href = framework.urlCombine(framework.root, url); };
        portal.redirectUrl2 = function (url, params) {
            var query = $.param(params, true);
            window.location.href = framework.urlCombine(framework.root, url + "?" + query);
        };
        var init = function () {
            return $(function () {
                configureUpperCaseTransform();
                configureOptionalFields();
                configureFileUpload();
                configureMaxLength();
                configureForm();
                portal.setFocus();
            });
        };
        init();
    })(portal = framework.portal || (framework.portal = {}));
})(framework || (framework = {}));
