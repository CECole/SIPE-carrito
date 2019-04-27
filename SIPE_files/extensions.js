Function.prototype.close = function () {
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    return function () {
        return fn.apply(this, args);
    };
};
Function.prototype.partial = function () {
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    return function () {
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
};
String.prototype.trim = String.prototype.trim || function () {
    if (!this)
        return this;
    return this.replace(/^\s+|\s+$/g, "");
};
Array.prototype.filter = Array.prototype.filter || function (callback) {
    var _this = this;
    return $.grep(this, function (e, i) { return callback(e, i, _this); });
};
Array.prototype.hasElements = function () {
    return this && this.length > 0;
};
Array.prototype.map = Array.prototype.map || function (callback) {
    var _this = this;
    return $.map(this, function (e, i) { return callback(e, i, _this); });
};
Array.prototype.reduce = Array.prototype.reduce || function (callbackfn, initialValue) {
    var _this = this;
    $.each(this, function (i, value) {
        initialValue = callbackfn(initialValue, value, i, _this);
    });
    return initialValue;
};
Array.prototype.removeLast = function () {
    return this.slice(0, this.length - 1);
};
Date.prototype.toISOString = Date.prototype.toISOString || function () {
    var pad = function (n) { return (n < 10) ? '0' + n : n; };
    return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
};
String.prototype.hasValue = function () {
    return this && this.length && this.length > 0;
};
String.prototype.padLeft = function (length, filler) {
    return Array(length - this.length + 1).join(filler || ' ') + this;
};
(function (ko) {
    ko.bindingHandlers.control = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = $(element).val();
            ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            valueAccessor()(value);
        },
        'update': ko.bindingHandlers.value.update
    };
    ko.bindingHandlers.controlText = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var text = $(element).text();
            ko.bindingHandlers.text.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            valueAccessor()(text);
        },
        'update': ko.bindingHandlers.text.update
    };
    ko.bindingHandlers.options2 = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var element$ = $(element), items = $(element).find('option').map(function (index, element) { return { Value: element.value, Text: element.text }; }).toArray();
            element$.data('initialValue', $(element).val());
            ko.bindingHandlers.options.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            valueAccessor()(items);
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ko.bindingHandlers.options.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            var element$ = $(element), initialValue = element$.data('initialValue');
            if (initialValue) {
                element$.val(initialValue);
                element$.data('initialValue', null);
            }
        }
    };
    ko.bindingHandlers.checkedControl = {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = $(element).prop('checked');
            ko.bindingHandlers.checked.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            valueAccessor()(value);
        },
        'update': ko.bindingHandlers.checked.update
    };
    ko.bindingHandlers.stopBinding = {
        init: function () {
            return { controlsDescendantBindings: true };
        }
    };
    ko.merge = function (source, target) {
        for (var targetKey in target) {
            if (ko.isObservable(target[targetKey])) {
                for (var sourceKey in source) {
                    if (targetKey.toLowerCase() === sourceKey.toLowerCase()) {
                        target[targetKey](source[sourceKey]);
                        break;
                    }
                }
            }
        }
    };
})(ko);
(function ($) {
    function resetValidation(form$) {
        form$.validate().resetForm();
        form$.find("[data-valmsg-replace]")
            .removeClass("field-validation-error")
            .addClass("field-validation-valid")
            .removeClass("field-validation-valid")
            .empty();
        form$.find("[data-val]")
            .removeClass("input-validation-error");
    }
    $.fn.formReset = function (exclude) {
        if (exclude === void 0) { exclude = ''; }
        var form$ = $(this);
        if (form$.is('form')) {
            form$
                .find(':text, select, input:checkbox')
                .not(exclude)
                .each(function (index, element) {
                var control$ = $(element);
                if (control$.is(':text')) {
                    control$.val('').change();
                }
                else if (control$.is('select')) {
                    control$.val('0').change();
                }
                else {
                    control$.prop('checked', false).triggerHandler('click');
                }
            });
            resetValidation(form$);
        }
    };
    $.fn.disableElement = function () {
        $(this).each(function () {
            var element$ = $(this);
            element$.attr('disabled', 'disabled');
            try {
                var rules = element$.rules('remove');
                if (rules && !$.isEmptyObject(rules)) {
                    element$.data('disabledRules', rules);
                    element$.valid();
                }
                element$.siblings("[data-valmsg-replace]")
                    .removeClass("field-validation-error")
                    .addClass("field-validation-valid")
                    .removeClass("field-validation-valid")
                    .empty();
            }
            catch (e) {
            }
        });
    };
    $.fn.enableElement = function () {
        $(this).each(function () {
            var element$ = $(this);
            element$.removeAttr('disabled');
            try {
                var rules = element$.data('disabledRules');
                if (rules) {
                    element$.rules('add', rules);
                    element$.valid();
                }
                var validator = element$.closest('form').data('validator');
                if (validator) {
                    delete validator.submitted[element$[0].name];
                }
            }
            catch (e) {
            }
        });
    };
})(jQuery);
